// components/Hero.tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[600px] pt-20 overflow-hidden bg-slate-900 text-white">
      {/* Background image */}
      <Image
        src="/images/house.jpg"
        alt="Modern spotless home interior"
        fill
        priority
        className="object-cover"
      />

      {/* Blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#172b45]/95 via-[#29496b]/75 to-[#7fb6e7]/55" />

      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <div className="max-w-3xl">
            {/* <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.2em] text-sky-300">
              Built on trust. Driven by standards.
            </p> */}

            <h1 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl lg:text-6xl">
              Come home to spotless. Every single time.
            </h1>

            <p className="mt-8 max-w-3xl text-lg font-medium leading-8 text-slate-100 sm:text-xl">
              Life gets busy, and cleaning is usually the first thing to slip.
              That's where we come in. Cleaning by Cris keeps homes and
              businesses across Metro Atlanta fresh and spotless, with the
              personal care of a local owner who treats your space like her own.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#quote"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-4 text-lg font-extrabold text-white shadow-lg transition hover:bg-sky-300"
              >
                Get My Free Quote →
              </a>

              <a
                href="sms:9125721231"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/90 px-8 py-4 text-lg font-extrabold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                💬 Text us: (912) 572-1231
              </a>
            </div>

            <div className="mt-14 border-t border-white/20 pt-7 text-base font-extrabold text-slate-100 flex flex-wrap gap-x-8 gap-y-4">
            ✓ Locally Owned
             ✓ Same Trusted Team ✓ Guaranteed Service</div>
          </div>

          {/* Right logo area */}
         {/* Right logo area */}
<div className="flex flex-col items-center justify-center lg:items-end">
  
  {/* Logo container */}
  <div
    className="
      relative flex items-center justify-center
      rounded-[2rem]
      border border-white/10
      bg-white/5
      p-6 backdrop-blur-sm
      shadow-[0_10px_60px_rgba(255,255,255,0.08)]
    "
  >
    {/* subtle glow */}
    <div
      aria-hidden="true"
      className="
        absolute inset-0 rounded-[2rem]
        bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)]
      "
    />

    <Image
      src="/images/whitelogo.png"
      alt="Saskia Cleaning Logo"
      width={260}
      height={260}
      priority
      className="
        relative z-10 object-contain
        drop-shadow-[0_0_25px_rgba(255,255,255,0.18)]
      "
    />
  </div>

  {/* Brand text */}
  <div className="mt-6 text-center lg:text-right">
    <h2
      className="
        text-3xl font-black tracking-tight text-white
        sm:text-4xl lg:text-5xl
      "
    >
      Saskia Cleaning
    </h2>

    <p
      className="
        mt-2 text-sm font-medium uppercase tracking-[0.3em]
        text-sky-200/90
      "
    >
      Luxury Cleaning Services
    </p>
  </div>
</div>
        </div>
      </div>
    </section>
  );
}