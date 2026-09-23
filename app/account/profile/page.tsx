import Image from "next/image";
import Link from "next/link";
import { requireCustomer } from "@/app/lib/customer-auth";
import {
  getCustomerProfile,
  listCustomerAddresses,
} from "@/app/lib/customer-profile";
import ProfileForm from "@/app/components/account/ProfileForm";
import AddressBook from "@/app/components/account/AddressBook";
import SignOutButton from "@/app/components/auth/SignOutButton";

export default async function AccountProfilePage() {
  const customer = await requireCustomer("/login");
  const [profile, addresses] = await Promise.all([
    getCustomerProfile(customer.id),
    listCustomerAddresses(customer.id),
  ]);

  if (!profile) {
    return (
      <main className="min-h-screen px-6 py-16">
        <p className="text-sm text-slate-600">Profile not found.</p>
      </main>
    );
  }

  const initials = (profile.name ?? profile.email).charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/account"
            className="text-sm font-medium text-slate-500 transition hover:text-sky-600"
          >
            ← Account
          </Link>
          <SignOutButton />
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-sky-50">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name ?? "Profile"}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-semibold text-sky-500">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-500">
                Your profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Personal information
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Update your preferred name and phone. Your Google email stays
                linked for sign-in.
              </p>
            </div>
          </div>

          <ProfileForm
            initialName={profile.name}
            initialPhone={profile.phone}
            email={profile.email}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Saved addresses
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            These addresses are for your account only. Changing them never
            changes past bookings.
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
      </div>
    </main>
  );
}
