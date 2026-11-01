import {
  ArrowRight,
  CalendarCheck,
  Flame,
  Gift,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { brand } from "@/config/brand";
import { getRankProgress, ranks, xpSources, type XpSourceId } from "@/config/pass";
import { cn } from "@/lib/utils";

const sourceIcons: Record<XpSourceId, typeof Target> = {
  disciplinedDay: ShieldCheck,
  dailyMission: Target,
  weeklyMission: CalendarCheck,
  evaluationPassed: Trophy,
  payout: Gift,
  referral: Users,
  streak: Flame,
};

const rankText = {
  bronze: "text-rank-bronze",
  silver: "text-rank-silver",
  gold: "text-rank-gold",
  platinum: "text-rank-platinum",
  elite: "text-rank-elite",
} as const;

/** XP d'exemple pour illustrer la carte de rang (pas un vrai utilisateur). */
const EXAMPLE_XP = 2_640;

export function PassSection() {
  const t = useTranslations("Pass");
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale);
  const progress = getRankProgress(EXAMPLE_XP);

  return (
    <Section id="pass" elevated className="overflow-hidden">
      <div
        aria-hidden
        className="absolute top-0 right-0 h-[400px] w-[600px] rounded-full bg-cyan-deep/25 blur-[140px]"
      />
      <SectionHeading
        eyebrow={t("eyebrow", { passName: brand.passName })}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="relative mt-14 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Card className="flex h-full flex-col gap-6 p-7 border-chrome">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">{t("currentRank")}</span>
              <Badge variant="neutral">{t("example")}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-rank-gold/50 bg-rank-gold/10 shadow-[0_0_30px_rgba(232,176,74,.25)]">
                <Trophy className="size-8 text-rank-gold" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <p className={cn("font-display text-3xl font-bold", rankText[progress.current.id])}>
                  {t(`ranks.${progress.current.id}.name`)}
                </p>
                <p className="tabular text-sm text-text-muted">
                  {nf.format(progress.xp)} XP · {t("xpLabel")}
                </p>
              </div>
            </div>
            <ProgressBar
              value={progress.progressPct}
              label={
                progress.next
                  ? t("toNext", {
                      xp: nf.format(progress.xpToNext),
                      rank: t(`ranks.${progress.next.id}.name`),
                    })
                  : t("maxRank")
              }
              valueLabel={
                progress.next
                  ? `${nf.format(progress.xp)} / ${nf.format(progress.next.minXp)}`
                  : undefined
              }
            />
            <p className="text-sm text-text-muted">{t("season")}</p>

            <h3 className="mt-2 text-sm font-semibold tracking-[0.15em] text-text uppercase">
              {t("sourcesTitle")}
            </h3>
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {xpSources.map((s) => {
                const Icon = sourceIcons[s.id];
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg/60 px-3.5 py-2.5"
                  >
                    <span className="flex items-center gap-2.5 text-sm text-text-muted">
                      <Icon className="size-4 shrink-0 text-cyan" strokeWidth={1.5} aria-hidden />
                      {t(`sources.${s.id}`)}
                    </span>
                    <span className="tabular text-sm font-semibold text-cyan-light">
                      +{nf.format(s.xp)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-[0.15em] text-text uppercase">
              {t("ranksTitle")}
            </h3>
            <ol className="relative flex flex-col gap-3">
              {ranks.map((rank) => {
                const reached = EXAMPLE_XP >= rank.minXp;
                const isCurrent = rank.id === progress.current.id;
                return (
                  <li
                    key={rank.id}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border bg-surface px-5 py-4 transition-colors",
                      isCurrent ? "border-cyan/60 glow-cyan" : "border-border",
                      !reached && "opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border tabular text-xs font-semibold",
                        rankText[rank.id],
                        rank.id === "elite" && "glow-cyan",
                      )}
                      style={{ borderColor: "currentColor" }}
                      aria-hidden
                    >
                      {rank.minXp >= 1000 ? `${rank.minXp / 1000}K` : rank.minXp}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-display font-semibold", rankText[rank.id])}>
                        {t(`ranks.${rank.id}.name`)}
                        <span className="ml-2 tabular text-xs font-normal text-text-muted">
                          {nf.format(rank.minXp)} XP
                        </span>
                      </p>
                      <p className="text-sm text-text-muted">{t(`ranks.${rank.id}.reward`)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <ButtonLink href="/pass" variant="secondary" className="mt-2 self-start">
              {t("cta", { passName: brand.passName })}
              <ArrowRight />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
