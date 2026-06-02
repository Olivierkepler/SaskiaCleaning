// components/Hero.tsx

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-[600px] overflow-hidden bg-white pt-30 text-white">
      
      {/* Background image */}
      <Image
        src="/images/house.jpg"
        alt="Modern spotless home interior"
        fill
        priority
        className="object-cover animate-[scaleIn_1.5s_ease-out_forwards]"
      />

      {/* Blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#172b45]/95 via-[#29496b]/75 to-[#7fb6e7]/55" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          
          {/* Left Content */}
          <div className="max-w-3xl">
            
            {/* Heading */}
            <h1 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl lg:text-6xl animate-[fadeInUp_0.8s_ease-out_forwards]">
              Come home to spotless. Every single time.
            </h1>

            {/* Paragraph */}
            <p className="mt-8 max-w-3xl text-lg font-medium leading-8 text-slate-100 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] sm:text-xl">
              Life gets busy, and cleaning is usually the first thing to slip.
              That&apos;s where we come in. Saskia Cleaning keeps homes and
              businesses spotless with reliable service, premium care, and
              attention to detail you can trust.
            </p>

            {/* CTA Buttons */}
            <div className="my-10 flex flex-col gap-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] sm:flex-row">
              
              <a
                href="#quote"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-8 py-4 text-lg font-extrabold text-white shadow-lg transition duration-300 hover:scale-[1.03] hover:bg-sky-300 hover:shadow-sky-400/20 active:scale-[0.98]"
              >
                Get My Free Quote →
              </a>

              <a
                href="sms:8573528554"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/90 px-8 py-4 text-lg font-extrabold text-white backdrop-blur-sm transition duration-300 hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]"
              >
                💬 Text us: (857) 352-8554
              </a>

            </div>

          
          </div>

          {/* Right Logo Area */}
          <div className="flex flex-col items-center justify-center lg:items-end">
            
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

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
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

    </section>
  );
}