import AsyncStorage from '@react-native-async-storage/async-storage';

export type DonationState = {
  hasDonated: boolean;
  declined: boolean;
  openCountSinceDecline: number;
  lastPixId?: string;
  lastPixStatus?: string;
  lastPixBrCode?: string;
  lastPixQrCodeBase64?: string;
  lastPixExpiresAt?: string;
  donatedAt?: string;
  amountInCents?: number;
};

const KEYS = {
  hasDonated: 'donation_has_donated',
  declined: 'donation_declined',
  openCountSinceDecline: 'donation_open_count_since_decline',
  lastPixId: 'donation_last_pix_id',
  lastPixStatus: 'donation_last_pix_status',
  lastPixBrCode: 'donation_last_pix_brcode',
  lastPixQrCodeBase64: 'donation_last_pix_qrcode_base64',
  lastPixExpiresAt: 'donation_last_pix_expires_at',
  donatedAt: 'donation_donated_at',
  amountInCents: 'donation_amount'
} as const;

function parseBoolean(value: string | null | undefined): boolean {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

function parseNumber(value: string | null | undefined): number | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function parseNumberOrZero(value: string | null | undefined): number {
  return parseNumber(value) ?? 0;
}

export async function getDonationState(): Promise<DonationState> {
  const entries = await AsyncStorage.multiGet([
    KEYS.hasDonated,
    KEYS.declined,
    KEYS.openCountSinceDecline,
    KEYS.lastPixId,
    KEYS.lastPixStatus,
    KEYS.lastPixBrCode,
    KEYS.lastPixQrCodeBase64,
    KEYS.lastPixExpiresAt,
    KEYS.donatedAt,
    KEYS.amountInCents
  ]);

  const map = Object.fromEntries(entries);
  return {
    hasDonated: parseBoolean(map[KEYS.hasDonated]),
    declined: parseBoolean(map[KEYS.declined]),
    openCountSinceDecline: parseNumberOrZero(map[KEYS.openCountSinceDecline]),
    lastPixId: map[KEYS.lastPixId] ?? undefined,
    lastPixStatus: map[KEYS.lastPixStatus] ?? undefined,
    lastPixBrCode: map[KEYS.lastPixBrCode] ?? undefined,
    lastPixQrCodeBase64: map[KEYS.lastPixQrCodeBase64] ?? undefined,
    lastPixExpiresAt: map[KEYS.lastPixExpiresAt] ?? undefined,
    donatedAt: map[KEYS.donatedAt] ?? undefined,
    amountInCents: parseNumber(map[KEYS.amountInCents])
  };
}

export async function markDonationDeclined(): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.declined, 'true'],
    [KEYS.openCountSinceDecline, '0']
  ]);
}

export async function incrementOpenCountAfterDecline(): Promise<number> {
  const current = await AsyncStorage.getItem(KEYS.openCountSinceDecline);
  const next = parseNumberOrZero(current) + 1;
  await AsyncStorage.setItem(KEYS.openCountSinceDecline, String(next));
  return next;
}

export async function resetDeclineCounter(): Promise<void> {
  await AsyncStorage.setItem(KEYS.openCountSinceDecline, '0');
}

export async function savePendingPix(pix: {
  id: string;
  status: string;
  brCode?: string;
  brCodeBase64?: string;
  expiresAt?: string;
  amountInCents?: number;
}): Promise<void> {
  const pairs: Array<[string, string]> = [
    [KEYS.lastPixId, String(pix.id)],
    [KEYS.lastPixStatus, String(pix.status)]
  ];

  if (pix.brCode != null) pairs.push([KEYS.lastPixBrCode, String(pix.brCode)]);
  if (pix.brCodeBase64 != null) pairs.push([KEYS.lastPixQrCodeBase64, String(pix.brCodeBase64)]);
  if (pix.expiresAt != null) pairs.push([KEYS.lastPixExpiresAt, String(pix.expiresAt)]);
  if (pix.amountInCents != null) pairs.push([KEYS.amountInCents, String(pix.amountInCents)]);

  await AsyncStorage.multiSet(pairs);
}

export async function markDonationPaid(amountInCents: number): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.hasDonated, 'true'],
    [KEYS.declined, 'false'],
    [KEYS.openCountSinceDecline, '0'],
    [KEYS.donatedAt, new Date().toISOString()],
    [KEYS.amountInCents, String(amountInCents)],
    [KEYS.lastPixStatus, 'PAID']
  ]);
}

export async function clearPendingPix(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.lastPixId,
    KEYS.lastPixStatus,
    KEYS.lastPixBrCode,
    KEYS.lastPixQrCodeBase64,
    KEYS.lastPixExpiresAt
  ]);
}

