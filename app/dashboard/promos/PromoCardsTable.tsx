"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  EMPTY_PROMO_CARD_FORM,
  type PromoCard,
  type PromoCardInput,
} from "../../lib/promo-cards";

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function toForm(card: PromoCard): PromoCardInput {
  return {
    tag: card.tag,
    title: card.title,
    titleSmall: card.titleSmall,
    description: card.description,
    ctaLabel: card.ctaLabel,
    ctaHref: card.ctaHref,
    imageUrl: card.imageUrl,
    imageAlt: card.imageAlt,
    isRedTag: card.isRedTag,
    sortOrder: card.sortOrder,
    isActive: card.isActive,
  };
}

function PromoCardForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: {
  form: PromoCardInput;
  onChange: (next: PromoCardInput) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
      <div>
        <label className={labelClassName}>Tag</label>
        <input
          className={inputClassName}
          value={form.tag}
          onChange={(e) => onChange({ ...form, tag: e.target.value })}
          placeholder="REFERRAL"
        />
      </div>
      <div>
        <label className={labelClassName}>Sort order</label>
        <input
          type="number"
          min={0}
          className={inputClassName}
          value={form.sortOrder}
          onChange={(e) =>
            onChange({
              ...form,
              sortOrder: Number.parseInt(e.target.value || "0", 10),
            })
          }
        />
      </div>
      <div>
        <label className={labelClassName}>Title</label>
        <input
          className={inputClassName}
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClassName}>Title small</label>
        <input
          className={inputClassName}
          value={form.titleSmall ?? ""}
          onChange={(e) =>
            onChange({
              ...form,
              titleSmall: e.target.value || null,
            })
          }
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClassName}>Description</label>
        <textarea
          rows={2}
          className={`${inputClassName} resize-none`}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClassName}>CTA label</label>
        <input
          className={inputClassName}
          value={form.ctaLabel}
          onChange={(e) => onChange({ ...form, ctaLabel: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClassName}>CTA href</label>
        <input
          className={inputClassName}
          value={form.ctaHref}
          onChange={(e) => onChange({ ...form, ctaHref: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClassName}>Image URL</label>
        <input
          className={inputClassName}
          value={form.imageUrl}
          onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
          placeholder="/images/example.jpg"
        />
      </div>
      <div>
        <label className={labelClassName}>Image alt</label>
        <input
          className={inputClassName}
          value={form.imageAlt}
          onChange={(e) => onChange({ ...form, imageAlt: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isRedTag}
            onChange={(e) => onChange({ ...form, isRedTag: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-100"
          />
          Red tag
        </label>
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

export default function PromoCardsTable({
  cards,
  dashboardKey,
}: {
  cards: PromoCard[];
  dashboardKey: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<PromoCardInput>(EMPTY_PROMO_CARD_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PromoCardInput>(EMPTY_PROMO_CARD_FORM);

  const sortedCards = useMemo(
    () =>
      [...cards].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
      ),
    [cards],
  );

  async function handleCreate() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/promo-cards?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createForm),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to create promo card.");
      }

      setMessage({ type: "success", text: "Promo card created." });
      setCreateForm(EMPTY_PROMO_CARD_FORM);
      setShowCreateForm(false);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create promo card.",
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
        `/api/promo-cards/${id}?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update promo card.");
      }

      setMessage({ type: "success", text: "Promo card updated." });
      setEditingId(null);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update promo card.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(card: PromoCard) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/promo-cards/${card.id}?key=${encodeURIComponent(dashboardKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !card.isActive }),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update promo card.");
      }

      setMessage({
        type: "success",
        text: card.isActive ? "Promo card deactivated." : "Promo card activated.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update promo card.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    const confirmed = confirm(`Delete promo card "${title}"?`);
    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/promo-cards/${id}?key=${encodeURIComponent(dashboardKey)}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete promo card.");
      }

      if (editingId === id) setEditingId(null);
      setMessage({ type: "success", text: "Promo card deleted." });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete promo card.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(card: PromoCard) {
    setEditingId(card.id);
    setEditForm(toForm(card));
    setShowCreateForm(false);
    setMessage(null);
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {sortedCards.length} promo card{sortedCards.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={() => {
              setShowCreateForm((value) => !value);
              setEditingId(null);
              setMessage(null);
            }}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            {showCreateForm ? "Hide create form" : "Create promo card"}
          </button>
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

        {showCreateForm && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
              New promo card
            </h2>
            <PromoCardForm
              form={createForm}
              onChange={setCreateForm}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              submitLabel="Create card"
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>

      {sortedCards.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No promo cards yet.</div>
      ) : (
        <div className="divide-y divide-slate-200">
          {sortedCards.map((card) => (
            <div key={card.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {card.imageUrl && (
                      <Image
                        src={card.imageUrl}
                        alt={card.imageAlt}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {card.title}
                        {card.titleSmall ? ` ${card.titleSmall}` : ""}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          card.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {card.isActive ? "Active" : "Inactive"}
                      </span>
                      {card.isRedTag && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                          Red tag
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-sky-700">
                      {card.tag}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {card.description}
                    </p>
                    <div className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-slate-700">CTA:</span>{" "}
                        {card.ctaLabel}
                      </p>
                      <p className="truncate">
                        <span className="font-semibold text-slate-700">Href:</span>{" "}
                        {card.ctaHref}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Sort:</span>{" "}
                        {card.sortOrder}
                      </p>
                      <p className="truncate">
                        <span className="font-semibold text-slate-700">Image:</span>{" "}
                        {card.imageUrl}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(card)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(card)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {card.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(card.id, card.title)}
                    disabled={isSubmitting}
                    className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingId === card.id && (
                <div className="mt-4">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                    Edit promo card
                  </h4>
                  <PromoCardForm
                    form={editForm}
                    onChange={setEditForm}
                    onSubmit={() => handleSaveEdit(card.id)}
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
  );
}
