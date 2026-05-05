export default function Footer() {
  return (
    <footer className="bg-[#F7F6F3] border-t border-zinc-200 px-8 pt-24 pb-12">
      <div className="max-w-7xl mx-auto">

        {/* Top */}
        <div className="grid md:grid-cols-12 gap-16 mb-24">

          {/* Brand */}
          <div className="md:col-span-5 max-w-md">
            <p className="text-[10px] uppercase tracking-[0.45em] text-stone-400 mb-6">
              Saskia Cleaning Services
            </p>

            <h3 className="font-serif text-[30px] leading-[1.15] text-zinc-900 mb-6">
              A consistent standard, <br /> delivered with care.
            </h3>

            <p className="text-sm text-stone-500 leading-relaxed font-light">
              Deep cleaning and routine maintenance for residential and
              commercial spaces. Every visit is handled with precision,
              reliability, and respect for your environment.
            </p>
          </div>

          {/* Right Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-14">

            {/* Contact */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-900 font-medium">
                Contact
              </span>

              <a
                href="tel:8573528554"
                className="text-sm text-stone-500 hover:text-zinc-900 transition"
              >
                857 352 8554
              </a>

              <a
                href="mailto:cleaningsaskia@gmail.com"
                className="text-sm text-stone-500 hover:text-zinc-900 transition"
              >
                cleaningsaskia@gmail.com
              </a>

              <a
                href="https://saskiaservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 hover:text-zinc-900 transition"
              >
                SaskiaServices.com
              </a>
            </div>

            {/* Services */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-900 font-medium">
                Services
              </span>

              <span className="text-sm text-stone-500">Deep Cleaning</span>
              <span className="text-sm text-stone-500">Recurring Service</span>
              <span className="text-sm text-stone-500">Move In / Move Out</span>
              <span className="text-sm text-stone-500">Commercial Cleaning</span>
            </div>

            {/* Area */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-900 font-medium">
                Area
              </span>

              <span className="text-sm text-stone-500">Boston</span>
              <span className="text-sm text-stone-500">Massachusetts</span>
              <span className="text-sm text-stone-500">United States</span>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">

          <p className="text-[10px] uppercase tracking-[0.45em] text-stone-400">
            © 2026 Saskia Cleaning Services
          </p>

          <div className="flex gap-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
              Licensed & Insured
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
              Boston Area
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}