import type { Metadata } from "next";
import ReferralPortal from "./ReferralPortal";

export const metadata: Metadata = {
  title: "Referral Portal | Saskia Cleaning Services",
  description:
    "Check your Saskia Cleaning referral code, share your link, and view reward status.",
};

export default function ReferralsPage() {
  return <ReferralPortal />;
}
