"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ACCOUNT_SIZE, SIZES, type SizeId as PlanId } from "@/config/sizes";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  rankEntries,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/server/leaderboard/rank";

import { Podium } from "./podium";
import { TraderAvatar } from "./trader-avatar";

type Props = { entries: LeaderboardEntry[]; locale: string; limit?: number };

const PERIODS: LeaderboardPeriod[] = ["season", "month", "allTime"];

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
    <div className="flex flex-col gap-2">
      <span className="px-1 label-caps">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex flex-wrap rounded-[12px] border border-border bg-bg/70 p-1"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[9px] px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm",
              value === o.value ? "bg-chrome" : "text-text-muted hover:bg-surface hover:text-text",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Change({ n }: { n: number }) {
  const t = useTranslations("Leaderboard.change");
  if (n === 0)
    return (
      <span className="inline-flex w-8 justify-center text-text-muted" aria-label={t("same")}>
        <Minus className="size-3.5" aria-hidden />
      </span>
    );
  const up = n > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex w-8 items-center justify-center gap-0.5 rounded-full py-0.5 tabular text-[11px]",
        up ? "bg-cyan/10 text-cyan-light" : "bg-danger/10 text-danger",
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
  const [period, setPeriod] = useState<LeaderboardPeriod>("season");
  const [size, setSize] = useState<PlanId | "all">("all");

  const ranked = useMemo(() => rankEntries(entries, period, size), [entries, period, size]);
  const rest = ranked.slice(3, limit);
  const myIndex = ranked.findIndex((e) => e.me);
  const me = myIndex >= 0 ? ranked[myIndex] : undefined;
  const leaderProfit = ranked[0]?.profit[period] || 1;

  const total = ranked.reduce((s, e) => s + e.profit[period], 0);
  const money = (c: number) => formatMoney(c, { locale, showCents: false });
  const nf = new Intl.NumberFormat(locale);

  const stats = [
    { label: t("stats.traders"), value: nf.format(ranked.length) },
    { label: t("stats.total"), value: money(total) },
    {
      label: t("stats.average"),
      value: money(ranked.length ? Math.round(total / ranked.length) : 0),
    },
  ];

  const row = (e: LeaderboardEntry, position: number) => {
    const share = Math.max(2, Math.round((e.profit[period] / leaderProfit) * 100));
    return (
      <li
        key={e.id}
        className={cn(
          "relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-[14px] border px-3 py-3 transition-all sm:grid-cols-[3rem_2rem_1fr_7rem_5rem_8rem] sm:gap-4 sm:px-5",
          e.me
            ? "border-cyan/60 bg-[linear-gradient(90deg,rgba(34,211,238,.16),rgba(17,19,23,1)_70%)] shadow-[0_0_30px_rgba(34,211,238,.18)]"
            : "border-border bg-surface hover:border-cyan/40 hover:shadow-[0_0_24px_rgba(34,211,238,.12)]",
        )}
      >
        <span
          className={cn(
            "text-center font-display text-lg font-bold",
            position <= 10 ? "text-chrome" : "text-text-muted",
          )}
        >
          {position}
        </span>
        <span className="hidden sm:block">
          <Change n={e.change} />
        </span>
        <div className="flex min-w-0 items-center gap-3">
          <TraderAvatar handle={e.handle} tone={e.rank} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              <span className={cn(e.me && "text-cyan-light")}>{e.handle}</span>
              {e.me && <span className="ml-1.5 text-xs text-cyan-light">({t("you")})</span>}
            </p>
            {/* Profit relatif au leader */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1 w-full max-w-48 overflow-hidden rounded-full bg-bg-elevated">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-cyan-deep to-cyan"
                  style={{ width: `${share}%` }}
                />
              </span>
              <span className="hidden tabular text-[10px] whitespace-nowrap text-text-muted lg:inline">
                {t("vsLeader", { pct: share })}
              </span>
            </div>
          </div>
        </div>
        <span className="hidden sm:block">
          <Badge variant={e.rank}>{tPass(`${e.rank}.name`)}</Badge>
        </span>
        <span className="hidden text-right tabular text-sm text-text-muted sm:block">
          {formatAccountSize(ACCOUNT_SIZE[e.planId])}
          <span className="block text-[11px]">
            {e.tradingDays[period]} {t("cols.days").toLowerCase()}
          </span>
        </span>
        <span className="text-right tabular font-semibold text-cyan-light sm:text-lg">
          {money(e.profit[period])}
        </span>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Filtres */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface/60 p-4 backdrop-blur-xl sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:p-5">
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
            ...SIZES.map((s) => ({ value: s, label: formatAccountSize(ACCOUNT_SIZE[s]) })),
          ]}
        />
      </div>

      {/* Chiffres clés de la sélection */}
      <dl className="grid grid-cols-3 divide-x divide-border rounded-[20px] border border-border bg-[linear-gradient(180deg,#111317,#0C0E12)]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 px-2 py-5 text-center">
            <dd className="order-1 tabular text-base font-semibold text-text sm:text-3xl">
              {s.value}
            </dd>
            <dt className="order-2 label-caps !text-[10px] sm:!text-[11px]">{s.label}</dt>
          </div>
        ))}
      </dl>

      {ranked.length === 0 ? (
        <p className="text-sm text-text-muted">{t("empty")}</p>
      ) : (
        <>
          <Podium
            top={ranked.slice(0, 3)}
            period={period}
            locale={locale}
            animationKey={`${period}-${size}`}
          />

          {rest.length > 0 && (
            <ol aria-label={t("title")} className="flex flex-col gap-2">
              <li
                aria-hidden
                className="hidden grid-cols-[3rem_2rem_1fr_7rem_5rem_8rem] gap-4 px-5 label-caps sm:grid"
              >
                <span className="text-center">{t("cols.rank")}</span>
                <span />
                <span>{t("cols.trader")}</span>
                <span>{t("cols.pass")}</span>
                <span className="text-right">{t("cols.account")}</span>
                <span className="text-right">{t("cols.profit")}</span>
              </li>
              {rest.map((e, i) => row(e, i + 4))}
            </ol>
          )}

          {/* Position de l'utilisateur, toujours visible s'il est hors du top affiché */}
          {me && myIndex >= limit && (
            <div className="sticky bottom-20 z-10 -mx-2 rounded-[20px] bg-bg/85 p-2 backdrop-blur-xl lg:bottom-4">
              <p className="mb-2 px-1 label-caps">{t("yourPosition")}</p>
              <ol>{row(me, myIndex + 1)}</ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
