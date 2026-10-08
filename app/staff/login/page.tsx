import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/app/lib/staff-auth";
import StaffGoogleSignInButton from "@/app/components/staff/StaffGoogleSignInButton";
import StaffPortalShell from "@/app/components/staff/StaffPortalShell";

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
    <StaffPortalShell>
      <div className="mx-auto grid min-h-[calc(100svh-12rem)] max-w-5xl items-center gap-8 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,27rem)] lg:gap-14">
        <section className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-sky-700">Team workspace</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 xl:text-5xl">A smoother day starts with a clear schedule.</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">Sign in with your approved staff account to review assigned cleaning jobs and update your progress.</p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-lg font-bold text-sky-800">S</span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Your Saskia schedule</p>
              <p className="mt-0.5 text-xs text-slate-500">Private access for approved team members</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_32px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-lg font-bold text-sky-800 lg:hidden">S</div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-700">Staff Portal</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Cleaner sign in</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use your approved Google account to see today&apos;s jobs and update job status.</p>

          {errorMessage ? <p role="alert" aria-live="assertive" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800">{errorMessage}</p> : null}

          <div className="mt-7">
            <StaffGoogleSignInButton callbackUrl="/staff" />
          </div>

          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Staff access is invite-only. Customer accounts use a separate login.</p>
        </section>
      </div>
    </StaffPortalShell>
  );
}
