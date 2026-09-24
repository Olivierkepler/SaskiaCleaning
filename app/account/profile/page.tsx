import { requireCustomer } from "@/app/lib/customer-auth";
import {
  getCustomerProfile,
  listCustomerAddresses,
} from "@/app/lib/customer-profile";
import ProfileForm from "@/app/components/account/ProfileForm";
import AddressBook from "@/app/components/account/AddressBook";
import AccountHero from "@/app/components/account/AccountHero";

export default async function AccountProfilePage() {
  const customer = await requireCustomer("/login");
  const [profile, addresses] = await Promise.all([
    getCustomerProfile(customer.id),
    listCustomerAddresses(customer.id),
  ]);

  if (!profile) {
    return (
      <p className="text-sm text-slate-600">Profile not found.</p>
    );
  }

  return (
    <>
      <AccountHero
        eyebrow="Your account"
        title="Profile"
        description="Manage your personal information and saved addresses."
      />

      <section className="rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
        <div className="mb-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Personal information
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Update your preferred name and phone. Your Google email stays linked
            for sign-in.
          </p>
        </div>

        <ProfileForm
          initialName={profile.name}
          initialPhone={profile.phone}
          email={profile.email}
        />
      </section>

      <section className="mt-6 rounded-[28px] border border-slate-200/60 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Saved addresses
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          These addresses are for your account only. Changing them never changes
          past bookings.
        </p>
        <AddressBook
          initialAddresses={addresses.map((address) => ({
            id: address.id,
            label: address.label,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
          }))}
        />
      </section>
    </>
  );
}
