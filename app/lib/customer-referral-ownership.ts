import { normalizeCustomerEmail } from "./customer-auth-pure";

export type ReferralCodeOwner = {
  customer_id: string | null;
  referrer_email: string | null;
};

export type ReferralOwner = {
  id: string;
  email: string;
};

export function isReferralCodeOwnedByCustomer(
  code: ReferralCodeOwner,
  customer: ReferralOwner,
): boolean {
  if (code.customer_id !== null) {
    return code.customer_id === customer.id;
  }

  return (
    code.referrer_email !== null &&
    normalizeCustomerEmail(code.referrer_email) ===
      normalizeCustomerEmail(customer.email)
  );
}

export function filterReferralCodesForCustomer<
  T extends ReferralCodeOwner,
>(codes: T[], customer: ReferralOwner): T[] {
  return codes.filter((code) => isReferralCodeOwnedByCustomer(code, customer));
}

export function resolveReferralCodeOwnerId(
  currentCustomer: { id: string } | null,
): string | null {
  return currentCustomer?.id ?? null;
}

export function findUniqueLegacyReferralOwnerId(
  referrerEmail: string | null,
  customers: Array<{ id: string; email: string }>,
): string | null {
  if (!referrerEmail) return null;

  const normalizedEmail = normalizeCustomerEmail(referrerEmail);
  const matchingCustomers = customers.filter(
    (customer) => normalizeCustomerEmail(customer.email) === normalizedEmail,
  );

  return matchingCustomers.length === 1 ? matchingCustomers[0].id : null;
}
