"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Gift, Lock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import type { SeasonReward, SeasonTier } from "@/config/pass";
import { cn } from "@/lib/utils";

type Props = {
  tiers: SeasonTier[];
  unlockedTier: number;
  initialClaimed: number[];
  premium: boolean;
};

/**
 * Piste de saison scrollable. La réclamation est locale (démo) : en Phase 6 elle passera
 * par une Server Action qui vérifie et enregistre la récompense côté serveur.
 */
export function SeasonTrack({ tiers, unlockedTier, initialClaimed, premium }: Props) {
  const t = useTranslations("Dashboard.pass");
  const reduce = useReducedMotion();
  const [claimed, setClaimed] = useState<Set<number>>(() => new Set(initialClaimed));
  const [justClaimed, setJustClaimed] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ouvre la piste sur le palier en cours.
  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-tier="${unlockedTier}"]`);
    if (el && scrollRef.current) {
      scrollRef.current.scrollLeft = Math.max(0, el.offsetLeft - 16);
    }
  }, [unlockedTier]);

  function rewardLabel(r: SeasonReward) {
    return r.type === "coupon" ? t("rewards.coupon", { pct: r.pct }) : t(`rewards.${r.type}`);
  }

  function claim(tier: number) {
    setClaimed((s) => new Set(s).add(tier));
    setJustClaimed(tier);
    setTimeout(() => setJustClaimed(null), 1200);
  }

  return (
    <div className="-mx-1 [scrollbar-color:#262A31_transparent] overflow-x-auto pb-3">
      <ol className="flex w-max gap-3 px-1">
        {tiers.map(({ tier, free, premium: prem }) => {
          const unlocked = tier <= unlockedTier;
          const isClaimed = claimed.has(tier);
          const claimable = unlocked && !isClaimed && free !== null;

          return (
            <li
              key={tier}
              data-tier={tier}
              className={cn(
                "relative flex w-36 flex-col gap-2 rounded-2xl border bg-surface p-3",
                claimable ? "border-cyan/70 glow-cyan" : "border-border",
                !unlocked && "opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="tabular text-xs text-text-muted">{t("tier", { n: tier })}</span>
                {!unlocked && (
                  <Lock className="size-3.5 text-text-muted" aria-label={t("locked")} />
                )}
                {unlocked && isClaimed && (
                  <Check className="size-3.5 text-cyan" aria-label={t("claimed")} />
                )}
              </div>

              {/* Piste gratuite */}
              <div className="flex min-h-[72px] flex-col justify-between rounded-xl border border-border bg-bg/60 p-2.5">
                <span className="text-[10px] tracking-widest text-text-muted uppercase">
                  {t("free")}
                </span>
                <span className="text-xs leading-snug text-text">
                  {free ? rewardLabel(free) : "—"}
                </span>
              </div>

              {/* Piste premium */}
              <div className="flex min-h-[72px] flex-col justify-between rounded-xl border border-rank-gold/30 bg-rank-gold/5 p-2.5">
                <span className="flex items-center gap-1 text-[10px] tracking-widest text-rank-gold uppercase">
                  <Sparkles className="size-3" aria-hidden /> {t("premium")}
                </span>
                <span className="text-xs leading-snug text-text">{rewardLabel(prem)}</span>
              </div>

              {claimable ? (
                <button
                  type="button"
                  onClick={() => claim(tier)}
                  className="mt-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-[10px] text-xs font-semibold bg-chrome"
                >
                  <Gift className="size-3.5" aria-hidden />
                  {t("claim")}
                </button>
              ) : (
                <span className="mt-1 inline-flex h-8 items-center justify-center rounded-[10px] border border-border text-xs text-text-muted">
                  {!unlocked
                    ? t("locked")
                    : free === null && !premium
                      ? t("premiumLocked")
                      : t("claimed")}
                </span>
              )}

              <AnimatePresence>
                {justClaimed === tier && !reduce && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-cyan"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {justClaimed ? `${t("tier", { n: justClaimed })} : ${t("claimed")}` : ""}
      </p>
    </div>
  );
}
