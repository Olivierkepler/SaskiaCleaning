"use client";

import { useEffect, useState } from "react";
import type {
  ReferralPortalCodeSummary,
  ReferralPortalRewardWallet,
} from "../lib/referral-portal";
import {
  PortalCodeSection,
  PortalLoadingState,
  PortalTokenError,
  ReferralRewardWalletSection,
} from "./ReferralPortalSections";

type PortalResponse =
  | {
      success: true;
      found: true;
      codes: ReferralPortalCodeSummary[];
      wallet: ReferralPortalRewardWallet;
    }
  | { error: string };

export function ReferralPortalTokenLoader({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReferralPortalCodeSummary[] | null>(
    null,
  );
  const [wallet, setWallet] = useState<ReferralPortalRewardWallet | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPortalFromToken() {
      setIsLoading(true);
      setError(null);
      setResults(null);
      setWallet(null);

      try {
        const response = await fetch(
          `/api/referrals/portal?token=${encodeURIComponent(token)}`,
        );
        const data = (await response.json()) as PortalResponse;

        if (cancelled) return;

        if (!response.ok) {
          setError(
            "error" in data
              ? data.error
              : "Invalid or expired access link.",
          );
          return;
        }

        if ("found" in data && data.found) {
          setResults(data.codes);
          setWallet(data.wallet);
        } else {
          setError("Invalid or expired access link.");
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load referral portal data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPortalFromToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (isLoading) {
    return <PortalLoadingState />;
  }

  if (error) {
    return <PortalTokenError message={error} />;
  }

  if (!results || !wallet) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <ReferralRewardWalletSection wallet={wallet} />
      {results.map((summary) => (
        <PortalCodeSection key={summary.code} summary={summary} />
      ))}
    </div>
  );
}
