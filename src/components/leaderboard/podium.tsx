"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/ui/flag";
import { ACCOUNT_SIZE } from "@/config/sizes";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/server/leaderboard/rank";

import { TraderAvatar } from "./trader-avatar";

type Props = {
  top: LeaderboardEntry[];
  period: LeaderboardPeriod;
  locale: string;
  /** Clé qui change avec les filtres, pour rejouer l'animation. */
  animationKey: string;
};

const places = [
  {
    tone: "gold" as const,
    text: "text-rank-gold",
    pedestal: "h-28 sm:h-44",
    face: "from-[#3A2F17] via-[#1B1710] to-[#0C0E12]",
    edge: "from-[#FFE6A8] via-[#E8B04A] to-[#7A5413]",
    glow: "shadow-[0_-10px_60px_rgba(232,176,74,.25)]",
  },
  {
    tone: "silver" as const,
    text: "text-rank-silver",
    pedestal: "h-20 sm:h-32",
    face: "from-[#2B2F36] via-[#16191E] to-[#0C0E12]",
    edge: "from-[#FFFFFF] via-[#B8C0CC] to-[#5E656E]",
    glow: "shadow-[0_-10px_50px_rgba(184,192,204,.15)]",
  },
  {
    tone: "bronze" as const,
    text: "text-rank-bronze",
    pedestal: "h-14 sm:h-24",
    face: "from-[#33241A] via-[#181512] to-[#0C0E12]",
    edge: "from-[#E3B48C] via-[#C98A5A] to-[#6B4126]",
    glow: "shadow-[0_-10px_50px_rgba(201,138,90,.18)]",
  },
];

/** Podium à marches métalliques : 2e – 1er – 3e. */
export function Podium({ top, period, locale, animationKey }: Props) {
  const t = useTranslations("Leaderboard");
  const tPass = useTranslations("Pass.ranks");
  const reduce = useReducedMotion();
  const order = [1, 0, 2].filter((i) => top[i]);

  return (
    <section
      aria-label={t("podium")}
      className="relative grid grid-cols-3 items-end gap-2 pt-10 sm:gap-5"
    >
      {/* Projecteur sur le 1er */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] spotlight"
      />

      {order.map((i) => {
        const e = top[i]!;
        const p = places[i]!;
        const first = i === 0;
        const size = formatAccountSize(ACCOUNT_SIZE[e.planId]);

        return (
          <motion.div
            key={`${animationKey}-${e.id}`}
            className="relative flex min-w-0 flex-col items-center"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: first ? 0.15 : i === 1 ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Trader */}
            <div className="mb-4 flex w-full min-w-0 flex-col items-center gap-2 px-1 text-center">
              {first && (
                <motion.span
                  aria-hidden
                  animate={reduce ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown
                    className="size-6 text-rank-gold drop-shadow-[0_0_10px_rgba(232,176,74,.7)] sm:size-8"
                    strokeWidth={1.5}
                  />
                </motion.span>
              )}
              <TraderAvatar handle={e.handle} tone={p.tone} size={first ? "xl" : "lg"} />
              <p className="w-full truncate font-display text-sm font-semibold sm:text-lg">
                <Flag
                  code={e.country}
                  title={new Intl.DisplayNames([locale], { type: "region" }).of(
                    e.country.toUpperCase(),
                  )}
                  className="mr-1.5 inline-block h-[11px] w-[16px] rounded-[2px] ring-1 ring-white/10 sm:h-[13px] sm:w-[19px]"
                />
                {e.handle}
                {e.me && <span className="ml-1 text-xs text-cyan-light">({t("you")})</span>}
              </p>
              <div className="hidden items-center gap-2 sm:flex">
                <Badge variant={e.rank}>{tPass(`${e.rank}.name`)}</Badge>
                <span className="tabular text-xs text-text-muted">{size}</span>
              </div>
              <p
                className={cn(
                  "tabular font-semibold whitespace-nowrap",
                  first
                    ? "text-lg text-rank-gold drop-shadow-[0_0_14px_rgba(232,176,74,.45)] sm:text-4xl"
                    : "text-sm text-cyan-light sm:text-2xl",
                )}
              >
                {formatMoney(e.profit[period], { locale, showCents: false })}
              </p>
            </div>

            {/* Marche */}
            <div
              className={cn("relative w-full overflow-hidden rounded-t-[16px]", p.pedestal, p.glow)}
            >
              <div className={cn("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r", p.edge)} />
              <div className={cn("absolute inset-0 top-[3px] bg-gradient-to-b", p.face)} />
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-3 text-center font-display text-4xl font-bold opacity-90 sm:top-5 sm:text-6xl",
                  p.text,
                )}
                style={{ textShadow: "0 1px 0 rgba(255,255,255,.15), 0 -1px 0 rgba(0,0,0,.6)" }}
              >
                {i + 1}
              </span>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
