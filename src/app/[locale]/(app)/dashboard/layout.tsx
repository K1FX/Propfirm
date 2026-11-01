import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { DemoBanner } from "@/components/dashboard/demo-banner";
import { MobileNav, MobileTopBar, Sidebar } from "@/components/dashboard/sidebar";
import { toLocale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

// TODO Phase 3 : protéger ces routes (session Supabase obligatoire).
export default function DashboardLayout({ children, params }: LayoutProps<"/[locale]/dashboard">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main
          id="main"
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-6 pb-28 sm:px-8 lg:pt-10 lg:pb-12"
        >
          <DemoBanner />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
