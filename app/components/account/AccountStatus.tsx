import Link from "next/link";
import { CheckCircle2, Circle, UserRound } from "lucide-react";
import AccountOverviewCard from "@/app/components/account/AccountOverviewCard";

function StatusRow({ label, value, complete }: { label: string; value: string; complete: boolean }) {
  const Icon = complete ? CheckCircle2 : Circle;
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-slate-700">{label}</span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-slate-600">
        <Icon className={`h-4 w-4 ${complete ? "text-emerald-600" : "text-slate-400"}`} aria-hidden="true" />
        {value}
      </span>
    </li>
  );
}

export default function AccountStatus({
  email,
  phone,
  addressCount,
  profileFailed,
  addressesFailed,
}: {
  email: string;
  phone: string | null;
  addressCount: number;
  profileFailed: boolean;
  addressesFailed: boolean;
}) {
  return (
    <AccountOverviewCard title="Account Status" icon={<UserRound className="h-5 w-5" />}>
      <p className="mb-2 break-all text-xs text-slate-500">{email}</p>
      <ul className="divide-y divide-slate-100">
        <StatusRow label="Email" value="Connected" complete={Boolean(email)} />
        <StatusRow label="Phone" value={profileFailed ? "Status unavailable" : phone?.trim() ? "Added" : "Add phone"} complete={!profileFailed && Boolean(phone?.trim())} />
        <StatusRow label="Address" value={addressesFailed ? "Status unavailable" : addressCount === 0 ? "No saved address" : addressCount === 1 ? "1 saved address" : `${addressCount} saved addresses`} complete={!addressesFailed && addressCount > 0} />
      </ul>
      <Link href="/account/profile" className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        Update profile <span className="ml-1" aria-hidden="true">→</span>
      </Link>
    </AccountOverviewCard>
  );
}
