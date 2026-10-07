"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Props = {
  googleConnected: boolean;
  passwordEnabled: boolean;
  authMethod: "google" | "credentials" | null;
  googleLinkState?: string;
};

function MethodStatus({ label, disabledLabel, enabled }: { label: string; disabledLabel: string; enabled: boolean }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{enabled ? label : disabledLabel}</span>;
}

export default function AccountSecurityMethods({ googleConnected, passwordEnabled, authMethod, googleLinkState }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordAdded, setPasswordAdded] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/account/security/add-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setError(result?.error ?? "Unable to add password sign-in right now.");
        return;
      }
      setPasswordAdded(true);
      setPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch {
      setError("Unable to add password sign-in right now.");
    } finally {
      setPending(false);
    }
  }

  async function connectGoogle() {
    setError(null);
    setGooglePending(true);
    try {
      const response = await fetch("/api/account/security/google-link-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        setError(result?.error ?? "Unable to start Google linking right now.");
        setGooglePending(false);
        return;
      }
      await signIn("google", { callbackUrl: "/account/security?googleLink=success" });
    } catch {
      setError("Unable to start Google linking right now.");
      setGooglePending(false);
    }
  }

  return (
    <div className="space-y-5">
      {googleLinkState === "success" && googleConnected ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Google connected successfully.</p> : null}
      {googleLinkState === "failed" ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Google could not be connected to this account. Confirm you used the same verified email and try again.</p> : null}
      {passwordAdded ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Password sign-in added successfully.</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Google</h2>
            <p className="mt-1 text-sm text-slate-600">Use your verified Google account to sign in.</p>
          </div>
          <MethodStatus label="Connected" disabledLabel="Not connected" enabled={googleConnected} />
        </div>
        {!googleConnected && authMethod === "credentials" ? <button type="button" onClick={connectGoogle} disabled={googlePending} className="mt-4 min-h-11 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-60">{googlePending ? "Connecting…" : "Connect Google"}</button> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Password</h2>
            <p className="mt-1 text-sm text-slate-600">Sign in with your email and a password.</p>
          </div>
          <MethodStatus label="Enabled" disabledLabel="Not enabled" enabled={passwordEnabled} />
        </div>
        {!passwordEnabled && authMethod === "google" ? (
          <form onSubmit={submitPassword} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">New password
              <input type="password" autoComplete="new-password" required minLength={15} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
            </label>
            <label className="text-sm font-medium text-slate-700">Confirm password
              <input type="password" autoComplete="new-password" required minLength={15} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-200" />
            </label>
            <p className="text-xs text-slate-500 sm:col-span-2">Use 15–128 characters. Passphrases are welcome.</p>
            <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-60 sm:col-span-2 sm:justify-self-start">{pending ? "Adding password…" : "Add password"}</button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
