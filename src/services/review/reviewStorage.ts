import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ReviewState } from './reviewRules';
import { createInitialState, normalizeState } from './reviewRules';

const STORAGE_KEY = '@mensagem_transformadora/review_state_v1';

/**
 * Carrega o estado persistido do fluxo de avaliação. Retorna `null` quando não existe (primeiro uso).
 */
export async function loadReviewState(nowMs: number): Promise<ReviewState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ReviewState;
    if (!parsed || parsed.version !== 1) return null;
    if (typeof parsed.first_open_at !== 'number' || typeof parsed.next_review_at !== 'number') return null;
    if (typeof parsed.review_status !== 'string') return null;

    return normalizeState(parsed, nowMs);
  } catch {
    return null;
  }
}

/**
 * Persiste o estado do fluxo de avaliação (fonte de verdade das regras de negócio).
 */
export async function saveReviewState(state: ReviewState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Garante que exista um estado inicial persistido, registrando `first_open_at` no primeiro acesso.
 */
export async function ensureReviewState(nowMs: number): Promise<ReviewState> {
  const existing = await loadReviewState(nowMs);
  if (existing) return existing;

  const created = createInitialState(nowMs);
  await saveReviewState(created);
  return created;
}

/**
 * Remove o estado de review (apenas para desenvolvimento/testes locais).
 */
export async function resetReviewState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
