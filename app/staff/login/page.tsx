import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/app/lib/staff-auth";
import StaffGoogleSignInButton from "@/app/components/staff/StaffGoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  not_staff:
    "This Google account is not on the Saskia staff list, or it has been deactivated.",
  AccessDenied: "We couldn't sign you in with Google. Please try again.",
  unverified_email:
    "Your Google account email must be verified before you can sign in.",
  Default: "We couldn't sign you in with Google. Please try again.",
};

type StaffLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function StaffLoginPage({
  searchParams,
}: StaffLoginPageProps) {
  const staff = await getCurrentStaff();
  if (staff) {
    redirect("/staff");
  }

  const params = await searchParams;
  const errorKey = params.error ?? "";
  const errorMessage =
    errorKey && (ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.Default);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-10 inline-block text-sky-400">
          <p className="text-2xl font-semibold tracking-[-0.04em]">
            Saskia Cleaning
          </p>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
            Staff portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Cleaner sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in with your approved Google account to view today&apos;s jobs
            and update job status.
          </p>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-8">
            <StaffGoogleSignInButton callbackUrl="/staff" />
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            Staff access is invite-only. Customer accounts use a separate login.
          </p>
        </div>
      </div>
    </main>
  );
}
