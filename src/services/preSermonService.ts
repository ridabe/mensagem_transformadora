export type PreSermonFromApi = {
  shareCode: string;
  title: string;
  mainVerse: string;
  secondaryVerses: string[];
  leader?: {
    name?: string;
  };
  church?: {
    name?: string;
  };
};

type PreSermonErrorKind = 'invalid_code' | 'not_found' | 'server_error' | 'offline' | 'unknown';

export class PreSermonError extends Error {
  kind: PreSermonErrorKind;
  status?: number;

  constructor(kind: PreSermonErrorKind, message: string, status?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

function getRequiredEnv(key: 'EXPO_PUBLIC_WEB_API_URL'): string {
  const value = process.env[key];
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    throw new PreSermonError('server_error', `Variável de ambiente ausente: ${key}`);
  }
  return trimmed;
}

export function normalizePreSermonCode(code: string): string {
  const cleaned = String(code ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (!/^MT[A-Z0-9]{5}$/.test(cleaned)) {
    throw new PreSermonError('invalid_code', 'Código inválido. Confira o código informado pelo pregador.');
  }

  return `MT-${cleaned.slice(2)}`;
}

export async function getPreSermonByCode(code: string): Promise<PreSermonFromApi> {
  const normalizedCode = normalizePreSermonCode(code);
  const baseUrl = getRequiredEnv('EXPO_PUBLIC_WEB_API_URL');
  const url = `${baseUrl.replace(/\/+$/, '')}/api/pre-sermons/by-code?code=${encodeURIComponent(normalizedCode)}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new PreSermonError('offline', 'Não foi possível conectar. Verifique sua internet e tente novamente.');
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new PreSermonError('invalid_code', 'Código inválido. Confira o código informado pelo pregador.', 400);
    }

    if (response.status === 404) {
      throw new PreSermonError('not_found', 'Não encontramos uma mensagem ativa com esse código.', 404);
    }

    throw new PreSermonError(
      'server_error',
      'Não foi possível carregar a mensagem agora. Tente novamente em instantes.',
      response.status
    );
  }

  const json = (await response.json().catch(() => null)) as
    | { success?: boolean; sermon?: unknown }
    | null;

  if (!json?.success || typeof json.sermon !== 'object' || json.sermon === null) {
    throw new PreSermonError('server_error', 'Não foi possível carregar a mensagem agora. Tente novamente em instantes.');
  }

  const sermon = json.sermon as PreSermonFromApi;

  return {
    shareCode: String(sermon.shareCode ?? normalizedCode),
    title: String(sermon.title ?? ''),
    mainVerse: String(sermon.mainVerse ?? ''),
    secondaryVerses: Array.isArray(sermon.secondaryVerses)
      ? sermon.secondaryVerses.map((item) => String(item ?? ''))
      : [],
    leader: sermon.leader ? { name: String(sermon.leader.name ?? '') } : undefined,
    church: sermon.church ? { name: String(sermon.church.name ?? '') } : undefined
  };
}
