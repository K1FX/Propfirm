import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { brand } from "@/config/brand";
import { routing, toLocale } from "@/i18n/routing";

import "../globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: toLocale(locale), namespace: "Metadata" });

  return {
    title: { default: brand.name, template: `%s · ${brand.name}` },
    description: t("description", { passName: brand.passName }),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh bg-bg text-text">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
