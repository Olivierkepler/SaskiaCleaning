import Image from "next/image";
import type { ReactNode } from "react";

type AccountProfileHeaderProps = {
  name: string | null;
  email: string;
  image?: string | null;
  children?: ReactNode;
};

export default function AccountProfileHeader({
  name,
  email,
  image,
  children,
}: AccountProfileHeaderProps) {
  const displayName = name?.trim() || "Saskia customer";
  const initial = (name?.trim() || email).charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-5 border-b border-slate-100 pb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-sky-50 md:h-20 md:w-20">
          {image ? (
            <Image
              src={image}
              alt={displayName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl font-semibold text-sky-500">
              {initial}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            {displayName}
          </h2>
          <p className="mt-1 truncate text-sm text-slate-500 md:text-base">
            {email}
          </p>
        </div>
      </div>
      {children ? <div className="sm:shrink-0">{children}</div> : null}
    </div>
  );
}
