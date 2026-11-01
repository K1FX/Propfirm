import { Construction } from "lucide-react";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { routing, toLocale } from "@/i18n/routing";

const sections = ["referrals", "profile"] as const;
type Section = (typeof sections)[number];
const isSection = (s: string): s is Section => (sections as readonly string[]).includes(s);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => sections.map((section) => ({ locale, section })));
}

export default function SectionPage({ params }: PageProps<"/[locale]/dashboard/[section]">) {
  const { locale, section } = use(params);
  setRequestLocale(toLocale(locale));
  const t = useTranslations("Dashboard");
  if (!isSection(section)) notFound();

  return (
    <>
      <PageHeader title={t(`nav.${section}`)} />
      <Card className="flex flex-col items-center gap-4 py-14 text-center">
        <Construction className="size-8 text-cyan" strokeWidth={1.5} aria-hidden />
        <p className="font-display text-lg font-semibold">{t("comingSoon.title")}</p>
        <p className="text-sm text-text-muted">{t("comingSoon.desc")}</p>
      </Card>
    </>
  );
}
