import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-white px-6 pt-40 pb-10 sm:px-8 lg:px-16 lg:pt-44">
      
      {/* TOP CURVE */}
      <div className="absolute top-0 left-0 z-[2] w-full overflow-hidden leading-[0]">
        <svg
          className="relative block h-[120px] w-[calc(100%+1.3px)]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39 56.44C197.8 89.92 0 120 0 120V0h1200v27.35c-86.91 25.8-208.8 58.23-348.84 62.15-147.19 4.14-243.45-23.08-358.66-35.71-87.53-9.61-172.8-3.2-271.11 2.65Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Top Content */}
        <div className="mb-20 grid gap-14 lg:grid-cols-12">
          
          {/* Brand */}
          <div className="max-w-md lg:col-span-5">
            
            {/* <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-6 bg-sky-300" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
                Saskia Cleaning Services
              </p>
            </div> */}

            <h3
              className="
                font-[family-name:var(--font-cormorant)]
                text-[clamp(2.2rem,4vw,3.5rem)]
                font-semibold
                leading-[0.95]
                tracking-[-0.05em]
                text-slate-950
              "
            >
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

          {/* Right Columns */}
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            
            {/* Contact */}
            <FooterColumn title="Contact">
              <FooterLink href="tel:+18573528554">
                857 352 8554
              </FooterLink>

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

            {/* Services */}
            <FooterColumn title="Services">
              <FooterText>Deep Cleaning</FooterText>
              <FooterText>Recurring Service</FooterText>
              <FooterText>Move In / Move Out</FooterText>
              <FooterText>Commercial Cleaning</FooterText>
            </FooterColumn>

            {/* Area */}
            <FooterColumn title="Area">
              <FooterText>Boston</FooterText>
              <FooterText>Massachusetts</FooterText>
              <FooterText>United States</FooterText>
            </FooterColumn>

          </div>
        </div>

        {/* Bottom */}
      {/* Bottom */}
<div className="flex flex-col items-center justify-between gap-6 border-t border-slate-200 pt-8 md:flex-row">
  <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-slate-400">
    © 2026 Saskia Cleaning Services
  </p>

  <div className="flex flex-wrap items-center justify-center gap-6">
    <Link
      href="/privacy-policy"
      className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400 transition hover:text-sky-500"
    >
      Privacy Policy
    </Link>

    <Link
      href="/terms-and-conditions"
      className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400 transition hover:text-sky-500"
    >
      Terms & Conditions
    </Link>

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
      className="
        text-sm leading-6 text-slate-500
        transition duration-300
        hover:text-sky-500
      "
    >
      {children}
    </a>
  );
}

function FooterText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="text-sm leading-6 text-slate-500">
      {children}
    </span>
  );
}