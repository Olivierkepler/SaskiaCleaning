import Image from "next/image";

const DEFAULT_HERO_IMAGE = "/account/headeraccount.png";
const DEFAULT_HERO_ALT =
  "Freshly cleaned space with folded towels and greenery";

type AccountHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  priority?: boolean;
  imageSrc?: string;
  imageAlt?: string;
};

export default function AccountHero({
  eyebrow,
  title,
  description,
  priority = false,
  imageSrc = DEFAULT_HERO_IMAGE,
  imageAlt = DEFAULT_HERO_ALT,
}: AccountHeroProps) {
  return (
    <section className="relative mb-8 min-h-[240px] overflow-hidden rounded-[28px] md:min-h-[300px]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 1152px"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent md:from-white/85 md:via-white/55 md:to-transparent"
      />
      <div className="relative z-10 flex h-full min-h-[240px] max-w-xl flex-col justify-center px-6 py-10 md:min-h-[300px] md:px-10 md:py-12">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-600">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={`text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl ${
            eyebrow ? "mt-3" : ""
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
