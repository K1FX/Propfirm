"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CalendarDay = { day: string; pnl: number; trades: number };

type Props = { days: CalendarDay[]; locale: string };

const monthKey = (iso: string) => iso.slice(0, 7);

function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

/** Calendrier mensuel du P&L (ou du nombre de trades) avec total par semaine. */
export function TradingCalendar({ days, locale }: Props) {
  const t = useTranslations("Dashboard.account.calendar");
  const byDay = useMemo(() => new Map(days.map((d) => [d.day, d])), [days]);
  const months = useMemo(() => [...new Set(days.map((d) => monthKey(d.day)))].sort(), [days]);
  const [month, setMonth] = useState(months.at(-1) ?? "2026-10");
  const [mode, setMode] = useState<"pnl" | "trades">("pnl");

  const first = months[0] ?? month;
  const last = months.at(-1) ?? month;

  // Semaines du mois, du lundi au dimanche.
  const weeks = useMemo(() => {
    const [y, m] = month.split("-").map(Number) as [number, number];
    const firstDay = new Date(Date.UTC(y, m - 1, 1));
    const offset = (firstDay.getUTCDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: (string | null)[] = [
      ...Array.from({ length: offset }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
      ),
    ];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [month]);

  const weekdayNames = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
    // 2026-11-02 est un lundi.
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2026, 10, 2 + i))));
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));

  const money = (c: number) => formatMoney(c, { locale, signed: true, showCents: false });
  const value = (d: CalendarDay) => (mode === "pnl" ? money(d.pnl) : String(d.trades));
  const monthHasData = months.includes(month);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="label-caps">{t("title")}</h2>
          <div
            role="tablist"
            className="inline-flex rounded-[10px] border border-border bg-bg p-0.5"
          >
            {(["pnl", "trades"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-[8px] px-3 py-1 text-xs font-semibold transition-colors",
                  mode === m
                    ? "bg-surface text-text ring-1 ring-border"
                    : "text-text-muted hover:text-text",
                )}
              >
                {t(m)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t("prev")}
            disabled={month <= first}
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="inline-flex size-8 items-center justify-center rounded-[10px] border border-border hover:border-cyan disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-36 text-center tabular text-sm capitalize" aria-live="polite">
            {monthLabel}
          </span>
          <button
            type="button"
            aria-label={t("next")}
            disabled={month >= last}
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="inline-flex size-8 items-center justify-center rounded-[10px] border border-border hover:border-cyan disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-1.5">
          <thead>
            <tr>
              {weekdayNames.map((n) => (
                <th
                  key={n}
                  scope="col"
                  className="pb-1 text-left label-caps font-semibold capitalize"
                >
                  {n}
                </th>
              ))}
              <th scope="col" className="pb-1 text-right label-caps">
                {t("week")}
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => {
              const data = week
                .map((d) => (d ? byDay.get(d) : undefined))
                .filter(Boolean) as CalendarDay[];
              const weekPnl = data.reduce((s, d) => s + d.pnl, 0);
              const weekTrades = data.reduce((s, d) => s + d.trades, 0);
              return (
                <tr key={wi}>
                  {week.map((d, di) => {
                    const entry = d ? byDay.get(d) : undefined;
                    return (
                      <td
                        key={di}
                        className={cn(
                          "h-16 rounded-[10px] border p-1.5 align-top sm:h-20",
                          !d && "border-transparent",
                          d && !entry && "border-border/60 bg-bg/40",
                          entry && entry.pnl >= 0 && "border-cyan/40 bg-cyan/10",
                          entry && entry.pnl < 0 && "border-danger/40 bg-danger/10",
                        )}
                        title={entry ? t("tradesCount", { count: entry.trades }) : undefined}
                      >
                        {d && (
                          <div className="flex h-full flex-col justify-between">
                            <span className="tabular text-[11px] text-text-muted">
                              {Number(d.slice(8))}
                            </span>
                            {entry && (
                              <span
                                className={cn(
                                  "truncate text-right tabular text-xs font-semibold sm:text-sm",
                                  mode === "trades"
                                    ? "text-text"
                                    : entry.pnl >= 0
                                      ? "text-cyan-light"
                                      : "text-danger",
                                )}
                              >
                                {value(entry)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="h-16 rounded-[10px] border border-border bg-surface p-1.5 text-right align-middle sm:h-20">
                    {data.length > 0 && (
                      <span
                        className={cn(
                          "tabular text-xs font-semibold sm:text-sm",
                          mode === "trades"
                            ? "text-text"
                            : weekPnl >= 0
                              ? "text-cyan-light"
                              : "text-danger",
                        )}
                      >
                        {mode === "pnl" ? money(weekPnl) : weekTrades}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!monthHasData && <p className="text-sm text-text-muted">{t("noData")}</p>}
    </div>
  );
}
