import { configureDbPragmas, getDb } from './db';

type Migration = {
  version: number;
  up: string[];
};

const migrations: Migration[] = [
  {
    version: 1,
    up: [
      `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS sermon_notes (
        id TEXT PRIMARY KEY NOT NULL,
        user_name TEXT NOT NULL,
        preacher_name TEXT NOT NULL,
        church_name TEXT NOT NULL,
        sermon_date TEXT NOT NULL,
        sermon_time TEXT,
        sermon_title TEXT NOT NULL,
        main_verse TEXT NOT NULL,
        introduction TEXT,
        personal_observations TEXT,
        practical_applications TEXT,
        conclusion TEXT,
        final_summary TEXT,
        highlighted_phrases TEXT NOT NULL DEFAULT '[]',
        favorite INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_sermon_notes_created_at ON sermon_notes(created_at);
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_sermon_notes_favorite ON sermon_notes(favorite);
      `,
      `
      CREATE TABLE IF NOT EXISTS sermon_points (
        id TEXT PRIMARY KEY NOT NULL,
        sermon_note_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        point_order INTEGER NOT NULL,
        FOREIGN KEY (sermon_note_id) REFERENCES sermon_notes(id) ON DELETE CASCADE
      );
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_sermon_points_note_order ON sermon_points(sermon_note_id, point_order);
      `,
      `
      CREATE TABLE IF NOT EXISTS secondary_verses (
        id TEXT PRIMARY KEY NOT NULL,
        sermon_note_id TEXT NOT NULL,
        verse_text TEXT NOT NULL,
        FOREIGN KEY (sermon_note_id) REFERENCES sermon_notes(id) ON DELETE CASCADE
      );
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_secondary_verses_note ON secondary_verses(sermon_note_id);
      `
    ]
  },
  {
    version: 2,
    up: [
      `
      CREATE TABLE IF NOT EXISTS backup_history (
        id TEXT PRIMARY KEY NOT NULL,
        file_name TEXT NOT NULL,
        file_uri TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      `,
      `
      CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at);
      `
    ]
  },
  {
    version: 3,
    up: [
      `
      ALTER TABLE sermon_notes ADD COLUMN web_publication_id TEXT;
      `,
      `
      ALTER TABLE sermon_notes ADD COLUMN web_slug TEXT;
      `,
      `
      ALTER TABLE sermon_notes ADD COLUMN web_url TEXT;
      `,
      `
      ALTER TABLE sermon_notes ADD COLUMN web_publish_status TEXT NOT NULL DEFAULT 'local_only';
      `,
      `
      ALTER TABLE sermon_notes ADD COLUMN web_published_at TEXT;
      `,
      `
      ALTER TABLE sermon_notes ADD COLUMN web_updated_at TEXT;
      `,
      `
      ALTER TABLE sermon_notes ADD COLUMN web_last_error TEXT;
      `
    ]
  },
  {
    version: 4,
    up: [
      `
      ALTER TABLE sermon_notes ADD COLUMN pre_sermon_code TEXT;
      `
    ]
  }
];

/**
 * Inicializa o banco local aplicando pragmas e migrations pendentes de forma transacional.
 */
export async function initializeDatabase(): Promise<void> {
  await configureDbPragmas();
  const db = await getDb();

  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL
      );
    `);

    const row = await tx.getFirstAsync<{ version: number }>('SELECT MAX(version) as version FROM schema_migrations;');
    const currentVersion = row?.version ?? 0;

    const pending = migrations.filter((m) => m.version > currentVersion).sort((a, b) => a.version - b.version);
    for (const migration of pending) {
      for (const statement of migration.up) {
        await tx.execAsync(statement);
      }
      await tx.runAsync('INSERT INTO schema_migrations (version) VALUES (?);', migration.version);
    }

    try {
      await tx.execAsync(`ALTER TABLE backup_history ADD COLUMN kind TEXT NOT NULL DEFAULT 'export';`);
    } catch {}
  });
}
