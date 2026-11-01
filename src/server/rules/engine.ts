import type { Alert, DailyResult, DrawdownPoint, Evaluation, RuleSet, Violation } from "./types";

/**
 * Moteur de règles – indépendant du fournisseur de trading (CLAUDE.md §8).
 *
 * Drawdown EOD trailing : le seuil d'élimination = plus haut solde de CLÔTURE − drawdown max.
 * Il ne monte qu'à la clôture du jour de trading et se bloque (lock) au solde initial + buffer.
 * Pendant la journée, le compte est éliminé si son solde touche le seuil fixé à la clôture précédente.
 */
export function evaluateAccount(
  rules: RuleSet,
  days: readonly DailyResult[],
  options: { winningDayMin?: number } = {},
): Evaluation {
  const lockLevel = rules.startBalance + rules.drawdownLockBuffer;
  let threshold = rules.startBalance - rules.maxDrawdown;
  let locked = false;
  let highWater = rules.startBalance;
  let breached = false;
  let balance = rules.startBalance;
  const violations: Violation[] = [];
  const drawdownHistory: DrawdownPoint[] = [];

  const sorted = [...days].sort((a, b) => a.day.localeCompare(b.day));

  for (const d of sorted) {
    if (breached) break;

    // Contrôles intraday contre le seuil fixé à la clôture précédente.
    if (d.lowBalance <= threshold || d.closingBalance <= threshold) {
      violations.push({ type: "drawdown", day: d.day, fatal: true });
      breached = true;
    }
    if (rules.dailyLossLimit !== null && -d.pnl >= rules.dailyLossLimit) {
      violations.push({ type: "dailyLoss", day: d.day, fatal: true });
      breached = true;
    }
    if (
      d.maxMiniContracts > rules.maxContracts.mini ||
      d.maxMicroContracts > rules.maxContracts.micro
    ) {
      violations.push({ type: "maxContracts", day: d.day, fatal: false });
    }

    balance = d.closingBalance;

    // Mise à jour EOD du trailing (uniquement à la clôture).
    if (!breached && !locked) {
      highWater = Math.max(highWater, d.closingBalance);
      threshold = Math.min(highWater - rules.maxDrawdown, lockLevel);
      if (threshold >= lockLevel) locked = true;
    }
    drawdownHistory.push({ day: d.day, threshold, closingBalance: d.closingBalance });
  }

  const profit = balance - rules.startBalance;
  const tradingDays = sorted.length;
  const bestDay = sorted.reduce((m, d) => Math.max(m, d.pnl), 0);
  const winningDayMin = options.winningDayMin ?? 1;
  const winningDays = sorted.filter((d) => d.pnl >= winningDayMin).length;

  const bestDayShareOfProfitPct = profit > 0 ? (bestDay / profit) * 100 : null;
  const consistencyOk =
    rules.consistencyMaxBestDayPct === null ||
    bestDayShareOfProfitPct === null ||
    bestDayShareOfProfitPct <= rules.consistencyMaxBestDayPct;

  const drawdownRemaining = Math.max(0, balance - threshold);
  const drawdownUsedPct = clampPct(
    ((rules.maxDrawdown - drawdownRemaining) / rules.maxDrawdown) * 100,
  );
  const targetProgressPct =
    rules.profitTarget === null ? 0 : clampPct((profit / rules.profitTarget) * 100);
  const minDaysMet = tradingDays >= rules.minTradingDays;

  const passed =
    !breached &&
    rules.profitTarget !== null &&
    profit >= rules.profitTarget &&
    minDaysMet &&
    consistencyOk;

  const alerts: Alert[] = [];
  if (!breached) {
    if (drawdownUsedPct >= rules.alertThresholdPct) {
      alerts.push({ type: "drawdown", usedPct: drawdownUsedPct });
    }
    const lastDay = sorted.at(-1);
    if (rules.dailyLossLimit !== null && lastDay && lastDay.pnl < 0) {
      const used = (-lastDay.pnl / rules.dailyLossLimit) * 100;
      if (used >= rules.alertThresholdPct)
        alerts.push({ type: "dailyLoss", usedPct: clampPct(used) });
    }
    if (
      rules.consistencyMaxBestDayPct !== null &&
      bestDayShareOfProfitPct !== null &&
      rules.profitTarget !== null &&
      profit >= rules.profitTarget * 0.5
    ) {
      const used = (bestDayShareOfProfitPct / rules.consistencyMaxBestDayPct) * 100;
      if (used >= rules.alertThresholdPct)
        alerts.push({ type: "consistency", usedPct: Math.round(used) });
    }
  }

  return {
    status: breached ? "breached" : passed ? "passed" : "active",
    balance,
    profit,
    targetProgressPct,
    drawdownThreshold: threshold,
    drawdownRemaining: breached ? 0 : drawdownRemaining,
    drawdownUsedPct: breached ? 100 : drawdownUsedPct,
    drawdownLocked: locked,
    drawdownHistory,
    tradingDays,
    minDaysMet,
    bestDay,
    bestDayShareOfProfitPct,
    consistencyOk,
    winningDays,
    violations,
    alerts,
  };
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
