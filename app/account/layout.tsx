import type { ReactNode } from "react";
import AccountPageShell from "@/app/components/account/AccountPageShell";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountPageShell>{children}</AccountPageShell>;
}
