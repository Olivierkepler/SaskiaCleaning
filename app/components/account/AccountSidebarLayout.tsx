"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import AccountSidebar from "@/app/components/account/AccountSidebar";

const SIDEBAR_PREFERENCE_KEY = "saskia:account-sidebar:collapsed";

export default function AccountSidebarLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [preferenceReady, setPreferenceReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(
        window.localStorage.getItem(SIDEBAR_PREFERENCE_KEY) === "collapsed",
      );
    } catch {
      // The sidebar still works for this session when storage is unavailable.
    }
    setPreferenceReady(true);
  }, []);

  useEffect(() => {
    if (!preferenceReady) return;
    try {
      window.localStorage.setItem(
        SIDEBAR_PREFERENCE_KEY,
        collapsed ? "collapsed" : "expanded",
      );
    } catch {
      // Keep the in-memory preference if storage is unavailable.
    }
  }, [collapsed, preferenceReady]);

  function toggleCollapsed() {
    setCollapsed((current) => !current);
  }

  const layoutStyle = {
    "--account-sidebar-width": collapsed ? "76px" : "250px",
  } as CSSProperties;

  return (
    <div
      data-account-sidebar-collapsed={collapsed ? "true" : "false"}
      className="min-w-0 lg:grid lg:grid-cols-[var(--account-sidebar-width)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:transition-[grid-template-columns] lg:duration-300 lg:ease-out"
      style={layoutStyle}
    >
      <AccountSidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
