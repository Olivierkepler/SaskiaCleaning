import type { ReactNode } from "react";

import AccountPageShell from "@/app/components/account/AccountPageShell";
import { requireCustomer } from "@/app/lib/customer-auth";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const customer = await requireCustomer("/login");

  return (
    <AccountPageShell
      customerName={customer.name}
      customerEmail={customer.email}
      customerImage={customer.image}
    >
      {children}
    </AccountPageShell>
  );
}
