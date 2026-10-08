import type { DispatchSummary } from "@/app/lib/dispatch-pure";

const cards: Array<{ key: keyof DispatchSummary; label: string; tone: string }> = [
  { key: "awaitingAssignment", label: "Awaiting assignment", tone: "text-amber-700 bg-amber-50" },
  { key: "assigned", label: "Assigned", tone: "text-sky-700 bg-sky-50" },
  { key: "inProgress", label: "In progress", tone: "text-orange-700 bg-orange-50" },
  { key: "completed", label: "Completed", tone: "text-emerald-700 bg-emerald-50" },
  { key: "exceptions", label: "Exceptions", tone: "text-rose-700 bg-rose-50" },
];

export default function DispatchOverviewCards({ summary }: { summary: DispatchSummary }) {
  return (
    <section aria-label="Dispatch overview" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <article key={card.key} className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:p-5">
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums text-slate-950">
            <span className={`size-2.5 rounded-full ${card.tone.split(" ")[1]}`} aria-hidden="true" />
            {summary[card.key]}
          </p>
        </article>
      ))}
    </section>
  );
}
