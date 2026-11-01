import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Michroma, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { brand } from "@/config/brand";
import { pickClientMessages } from "@/i18n/client-messages";
import { routing, toLocale } from "@/i18n/routing";

import "../globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-sora" });
/** Police du nom de marque (logo texte). Pour en changer : remplacer ici (ex. Cinzel, Orbitron). */
const wordmark = Michroma({ subsets: ["latin"], weight: "400", variable: "--font-wordmark" });
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
  const messages = await pickClientMessages("site");

  return (
    <html
      lang={locale}
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} ${wordmark.variable}`}
    >
      <body className="min-h-dvh bg-bg text-text">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
