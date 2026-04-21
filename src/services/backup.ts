import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { getDatabaseFileUri, getDb, resetDb } from '../database/db';
import { initializeDatabase } from '../database/migrations';

export type BackupHistoryItem = {
  id: string;
  kind: 'export' | 'import';
  fileName: string;
  fileUri: string;
  createdAt: string;
};

type BackupHistoryRow = {
  id: string;
  kind: string | null;
  file_name: string;
  file_uri: string;
  created_at: string;
};

/**
 * Lista o histórico de backups (exportações e importações) armazenado localmente.
 */
export async function listBackupHistory(limit = 30): Promise<BackupHistoryItem[]> {
  await initializeDatabase();
  const db = await getDb();

  const rows = await db.getAllAsync<BackupHistoryRow>(
    `
    SELECT id, kind, file_name, file_uri, created_at
    FROM backup_history
    ORDER BY created_at DESC
    LIMIT ?;
    `,
    limit
  );

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind === 'import' ? 'import' : 'export',
    fileName: r.file_name,
    fileUri: r.file_uri,
    createdAt: r.created_at
  }));
}

/**
 * Exporta o arquivo SQLite do app para uma pasta selecionada pelo usuário (Android) e registra no histórico.
 */
export async function exportDatabaseBackup(): Promise<BackupHistoryItem> {
  if (Platform.OS !== 'android') {
    throw new Error('Backup por arquivo está disponível apenas no Android.');
  }

  await initializeDatabase();
  const db = await getDb();
  await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');

  const sourceDbUri = getDatabaseFileUri();
  const createdAt = new Date().toISOString();
  const fileName = buildBackupFileName(createdAt);

  const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permissão negada para escolher uma pasta de backup.');
  }

  const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    fileName,
    'application/octet-stream'
  );

  const base64 = await FileSystem.readAsStringAsync(sourceDbUri, { encoding: FileSystem.EncodingType.Base64 });
  await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });

  const item: BackupHistoryItem = {
    id: createId(),
    kind: 'export',
    fileName,
    fileUri: destUri,
    createdAt
  };

  await insertBackupHistory(item);
  return item;
}

/**
 * Solicita um arquivo de backup ao usuário e restaura o banco local a partir dele.
 */
export async function importDatabaseBackup(): Promise<BackupHistoryItem> {
  if (Platform.OS !== 'android') {
    throw new Error('Restauração por arquivo está disponível apenas no Android.');
  }

  await initializeDatabase();
  const picked = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false
  });

  if (picked.canceled) {
    throw new Error('Importação cancelada.');
  }

  const asset = picked.assets?.[0];
  if (!asset?.uri) {
    throw new Error('Arquivo de backup inválido.');
  }

  const createdAt = new Date().toISOString();
  const fileName = asset.name ?? 'backup.db';

  await restoreDatabaseFromUri(asset.uri);

  const item: BackupHistoryItem = {
    id: createId(),
    kind: 'import',
    fileName,
    fileUri: asset.uri,
    createdAt
  };

  await insertBackupHistory(item);
  return item;
}

/**
 * Restaura o arquivo SQLite dentro do sandbox do app e reexecuta a inicialização/migrations.
 */
export async function restoreDatabaseFromUri(sourceUri: string): Promise<void> {
  await resetDb();

  const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

  const destDbUri = getDatabaseFileUri();

  await safeDeleteIfExists(`${destDbUri}-wal`);
  await safeDeleteIfExists(`${destDbUri}-shm`);

  if (sourceUri.startsWith('file://')) {
    await FileSystem.copyAsync({ from: sourceUri, to: destDbUri });
  } else {
    const base64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
    await FileSystem.writeAsStringAsync(destDbUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  }

  await initializeDatabase();
}

/**
 * Gera um nome de arquivo de backup consistente e amigável para o usuário.
 */
export function buildBackupFileName(isoDate: string): string {
  const safe = isoDate.replace(/[:.]/g, '-');
  return `mensagem-transformadora-backup_${safe}.mtbackup`;
}

/**
 * Registra um item no histórico local de backups.
 */
async function insertBackupHistory(item: BackupHistoryItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `
    INSERT INTO backup_history (id, kind, file_name, file_uri, created_at)
    VALUES (?, ?, ?, ?, ?);
    `,
    item.id,
    item.kind,
    item.fileName,
    item.fileUri,
    item.createdAt
  );
}

/**
 * Remove um arquivo caso exista, sem falhar quando o arquivo não está presente.
 */
async function safeDeleteIfExists(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
}

/**
 * Gera um identificador simples para uso local.
 */
function createId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}${random}`;
}
