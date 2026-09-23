import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "We couldn't sign you in with Google. Please try again.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
  OAuthAccountNotLinked:
    "We couldn't sign you in with Google. Please try again.",
  OAuthCallback: "We couldn't sign you in with Google. Please try again.",
  OAuthSignin: "We couldn't sign you in with Google. Please try again.",
  Callback: "We couldn't sign you in with Google. Please try again.",
  Default: "We couldn't sign you in with Google. Please try again.",
  unverified_email:
    "Your Google account email must be verified before you can sign in.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/account");
  }

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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in to manage your bookings, referrals, rewards, and cleaning
            services.
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
            <GoogleSignInButton callbackUrl="/account" />
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            We use Google to verify your identity securely. Saskia never sees
            your Google password.
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
