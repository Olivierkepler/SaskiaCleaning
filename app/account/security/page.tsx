import AccountHero from "@/app/components/account/AccountHero";
import AccountSecurityMethods from "@/app/components/account/AccountSecurityMethods";
import { getCurrentCustomerSessionAuthContext } from "@/app/lib/account-security";
import { requireCustomer } from "@/app/lib/customer-auth";
import { getCustomerSignInMethods } from "@/app/lib/customer-auth-linking";

export default async function AccountSecurityPage({ searchParams }: {
  searchParams: Promise<{ googleLink?: string }>;
}) {
  const customer = await requireCustomer("/login");
  const [context, methods] = await Promise.all([
    getCurrentCustomerSessionAuthContext(),
    getCustomerSignInMethods(customer.id),
  ]);
  const query = await searchParams;

  return (
    <>
      <AccountHero eyebrow="Your account" title="Security" description="Manage the ways you sign in to Saskia Cleaning." />
      <section className="rounded-[28px] bg-[#ECF0F3] p-5 shadow-[14px_14px_32px_rgba(163,177,198,0.38),-14px_-14px_32px_rgba(255,255,255,0.95)] sm:p-8">
        <h2 className="mb-1 text-xl font-semibold text-slate-950">Sign-in methods</h2>
        <p className="mb-5 text-sm text-slate-600">Connect another sign-in method to make account access easier.</p>
        <AccountSecurityMethods
          googleConnected={methods.google}
          passwordEnabled={methods.password}
          authMethod={context?.authMethod ?? null}
          googleLinkState={query.googleLink}
        />
      </section>
    </>
  );
}
