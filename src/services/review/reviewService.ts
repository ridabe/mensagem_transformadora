import InAppReview from 'react-native-in-app-review';
import { Linking, Platform } from 'react-native';

import { ANDROID_PACKAGE_NAME } from './reviewConfig';
import type { ReviewEvent, ReviewState } from './reviewRules';
import { addIntervalMs, isEligibleForReview, nowUtcMs, normalizeState, shouldShowReviewPrompt } from './reviewRules';
import { ensureReviewState, loadReviewState, resetReviewState, saveReviewState } from './reviewStorage';

type ReviewDecision = {
  shouldShow: boolean;
  state: ReviewState;
  reason:
    | 'rated_confirmed'
    | 'not_initialized'
    | 'not_android'
    | 'not_time_yet'
    | 'event_not_allowed'
    | 'eligible';
};

let locked = false;

/**
 * Serviço centralizado (reutilizável) para avaliação in-app.
 * A Play Store é apenas o mecanismo de exibição; a regra de 3 dias é controlada localmente via AsyncStorage.
 */
export const reviewService = {
  /**
   * Registra o primeiro uso do app (idempotente). Não exibe nada.
   */
  async registerFirstAppOpen(): Promise<ReviewState> {
    const nowMs = nowUtcMs();
    return ensureReviewState(nowMs);
  },

  /**
   * Retorna o estado atual (normalizado) garantindo persistência inicial.
   */
  async getReviewState(): Promise<ReviewState> {
    const nowMs = nowUtcMs();
    const state = await ensureReviewState(nowMs);
    const normalized = normalizeState(state, nowMs);
    if (normalized.review_status !== state.review_status) {
      await saveReviewState(normalized);
    }
    return normalized;
  },

  /**
   * Calcula elegibilidade estritamente por tempo e status (nunca antes de `next_review_at`).
   */
  async isEligibleForReview(): Promise<boolean> {
    const state = await this.getReviewState();
    return isEligibleForReview(state, nowUtcMs());
  },

  /**
   * Decide se pode mostrar o modal customizado agora, com base no evento que disparou a tentativa.
   * Regras:
   * - nunca mostrar antes de `next_review_at`
   * - nunca mostrar se `rated_confirmed`
   * - não mostrar em eventos não permitidos (ex.: `app_open`)
   */
  async shouldShowReviewPrompt(event: ReviewEvent): Promise<ReviewDecision> {
    const nowMs = nowUtcMs();
    const existing = await loadReviewState(nowMs);
    if (!existing) {
      return { shouldShow: false, state: await ensureReviewState(nowMs), reason: 'not_initialized' };
    }

    const state = normalizeState(existing, nowMs);

    if (Platform.OS !== 'android') {
      return { shouldShow: false, state, reason: 'not_android' };
    }

    if (state.review_status === 'rated_confirmed') {
      return { shouldShow: false, state, reason: 'rated_confirmed' };
    }

    if (event === 'app_open') {
      return { shouldShow: false, state, reason: 'event_not_allowed' };
    }

    if (!shouldShowReviewPrompt(state, nowMs)) {
      return { shouldShow: false, state, reason: 'not_time_yet' };
    }

    return { shouldShow: true, state, reason: 'eligible' };
  },

  /**
   * Marca adiamento e agenda uma nova elegibilidade para exatamente +3 dias.
   */
  async markReviewPostponed(): Promise<ReviewState> {
    const nowMs = nowUtcMs();
    const state = await ensureReviewState(nowMs);
    const next: ReviewState = {
      ...state,
      review_status: 'postponed',
      next_review_at: addIntervalMs(nowMs)
    };
    await saveReviewState(next);
    return next;
  },

  /**
   * Marca que o app tentou abrir a avaliação (sem confirmação rastreável) e agenda +3 dias.
   */
  async markReviewRequestedButUnconfirmed(): Promise<ReviewState> {
    const nowMs = nowUtcMs();
    const state = await ensureReviewState(nowMs);
    const next: ReviewState = {
      ...state,
      review_status: 'requested_but_unconfirmed',
      last_review_request_at: nowMs,
      review_request_count: (state.review_request_count ?? 0) + 1,
      next_review_at: addIntervalMs(nowMs)
    };
    await saveReviewState(next);
    return next;
  },

  /**
   * Marca avaliação confirmada por ação rastreável no app (ex.: botão "Já avaliei").
   * Uma vez confirmado, nunca mais exibir.
   */
  async markReviewConfirmed(): Promise<ReviewState> {
    const nowMs = nowUtcMs();
    const state = await ensureReviewState(nowMs);
    const next: ReviewState = {
      ...state,
      review_status: 'rated_confirmed',
      rated_confirmed_at: nowMs
    };
    await saveReviewState(next);
    return next;
  },

  /**
   * Tenta abrir o review nativo (Play In-App Review). A Play Store pode decidir não exibir.
   * O retorno NÃO deve ser usado para "confirmar" que o usuário avaliou.
   */
  async tryOpenNativeReview(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!InAppReview.isAvailable()) return false;

    try {
      return await InAppReview.RequestInAppReview();
    } catch {
      return false;
    }
  },

  /**
   * Fallback para abrir a página do app na Play Store.
   */
  async openStoreReviewPage(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    const marketUrl = `market://details?id=${ANDROID_PACKAGE_NAME}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

    try {
      const canOpenMarket = await Linking.canOpenURL(marketUrl);
      await Linking.openURL(canOpenMarket ? marketUrl : webUrl);
      return true;
    } catch {
      try {
        await Linking.openURL(webUrl);
        return true;
      } catch {
        return false;
      }
    }
  },

  /**
   * Handler do botão "Avaliar agora" do modal.
   * - tenta o review nativo
   * - faz fallback para Play Store
   * - marca como `requested_but_unconfirmed` e agenda +3 dias (sem inventar confirmação)
   */
  async handleReviewNow(): Promise<{ opened: boolean; state: ReviewState }> {
    if (locked) return { opened: false, state: await this.getReviewState() };
    locked = true;
    try {
      const openedNative = await this.tryOpenNativeReview();
      const opened = openedNative ? true : await this.openStoreReviewPage();
      const state = await this.markReviewRequestedButUnconfirmed();
      return { opened, state };
    } finally {
      locked = false;
    }
  },

  /**
   * Handler do botão "Lembrar depois" do modal.
   */
  async handleReviewLater(): Promise<ReviewState> {
    return this.markReviewPostponed();
  },

  /**
   * Handler do botão "Já avaliei" do modal.
   */
  async handleAlreadyReviewed(): Promise<ReviewState> {
    return this.markReviewConfirmed();
  },

  /**
   * Reset do estado (somente em desenvolvimento).
   */
  async devReset(): Promise<void> {
    if (!__DEV__) return;
    await resetReviewState();
  }
};
