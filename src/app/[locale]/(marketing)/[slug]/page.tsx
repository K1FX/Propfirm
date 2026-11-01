import { Construction } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { brand } from "@/config/brand";
import { routing, toLocale } from "@/i18n/routing";

/**
 * Pages publiques pas encore construites (Phase 2/3) : évite les liens morts.
 * Une vraie page (ex. app/[locale]/(marketing)/faq/page.tsx) prend automatiquement le dessus.
 */
const pages = {
  challenges: "challenges",
  rules: "rules",
  pass: "pass",
  payouts: "payouts",
  faq: "faq",
  login: "login",
  affiliate: "affiliate",
  blog: "blog",
  terms: "terms",
  privacy: "privacy",
  "legal-notice": "notice",
  "risk-disclosure": "risk",
} as const;

type Slug = keyof typeof pages;
const isSlug = (s: string): s is Slug => s in pages;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => Object.keys(pages).map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSlug(slug)) return {};
  const t = await getTranslations({ locale: toLocale(locale), namespace: "Pages" });
  return { title: t(pages[slug], { passName: brand.passName }), robots: { index: false } };
}

export default function ComingSoonPage({ params }: PageProps<"/[locale]/[slug]">) {
  const { locale, slug } = use(params);
  setRequestLocale(toLocale(locale));
  const t = useTranslations();
  if (!isSlug(slug)) notFound();

  return (
    <Section className="min-h-[60vh]">
      <div className="flex flex-col items-center gap-8">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-cyan/40 bg-cyan/10">
          <Construction className="size-7 text-cyan" strokeWidth={1.5} aria-hidden />
        </div>
        <SectionHeading
          as="h1"
          eyebrow={t("Placeholder.comingSoon")}
          title={t(`Pages.${pages[slug]}`, { passName: brand.passName })}
        />
        <ButtonLink href="/" variant="secondary">
          {t("Placeholder.back")}
        </ButtonLink>
      </div>
    </Section>
  );
}
