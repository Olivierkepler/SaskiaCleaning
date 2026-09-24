import { requireCustomer } from "@/app/lib/customer-auth";

import AccountHero from "@/app/components/account/AccountHero";
import AccountActionGrid from "@/app/components/account/AccountActionGrid";

export default async function AccountPage() {
  const customer = await requireCustomer("/login");

  const firstName =
    customer.name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title={`Hello, ${firstName}`}
        description="Manage your profile, bookings, and preferences."
        priority
      />

      <section
        className="
          rounded-[32px]
          bg-[#ECF0F3]
          p-6
          shadow-[14px_14px_32px_rgba(163,177,198,0.45),-14px_-14px_32px_rgba(255,255,255,0.95)]
          md:p-10
        "
      >
        <AccountActionGrid />
      </section>
    </>
  );
}
