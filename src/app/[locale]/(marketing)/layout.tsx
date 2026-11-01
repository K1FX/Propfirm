import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { PromoBanner } from "@/components/marketing/promo-banner";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { toLocale } from "@/i18n/routing";

export default function MarketingLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));

  return (
    <>
      <PromoBanner />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
