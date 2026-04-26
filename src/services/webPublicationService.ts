import type { SermonNote } from '../types/sermon';
import { buildSermonWebPayload } from '../mappers/sermonWebPayloadMapper';

export type PublishResponse = {
  id: string;
  slug: string;
  url: string;
};

type PublishErrorKind =
  | 'offline'
  | 'missing_required_fields'
  | 'unauthorized'
  | 'bad_request'
  | 'server_error'
  | 'config'
  | 'unknown';

export class PublishError extends Error {
  kind: PublishErrorKind;
  status?: number;

  constructor(kind: PublishErrorKind, message: string, status?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
  }
}

export async function publishSermonToWeb(sermon: SermonNote): Promise<PublishResponse> {
  const baseUrl = getRequiredEnv('EXPO_PUBLIC_WEB_API_URL');
  const token = getRequiredEnv('EXPO_PUBLIC_ANDROID_PUBLISH_TOKEN');

  const built = buildSermonWebPayload(sermon);
  if (!built.ok) {
    throw new PublishError('missing_required_fields', 'Preencha os campos obrigatórios antes de publicar.');
  }

  await assertServerReachable(baseUrl);

  const res = await fetch(joinUrl(baseUrl, '/api/integrations/android/sermons'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-publish-token': token
    },
    body: JSON.stringify(built.payload)
  }).catch((e) => {
    throw new PublishError('offline', getErrorMessage(e));
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new PublishError('unauthorized', 'Não foi possível publicar. Token de integração inválido.', 401);
    }
    if (res.status === 400) {
      throw new PublishError('bad_request', 'Não foi possível publicar. Verifique os dados da mensagem.', 400);
    }
    if (res.status >= 500) {
      throw new PublishError(
        'server_error',
        'O servidor não conseguiu processar a publicação agora. Tente novamente.',
        res.status
      );
    }
    throw new PublishError('unknown', 'Não foi possível publicar agora. Tente novamente.', res.status);
  }

  const json = (await res.json().catch(() => null)) as Partial<PublishResponse> | null;
  if (!json?.id || !json?.slug || !json?.url) {
    throw new PublishError('unknown', 'A publicação retornou uma resposta inválida. Tente novamente.');
  }

  return { id: String(json.id), slug: String(json.slug), url: String(json.url) };
}

export function getPublishErrorMessage(error: unknown): string {
  if (error instanceof PublishError) {
    if (error.kind === 'offline') {
      return 'Sua mensagem continua salva no app. Conecte-se à internet para publicar.';
    }
    return error.message;
  }
  const msg = getErrorMessage(error);
  if (msg.toLowerCase().includes('network')) {
    return 'Sua mensagem continua salva no app. Conecte-se à internet para publicar.';
  }
  return 'Não foi possível publicar agora. Tente novamente.';
}

function getRequiredEnv(key: 'EXPO_PUBLIC_WEB_API_URL' | 'EXPO_PUBLIC_ANDROID_PUBLISH_TOKEN'): string {
  const value = process.env[key];
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    throw new PublishError('config', `Variável de ambiente ausente: ${key}`);
  }
  return trimmed;
}

async function assertServerReachable(baseUrl: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    await fetch(joinUrl(baseUrl, '/'), { method: 'GET', signal: controller.signal });
  } catch (e) {
    throw new PublishError('offline', getErrorMessage(e));
  } finally {
    clearTimeout(timeout);
  }
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? 'Erro desconhecido');
}
