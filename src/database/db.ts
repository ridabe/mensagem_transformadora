import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

export const DATABASE_NAME = 'mensagem_transformadora.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Retorna a URI do arquivo físico do banco SQLite dentro do sandbox do app.
 */
export function getDatabaseFileUri(): string {
  return `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

/**
 * Fecha a conexão atual e limpa o cache para permitir reabrir o banco (útil em restore de backup).
 */
export async function resetDb(): Promise<void> {
  const current = dbPromise ? await dbPromise : null;
  dbPromise = null;
  if (current) {
    await current.closeAsync();
  }
}

export async function configureDbPragmas(): Promise<void> {
  const db = await getDb();
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
}
