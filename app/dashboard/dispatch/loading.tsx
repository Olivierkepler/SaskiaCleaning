export default function DispatchLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f5f7fb] p-4 sm:p-8" aria-label="Loading Dispatch Center" role="status">
      <span className="sr-only">Loading Dispatch Center…</span>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="h-14 rounded-xl bg-white" />
        <div className="h-24 rounded-2xl bg-white" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-24 rounded-2xl bg-white" />)}</div>
        <div className="grid gap-4 xl:grid-cols-2"><div className="h-96 rounded-2xl bg-white" /><div className="h-96 rounded-2xl bg-white" /></div>
      </div>
    </main>
  );
}
