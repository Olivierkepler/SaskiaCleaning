import type { ReactNode } from "react";

import AccountNavbar from "@/app/components/account/AccountNavbar";
import AccountSidebar from "@/app/components/account/AccountSidebar";

type AccountPageShellProps = {
  children: ReactNode;
  customerName: string | null;
  customerEmail: string;
  customerImage?: string | null;
};

export default function AccountPageShell({
  children,
  customerName,
  customerEmail,
  customerImage,
}: AccountPageShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f9fc] px-6 py-8 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <AccountNavbar
          customerName={customerName}
          customerEmail={customerEmail}
          customerImage={customerImage}
        />

        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <AccountSidebar />

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
