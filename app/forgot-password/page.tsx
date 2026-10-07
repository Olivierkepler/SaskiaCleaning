import Link from "next/link";
import PasswordResetRequestForm from "@/app/components/auth/PasswordResetRequestForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 sm:py-16">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-sky-100 bg-sky-50/60 p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold tracking-wide text-sky-700">SASKIA CLEANING</Link>
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-600">Account access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Enter the email address for your account. If it is eligible, we’ll send a secure reset link.</p>
        <div className="mt-6"><PasswordResetRequestForm /></div>
        <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-sky-700 underline-offset-2 hover:underline">Back to sign in</Link></p>
      </section>
    </main>
  );
}
