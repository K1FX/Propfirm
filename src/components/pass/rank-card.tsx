import { Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getRankProgress, type RankId } from "@/config/pass";
import { cn } from "@/lib/utils";

export const rankText: Record<RankId, string> = {
  bronze: "text-rank-bronze",
  silver: "text-rank-silver",
  gold: "text-rank-gold",
  platinum: "text-rank-platinum",
  elite: "text-rank-elite",
};

const rankRing: Record<RankId, string> = {
  bronze: "border-rank-bronze/50 bg-rank-bronze/10",
  silver: "border-rank-silver/50 bg-rank-silver/10",
  gold: "border-rank-gold/50 bg-rank-gold/10 shadow-[0_0_30px_rgba(232,176,74,.25)]",
  platinum: "border-rank-platinum/50 bg-rank-platinum/10",
  elite: "border-rank-elite/60 bg-rank-elite/10 glow-cyan",
};

/** Carte du rang actuel avec barre d'XP. */
export function RankCard({
  xp,
  badge,
  children,
  className,
}: {
  xp: number;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const t = useTranslations("Pass");
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale);
  const p = getRankProgress(xp);

  return (
    <Card className={cn("flex flex-col gap-6 p-6 border-chrome", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-muted">{t("currentRank")}</span>
        {badge}
      </div>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-2xl border",
            rankRing[p.current.id],
          )}
        >
          <Trophy className={cn("size-8", rankText[p.current.id])} strokeWidth={1.5} aria-hidden />
        </div>
        <div>
          <p className={cn("font-display text-3xl font-bold", rankText[p.current.id])}>
            {t(`ranks.${p.current.id}.name`)}
          </p>
          <p className="tabular text-sm text-text-muted">
            {t("xpLabel")} · {nf.format(p.xp)} XP
          </p>
        </div>
      </div>
      <ProgressBar
        value={p.progressPct}
        label={
          p.next
            ? t("toNext", { xp: nf.format(p.xpToNext), rank: t(`ranks.${p.next.id}.name`) })
            : t("maxRank")
        }
        valueLabel={p.next ? `${nf.format(p.xp)} / ${nf.format(p.next.minXp)}` : undefined}
      />
      {children}
    </Card>
  );
}
