import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type AccountSection = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const accountSections: AccountSection[] = [
  {
    title: "My Bookings",
    description: "View and manage your cleaning requests.",
    href: "/account/bookings",
    imageSrc: "/account/reviews/bookings.png",
    imageAlt: "Bookings calendar",
  },
  {
    title: "Referrals",
    description: "Track referrals and share your rewards link.",
    href: "/account/referrals",
    imageSrc: "/account/reviews/overviewreferal.png",
    imageAlt: "Referral sharing",
  },
  {
    title: "Rewards",
    description: "See your referral wallet and milestones.",
    href: "/account/rewards",
    imageSrc: "/account/reviews/reward.png",
    imageAlt: "Rewards gift",
  },
  {
    title: "Profile",
    description: "Manage your personal information and saved addresses.",
    href: "/account/profile",
    imageSrc: "/account/reviews/reviewprofile.png",
    imageAlt: "Profile settings",
  },
];

export default function AccountActionGrid() {
  return (
    <nav
      aria-label="Account sections"
      className="mt-8 grid gap-6 sm:grid-cols-2"
    >
      {accountSections.map((section) => {
        return (
          <Link
            key={section.title}
            href={section.href}
            className="
              group
              relative
              flex
              min-h-[150px]
              items-center
              gap-4
              overflow-hidden
              rounded-[10px]
              bg-[#ECF0F3]
              p-6
              shadow-[10px_10px_24px_rgba(163,177,198,0.45),-10px_-10px_24px_rgba(255,255,255,0.95)]
              transition-all
              duration-300
              ease-out
              hover:-translate-y-0.5
              hover:shadow-[14px_14px_30px_rgba(163,177,198,0.52),-14px_-14px_30px_rgba(255,255,255,1)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-sky-300
              focus-visible:ring-offset-4
              focus-visible:ring-offset-[#ECF0F3]
            "
          >
            {/* Soft decorative glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -bottom-12
                -right-12
                h-32
                w-32
                rounded-full
                bg-white/40
                blur-2xl
              "
            />

            {/* Illustration */}
            <div className="relative h-[68px] w-[68px] shrink-0 sm:h-[76px] sm:w-[76px]">
              <Image
                src={section.imageSrc}
                alt={section.imageAlt}
                fill
                sizes="(max-width: 640px) 68px, 76px"
                className="object-contain"
              />
            </div>

            {/* Text */}
            <div className="relative min-w-0 flex-1">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {section.title}
              </h3>

              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {section.description}
              </p>
            </div>

            {/* Arrow */}
            <span
              className="
                relative
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-full
                bg-[#ECF0F3]
                text-slate-500
                shadow-[5px_5px_12px_rgba(163,177,198,0.35),-5px_-5px_12px_rgba(255,255,255,0.95)]
                transition-all
                duration-300
                group-hover:text-sky-600
                group-hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.28),inset_-4px_-4px_8px_rgba(255,255,255,0.95)]
              "
            >
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span className="sr-only">
                Open {section.title}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
