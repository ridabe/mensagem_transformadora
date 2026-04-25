import type { SermonNote } from '../types/sermon';

export type SermonWebKeyPointPayload = {
  id: string;
  title: string;
  content: string;
  order: number;
};

export type SermonWebPayload = {
  localSermonId: string;
  userName: string;
  preacherName: string;
  churchName: string;
  sermonDate: string;
  sermonTime?: string | null;
  sermonTitle: string;
  mainVerse: string;
  secondaryVerses: string[];
  introduction?: string;
  keyPoints: SermonWebKeyPointPayload[];
  highlightedPhrases: string[];
  personalObservations?: string;
  practicalApplications?: string;
  conclusion?: string;
  finalSummary?: string;
  visibility: 'public';
  status: 'published';
};

export type SermonWebPayloadBuildResult =
  | { ok: true; payload: SermonWebPayload }
  | { ok: false; reason: 'missing_required_fields' };

export function buildSermonWebPayload(sermon: SermonNote): SermonWebPayloadBuildResult {
  const userName = normalizeSingleLine(sermon.userName);
  const preacherName = normalizeSingleLine(sermon.preacherName);
  const churchName = normalizeSingleLine(sermon.churchName);
  const sermonDate = normalizeDateToYmd(normalizeSingleLine(sermon.sermonDate));
  const sermonTitle = normalizeSingleLine(sermon.sermonTitle);
  const mainVerse = normalizeSingleLine(sermon.mainVerse);

  if (!userName || !preacherName || !churchName || !sermonDate || !sermonTitle || !mainVerse) {
    return { ok: false, reason: 'missing_required_fields' };
  }

  const secondaryVerses = (sermon.secondaryVerses ?? []).map(normalizeSingleLine).filter(Boolean);
  const highlightedPhrases = (sermon.highlightedPhrases ?? []).map(normalizeSingleLine).filter(Boolean);

  const keyPoints = (sermon.keyPoints ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id: String(p.id ?? ''),
      title: normalizeSingleLine(p.title),
      content: normalizeMultiline(p.content),
      order: Number(p.order ?? 0)
    }))
    .filter((p) => p.id.length > 0)
    .map((p, idx) => ({ ...p, order: p.order > 0 ? p.order : idx + 1 }));

  const payload: SermonWebPayload = {
    localSermonId: sermon.id,
    userName,
    preacherName,
    churchName,
    sermonDate,
    sermonTime: normalizeTimeOrNull(sermon.sermonTime),
    sermonTitle,
    mainVerse,
    secondaryVerses,
    introduction: normalizeOptionalMultiline(sermon.introduction),
    keyPoints,
    highlightedPhrases,
    personalObservations: normalizeOptionalMultiline(sermon.personalObservations),
    practicalApplications: normalizeOptionalMultiline(sermon.practicalApplications),
    conclusion: normalizeOptionalMultiline(sermon.conclusion),
    finalSummary: normalizeOptionalMultiline(sermon.finalSummary),
    visibility: 'public',
    status: 'published'
  };

  return { ok: true, payload };
}

function normalizeSingleLine(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .replace(/[ \t]+/g, ' ');
}

function normalizeMultiline(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();
}

function normalizeOptionalMultiline(value: string | null | undefined): string | undefined {
  const v = normalizeMultiline(value);
  return v.length > 0 ? v : undefined;
}

function normalizeTimeOrNull(value: string | null | undefined): string | null {
  const v = normalizeSingleLine(value);
  if (!v) return null;
  return v;
}

function normalizeDateToYmd(value: string): string {
  const v = normalizeSingleLine(value);
  if (!v) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v;
  }

  const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const [, dd, mm, yyyy] = br;
    return `${yyyy}-${mm}-${dd}`;
  }

  const iso = new Date(v);
  if (Number.isNaN(iso.getTime())) return '';
  const yyyy = iso.getFullYear();
  const mm = String(iso.getMonth() + 1).padStart(2, '0');
  const dd = String(iso.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
