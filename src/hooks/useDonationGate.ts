import React from 'react';

import type { DonationState } from '../storage/donationStorage';
import {
  getDonationState,
  incrementOpenCountAfterDecline,
  markDonationDeclined,
  markDonationPaid
} from '../storage/donationStorage';

export type UseDonationGateResult = {
  shouldShowDonation: boolean;
  loading: boolean;
  donationState: DonationState | null;
  closeDonation: () => void;
  declineDonation: () => Promise<void>;
  markAsPaid: (amountInCents: number) => Promise<void>;
  refreshDonationGate: () => Promise<void>;
};

export function useDonationGate(): UseDonationGateResult {
  const [loading, setLoading] = React.useState(true);
  const [shouldShowDonation, setShouldShowDonation] = React.useState(false);
  const [donationState, setDonationState] = React.useState<DonationState | null>(null);
  const ranOnceRef = React.useRef(false);

  async function refreshDonationGate() {
    setLoading(true);
    try {
      const state = await getDonationState();

      if (state.hasDonated) {
        setDonationState(state);
        setShouldShowDonation(false);
        return;
      }

      if (!state.declined) {
        setDonationState(state);
        setShouldShowDonation(true);
        return;
      }

      const nextCount = await incrementOpenCountAfterDecline();
      setDonationState({ ...state, openCountSinceDecline: nextCount });
      setShouldShowDonation(nextCount >= 5);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (ranOnceRef.current) return;
    ranOnceRef.current = true;
    refreshDonationGate().catch(() => {});
  }, []);

  function closeDonation() {
    setShouldShowDonation(false);
  }

  async function declineDonation() {
    await markDonationDeclined();
    const next = await getDonationState();
    setDonationState(next);
    setShouldShowDonation(false);
  }

  async function markAsPaid(amountInCents: number) {
    await markDonationPaid(amountInCents);
    const next = await getDonationState();
    setDonationState(next);
    setShouldShowDonation(false);
  }

  return {
    shouldShowDonation,
    loading,
    donationState,
    closeDonation,
    declineDonation,
    markAsPaid,
    refreshDonationGate
  };
}

