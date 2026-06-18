"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  EMPTY_REFERRAL_CODE_FORM,
  REFERRAL_STATUSES,
  type ReferralAnalyticsMetrics,
  type ReferralCode,
  type ReferralCodeInput,
  type ReferralFunnelStep,
  type ReferralStatus,
  type ReferralTracking,
  type TopReferrerStats,
} from "../../lib/referrals";
import type {
  ReferralNotification,
  ReferralNotificationStatus,
} from "../../lib/referral-notifications";

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

function formatReferralNotificationType(
  type: ReferralNotification["type"],
): string {
  switch (type) {
    case "referral_completed":
      return "Referral completed";
    case "referral_rewarded":
      return "Referral rewarded";
    case "admin_reward_eligible":
      return "Admin: reward eligible";
    case "admin_rewards_summary":
      return "Admin: rewards summary";
    case "referral_milestone_first":
      return "First Referral milestone";
    case "referral_milestone_champion":
      return "Referral Champion milestone";
    case "referral_milestone_vip":
      return "Saskia VIP milestone";
  }
}

type AnalyticsFilter =
  | "all"
  | "active_codes"
  | "rewarded_only"
  | "outstanding_payouts";

type NotificationStatusFilter = "all" | "sent" | "failed" | "skipped";

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function formatMoney(amount: number) {
  return `$${amount}`;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function statusBadgeClass(status: ReferralStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-sky-100 text-sky-800";
    case "rewarded":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-slate-200 text-slate-600";
  }
}

function notificationStatusBadgeClass(status: ReferralNotificationStatus) {
  switch (status) {
    case "sent":
      return "bg-emerald-100 text-emerald-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "skipped":
      return "bg-amber-100 text-amber-800";
    case "pending":
      return "bg-slate-200 text-slate-600";
  }
}

function toForm(code: ReferralCode): ReferralCodeInput {
  return {
    code: code.code,
    referrerName: code.referrerName,
    referrerEmail: code.referrerEmail,
    rewardAmount: code.rewardAmount,
    friendDiscountAmount: code.friendDiscountAmount,
    isActive: code.isActive,
  };
}

type ReferralPayoutDraft = {
  payoutAmount: number;
  payoutMethod: string;
  payoutNotes: string;
};

function ReferralCodeForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  includeCode = true,
}: {
  form: ReferralCodeInput;
  onChange: (next: ReferralCodeInput) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  includeCode?: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
      {includeCode && (
        <div>
          <label className={labelClassName}>Code</label>
          <input
            className={inputClassName}
            value={form.code ?? ""}
            onChange={(e) => onChange({ ...form, code: e.target.value })}
            placeholder="BARBARA20"
          />
        </div>
      )}
      <div>
        <label className={labelClassName}>Referrer name</label>
        <input
          className={inputClassName}
          value={form.referrerName}
          onChange={(e) => onChange({ ...form, referrerName: e.target.value })}
          placeholder="Barbara Smith"
        />
      </div>
      <div>
        <label className={labelClassName}>Referrer email</label>
        <input
          type="email"
          className={inputClassName}
          value={form.referrerEmail ?? ""}
          onChange={(e) =>
            onChange({
              ...form,
              referrerEmail: e.target.value.trim() || null,
            })
          }
          placeholder="referrer@example.com"
        />
      </div>
      <div>
        <label className={labelClassName}>Reward amount</label>
        <input
          type="number"
          min={0}
          className={inputClassName}
          value={form.rewardAmount}
          onChange={(e) =>
            onChange({
              ...form,
              rewardAmount: Number.parseInt(e.target.value || "0", 10),
            })
          }
        />
      </div>
      <div>
        <label className={labelClassName}>Friend discount amount</label>
        <input
          type="number"
          min={0}
          className={inputClassName}
          value={form.friendDiscountAmount}
          onChange={(e) =>
            onChange({
              ...form,
              friendDiscountAmount: Number.parseInt(e.target.value || "0", 10),
            })
          }
        />
      </div>
      <div className="flex items-center sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-100"
          />
          Active
        </label>
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function AnalyticsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

function ReferralFunnel({ steps }: { steps: ReferralFunnelStep[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
        Referral funnel
      </h2>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.key}>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-800">{step.label}</p>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">{step.count}</span>
                {step.conversionPercent != null && (
                  <span className="ml-2 text-sky-700">
                    ({step.conversionPercent}%)
                  </span>
                )}
              </p>
            </div>
            {index < steps.length - 1 && (
              <p className="py-1 text-center text-lg text-slate-300">↓</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopReferrersTable({ referrers }: { referrers: TopReferrerStats[] }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <h2 className="text-lg font-bold text-slate-900">Top referrers</h2>
        <p className="text-sm text-slate-500">
          Ranked by completed referrals (top 10)
        </p>
      </div>
      {referrers.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No referral usage yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Referrer",
                  "Code",
                  "Referrals",
                  "Completed",
                  "Rewarded",
                  "Earned",
                  "Paid",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrers.map((referrer) => (
                <tr key={referrer.referralCode} className="align-top">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {referrer.referrerName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sky-700">
                    {referrer.referralCode}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {referrer.referralsCount}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {referrer.completedReferrals}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {referrer.rewardedReferrals}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatMoney(referrer.totalRewardsEarned)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatMoney(referrer.totalRewardsPaid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CopyableMessageId({ messageId }: { messageId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(messageId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-1">
      <code className="block break-all rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
        {messageId}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="text-xs font-semibold text-sky-600 transition hover:text-sky-700"
      >
        {copied ? "Copied" : "Copy message ID"}
      </button>
      <p className="text-[11px] text-slate-400">
        Search this ID in the Resend dashboard to view delivery details.
      </p>
    </div>
  );
}

function NotificationHistorySection({
  notifications,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  onExportCsv,
  isExpanded,
  onToggleExpanded,
}: {
  notifications: ReferralNotification[];
  statusFilter: NotificationStatusFilter;
  onStatusFilterChange: (value: NotificationStatusFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onExportCsv: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex items-start gap-2 text-left"
          >
            <span className="mt-0.5 text-slate-400">{isExpanded ? "▾" : "▸"}</span>
            <span>
              <h2 className="text-lg font-bold text-slate-900">
                Notification history
              </h2>
              <p className="text-sm text-slate-500">
                {notifications.length} notification
                {notifications.length === 1 ? "" : "s"}
              </p>
            </span>
          </button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onExportCsv}
              disabled={notifications.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export notifications CSV
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className={inputClassName}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recipient, code, subject, names..."
            />
            <select
              className={inputClassName}
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as NotificationStatusFilter)
              }
            >
              <option value="all">All</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        )}
      </div>

      {isExpanded &&
        (notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No notification attempts match your filters.
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${notificationStatusBadgeClass(notification.status)}`}
                    >
                      {notification.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {formatReferralNotificationType(notification.type)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(notification.createdAt)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-sky-700">
                    {notification.code}
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    {notification.recipientEmail || "—"}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{notification.subject}</p>
                  {(notification.referrerName || notification.referredName) && (
                    <p className="mt-2 text-xs text-slate-500">
                      {notification.referrerName ?? "—"} → {notification.referredName}
                    </p>
                  )}
                  {notification.providerMessageId && (
                    <div className="mt-3">
                      <CopyableMessageId messageId={notification.providerMessageId} />
                    </div>
                  )}
                  {notification.errorMessage && (
                    <p className="mt-2 text-xs text-red-700">
                      {notification.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Date",
                      "Type",
                      "Code",
                      "Recipient",
                      "Subject",
                      "Status",
                      "Message ID",
                      "Error",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="align-top">
                      <td className="px-4 py-4 text-slate-700">
                        {formatDate(notification.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {formatReferralNotificationType(notification.type)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-sky-700">
                          {notification.code}
                        </p>
                        {notification.referrerName && (
                          <p className="mt-1 text-xs text-slate-500">
                            {notification.referrerName}
                          </p>
                        )}
                        {notification.referredName && (
                          <p className="text-xs text-slate-400">
                            Referred: {notification.referredName}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {notification.recipientEmail || "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {notification.subject}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${notificationStatusBadgeClass(notification.status)}`}
                        >
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {notification.providerMessageId ? (
                          <CopyableMessageId
                            messageId={notification.providerMessageId}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-red-700">
                        {notification.errorMessage ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
    </div>
  );
}

export default function ReferralDashboard({
  referralCodes,
  referrals,
  notifications,
  analytics,
  funnel,
  topReferrers,
  referrerExportRows,
  dashboardKey,
}: {
  referralCodes: ReferralCode[];
  referrals: ReferralTracking[];
  notifications: ReferralNotification[];
  analytics: ReferralAnalyticsMetrics;
  funnel: ReferralFunnelStep[];
  topReferrers: TopReferrerStats[];
  referrerExportRows: TopReferrerStats[];
  dashboardKey: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<ReferralCodeInput>(
    EMPTY_REFERRAL_CODE_FORM,
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ReferralCodeInput>(
    EMPTY_REFERRAL_CODE_FORM,
  );
  const [codeSearch, setCodeSearch] = useState("");
  const [referralSearch, setReferralSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "all">(
    "all",
  );
  const [analyticsFilter, setAnalyticsFilter] =
    useState<AnalyticsFilter>("all");
  const [payoutDrafts, setPayoutDrafts] = useState<
    Record<number, ReferralPayoutDraft>
  >({});
  const [notificationSearch, setNotificationSearch] = useState("");
  const [notificationStatusFilter, setNotificationStatusFilter] =
    useState<NotificationStatusFilter>("all");
  const [notificationHistoryExpanded, setNotificationHistoryExpanded] =
    useState(true);
  const [isSendingSummary, setIsSendingSummary] = useState(false);

  function getPayoutDraft(referral: ReferralTracking): ReferralPayoutDraft {
    const draft = payoutDrafts[referral.id];
    if (draft) return draft;

    return {
      payoutAmount: referral.payoutAmount ?? referral.rewardAmount,
      payoutMethod: referral.payoutMethod ?? "",
      payoutNotes: referral.payoutNotes ?? "",
    };
  }

  function updatePayoutDraft(
    referralId: number,
    referral: ReferralTracking,
    patch: Partial<ReferralPayoutDraft>,
  ) {
    setPayoutDrafts((current) => ({
      ...current,
      [referralId]: {
        ...getPayoutDraft(referral),
        ...patch,
      },
    }));
  }

  function clearPayoutDraft(referralId: number) {
    setPayoutDrafts((current) => {
      const next = { ...current };
      delete next[referralId];
      return next;
    });
  }

  const filteredCodes = useMemo(() => {
    const query = codeSearch.trim().toLowerCase();
    if (!query) return referralCodes;

    return referralCodes.filter((code) => {
      const haystack = [
        code.code,
        code.referrerName,
        code.referrerEmail ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [referralCodes, codeSearch]);

  const activeReferralCodes = useMemo(
    () => new Set(referralCodes.filter((code) => code.isActive).map((c) => c.code)),
    [referralCodes],
  );

  const filteredReferrals = useMemo(() => {
    const query = referralSearch.trim().toLowerCase();

    return referrals.filter((referral) => {
      if (statusFilter !== "all" && referral.status !== statusFilter) {
        return false;
      }

      if (analyticsFilter === "active_codes" && !activeReferralCodes.has(referral.code)) {
        return false;
      }

      if (analyticsFilter === "rewarded_only" && referral.status !== "rewarded") {
        return false;
      }

      if (
        analyticsFilter === "outstanding_payouts" &&
        referral.status !== "completed"
      ) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        referral.code,
        referral.referredName,
        referral.referredEmail,
        referral.referrerName ?? "",
        referral.referrerEmail ?? "",
        referral.bookingService ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [
    referrals,
    referralSearch,
    statusFilter,
    analyticsFilter,
    activeReferralCodes,
  ]);

  const filteredNotifications = useMemo(() => {
    const query = notificationSearch.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (
        notificationStatusFilter !== "all" &&
        notification.status !== notificationStatusFilter
      ) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        notification.recipientEmail,
        notification.code,
        notification.subject,
        notification.referredName,
        notification.referredEmail,
        notification.referrerName ?? "",
        notification.referrerEmail ?? "",
        formatReferralNotificationType(notification.type),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [notifications, notificationSearch, notificationStatusFilter]);

  function handleExportAnalyticsCsv() {
    const headers = [
      "Referrer Name",
      "Referral Code",
      "Usage Count",
      "Completed Referrals",
      "Rewarded Referrals",
      "Pending Rewards",
      "Paid Rewards",
      "Outstanding Rewards",
    ];

    const rows = referrerExportRows.map((referrer) =>
      [
        escapeCsvValue(referrer.referrerName),
        escapeCsvValue(referrer.referralCode),
        escapeCsvValue(String(referrer.referralsCount)),
        escapeCsvValue(String(referrer.completedReferrals)),
        escapeCsvValue(String(referrer.rewardedReferrals)),
        escapeCsvValue(String(referrer.pendingRewards)),
        escapeCsvValue(String(referrer.totalRewardsPaid)),
        escapeCsvValue(String(referrer.outstandingRewards)),
      ].join(","),
    );

    const csv = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "referral-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleExportNotificationsCsv() {
    const headers = [
      "Created At",
      "Type",
      "Status",
      "Referral Code",
      "Recipient Email",
      "Subject",
      "Provider Message ID",
      "Error Message",
    ];

    const rows = filteredNotifications.map((notification) =>
      [
        escapeCsvValue(notification.createdAt),
        escapeCsvValue(formatReferralNotificationType(notification.type)),
        escapeCsvValue(notification.status),
        escapeCsvValue(notification.code),
        escapeCsvValue(notification.recipientEmail),
        escapeCsvValue(notification.subject),
        escapeCsvValue(notification.providerMessageId ?? ""),
        escapeCsvValue(notification.errorMessage ?? ""),
      ].join(","),
    );

    const csv = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "referral-notifications.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSendOutstandingSummary() {
    setIsSendingSummary(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referrals/admin-reminders?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "summary" }),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        notification?: { status?: string; errorMessage?: string | null };
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to send outstanding rewards summary.");
      }

      const status = data.notification?.status;
      if (status === "sent") {
        setMessage({
          type: "success",
          text: "Outstanding rewards summary email sent to admin.",
        });
      } else if (status === "skipped") {
        setMessage({
          type: "success",
          text:
            data.notification?.errorMessage ??
            "Summary email skipped. Check ADMIN_NOTIFICATION_EMAIL configuration.",
        });
      } else {
        throw new Error(
          data.notification?.errorMessage || "Failed to send summary email.",
        );
      }

      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to send outstanding rewards summary.",
      });
    } finally {
      setIsSendingSummary(false);
    }
  }

  async function handleCreate() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referral-codes?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createForm),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to create referral code.");
      }

      setMessage({ type: "success", text: "Referral code created." });
      setCreateForm(EMPTY_REFERRAL_CODE_FORM);
      setShowCreateForm(false);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to create referral code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveEdit(id: number) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referral-codes/${id}?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update referral code.");
      }

      setMessage({ type: "success", text: "Referral code updated." });
      setEditingId(null);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update referral code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(code: ReferralCode) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referral-codes/${code.id}?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !code.isActive }),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update referral code.");
      }

      setMessage({
        type: "success",
        text: code.isActive
          ? "Referral code deactivated."
          : "Referral code activated.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update referral code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(code: ReferralCode) {
    const confirmed = confirm(
      code.usageCount > 0
        ? `Deactivate referral code "${code.code}"? It has ${code.usageCount} referral use(s) and will be deactivated instead of deleted.`
        : `Delete referral code "${code.code}"?`,
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referral-codes/${code.id}?key=${encodeURIComponent(dashboardKey)}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        softDeleted?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete referral code.");
      }

      if (editingId === code.id) setEditingId(null);
      setMessage({
        type: "success",
        text:
          data.message ??
          (data.softDeleted
            ? "Referral code deactivated."
            : "Referral code deleted."),
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete referral code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function patchReferral(
    referralId: number,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referrals/${referralId}?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update referral.");
      }

      clearPayoutDraft(referralId);
      setMessage({ type: "success", text: successMessage });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update referral.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(
    referral: ReferralTracking,
    status: ReferralStatus,
  ) {
    if (referral.status === status) return;
    await patchReferral(referral.id, { status }, "Referral status updated.");
  }

  async function handleSavePayout(referral: ReferralTracking) {
    const draft = getPayoutDraft(referral);

    await patchReferral(
      referral.id,
      {
        payoutAmount: draft.payoutAmount,
        payoutMethod: draft.payoutMethod.trim() || null,
        payoutNotes: draft.payoutNotes.trim() || null,
      },
      "Payout details saved.",
    );
  }

  async function handleMarkRewarded(referral: ReferralTracking) {
    if (referral.status === "rewarded") return;

    const draft = getPayoutDraft(referral);
    const body: Record<string, unknown> = { status: "rewarded" };

    if (draft.payoutMethod.trim()) {
      body.payoutMethod = draft.payoutMethod.trim();
    }
    if (draft.payoutNotes.trim()) {
      body.payoutNotes = draft.payoutNotes.trim();
    }
    if (draft.payoutAmount !== referral.rewardAmount) {
      body.payoutAmount = draft.payoutAmount;
    }

    await patchReferral(referral.id, body, "Referral marked as rewarded.");
  }

  function startEdit(code: ReferralCode) {
    setEditingId(code.id);
    setEditForm(toForm(code));
    setShowCreateForm(false);
    setMessage(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Referral analytics</h2>
          <p className="text-sm text-slate-500">
            Performance, revenue impact, and reward liability
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSendOutstandingSummary}
            disabled={isSendingSummary || isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingSummary
              ? "Sending summary..."
              : "Send Outstanding Rewards Summary"}
          </button>
          <button
            type="button"
            onClick={handleExportAnalyticsCsv}
            disabled={referrerExportRows.length === 0}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export analytics CSV
          </button>
        </div>
      </div>

      <AnalyticsSection title="Referral codes">
        <MetricCard label="Total referral codes" value={analytics.totalCodes} />
        <MetricCard label="Active codes" value={analytics.activeCodes} />
        <MetricCard label="Inactive codes" value={analytics.inactiveCodes} />
      </AnalyticsSection>

      <AnalyticsSection title="Referral usage">
        <MetricCard label="Total referrals" value={analytics.totalReferrals} />
        <MetricCard label="Pending referrals" value={analytics.pendingReferrals} />
        <MetricCard
          label="Completed referrals"
          value={analytics.completedReferrals}
        />
        <MetricCard
          label="Rewarded referrals"
          value={analytics.rewardedReferrals}
        />
        <MetricCard
          label="Cancelled referrals"
          value={analytics.cancelledReferrals}
        />
      </AnalyticsSection>

      <AnalyticsSection title="Reward tracking">
        <MetricCard
          label="Total pending rewards"
          value={formatMoney(analytics.totalPendingRewards)}
        />
        <MetricCard
          label="Total rewarded amount"
          value={formatMoney(analytics.totalRewardedAmount)}
        />
        <MetricCard
          label="Total paid amount"
          value={formatMoney(analytics.totalPaidAmount)}
          hint="Sum of payout amounts for rewarded referrals"
        />
        <MetricCard
          label="Outstanding reward liability"
          value={formatMoney(analytics.outstandingRewardLiability)}
          hint="Pending + completed owed + any underpaid rewarded"
        />
        <MetricCard
          label="Rewards owed"
          value={formatMoney(analytics.rewardsOwed)}
          hint="Completed referrals not yet rewarded"
        />
      </AnalyticsSection>

      <AnalyticsSection title="Revenue">
        <MetricCard
          label="Referral bookings"
          value={analytics.referralBookingsCount}
        />
        <MetricCard
          label="Estimated referral revenue"
          value={formatMoney(analytics.estimatedReferralRevenue)}
          hint="Sum of linked booking mid estimates"
        />
        <MetricCard
          label="Average referral booking"
          value={formatMoney(analytics.averageReferralBookingValue)}
        />
      </AnalyticsSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReferralFunnel steps={funnel} />
        <TopReferrersTable referrers={topReferrers} />
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Referral codes</h2>
              <p className="text-sm text-slate-500">
                {filteredCodes.length} code{filteredCodes.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className={inputClassName}
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                placeholder="Search code, referrer..."
              />
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm((value) => !value);
                  setEditingId(null);
                  setMessage(null);
                }}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                {showCreateForm ? "Hide create form" : "Create code"}
              </button>
            </div>
          </div>

          {showCreateForm && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                New referral code
              </h3>
              <ReferralCodeForm
                form={createForm}
                onChange={setCreateForm}
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
                submitLabel="Create code"
                isSubmitting={isSubmitting}
                includeCode={false}
              />
              <p className="mt-2 text-xs text-slate-500">
                Leave code blank to auto-generate from referrer name.
              </p>
            </div>
          )}
        </div>

        {filteredCodes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No referral codes match your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredCodes.map((code) => (
              <div key={code.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {code.code}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          code.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {code.referrerName}
                    </p>
                    {code.referrerEmail && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {code.referrerEmail}
                      </p>
                    )}
                    <div className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-slate-700">
                          Reward:
                        </span>{" "}
                        {formatMoney(code.rewardAmount)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">
                          Friend discount:
                        </span>{" "}
                        {formatMoney(code.friendDiscountAmount)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">
                          Usage count:
                        </span>{" "}
                        {code.usageCount}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">
                          Created:
                        </span>{" "}
                        {formatDate(code.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(code)}
                      disabled={isSubmitting}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(code)}
                      disabled={isSubmitting}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      {code.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(code)}
                      disabled={isSubmitting}
                      className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {code.usageCount > 0 ? "Deactivate" : "Delete"}
                    </button>
                  </div>
                </div>

                {editingId === code.id && (
                  <div className="mt-4">
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                      Edit referral code
                    </h4>
                    <ReferralCodeForm
                      form={editForm}
                      onChange={setEditForm}
                      onSubmit={() => handleSaveEdit(code.id)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save changes"
                      isSubmitting={isSubmitting}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Referral tracking
              </h2>
              <p className="text-sm text-slate-500">
                {filteredReferrals.length} referral
                {filteredReferrals.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className={inputClassName}
                value={referralSearch}
                onChange={(e) => setReferralSearch(e.target.value)}
                placeholder="Search code, customer, referrer..."
              />
              <select
                className={inputClassName}
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ReferralStatus | "all")
                }
              >
                <option value="all">All statuses</option>
                {REFERRAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName}
                value={analyticsFilter}
                onChange={(e) =>
                  setAnalyticsFilter(e.target.value as AnalyticsFilter)
                }
              >
                <option value="all">All referrals</option>
                <option value="active_codes">Active codes only</option>
                <option value="rewarded_only">Rewarded only</option>
                <option value="outstanding_payouts">Outstanding payouts only</option>
              </select>
            </div>
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No referrals match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Referred customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code / Referrer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rewards
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payout
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReferrals.map((referral) => {
                  const payoutDraft = getPayoutDraft(referral);
                  const hasPayoutInfo =
                    referral.payoutAmount != null ||
                    referral.payoutMethod ||
                    referral.payoutNotes ||
                    referral.rewardedAt;

                  return (
                  <tr key={referral.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {referral.referredName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {referral.referredEmail}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(referral.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-sky-700">{referral.code}</p>
                      <p className="mt-1 text-slate-700">
                        {referral.referrerName ?? "—"}
                      </p>
                      {referral.referrerEmail && (
                        <p className="text-xs text-slate-500">
                          {referral.referrerEmail}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">
                        {referral.bookingService ?? "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Booking #{referral.bookingRequestId}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {referral.bookingEstimateMid != null
                          ? `Estimate: ${formatMoney(referral.bookingEstimateMid)}`
                          : "No estimate"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(referral.bookingCreatedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">
                        Reward: {formatMoney(referral.rewardAmount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Friend discount:{" "}
                        {formatMoney(referral.friendDiscountAmount)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-[12rem] space-y-2">
                        {hasPayoutInfo && (
                          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                            {referral.payoutAmount != null && (
                              <p>
                                <span className="font-semibold">Paid:</span>{" "}
                                {formatMoney(referral.payoutAmount)}
                              </p>
                            )}
                            {referral.payoutMethod && (
                              <p className="mt-1">
                                <span className="font-semibold">Method:</span>{" "}
                                {referral.payoutMethod}
                              </p>
                            )}
                            {referral.rewardedAt && (
                              <p className="mt-1">
                                <span className="font-semibold">Rewarded:</span>{" "}
                                {formatDate(referral.rewardedAt)}
                              </p>
                            )}
                            {referral.payoutNotes && (
                              <p className="mt-1 whitespace-pre-wrap">
                                <span className="font-semibold">Notes:</span>{" "}
                                {referral.payoutNotes}
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <label className={labelClassName}>Payout amount</label>
                          <input
                            type="number"
                            min={0}
                            className={inputClassName}
                            value={payoutDraft.payoutAmount}
                            disabled={isSubmitting}
                            onChange={(e) =>
                              updatePayoutDraft(referral.id, referral, {
                                payoutAmount: Number.parseInt(
                                  e.target.value || "0",
                                  10,
                                ),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>Payout method</label>
                          <input
                            className={inputClassName}
                            value={payoutDraft.payoutMethod}
                            disabled={isSubmitting}
                            placeholder="Venmo, Zelle, cash..."
                            onChange={(e) =>
                              updatePayoutDraft(referral.id, referral, {
                                payoutMethod: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClassName}>Payout notes</label>
                          <textarea
                            className={`${inputClassName} min-h-[4.5rem] resize-y`}
                            value={payoutDraft.payoutNotes}
                            disabled={isSubmitting}
                            placeholder="Internal notes..."
                            onChange={(e) =>
                              updatePayoutDraft(referral.id, referral, {
                                payoutNotes: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSavePayout(referral)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save payout
                          </button>
                          {referral.status !== "rewarded" && (
                            <button
                              type="button"
                              disabled={
                                isSubmitting ||
                                referral.status === "cancelled"
                              }
                              onClick={() => handleMarkRewarded(referral)}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Mark rewarded
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClass(referral.status)}`}
                      >
                        {referral.status}
                      </span>
                      <select
                        className={`${inputClassName} mt-2 min-w-[9rem]`}
                        value={referral.status}
                        disabled={isSubmitting}
                        onChange={(e) =>
                          handleStatusChange(
                            referral,
                            e.target.value as ReferralStatus,
                          )
                        }
                      >
                        {REFERRAL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationHistorySection
        notifications={filteredNotifications}
        statusFilter={notificationStatusFilter}
        onStatusFilterChange={setNotificationStatusFilter}
        search={notificationSearch}
        onSearchChange={setNotificationSearch}
        onExportCsv={handleExportNotificationsCsv}
        isExpanded={notificationHistoryExpanded}
        onToggleExpanded={() =>
          setNotificationHistoryExpanded((value) => !value)
        }
      />
    </div>
  );
}
