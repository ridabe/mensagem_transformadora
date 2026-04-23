import React from 'react';

import type { ReviewEvent, ReviewState } from '../services/review/reviewRules';
import { reviewService } from '../services/review/reviewService';

type UseInAppReviewResult = {
  visible: boolean;
  isWorking: boolean;
  state: ReviewState | null;
  requestPrompt: (event: ReviewEvent) => Promise<boolean>;
  handleReviewNow: () => Promise<void>;
  handleReviewLater: () => Promise<void>;
  handleAlreadyReviewed: () => Promise<void>;
};

const PROMPT_DEBOUNCE_MS = 2000;

export function useInAppReview(): UseInAppReviewResult {
  const [visible, setVisible] = React.useState(false);
  const [isWorking, setIsWorking] = React.useState(false);
  const [state, setState] = React.useState<ReviewState | null>(null);

  const visibleRef = React.useRef(false);
  const lastAttemptAtRef = React.useRef(0);

  React.useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  React.useEffect(() => {
    reviewService
      .registerFirstAppOpen()
      .then((s) => setState(s))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    return () => {
      if (!visibleRef.current) return;
      reviewService.handleReviewLater().catch(() => {});
    };
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      const next = await reviewService.getReviewState();
      setState(next);
    } catch {}
  }, []);

  /**
   * Solicita a abertura do modal (pré-API) de forma controlada.
   * O serviço garante que nunca abrirá antes de `nextReviewAt`.
   */
  const requestPrompt = React.useCallback(
    async (event: ReviewEvent) => {
      if (visibleRef.current) return false;

      const nowMs = Date.now();
      if (nowMs - lastAttemptAtRef.current < PROMPT_DEBOUNCE_MS) return false;
      lastAttemptAtRef.current = nowMs;

      try {
        const decision = await reviewService.shouldShowReviewPrompt(event);
        setState(decision.state);
        if (!decision.shouldShow) return false;

        setVisible(true);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  /**
   * Handler do botão "Avaliar agora" do modal.
   */
  const handleReviewNow = React.useCallback(async () => {
    if (isWorking) return;
    try {
      setIsWorking(true);
      await reviewService.handleReviewNow();
    } finally {
      setIsWorking(false);
      setVisible(false);
      await refresh();
    }
  }, [isWorking, refresh]);

  /**
   * Handler do botão "Lembrar depois" do modal.
   */
  const handleReviewLater = React.useCallback(async () => {
    if (isWorking) return;
    try {
      setIsWorking(true);
      await reviewService.handleReviewLater();
    } finally {
      setIsWorking(false);
      setVisible(false);
      await refresh();
    }
  }, [isWorking, refresh]);

  /**
   * Handler do botão "Já avaliei" do modal.
   * Esta é uma confirmação rastreável no fluxo do app, portanto pode gravar `rated_confirmed`.
   */
  const handleAlreadyReviewed = React.useCallback(async () => {
    if (isWorking) return;
    try {
      setIsWorking(true);
      await reviewService.handleAlreadyReviewed();
    } finally {
      setIsWorking(false);
      setVisible(false);
      await refresh();
    }
  }, [isWorking, refresh]);

  return {
    visible,
    isWorking,
    state,
    requestPrompt,
    handleReviewNow,
    handleReviewLater,
    handleAlreadyReviewed
  };
}

