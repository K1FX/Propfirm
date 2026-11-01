import type {
  Alert,
  DailyResult,
  DrawdownPoint,
  Evaluation,
  PayoutStatus,
  RulesSnapshot,
  Violation,
} from "./types";

/**
 * Moteur de règles – indépendant du fournisseur de trading (CLAUDE.md §8).
 *
 * - Drawdown EOD trailing : seuil = plus haut solde de CLÔTURE − drawdown max, mis à jour à la clôture,
 *   bloqué au solde initial + buffer. Pendant la journée, le compte est éliminé s'il touche le seuil de la veille.
 * - Perte journalière « soft » : la journée est bloquée (violation non éliminatoire), le compte continue.
 * - Consistance : meilleur jour ≤ X % du profit (éval : total ; financé : cycle de payout).
 * - Financé : payout tous les N jours gagnants (≥ seuil), compteur remis à zéro après chaque payout.
 */
export function evaluateAccount(
  rules: RulesSnapshot,
  days: readonly DailyResult[],
  options: { lastPayoutDay?: string | null } = {},
): Evaluation {
  const lockLevel = rules.startBalance + rules.drawdownLockBuffer;
  let threshold = rules.startBalance - rules.maxDrawdown;
  let locked = false;
  let highWater = rules.startBalance;
  let breached = false;
  let balance = rules.startBalance;
  const violations: Violation[] = [];
  const drawdownHistory: DrawdownPoint[] = [];
  const dailyLossLockedDays: string[] = [];

  const sorted = [...days].sort((a, b) => a.day.localeCompare(b.day));
  const played: DailyResult[] = [];

  for (const d of sorted) {
    if (breached) break;
    played.push(d);

    // Contrôle intraday contre le seuil fixé à la clôture précédente.
    if (d.lowBalance <= threshold || d.closingBalance <= threshold) {
      violations.push({ type: "drawdown", day: d.day, fatal: true });
      breached = true;
    }
    // Limite journalière « soft » : journée bloquée, compte conservé.
    if (rules.dailyLossLimit !== null && -d.pnl >= rules.dailyLossLimit) {
      violations.push({ type: "dailyLoss", day: d.day, fatal: false });
      dailyLossLockedDays.push(d.day);
    }
    if (
      d.maxMiniContracts > rules.maxContracts.mini ||
      d.maxMicroContracts > rules.maxContracts.micro
    ) {
      violations.push({ type: "maxContracts", day: d.day, fatal: false });
    }

    balance = d.closingBalance;

    if (!breached && !locked) {
      highWater = Math.max(highWater, d.closingBalance);
      threshold = Math.min(highWater - rules.maxDrawdown, lockLevel);
      if (threshold >= lockLevel) locked = true;
    }
    drawdownHistory.push({ day: d.day, threshold, closingBalance: d.closingBalance });
  }

  const profit = balance - rules.startBalance;
  const tradingDays = played.length;

  // Périmètre de consistance et de jours gagnants : tout le compte en éval, le cycle de payout en financé.
  const cycle =
    rules.phase === "funded" && options.lastPayoutDay
      ? played.filter((d) => d.day > options.lastPayoutDay!)
      : played;
  const cycleProfit = cycle.reduce((s, d) => s + d.pnl, 0);
  const scopeProfit = rules.phase === "funded" ? cycleProfit : profit;
  const bestDay = cycle.reduce((m, d) => Math.max(m, d.pnl), 0);
  const winningDays = cycle.filter((d) => d.pnl >= rules.winningDayMin).length;

  const bestDayShareOfProfitPct = scopeProfit > 0 ? (bestDay / scopeProfit) * 100 : null;
  const consistencyOk =
    rules.consistencyPct === null ||
    bestDayShareOfProfitPct === null ||
    bestDayShareOfProfitPct <= rules.consistencyPct;

  const drawdownRemaining = Math.max(0, balance - threshold);
  const drawdownUsedPct = clampPct(
    ((rules.maxDrawdown - drawdownRemaining) / rules.maxDrawdown) * 100,
  );
  const targetProgressPct =
    rules.profitTarget === null ? 0 : clampPct((profit / rules.profitTarget) * 100);
  const minDaysMet = tradingDays >= rules.minTradingDays;

  const passed =
    !breached &&
    rules.phase === "evaluation" &&
    rules.profitTarget !== null &&
    profit >= rules.profitTarget &&
    minDaysMet &&
    consistencyOk;

  let payout: PayoutStatus | null = null;
  if (rules.phase === "funded") {
    // Retirable : profit au-dessus du solde initial, limité au profit du cycle et au plafond.
    const available = Math.max(0, Math.min(profit, cycleProfit));
    const payable = rules.payoutCap === null ? available : Math.min(available, rules.payoutCap);
    const traderShare = Math.floor((payable * rules.profitSplitPct) / 100);
    payout = {
      eligible:
        !breached &&
        winningDays >= rules.payoutEveryWinningDays &&
        consistencyOk &&
        traderShare >= rules.payoutMin,
      winningDays,
      requiredWinningDays: rules.payoutEveryWinningDays,
      cycleProfit,
      payable,
      traderShare,
      payoutCap: rules.payoutCap,
      minPayout: rules.payoutMin,
      consistencyOk,
    };
  }

  const alerts: Alert[] = [];
  if (!breached) {
    if (drawdownUsedPct >= rules.alertThresholdPct) {
      alerts.push({ type: "drawdown", usedPct: drawdownUsedPct });
    }
    const lastDay = played.at(-1);
    if (rules.dailyLossLimit !== null && lastDay && lastDay.pnl < 0) {
      const used = (-lastDay.pnl / rules.dailyLossLimit) * 100;
      if (used >= rules.alertThresholdPct)
        alerts.push({ type: "dailyLoss", usedPct: clampPct(used) });
    }
    const consistencyMatters =
      rules.phase === "funded" ||
      (rules.profitTarget !== null && profit >= rules.profitTarget * 0.5);
    if (rules.consistencyPct !== null && bestDayShareOfProfitPct !== null && consistencyMatters) {
      const used = (bestDayShareOfProfitPct / rules.consistencyPct) * 100;
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
    dailyLossLockedDays,
    violations,
    alerts,
    payout,
  };
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
