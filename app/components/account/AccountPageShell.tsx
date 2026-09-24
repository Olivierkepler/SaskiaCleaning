import type { ReactNode } from "react";

type AccountPageShellProps = {
  children: ReactNode;
};

export default function AccountPageShell({ children }: AccountPageShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f9fc] px-6 py-8 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
}
