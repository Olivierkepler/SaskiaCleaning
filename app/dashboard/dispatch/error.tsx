"use client";

export default function DispatchError({ error: _error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#f5f7fb] p-4">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8" aria-labelledby="dispatch-error-title">
        <h1 id="dispatch-error-title" className="text-xl font-semibold text-slate-950">Dispatch Center could not load</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">The dispatch information is temporarily unavailable. Please try again.</p>
        <button type="button" onClick={reset} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">Try again</button>
      </section>
    </main>
  );
}
