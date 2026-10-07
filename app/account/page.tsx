import AccountHero from "@/app/components/account/AccountHero";
import AccountNextCleaning from "@/app/components/account/AccountNextCleaning";
import AccountQuickActions from "@/app/components/account/AccountQuickActions";
import AccountRecentBookings from "@/app/components/account/AccountRecentBookings";
import AccountReferralRewards from "@/app/components/account/AccountReferralRewards";
import AccountReferralShare from "@/app/components/account/AccountReferralShare";
import AccountStatus from "@/app/components/account/AccountStatus";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerBookings } from "@/app/lib/customer-bookings";
import { partitionCustomerBookings, parseBookingDateOnly } from "@/app/lib/customer-bookings-pure";
import { getCustomerProfile, listCustomerAddresses } from "@/app/lib/customer-profile";
import { getCustomerReferralAccountData } from "@/app/lib/customer-referral-account";

export default async function AccountPage() {
  const customer = await requireCustomer("/login");

  const [bookingsResult, referralResult, profileResult, addressesResult] =
    await Promise.all([
      getCustomerBookings(customer.id).then(
        (data) => ({ ok: true as const, data }),
        (error) => {
          console.error("Failed to load overview bookings", error);
          return { ok: false as const, data: [] };
        },
      ),
      getCustomerReferralAccountData(customer).then(
        (data) => ({ ok: true as const, data }),
        (error) => {
          console.error("Failed to load overview referral data", error);
          return { ok: false as const, data: null };
        },
      ),
      getCustomerProfile(customer.id).then(
        (data) => ({ ok: true as const, data }),
        (error) => {
          console.error("Failed to load overview profile", error);
          return { ok: false as const, data: null };
        },
      ),
      listCustomerAddresses(customer.id).then(
        (data) => ({ ok: true as const, data }),
        (error) => {
          console.error("Failed to load overview addresses", error);
          return { ok: false as const, data: [] };
        },
      ),
    ]);

  const bookings = bookingsResult.data;
  const { upcoming } = partitionCustomerBookings(bookings);
  const datedUpcoming = upcoming
    .filter((booking) => parseBookingDateOnly(booking.booking_date) !== null)
    .sort((a, b) => {
      const dateOrder =
            String(a.booking_date).slice(0, 10).localeCompare(String(b.booking_date).slice(0, 10));
      if (dateOrder !== 0) return dateOrder;
      return (a.booking_time ?? "99:99:99").localeCompare(b.booking_time ?? "99:99:99");
    });

  const referrals = referralResult.data?.found ? referralResult.data : null;
  const referralCode = referrals?.codes[0] ?? null;
  const profile = profileResult.data;

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title={`Hello, ${customer.name?.trim().split(/\s+/)[0] ?? "there"}`}
        description="Manage your profile, bookings, and preferences."
        priority
      />

      <div className="space-y-6 pb-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <AccountNextCleaning
            booking={datedUpcoming[0] ?? null}
            failed={!bookingsResult.ok}
          />
          <AccountQuickActions />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AccountReferralRewards
            data={referrals}
            failed={!referralResult.ok}
          />
          <AccountReferralShare
            code={referralCode?.code ?? null}
            link={referralCode?.referralLink ?? null}
            failed={!referralResult.ok}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <AccountRecentBookings
            bookings={bookings.slice(0, 3)}
            failed={!bookingsResult.ok}
          />
          <AccountStatus
            email={profile?.email ?? customer.email}
            phone={profile?.phone ?? null}
            addressCount={addressesResult.data.length}
            profileFailed={!profileResult.ok}
            addressesFailed={!addressesResult.ok}
          />
        </div>
      </div>
    </>
  );
}
