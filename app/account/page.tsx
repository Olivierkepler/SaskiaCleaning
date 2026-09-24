import { requireCustomer } from "@/app/lib/customer-auth";
import AccountPageShell from "@/app/components/account/AccountPageShell";
import AccountHero from "@/app/components/account/AccountHero";
import AccountProfileHeader from "@/app/components/account/AccountProfileHeader";
import AccountActionGrid from "@/app/components/account/AccountActionGrid";

export default async function AccountPage() {
  const customer = await requireCustomer("/login");
  const firstName = customer.name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <AccountPageShell>
      <AccountHero
        eyebrow="Your account"
        title={`Hello, ${firstName}`}
        description="Manage your profile, bookings, and preferences."
        priority
      />

      <section className="rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
        <AccountProfileHeader
          name={customer.name}
          email={customer.email}
          image={customer.image}
        />
        <AccountActionGrid />
      </section>
    </AccountPageShell>
  );
}
