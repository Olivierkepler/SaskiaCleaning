import Link from "next/link";
import Image from "next/image";

import SignOutButton from "@/app/components/auth/SignOutButton";

type AccountNavbarProps = {
  homeHref?: string;
  homeLabel?: string;
};

export default function AccountNavbar({
  homeHref = "/",
  homeLabel = "Home",
}: AccountNavbarProps) {
  return (
    <header className="mb-7">
      <div
        className="
          flex
          min-h-[88px]
          items-center
          justify-between
          gap-4

          bg-white
          px-5
          py-3
          shadow-[0_14px_40px_rgba(71,85,105,0.10)]
          sm:px-6
        "
      >
        {/* Brand / home */}
        <Link
          href={homeHref}
          aria-label={`Go to ${homeLabel}`}
          className="
            group
            flex
            min-w-0
            items-center
            gap-3
            rounded-[18px]
            outline-none
            transition
            focus-visible:ring-2
            focus-visible:ring-sky-300
            focus-visible:ring-offset-2
          "
        >
          <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/images/logoSaskia.png"
              alt="Saskia Cleaning Services"
              fill
              priority
              sizes="64px"
              className="object-contain"
            />
          </div>

          <div className="min-w-0">
            <div
              className="
                text-[20px]
                font-semibold
                leading-none
                tracking-[-0.025em]
                text-sky-600
                transition-colors
                group-hover:text-sky-600
                sm:text-[22px]
              "
            >
              Saskia
            </div>

            <div
              className="
                mt-1.5
                hidden
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-slate-400
                sm:block
              "
            >
              Cleaning Services
            </div>
          </div>
        </Link>

        {/* Account action */}
        <div className="flex shrink-0 items-center">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}