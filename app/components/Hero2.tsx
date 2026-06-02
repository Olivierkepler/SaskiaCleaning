// components/Hero.tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[600px] pt-20 overflow-hidden bg-slate-900 text-white">
      {/* Background image - Smooth scale-in on load */}
      <Image
        src="/images/house.jpg"
        alt="Modern spotless home interior"
        fill
        priority
        className="object-cover animate-[scaleIn_1.5s_ease-out_forwards]"
      />

      {/* Blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#172b45]/95 via-[#29496b]/75 to-[#7fb6e7]/55" />

      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          
          {/* Left content with staggered entry animations */}
          <div className="max-w-3xl">
            {/* Heading: Fades in first */}
            <h1 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl lg:text-6xl animate-[fadeInUp_0.8s_ease-out_forwards]">
              Come home to spotless. Every single time.
            </h1>

            {/* Paragraph: Fades in slightly later (delay-200) */}
            <p className="mt-8 max-w-3xl text-lg font-medium leading-8 text-slate-100 sm:text-xl opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              Life gets busy, and cleaning is usually the first thing to slip.
              That's where we come in. Cleaning by Cris keeps homes and
              businesses across Metro Atlanta fresh and spotless, with the
              personal care of a local owner who treats your space like her own.
            </p>

            {/* CTA Buttons: Fade in next (delay-400) */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              <a
                href="#quote"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-4 text-lg font-extrabold text-white shadow-lg transition duration-300 hover:bg-sky-300 hover:scale-[1.03] hover:shadow-sky-400/20 active:scale-[0.98]"
              >
                Get My Free Quote →
              </a>

              <a
                href="sms:9125721231"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/90 px-8 py-4 text-lg font-extrabold text-white backdrop-blur-sm transition duration-300 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.98]"
              >
                💬 Text us: (912) 572-1231
              </a>
            </div>

            {/* Trust Badges: Fade in last (delay-600) */}
            <div className="mt-14 border-t border-white/20 pt-7 text-base font-extrabold text-slate-100 flex flex-wrap gap-x-8 gap-y-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
              <span className="transition duration-300 hover:text-sky-300 cursor-default">✓ Locally Owned</span>
              <span className="transition duration-300 hover:text-sky-300 cursor-default">✓ Same Trusted Team</span>
              <span className="transition duration-300 hover:text-sky-300 cursor-default">✓ Guaranteed Service</span>
            </div>
          </div>

          {/* Right logo area */}
          <div className="flex flex-col items-center justify-center lg:items-end">
            {/* Logo container with scale-in and continuous smooth float animation */}
            <div className="relative flex items-center justify-center opacity-0 animate-[scaleIn_0.8s_ease-out_0.3s_forwards]">
              <div className="animate-[float_6s_ease-in-out_infinite]">
                <Image
                  src="/images/whitelogo2.png"
                  alt="Saskia Cleaning Logo"
                  width={300}
                  height={300}
                  priority
                  className="relative z-10 object-contain drop-shadow-[0_0_35px_rgba(127,182,231,0.3)] transition duration-500 hover:drop-shadow-[0_0_50px_rgba(127,182,231,0.5)]"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}