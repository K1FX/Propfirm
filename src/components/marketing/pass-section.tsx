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

import { RankCard, rankText } from "@/components/pass/rank-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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
          <RankCard
            xp={EXAMPLE_XP}
            className="h-full p-7"
            badge={<Badge variant="neutral">{t("example")}</Badge>}
          >
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
          </RankCard>
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
