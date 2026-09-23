import Link from "next/link";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerBookings } from "@/app/lib/customer-bookings";
import { getPendingChangeRequestBookingIds } from "@/app/lib/booking-change-requests";
import { partitionCustomerBookings } from "@/app/lib/customer-bookings-pure";
import CustomerBookingCard from "@/app/components/account/CustomerBookingCard";

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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/account"
            className="text-sm font-medium text-slate-500 transition hover:text-sky-600"
          >
            ← Account
          </Link>
          <Link
            href="/#quote"
            className="rounded-full border border-sky-500 bg-sky-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-sky-600"
          >
            Book a Cleaning
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-500">
            Your account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            My Bookings
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            View your cleaning requests and past services.
          </p>

          {loadError ? (
            <p
              role="alert"
              className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              We couldn&apos;t load your bookings right now. Please try again
              later.
            </p>
          ) : bookings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                No bookings yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                When you&apos;re ready, get an estimate and book your first
                cleaning.
              </p>
              <Link
                href="/#quote"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-transparent hover:text-slate-900"
              >
                Book a Cleaning
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              <section aria-labelledby="upcoming-bookings-heading">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2
                    id="upcoming-bookings-heading"
                    className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500"
                  >
                    Upcoming
                  </h2>
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                    {upcoming.length}
                  </span>
                </div>
                {upcoming.length === 0 ? (
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No upcoming bookings.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {upcoming.map((booking) => (
                      <CustomerBookingCard
                        key={booking.id}
                        booking={booking}
                        hasPendingChangeRequest={pendingIds.has(booking.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section aria-labelledby="past-bookings-heading">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2
                    id="past-bookings-heading"
                    className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500"
                  >
                    Past
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {past.length}
                  </span>
                </div>
                {past.length === 0 ? (
                  <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No past bookings yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {past.map((booking) => (
                      <CustomerBookingCard
                        key={booking.id}
                        booking={booking}
                        hasPendingChangeRequest={pendingIds.has(booking.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
