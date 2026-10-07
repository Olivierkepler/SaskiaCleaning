import Link from "next/link";
import VerifyEmailAction from "@/app/components/auth/VerifyEmailAction";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-sky-100 bg-sky-50/60 p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold tracking-wide text-sky-700">SASKIA CLEANING</Link>
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">Account verification</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Check your email</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          We sent a verification link to the email address you used to register. The link expires after 24 hours.
        </p>
        <div className="mt-6"><VerifyEmailAction /></div>
      </section>
    </main>
  );
}
