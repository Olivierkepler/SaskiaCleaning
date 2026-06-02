export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-white px-6 pt-24 pb-10 sm:px-8 lg:px-16 lg:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-20 grid gap-14 lg:grid-cols-12">
          <div className="max-w-md lg:col-span-5">
            {/* <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-6 bg-sky-300" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
                Saskia Cleaning Services
              </p>
            </div> */}

            <h3 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950">
              A consistent standard,{" "}
              <span className="font-light italic text-slate-400">
                delivered with care.
              </span>
            </h3>

            <p className="mt-6 text-[15px] leading-8 text-slate-500">
              Deep cleaning and routine maintenance for residential and
              commercial spaces. Every visit is handled with precision,
              reliability, and respect for your environment.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <FooterColumn title="Contact">
              <FooterLink href="tel:+18573528554">857 352 8554</FooterLink>
              <FooterLink href="mailto:cleaningsaskia@gmail.com">
                cleaningsaskia@gmail.com
              </FooterLink>
              <FooterLink
                href="https://saskiaservices.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                SaskiaServices.com
              </FooterLink>
            </FooterColumn>

            <FooterColumn title="Services">
              <FooterText>Deep Cleaning</FooterText>
              <FooterText>Recurring Service</FooterText>
              <FooterText>Move In / Move Out</FooterText>
              <FooterText>Commercial Cleaning</FooterText>
            </FooterColumn>

            <FooterColumn title="Area">
              <FooterText>Boston</FooterText>
              <FooterText>Massachusetts</FooterText>
              <FooterText>United States</FooterText>
            </FooterColumn>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-slate-400">
            © 2026 Saskia Cleaning Services
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
              Licensed & Insured
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
              Boston Area
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-950">
        {title}
      </span>
      {children}
    </div>
  );
}

function FooterLink({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      className="text-sm leading-6 text-slate-500 transition hover:text-sky-500"
    >
      {children}
    </a>
  );
}

function FooterText({ children }: { children: React.ReactNode }) {
  return <span className="text-sm leading-6 text-slate-500">{children}</span>;
}