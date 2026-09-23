import { getCurrentCustomer } from "@/app/lib/customer-auth";
import { getCustomerBookingPrefill } from "@/app/lib/customer-profile";
import { toClientBookingPrefill } from "@/app/lib/booking-prefill";
import CleaningEstimator from "@/app/components/CatTab";

/**
 * Server wrapper: resolve authenticated customer prefill and pass a plain
 * serializable object into the client CatTab estimator. Guests get null.
 */
export default async function CatTabWithPrefill() {
  const customer = await getCurrentCustomer();
  const raw =
    customer != null
      ? await getCustomerBookingPrefill(customer.id)
      : null;
  const bookingPrefill = toClientBookingPrefill(raw);

  return <CleaningEstimator bookingPrefill={bookingPrefill} />;
}
