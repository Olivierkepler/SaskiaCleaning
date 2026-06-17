"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EMPTY_REFERRAL_CODE_FORM,
  REFERRAL_STATUSES,
  type ReferralCode,
  type ReferralCodeInput,
  type ReferralDashboardMetrics,
  type ReferralStatus,
  type ReferralTracking,
} from "../../lib/referrals";

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

export default function ReferralDashboard({
  referralCodes,
  referrals,
  metrics,
  dashboardKey,
}: {
  referralCodes: ReferralCode[];
  referrals: ReferralTracking[];
  metrics: ReferralDashboardMetrics;
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

  const filteredReferrals = useMemo(() => {
    const query = referralSearch.trim().toLowerCase();

    return referrals.filter((referral) => {
      if (statusFilter !== "all" && referral.status !== statusFilter) {
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
  }, [referrals, referralSearch, statusFilter]);

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

  async function handleStatusChange(
    referral: ReferralTracking,
    status: ReferralStatus,
  ) {
    if (referral.status === status) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/referrals/${referral.id}?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update referral status.");
      }

      setMessage({ type: "success", text: "Referral status updated." });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update referral status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(code: ReferralCode) {
    setEditingId(code.id);
    setEditForm(toForm(code));
    setShowCreateForm(false);
    setMessage(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total referral codes" value={metrics.totalCodes} />
        <MetricCard label="Active codes" value={metrics.activeCodes} />
        <MetricCard label="Pending referrals" value={metrics.pendingReferrals} />
        <MetricCard
          label="Rewarded referrals"
          value={metrics.rewardedReferrals}
        />
        <MetricCard
          label="Total pending rewards"
          value={formatMoney(metrics.totalPendingRewards)}
        />
        <MetricCard
          label="Total rewarded amount"
          value={formatMoney(metrics.totalRewardedAmount)}
        />
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReferrals.map((referral) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
