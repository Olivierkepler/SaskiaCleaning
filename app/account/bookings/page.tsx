import Link from "next/link";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerBookings } from "@/app/lib/customer-bookings";
import { getPendingChangeRequestBookingIds } from "@/app/lib/booking-change-requests";
import { partitionCustomerBookings } from "@/app/lib/customer-bookings-pure";
import BookingsExplorer from "@/app/components/account/BookingsExplorer";
import AccountHero from "@/app/components/account/AccountHero";

export default async function AccountBookingsPage() {
  const customer = await requireCustomer("/login");

  let bookings: Awaited<ReturnType<typeof getCustomerBookings>> = [];
  let pendingIds = new Set<number>();
  let loadError = false;

  try {
    [bookings, pendingIds] = await Promise.all([
      getCustomerBookings(customer.id),
      getPendingChangeRequestBookingIds(customer.id),
    ]);
  } catch (error) {
    console.error("Failed to load customer bookings");
    void error;
    loadError = true;
  }

  const { upcoming, past } = partitionCustomerBookings(bookings);

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title="My Bookings"
        description="View and manage your cleaning requests."
        imageSrc="/account/mybooking.png"
        imageAlt="Clean living room with soft seating and natural light"
      />

      <div className="mb-4 flex justify-end">
        <Link
          href="/account/book"
          className="rounded-full border border-sky-500 bg-sky-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-sky-600"
        >
          Book a Cleaning
        </Link>
      </div>

      <section className="rounded-[28px] bg-[#ECF0F3] p-6 shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)] md:p-10">
        {loadError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            We couldn&apos;t load your bookings right now. Please try again
            later.
          </p>
        ) : bookings.length === 0 ? (
          <div className="rounded-[22px] bg-[#ECF0F3] px-6 py-12 text-center shadow-[inset_5px_5px_12px_rgba(163,177,198,0.30),inset_-5px_-5px_12px_rgba(255,255,255,0.95)]">
            <h2 className="text-xl font-semibold text-slate-900">
              No bookings yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              When you&apos;re ready, get an estimate and book your first
              cleaning.
            </p>
            <Link
              href="/account/book"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-transparent hover:text-slate-900"
            >
              Book a Cleaning
            </Link>
          </div>
        ) : (
          <BookingsExplorer
            upcoming={upcoming}
            past={past}
            pendingBookingIds={[...pendingIds]}
          />
        )}
      </section>
    </>
  );
}
