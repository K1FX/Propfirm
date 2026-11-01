import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { DemoBanner } from "@/components/dashboard/demo-banner";
import { MobileNav, MobileTopBar, Sidebar } from "@/components/dashboard/sidebar";
import { pickClientMessages } from "@/i18n/client-messages";
import { toLocale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

// TODO Phase 3 : protéger ces routes (session Supabase obligatoire).
export default async function DashboardLayout({
  children,
  params,
}: LayoutProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(toLocale(locale));
  const messages = await pickClientMessages("dashboard");

  return (
    <NextIntlClientProvider messages={messages}>
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
    </NextIntlClientProvider>
  );
}
