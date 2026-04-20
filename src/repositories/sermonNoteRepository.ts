import { getDb } from '../database/db';
import type { SermonNote, SermonPoint } from '../types/sermon';

type ListOptions = {
  searchText?: string;
  favoritesOnly?: boolean;
  limit?: number;
  offset?: number;
};

type SermonNoteRow = {
  id: string;
  user_name: string;
  preacher_name: string;
  church_name: string;
  sermon_date: string;
  sermon_time: string | null;
  sermon_title: string;
  main_verse: string;
  introduction: string | null;
  personal_observations: string | null;
  practical_applications: string | null;
  conclusion: string | null;
  final_summary: string | null;
  highlighted_phrases: string;
  favorite: number;
  created_at: string;
  updated_at: string;
};

type SermonPointRow = {
  id: string;
  sermon_note_id: string;
  title: string;
  content: string;
  point_order: number;
};

type SecondaryVerseRow = {
  id: string;
  sermon_note_id: string;
  verse_text: string;
};

export const sermonNoteRepository = {
  create,
  getById,
  list,
  update,
  remove,
  setFavorite,
  duplicate,
  getDashboardStats
};

export type DashboardStats = {
  totalMessages: number;
  favorites: number;
  favoriteRatio: number;
  dailyCounts: Array<{ day: string; count: number }>;
  topPreachers: Array<{ name: string; count: number }>;
  topChurches: Array<{ name: string; count: number }>;
};

