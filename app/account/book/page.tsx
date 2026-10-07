import CleaningEstimator from "@/app/components/CatTab";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerBookingById } from "@/app/lib/customer-bookings";
import { getCustomerBookingPrefill } from "@/app/lib/customer-profile";
import { toClientBookingPrefill } from "@/app/lib/booking-prefill";
import {
  buildRepeatBookingPrefill,
  parseRepeatBookingId,
} from "@/app/lib/repeat-booking-prefill";

type AccountBookPageProps = {
  searchParams: Promise<{ repeat?: string | string[] }>;
};

export default async function AccountBookPage({
  searchParams,
}: AccountBookPageProps) {
  const customer = await requireCustomer("/login");
  const { repeat } = await searchParams;
  const repeatBookingId = parseRepeatBookingId(repeat);
  const [prefill, repeatBooking] = await Promise.all([
    getCustomerBookingPrefill(customer.id),
    repeatBookingId === null
      ? Promise.resolve(null)
      : getCustomerBookingById(customer.id, repeatBookingId).catch((error) => {
          console.error("Failed to load repeat booking prefill");
          void error;
          return null;
        }),
  ]);
  const bookingPrefill = toClientBookingPrefill(prefill);
  const repeatPrefill = buildRepeatBookingPrefill(
    repeatBooking,
    customer.id,
    bookingPrefill?.savedAddresses ?? [],
  );

  return (
    <div className="min-w-0 pb-8">
      <header className="mb-4 rounded-[22px] border border-slate-200/70 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:px-7 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
          Your account
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Book a Cleaning
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          Schedule your next Saskia cleaning.
        </p>
      </header>

      <div className="min-w-0 rounded-[22px] border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <CleaningEstimator
          key={repeatPrefill ? `repeat-${repeatPrefill.bookingId}` : "new-booking"}
          bookingPrefill={bookingPrefill}
          repeatBookingPrefill={repeatPrefill}
          showMarketingHeader={false}
          layoutVariant="account"
        />
      </div>
    </div>
  );
}
