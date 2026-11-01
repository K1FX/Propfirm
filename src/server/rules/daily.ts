import { getTradingDay } from "@/lib/session";

import type { Trade } from "../trading/types";
import type { DailyResult } from "./types";

/** Agrège des trades fermés en résultats journaliers (jour de trading CME). */
export function buildDailyResults(startBalance: number, trades: readonly Trade[]): DailyResult[] {
  const sorted = [...trades].sort((a, b) => a.closedAt.localeCompare(b.closedAt));
  const byDay = new Map<string, DailyResult>();
  let balance = startBalance;

  for (const t of sorted) {
    const day = getTradingDay(new Date(t.closedAt));
    let d = byDay.get(day);
    if (!d) {
      d = {
        day,
        pnl: 0,
        closingBalance: balance,
        lowBalance: balance,
        maxMiniContracts: 0,
        maxMicroContracts: 0,
      };
      byDay.set(day, d);
    }
    const net = t.pnl - t.fees;
    // Approximation du plus bas intraday : pire excursion (MAE) du trade avant sa clôture.
    d.lowBalance = Math.min(d.lowBalance, balance - t.maxAdverse);
    balance += net;
    d.pnl += net;
    d.closingBalance = balance;
    d.lowBalance = Math.min(d.lowBalance, balance);
    if (t.isMicro) d.maxMicroContracts = Math.max(d.maxMicroContracts, t.quantity);
    else d.maxMiniContracts = Math.max(d.maxMiniContracts, t.quantity);
  }

  return [...byDay.values()];
}
