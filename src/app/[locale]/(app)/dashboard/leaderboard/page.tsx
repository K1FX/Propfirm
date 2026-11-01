import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/dashboard/page-header";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { toLocale } from "@/i18n/routing";
import { getLeaderboard } from "@/server/leaderboard/service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Leaderboard");
  return { title: t("eyebrow") };
}

export default async function DashboardLeaderboardPage({
  params,
}: PageProps<"/[locale]/dashboard/leaderboard">) {
  const { locale: raw } = await params;
  setRequestLocale(toLocale(raw));
  const locale = await getLocale();
  const t = await getTranslations("Leaderboard");

  return (
    <>
      <PageHeader title={t("eyebrow")} subtitle={t("dashboardSubtitle")} />
      <LeaderboardView entries={getLeaderboard()} locale={locale} limit={15} />
    </>
  );
}
