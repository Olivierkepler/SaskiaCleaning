import Link from "next/link";
import Image from "next/image";

import SignOutButton from "@/app/components/auth/SignOutButton";

type AccountNavbarProps = {
  homeHref?: string;
  homeLabel?: string;
  customerName: string | null;
  customerEmail: string;
  customerImage?: string | null;
};

export default function AccountNavbar({
  homeHref = "/",
  homeLabel = "Home",
  customerName,
  customerEmail,
  customerImage,
}: AccountNavbarProps) {
  const displayName = customerName?.trim() || "Saskia customer";

  const initial = (customerName?.trim() || customerEmail)
    .charAt(0)
    .toUpperCase();

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
          shadow-[inset_18px_18px_30px_rgba(209,217,230,1),inset_-18px_-18px_30px_rgba(255,255,255,1)]
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

        {/* Customer identity + sign out */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-sky-50 sm:h-11 sm:w-11">
              {customerImage ? (
                <Image
                  src={customerImage}
                  alt={displayName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm font-semibold text-sky-500">
                  {initial}
                </div>
              )}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                {displayName}
              </p>

              <p className="mt-0.5 hidden truncate text-xs leading-tight text-slate-500 md:block">
                {customerEmail}
              </p>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block"
          />

          <SignOutButton />
        </div>
      </div>
    </header>
  );
}