import type { ReactNode } from "react";

import AccountNavbar from "@/app/components/account/AccountNavbar";
import AccountSidebarLayout from "@/app/components/account/AccountSidebarLayout";

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
    <div className="min-h-screen bg-[#f5f9fc] px-6 py-8 md:px-8 ">
      <div className="mx-auto w-full max-w-full">
        <AccountNavbar
          customerName={customerName}
          customerEmail={customerEmail}
          customerImage={customerImage}
        />

        <AccountSidebarLayout>{children}</AccountSidebarLayout>
      </div>
    </div>
  );
}
