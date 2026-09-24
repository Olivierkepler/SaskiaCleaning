import Link from "next/link";
import SignOutButton from "@/app/components/auth/SignOutButton";

type AccountNavbarProps = {
  homeHref?: string;
  homeLabel?: string;
};

export default function AccountNavbar({
  homeHref = "/",
  homeLabel = "← Home",
}: AccountNavbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <Link
        href={homeHref}
        className="text-sm font-medium text-slate-500 transition hover:text-sky-600"
      >
        {homeLabel}
      </Link>
      <SignOutButton />
    </div>
  );
}
