/**
 * Pure booking follow-up helpers — Phase 11.13.
 * Admin-only operational records. No DB / Next imports.
 */

export const FOLLOWUP_TYPES = [
  "customer_contact",
  "staff_contact",
  "internal_note",
  "operations_review",
] as const;

export type FollowupType = (typeof FOLLOWUP_TYPES)[number];

export const FOLLOWUP_CONTACT_METHODS = [
  "phone",
  "email",
  "sms",
  "internal",
  "other",
] as const;

export type FollowupContactMethod = (typeof FOLLOWUP_CONTACT_METHODS)[number];

export const FOLLOWUP_OUTCOMES = [
  "reached",
  "voicemail",
  "no_answer",
  "confirmed",
  "needs_followup",
  "resolved",
  "other",
] as const;

export type FollowupOutcome = (typeof FOLLOWUP_OUTCOMES)[number];

export const MAX_FOLLOWUP_NOTE_LENGTH = 2000;

export function isFollowupType(value: unknown): value is FollowupType {
  return (
    typeof value === "string" &&
    (FOLLOWUP_TYPES as readonly string[]).includes(value)
  );
}

export function isFollowupContactMethod(
  value: unknown,
): value is FollowupContactMethod {
  return (
    typeof value === "string" &&
    (FOLLOWUP_CONTACT_METHODS as readonly string[]).includes(value)
  );
}

export function isFollowupOutcome(value: unknown): value is FollowupOutcome {
  return (
    typeof value === "string" &&
    (FOLLOWUP_OUTCOMES as readonly string[]).includes(value)
  );
}

export function normalizeFollowupNote(
  value: unknown,
): { ok: true; note: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return { ok: false, error: "A note is required." };
  }
  const note = value.trim();
  if (!note) return { ok: false, error: "A note is required." };
  if (note.length > MAX_FOLLOWUP_NOTE_LENGTH) {
    return {
      ok: false,
      error: `Note must be ${MAX_FOLLOWUP_NOTE_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, note };
}

/** Parse optional next follow-up ISO / datetime string. */
export function normalizeNextFollowupAt(
  value: unknown,
): { ok: true; nextFollowupAt: string | null } | { ok: false; error: string } {
  if (value == null || value === "") {
    return { ok: true, nextFollowupAt: null };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "Invalid next follow-up time." };
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: "Invalid next follow-up time." };
  }
  return { ok: true, nextFollowupAt: parsed.toISOString() };
}

export function isFollowupDue(input: {
  nextFollowupAt: Date | string | null | undefined;
  resolvedAt: Date | string | null | undefined;
  now?: Date;
}): boolean {
  if (input.resolvedAt != null) return false;
  if (input.nextFollowupAt == null) return false;
  const next = new Date(input.nextFollowupAt);
  if (Number.isNaN(next.getTime())) return false;
  const now = input.now ?? new Date();
  return next.getTime() <= now.getTime();
}

export type CreateFollowupInput = {
  followupType: unknown;
  contactMethod: unknown;
  outcome: unknown;
  note: unknown;
  nextFollowupAt?: unknown;
  createdByLabel?: unknown;
};

export type ValidatedCreateFollowup = {
  followupType: FollowupType;
  contactMethod: FollowupContactMethod;
  outcome: FollowupOutcome;
  note: string;
  nextFollowupAt: string | null;
  createdByLabel: string | null;
};

export function validateCreateFollowup(
  input: CreateFollowupInput,
): { ok: true; value: ValidatedCreateFollowup } | { ok: false; error: string } {
  if (!isFollowupType(input.followupType)) {
    return { ok: false, error: "Invalid follow-up type." };
  }
  if (!isFollowupContactMethod(input.contactMethod)) {
    return { ok: false, error: "Invalid contact method." };
  }
  if (!isFollowupOutcome(input.outcome)) {
    return { ok: false, error: "Invalid outcome." };
  }
  const note = normalizeFollowupNote(input.note);
  if (!note.ok) return note;
  const next = normalizeNextFollowupAt(input.nextFollowupAt);
  if (!next.ok) return next;

  let createdByLabel: string | null = null;
  if (input.createdByLabel != null && input.createdByLabel !== "") {
    if (typeof input.createdByLabel !== "string") {
      return { ok: false, error: "Invalid created-by label." };
    }
    const cleaned = input.createdByLabel.trim().slice(0, 80);
    createdByLabel = cleaned || null;
  }

  return {
    ok: true,
    value: {
      followupType: input.followupType,
      contactMethod: input.contactMethod,
      outcome: input.outcome,
      note: note.note,
      nextFollowupAt: next.nextFollowupAt,
      createdByLabel,
    },
  };
}

export const FOLLOWUP_TYPE_LABELS: Record<FollowupType, string> = {
  customer_contact: "Customer contact",
  staff_contact: "Staff contact",
  internal_note: "Internal note",
  operations_review: "Operations review",
};

export const FOLLOWUP_METHOD_LABELS: Record<FollowupContactMethod, string> = {
  phone: "Phone",
  email: "Email",
  sms: "SMS",
  internal: "Internal",
  other: "Other",
};

export const FOLLOWUP_OUTCOME_LABELS: Record<FollowupOutcome, string> = {
  reached: "Reached",
  voicemail: "Voicemail",
  no_answer: "No answer",
  confirmed: "Confirmed",
  needs_followup: "Needs follow-up",
  resolved: "Resolved",
  other: "Other",
};
