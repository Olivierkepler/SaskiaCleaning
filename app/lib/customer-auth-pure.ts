/**
 * Pure customer-auth helpers (no DB / Next imports).
 * Safe for unit tests and shared validation.
 */

export function normalizeCustomerEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isGoogleEmailVerified(
  profile:
    | { email?: string | null; email_verified?: boolean | string | null }
    | null
    | undefined,
): boolean {
  if (!profile?.email || typeof profile.email !== "string") {
    return false;
  }

  const verified = profile.email_verified;
  return verified === true || verified === "true";
}

/**
 * Ownership helper for future booking retrieval.
 * Always scope by both booking id and session customer id.
 */
export function bookingOwnershipWhere(
  bookingId: number | string,
  sessionCustomerId: string,
) {
  return {
    id: bookingId,
    customerId: sessionCustomerId,
  } as const;
}
