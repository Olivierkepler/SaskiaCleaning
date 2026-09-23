import "server-only";

export {
  normalizeCustomerEmail,
  isGoogleEmailVerified,
  getCurrentCustomer,
  requireCustomer,
  upsertCustomerFromGoogle,
  linkGuestBookingsByEmail,
  findCustomerById,
  findCustomerByEmail,
  bookingOwnershipWhere,
  type CustomerRecord,
} from "@/app/lib/customer-auth";
