import Link from "next/link";
import RegistrationForm from "@/app/components/auth/RegistrationForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#ECF0F3] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl rounded-[24px] bg-white/90 p-6 shadow-[8px_8px_24px_rgba(163,177,198,0.24)] sm:p-10">
        <Link href="/" className="text-sm font-semibold text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">Saskia Cleaning</Link>
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-600">Your account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Create an account to manage your bookings and referral rewards.</p>
        <div className="mt-7"><RegistrationForm /></div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-sky-700 underline-offset-2 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
