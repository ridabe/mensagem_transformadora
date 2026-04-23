export const REVIEW_INTERVAL_DAYS = 3;
export const REVIEW_INTERVAL_MS = REVIEW_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

export type ReviewStatus =
  | 'never_asked'
  | 'eligible'
  | 'postponed'
  | 'rated_confirmed'
  | 'requested_but_unconfirmed';

export type ReviewState = {
  version: 1;
  first_open_at: number;
  next_review_at: number;
  review_status: ReviewStatus;
  last_review_request_at: number | null;
  review_request_count: number;
  rated_confirmed_at: number | null;
};

export type ReviewEvent = 'app_open' | 'home_focus' | 'positive_action';

/**
 * Retorna um timestamp em milissegundos (UTC) para uso consistente nas regras.
 */
export function nowUtcMs(): number {
  return Date.now();
}

/**
 * Soma o intervalo padrão (3 dias) ao timestamp informado.
 */
export function addIntervalMs(fromMs: number): number {
  return fromMs + REVIEW_INTERVAL_MS;
}

/**
 * Indica se o usuário está elegível para tentativa de avaliação (nunca antes de `next_review_at`).
 */
export function isEligibleForReview(state: ReviewState, nowMs: number): boolean {
  if (state.review_status === 'rated_confirmed') return false;
  return nowMs >= state.next_review_at;
}

/**
 * Atualiza o status para `eligible` quando o tempo mínimo já foi atingido.
 * Importante: isso não "confirma avaliação", apenas reflete a elegibilidade temporal.
 */
export function normalizeState(state: ReviewState, nowMs: number): ReviewState {
  if (state.review_status === 'rated_confirmed') return state;

  if (nowMs >= state.next_review_at) {
    if (state.review_status !== 'eligible') {
      return { ...state, review_status: 'eligible' };
    }
  }

  return state;
}

/**
 * Define se o app pode exibir o modal customizado (pré-API) neste momento.
 * Regra rígida: nunca exibir antes de `next_review_at` e nunca após `rated_confirmed`.
 */
export function shouldShowReviewPrompt(state: ReviewState, nowMs: number): boolean {
  if (state.review_status === 'rated_confirmed') return false;
  if (nowMs < state.next_review_at) return false;
  return true;
}

/**
 * Cria o estado inicial e agenda a primeira elegibilidade para 3 dias depois do primeiro uso.
 */
export function createInitialState(nowMs: number): ReviewState {
  return {
    version: 1,
    first_open_at: nowMs,
    next_review_at: addIntervalMs(nowMs),
    review_status: 'never_asked',
    last_review_request_at: null,
    review_request_count: 0,
    rated_confirmed_at: null
  };
}
