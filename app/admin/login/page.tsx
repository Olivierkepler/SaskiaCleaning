import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminSession } from "@/app/lib/admin-auth";
import AdminGoogleSignInButton from "@/app/components/admin/AdminGoogleSignInButton";
import AdminSignOutButton from "@/app/components/admin/AdminSignOutButton";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:
    "This Google account is not authorized for the Saskia admin portal.",
  AccessDenied: "We couldn't sign you in with Google. Please try again.",
  unverified_email:
    "Your Google account email must be verified before you can sign in.",
  Default: "We couldn't sign you in with Google. Please try again.",
};

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const admin = await getAdminSession();
  if (admin) {
    redirect("/dashboard");
  }

  const session = await auth();
  const signedInNonAdmin = Boolean(session?.user?.email);

  const params = await searchParams;
  const errorKey = params.error ?? "";
  const errorMessage =
    errorKey && (ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.Default);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white px-6 py-20 sm:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/60 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center text-center">
        <Link href="/" className="mb-10 block">
          <p className="text-3xl font-semibold tracking-[-0.04em] text-sky-500">
            Saskia Cleaning
          </p>
        </Link>

        <div className="w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
            Admin Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Admin sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Continue with an authorized Google account to manage bookings,
            operations, and staff.
          </p>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          ) : null}

          {signedInNonAdmin ? (
            <div className="mt-6 space-y-4">
              <p
                role="alert"
                className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                This Google account is not authorized for the Saskia admin
                portal.
              </p>
              <AdminSignOutButton
                label="Sign out / Try another account"
                className="w-full rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
              />
            </div>
          ) : (
            <div className="mt-8">
              <AdminGoogleSignInButton callbackUrl="/dashboard" />
            </div>
          )}

          <p className="mt-6 text-xs leading-5 text-slate-500">
            Admin access is invite-only. Customer and staff portals use separate
            sign-in flows.
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 text-sm font-medium text-slate-500 transition hover:text-sky-600"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
