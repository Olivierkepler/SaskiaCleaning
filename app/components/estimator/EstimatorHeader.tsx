"use client";

import { motion } from "framer-motion";

import {
  fadeUp,
  K,
  SCROLL_VIEWPORT,
  staggerContainer,
} from "./constants";

export type EstimatorHeaderProps = {
  showReferralSuccess: boolean;
  showReferralWarning: boolean;
  successfulReferralCode: string;
  referralDiscountAmount: number;
  warningReferralCode: string | null;
};

export function EstimatorHeader({
  showReferralSuccess,
  showReferralWarning,
  successfulReferralCode,
  referralDiscountAmount,
  warningReferralCode,
}: EstimatorHeaderProps) {
  return (
    <div id="instant-estimate" className="mx-auto mt-12 scroll-mt-24 max-w-4xl px-4 text-center sm:mt-16 sm:px-6 lg:mt-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_VIEWPORT}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeUp}
          className="
            font-heading
            max-w-3xl
            text-3xl
            font-thin
            leading-[0.95]
            tracking-tight
            sm:text-4xl
            lg:text-5xl
            text-black
            dark:text-black
          "
          style={{
            fontWeight: 300,
            letterSpacing: "-0.01em",
          }}
        >
          See Your Cleaning Price.{" "}
          <span style={{ color: K.blue }}>Instantly</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="my-4 mx-auto w-[80%] text-[16px] font-medium uppercase tracking-[0.09em] text-slate-600"
        >
          Instant estimate. Book when you&apos;re ready.
        </motion.p>

        {(showReferralSuccess || showReferralWarning) && (
          <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
            {showReferralSuccess && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left text-sm leading-relaxed text-emerald-900 shadow-sm"
              >
                🎉 Referral discount applied! You&apos;re booking with referral
                code{" "}
                <span className="font-bold">{successfulReferralCode}</span>.
                You&apos;ll receive ${referralDiscountAmount} off your first
                cleaning when you submit your booking request.
              </div>
            )}
            {showReferralWarning && (
              <div
                role="status"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left text-sm leading-relaxed text-amber-900 shadow-sm"
              >
                Referral code{" "}
                <span className="font-semibold">{warningReferralCode}</span>{" "}
                could not be applied. You can still book normally
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default EstimatorHeader;
