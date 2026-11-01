import { CalendarClock, Flame, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { formatDay } from "@/components/dashboard/format";
import { PageHeader } from "@/components/dashboard/page-header";
import { Leaderboard } from "@/components/pass/leaderboard";
import { MissionsList } from "@/components/pass/missions-list";
import { RankCard } from "@/components/pass/rank-card";
import { SeasonTrack } from "@/components/pass/season-track";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { brand } from "@/config/brand";
import { defaultSeasonTrack, seasonConfig } from "@/config/pass";
import { toLocale } from "@/i18n/routing";
import { formatMoney } from "@/lib/format";
import { demoLeaderboard, demoMissions, demoUser } from "@/server/demo/data";

export async function generateMetadata(): Promise<Metadata> {
  return { title: brand.passName };
}

export default async function PassPage({ params }: PageProps<"/[locale]/dashboard/pass">) {
  const { locale: raw } = await params;
  setRequestLocale(toLocale(raw));
  const locale = await getLocale();
  const t = await getTranslations("Dashboard.pass");
  const nf = new Intl.NumberFormat(locale);

  const tiers = defaultSeasonTrack();
  const unlockedTier = Math.floor(demoUser.seasonXp / demoUser.seasonTierXp);
  const tierProgress = ((demoUser.seasonXp % demoUser.seasonTierXp) / demoUser.seasonTierXp) * 100;

  return (
    <>
      <PageHeader title={brand.passName} subtitle={t("subtitle")} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <RankCard xp={demoUser.totalXp}>
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Flame className="size-4 text-rank-gold" strokeWidth={1.5} aria-hidden />
            {t("streak", { n: demoUser.streakDays })}
          </p>
        </RankCard>

        <Card className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl">{t("season", { n: demoUser.seasonNumber })}</CardTitle>
            <Badge variant="neutral">
              <CalendarClock className="size-3.5" aria-hidden />
              {t("endsOn", { date: formatDay(demoUser.seasonEndsAt, locale, "long") })}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="tabular text-4xl font-semibold text-cyan-light">
              {nf.format(demoUser.seasonXp)}
            </span>
            <span className="text-sm text-text-muted">{t("seasonXp")}</span>
          </div>
          <ProgressBar
            value={tierProgress}
            label={t("tier", { n: unlockedTier + 1 })}
            valueLabel={`${demoUser.seasonXp % demoUser.seasonTierXp} / ${demoUser.seasonTierXp} XP`}
          />
          {!demoUser.premium && (
            <Button variant="secondary" className="self-start" disabled>
              <Sparkles className="text-rank-gold" aria-hidden />
              {t("unlockPremium", {
                price: formatMoney(seasonConfig.premiumPrice, { locale }),
              })}
            </Button>
          )}
        </Card>
      </div>

      <section aria-labelledby="track-title" className="flex flex-col gap-4">
        <h2 id="track-title" className="font-display text-lg font-semibold">
          {t("track")}
        </h2>
        <SeasonTrack
          tiers={tiers}
          unlockedTier={unlockedTier}
          initialClaimed={[...demoUser.claimedTiers]}
          premium={demoUser.premium}
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <MissionsList missions={demoMissions} />
        <Leaderboard rows={demoLeaderboard} />
      </div>
    </>
  );
}
