type DonationStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export type DonationPix = {
  id: string;
  status: DonationStatus;
  amountInCents: number;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
};

export type DonationPixStatus = {
  id: string;
  status: DonationStatus;
};

const APP_SOURCE_HEADER = 'mensagem-transformadora-android';

function getRequiredEnv(key: 'EXPO_PUBLIC_DONATION_API_URL'): string {
  const value = process.env[key];
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }
  return trimmed;
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function assertAmountRange(amountInCents: number): void {
  if (!Number.isFinite(amountInCents)) throw new Error('Valor inválido.');
  if (amountInCents < 500) throw new Error('Valor mínimo: R$ 5,00.');
  if (amountInCents > 50000) throw new Error('Valor máximo: R$ 500,00.');
}

function assertId(id: string): void {
  const trimmed = String(id ?? '').trim();
  if (!trimmed) throw new Error('ID do Pix obrigatório.');
}

function isDonationStatus(value: unknown): value is DonationStatus {
  return value === 'PENDING' || value === 'PAID' || value === 'EXPIRED' || value === 'CANCELLED';
}

export async function createDonationPix(amountInCents: number): Promise<DonationPix> {
  assertAmountRange(amountInCents);
  const baseUrl = normalizeBaseUrl(getRequiredEnv('EXPO_PUBLIC_DONATION_API_URL'));

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/donations/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-source': APP_SOURCE_HEADER
      },
      body: JSON.stringify({ amountInCents })
    });
  } catch {
    throw new Error('Não foi possível conectar. Verifique sua internet e tente novamente.');
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error('Não foi possível processar a doação agora. Tente novamente em instantes.');
  }

  if (!res.ok || !json?.success) {
    throw new Error('Não foi possível processar a doação agora. Tente novamente em instantes.');
  }

  const donation = json?.donation;
  const status = donation?.status;

  if (
    !donation ||
    typeof donation.id !== 'string' ||
    !isDonationStatus(status) ||
    typeof donation.amountInCents !== 'number' ||
    typeof donation.brCode !== 'string' ||
    typeof donation.brCodeBase64 !== 'string' ||
    typeof donation.expiresAt !== 'string'
  ) {
    throw new Error('Resposta inválida do servidor.');
  }

  return {
    id: donation.id,
    status,
    amountInCents: donation.amountInCents,
    brCode: donation.brCode,
    brCodeBase64: donation.brCodeBase64,
    expiresAt: donation.expiresAt
  };
}

export async function checkDonationPixStatus(id: string): Promise<DonationPixStatus> {
  assertId(id);
  const baseUrl = normalizeBaseUrl(getRequiredEnv('EXPO_PUBLIC_DONATION_API_URL'));
  const queryId = encodeURIComponent(id);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/donations/check?id=${queryId}`, {
      method: 'GET',
      headers: {
        'x-app-source': APP_SOURCE_HEADER
      }
    });
  } catch {
    throw new Error('Não foi possível conectar. Verifique sua internet e tente novamente.');
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error('Não foi possível processar a doação agora. Tente novamente em instantes.');
  }

  if (!res.ok || !json?.success) {
    throw new Error('Não foi possível processar a doação agora. Tente novamente em instantes.');
  }

  const donation = json?.donation;
  const status = donation?.status;
  if (!donation || typeof donation.id !== 'string' || !isDonationStatus(status)) {
    throw new Error('Resposta inválida do servidor.');
  }

  return { id: donation.id, status };
}

