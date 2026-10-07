import type { ReactNode } from "react";

export default function AccountOverviewCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-center gap-2.5">
        {icon ? (
          <span aria-hidden="true" className="text-sky-600">
            {icon}
          </span>
        ) : null}
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