async function create(note: SermonNote): Promise<void> {
  const db = await getDb();

  await db.withExclusiveTransactionAsync(async (tx) => {
    const noteParams = [
      note.id,
      note.userName,
      note.preacherName,
      note.churchName,
      note.sermonDate,
      note.sermonTime ?? null,
      note.sermonTitle,
      note.mainVerse,
      note.introduction ?? null,
      note.personalObservations ?? null,
      note.practicalApplications ?? null,
      note.conclusion ?? null,
      note.finalSummary ?? null,
      safeStringify(note.highlightedPhrases ?? []),
      note.favorite ? 1 : 0,
      note.createdAt,
      note.updatedAt
    ] as const;

    await tx.runAsync(
      `
      INSERT INTO sermon_notes (
        id, user_name, preacher_name, church_name, sermon_date, sermon_time,
        sermon_title, main_verse, introduction, personal_observations,
        practical_applications, conclusion, final_summary, highlighted_phrases,
        favorite, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      ...noteParams
    );

    for (const point of note.keyPoints ?? []) {
      await tx.runAsync(
        `
        INSERT INTO sermon_points (id, sermon_note_id, title, content, point_order)
        VALUES (?, ?, ?, ?, ?);
        `,
        [point.id, note.id, point.title, point.content, point.order]
      );
    }

    for (const verse of note.secondaryVerses ?? []) {
      await tx.runAsync(
        `
        INSERT INTO secondary_verses (id, sermon_note_id, verse_text)
        VALUES (?, ?, ?);
        `,
        [createId(), note.id, verse]
      );
    }
  });
}

async function getById(id: string): Promise<SermonNote | null> {
  const db = await getDb();

  const row = await db.getFirstAsync<SermonNoteRow>('SELECT * FROM sermon_notes WHERE id = ?;', id);
  if (!row) return null;

  const points = await db.getAllAsync<SermonPointRow>(
    `
    SELECT * FROM sermon_points
    WHERE sermon_note_id = ?
    ORDER BY point_order ASC;
    `,
    id
  );

  const verses = await db.getAllAsync<SecondaryVerseRow>(
    `
    SELECT * FROM secondary_verses
    WHERE sermon_note_id = ?
    ORDER BY rowid ASC;
    `,
    id
  );

  return mapNote(row, points, verses);
}

async function list(options: ListOptions = {}): Promise<SermonNote[]> {
  const db = await getDb();

  const limit = options.limit ?? 200;
  const offset = options.offset ?? 0;
  const searchText = options.searchText?.trim();
  const favoritesOnly = options.favoritesOnly ?? false;

  const whereParts: string[] = [];
  const params: (string | number)[] = [];

  if (favoritesOnly) {
    whereParts.push('n.favorite = 1');
  }

  if (searchText && searchText.length > 0) {
    const like = `%${escapeLike(searchText)}%`;
    whereParts.push(
      `(
        n.sermon_title LIKE ? ESCAPE '\\\\' OR
        n.preacher_name LIKE ? ESCAPE '\\\\' OR
        n.church_name LIKE ? ESCAPE '\\\\' OR
        n.main_verse LIKE ? ESCAPE '\\\\' OR
        EXISTS (
          SELECT 1 FROM secondary_verses sv
          WHERE sv.sermon_note_id = n.id AND sv.verse_text LIKE ? ESCAPE '\\\\'
        )
      )`
    );
    params.push(like, like, like, like, like);
  }

  const where = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

  const notes = await db.getAllAsync<SermonNoteRow>(
    `
    SELECT n.*
    FROM sermon_notes n
    ${where}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?;
    `,
    ...[...params, limit, offset]
  );

  if (notes.length === 0) return [];

  const noteIds = notes.map((n) => n.id);
  const placeholders = noteIds.map(() => '?').join(',');

  const points = await db.getAllAsync<SermonPointRow>(
    `
    SELECT * FROM sermon_points
    WHERE sermon_note_id IN (${placeholders})
    ORDER BY sermon_note_id ASC, point_order ASC;
    `,
    ...noteIds
  );

  const verses = await db.getAllAsync<SecondaryVerseRow>(
    `
    SELECT * FROM secondary_verses
    WHERE sermon_note_id IN (${placeholders})
    ORDER BY sermon_note_id ASC, rowid ASC;
    `,
    ...noteIds
  );

  const pointsByNote = groupBy(points, (p) => p.sermon_note_id);
  const versesByNote = groupBy(verses, (v) => v.sermon_note_id);

  return notes.map((n) => mapNote(n, pointsByNote[n.id] ?? [], versesByNote[n.id] ?? []));
}

async function update(note: SermonNote): Promise<void> {
  const db = await getDb();

  await db.withExclusiveTransactionAsync(async (tx) => {
    const updateParams = [
      note.userName,
      note.preacherName,
      note.churchName,
      note.sermonDate,
      note.sermonTime ?? null,
      note.sermonTitle,
      note.mainVerse,
      note.introduction ?? null,
      note.personalObservations ?? null,
      note.practicalApplications ?? null,
      note.conclusion ?? null,
      note.finalSummary ?? null,
      safeStringify(note.highlightedPhrases ?? []),
      note.favorite ? 1 : 0,
      note.updatedAt,
      note.id
    ] as const;

    await tx.runAsync(
      `
      UPDATE sermon_notes
      SET
        user_name = ?,
        preacher_name = ?,
        church_name = ?,
        sermon_date = ?,
        sermon_time = ?,
        sermon_title = ?,
        main_verse = ?,
        introduction = ?,
        personal_observations = ?,
        practical_applications = ?,
        conclusion = ?,
        final_summary = ?,
        highlighted_phrases = ?,
        favorite = ?,
        updated_at = ?
      WHERE id = ?;
      `,
      ...updateParams
    );

    await tx.runAsync('DELETE FROM sermon_points WHERE sermon_note_id = ?;', note.id);
    await tx.runAsync('DELETE FROM secondary_verses WHERE sermon_note_id = ?;', note.id);

    for (const point of note.keyPoints ?? []) {
      await tx.runAsync(
        `
        INSERT INTO sermon_points (id, sermon_note_id, title, content, point_order)
        VALUES (?, ?, ?, ?, ?);
        `,
        [point.id, note.id, point.title, point.content, point.order]
      );
    }

    for (const verse of note.secondaryVerses ?? []) {
      await tx.runAsync(
        `
        INSERT INTO secondary_verses (id, sermon_note_id, verse_text)
        VALUES (?, ?, ?);
        `,
        [createId(), note.id, verse]
      );
    }
  });
}

async function remove(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM sermon_notes WHERE id = ?;', id);
}

async function setFavorite(id: string, favorite: boolean, updatedAt: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE sermon_notes SET favorite = ?, updated_at = ? WHERE id = ?;', favorite ? 1 : 0, updatedAt, id);
}

async function duplicate(id: string): Promise<string> {
  const original = await getById(id);
  if (!original) {
    throw new Error('Mensagem não encontrada para duplicação.');
  }

  const now = new Date().toISOString();
  const newId = createId();

  const duplicated: SermonNote = {
    ...original,
    id: newId,
    sermonTitle: `${original.sermonTitle} (Cópia)`,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    keyPoints: (original.keyPoints ?? []).map((p, index) => ({ ...p, id: createId(), order: index + 1 }))
  };

  await create(duplicated);
  return newId;
}

async function getDashboardStats(options?: {
  days?: number;
  topLimit?: number;
}): Promise<DashboardStats> {
  const days = Math.max(1, Math.min(options?.days ?? 7, 30));
  const topLimit = Math.max(1, Math.min(options?.topLimit ?? 5, 10));
  const db = await getDb();

  const countsRow = await db.getFirstAsync<{ total: number; favorites: number }>(
    `
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(favorite), 0) as favorites
    FROM sermon_notes;
    `
  );

  const totalMessages = Number(countsRow?.total ?? 0);
  const favorites = Number(countsRow?.favorites ?? 0);
  const favoriteRatio = totalMessages > 0 ? favorites / totalMessages : 0;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  const sinceIso = since.toISOString();

  const rows = await db.getAllAsync<{ day: string; count: number }>(
    `
    SELECT
      SUBSTR(created_at, 1, 10) as day,
      COUNT(*) as count
    FROM sermon_notes
    WHERE created_at >= ?
    GROUP BY day
    ORDER BY day ASC;
    `,
    sinceIso
  );

  const byDay = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.day] = Number(r.count ?? 0);
    return acc;
  }, {});

  const dailyCounts: Array<{ day: string; count: number }> = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const day = toDateOnly(d);
    dailyCounts.push({ day, count: byDay[day] ?? 0 });
  }

  const topPreachers = await db.getAllAsync<{ name: string; count: number }>(
    `
    SELECT preacher_name as name, COUNT(*) as count
    FROM sermon_notes
    GROUP BY preacher_name
    ORDER BY count DESC, name ASC
    LIMIT ?;
    `,
    topLimit
  );

  const topChurches = await db.getAllAsync<{ name: string; count: number }>(
    `
    SELECT church_name as name, COUNT(*) as count
    FROM sermon_notes
    GROUP BY church_name
    ORDER BY count DESC, name ASC
    LIMIT ?;
    `,
    topLimit
  );

  return {
    totalMessages,
    favorites,
    favoriteRatio,
    dailyCounts,
    topPreachers: topPreachers.map((r) => ({ name: r.name, count: Number(r.count ?? 0) })),
    topChurches: topChurches.map((r) => ({ name: r.name, count: Number(r.count ?? 0) }))
  };
}

function mapNote(note: SermonNoteRow, points: SermonPointRow[], verses: SecondaryVerseRow[]): SermonNote {
  return {
    id: note.id,
    userName: note.user_name,
    preacherName: note.preacher_name,
    churchName: note.church_name,
    sermonDate: note.sermon_date,
    sermonTime: note.sermon_time ?? undefined,
    sermonTitle: note.sermon_title,
    mainVerse: note.main_verse,
    secondaryVerses: verses.map((v) => v.verse_text),
    introduction: note.introduction ?? undefined,
    keyPoints: points.map(mapPoint),
    highlightedPhrases: safeParseStringArray(note.highlighted_phrases),
    personalObservations: note.personal_observations ?? undefined,
    practicalApplications: note.practical_applications ?? undefined,
    conclusion: note.conclusion ?? undefined,
    finalSummary: note.final_summary ?? undefined,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    favorite: note.favorite === 1
  };
}

function mapPoint(row: SermonPointRow): SermonPoint {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    order: row.point_order
  };
}

function safeParseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => String(v));
    }
    return [];
  } catch {
    return [];
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? []);
  } catch {
    return '[]';
  }
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
}

function createId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}${random}`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function toDateOnly(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

