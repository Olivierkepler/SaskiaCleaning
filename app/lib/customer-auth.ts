import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  findCustomerById,
  findCustomerByEmail,
  upsertCustomerFromGoogle,
  linkGuestBookingsByEmail,
  type CustomerRecord,
} from "@/app/lib/customer-identity";
import {
  normalizeCustomerEmail,
  isGoogleEmailVerified,
  bookingOwnershipWhere,
} from "@/app/lib/customer-auth-pure";

export type { CustomerRecord };

export {
  normalizeCustomerEmail,
  isGoogleEmailVerified,
  bookingOwnershipWhere,
  findCustomerById,
  findCustomerByEmail,
  upsertCustomerFromGoogle,
  linkGuestBookingsByEmail,
};

export async function getCurrentCustomer(): Promise<CustomerRecord | null> {
  const session = await auth();
  const customerId = session?.user?.id;

  if (!customerId) {
    return null;
  }

  return findCustomerById(customerId);
}

export async function requireCustomer(
  loginRedirect = "/login",
): Promise<CustomerRecord> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect(loginRedirect);
  }
  return customer;
}
