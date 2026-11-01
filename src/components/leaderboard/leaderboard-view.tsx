"use client";

import { ArrowDown, ArrowUp, Crown, Minus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { plans, type PlanId } from "@/config/plans";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  rankEntries,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/server/leaderboard/rank";

type Props = { entries: LeaderboardEntry[]; locale: string; limit?: number };

const PERIODS: LeaderboardPeriod[] = ["season", "month", "allTime"];

const medal = [
  {
    ring: "border-rank-gold/70",
    text: "text-rank-gold",
    glow: "shadow-[0_0_50px_rgba(232,176,74,.28)]",
  },
  {
    ring: "border-rank-silver/60",
    text: "text-rank-silver",
    glow: "shadow-[0_0_36px_rgba(184,192,204,.18)]",
  },
  {
    ring: "border-rank-bronze/60",
    text: "text-rank-bronze",
    glow: "shadow-[0_0_36px_rgba(201,138,90,.2)]",
  },
] as const;

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap rounded-[12px] border border-border bg-bg p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[9px] px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
            value === o.value
              ? "bg-surface text-text ring-1 ring-border"
              : "text-text-muted hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Change({ n }: { n: number }) {
  const t = useTranslations("Leaderboard.change");
  if (n === 0)
    return (
      <span className="text-text-muted" aria-label={t("same")}>
        <Minus className="size-3.5" aria-hidden />
      </span>
    );
  const up = n > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 tabular text-xs",
        up ? "text-cyan-light" : "text-danger",
      )}
      aria-label={t(up ? "up" : "down", { n: Math.abs(n) })}
    >
      <Icon className="size-3" aria-hidden />
      {Math.abs(n)}
    </span>
  );
}

export function LeaderboardView({ entries, locale, limit = 25 }: Props) {
  const t = useTranslations("Leaderboard");
  const tPass = useTranslations("Pass.ranks");
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<LeaderboardPeriod>("season");
  const [size, setSize] = useState<PlanId | "all">("all");

  const ranked = useMemo(() => rankEntries(entries, period, size), [entries, period, size]);
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3, limit);
  const myIndex = ranked.findIndex((e) => e.me);
  const me = myIndex >= 0 ? ranked[myIndex] : undefined;

  const money = (c: number) => formatMoney(c, { locale, showCents: false });

  // Podium affiché 2 – 1 – 3 sur grand écran.
  const podiumOrder = [1, 0, 2].filter((i) => podium[i]);

  // Largeurs de colonnes communes au tableau et à la ligne « Votre position ».
  const cols = (
    <colgroup>
      <col className="w-[96px] sm:w-[120px]" />
      <col />
      <col className="hidden w-[150px] sm:table-column" />
      <col className="hidden w-[110px] md:table-column" />
      <col className="hidden w-[90px] md:table-column" />
      <col className="w-[120px] sm:w-[150px]" />
    </colgroup>
  );

  const row = (e: LeaderboardEntry, position: number, sticky = false) => (
    <tr
      key={`${e.id}${sticky ? "-sticky" : ""}`}
      className={cn("transition-colors", e.me ? "bg-cyan/10" : "bg-surface hover:bg-bg-elevated")}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="w-7 tabular text-sm font-semibold text-text-muted">{position}</span>
          <Change n={e.change} />
        </div>
      </td>
      <td className="truncate px-4 py-3">
        <span className={cn("font-semibold", e.me && "text-cyan-light")}>{e.handle}</span>
        {e.me && <span className="ml-2 text-xs text-cyan-light">({t("you")})</span>}
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <Badge variant={e.rank}>{tPass(`${e.rank}.name`)}</Badge>
      </td>
      <td className="hidden px-4 py-3 tabular text-text-muted md:table-cell">
        {formatAccountSize(plans.find((p) => p.id === e.planId)!.accountSize)}
      </td>
      <td className="hidden px-4 py-3 text-right tabular text-text-muted md:table-cell">
        {e.tradingDays[period]}
      </td>
      <td className="px-4 py-3 text-right tabular font-semibold text-cyan-light">
        {money(e.profit[period])}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Segmented
          label={t("periods.label")}
          value={period}
          onChange={setPeriod}
          options={PERIODS.map((p) => ({ value: p, label: t(`periods.${p}`) }))}
        />
        <Segmented
          label={t("sizes.label")}
          value={size}
          onChange={setSize}
          options={[
            { value: "all" as const, label: t("sizes.all") },
            ...plans.map((p) => ({ value: p.id, label: formatAccountSize(p.accountSize) })),
          ]}
        />
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-text-muted">{t("empty")}</p>
      ) : (
        <>
          <section aria-label={t("podium")} className="grid items-end gap-4 sm:grid-cols-3">
            {podiumOrder.map((i) => {
              const e = podium[i]!;
              const first = i === 0;
              return (
                <motion.div
                  key={`${e.id}-${period}-${size}`}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: first ? 0 : 0.12 }}
                  className={cn(
                    "relative flex flex-col items-center gap-3 rounded-[20px] border bg-surface px-5 text-center",
                    medal[i]!.ring,
                    medal[i]!.glow,
                    first ? "py-9 sm:-translate-y-0" : "py-7",
                    i === 0 ? "order-first sm:order-none" : "",
                    e.me && "ring-2 ring-cyan",
                  )}
                >
                  {first && (
                    <Crown className="size-6 text-rank-gold" strokeWidth={1.5} aria-hidden />
                  )}
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full border-2 font-display text-xl font-bold",
                      medal[i]!.ring,
                      medal[i]!.text,
                    )}
                  >
                    {i + 1}
                  </span>
                  <p className="font-display text-lg font-semibold">
                    {e.handle}
                    {e.me && <span className="ml-1.5 text-xs text-cyan-light">({t("you")})</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={e.rank}>{tPass(`${e.rank}.name`)}</Badge>
                    <span className="tabular text-xs text-text-muted">
                      {formatAccountSize(plans.find((p) => p.id === e.planId)!.accountSize)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "tabular font-semibold text-cyan-light drop-shadow-[0_0_12px_rgba(34,211,238,.45)]",
                      first ? "text-3xl sm:text-4xl" : "text-2xl",
                    )}
                  >
                    {money(e.profit[period])}
                  </p>
                </motion.div>
              );
            })}
          </section>

          {rest.length > 0 && (
            <div className="overflow-x-auto rounded-[16px] border border-border">
              <table className="w-full table-fixed text-sm">
                {cols}
                <caption className="sr-only">{t("title")}</caption>
                <thead className="bg-bg-elevated text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 label-caps">
                      {t("cols.rank")}
                    </th>
                    <th scope="col" className="px-4 py-3 label-caps">
                      {t("cols.trader")}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 label-caps sm:table-cell">
                      {t("cols.pass")}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 label-caps md:table-cell">
                      {t("cols.account")}
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-right label-caps md:table-cell"
                    >
                      {t("cols.days")}
                    </th>
                    <th scope="col" className="px-4 py-3 text-right label-caps">
                      {t("cols.profit")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rest.map((e, i) => row(e, i + 4))}
                </tbody>
              </table>
            </div>
          )}

          {/* Position de l'utilisateur, toujours visible s'il est hors du top affiché */}
          {me && myIndex >= limit && (
            <div className="sticky bottom-20 z-10 -mx-2 rounded-[20px] bg-bg/90 px-2 pt-2 pb-2 backdrop-blur-xl lg:bottom-4">
              <p className="mb-2 px-1 label-caps">{t("yourPosition")}</p>
              <div className="overflow-hidden rounded-[16px] border border-cyan/50 bg-surface shadow-[0_0_30px_rgba(34,211,238,.25)]">
                <table className="w-full table-fixed text-sm">
                  {cols}
                  <tbody>{row(me, myIndex + 1, true)}</tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
