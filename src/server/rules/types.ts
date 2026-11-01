import type { Cents } from "@/lib/format";

export type RuleSet = {
  startBalance: Cents;
  profitTarget: Cents | null; // null pour un compte financé
  maxDrawdown: Cents;
  drawdownLockBuffer: Cents;
  consistencyMaxBestDayPct: number | null; // null = règle non appliquée
  minTradingDays: number;
  maxContracts: { mini: number; micro: number };
  dailyLossLimit: Cents | null;
  alertThresholdPct: number;
};

/** Résultat d'un jour de trading (agrégé depuis les trades). */
export type DailyResult = {
  day: string; // YYYY-MM-DD (jour de trading CME)
  pnl: Cents;
  closingBalance: Cents;
  /** Plus bas solde atteint pendant la journée (pour la détection intraday). */
  lowBalance: Cents;
  maxMiniContracts: number;
  maxMicroContracts: number;
};

export type ViolationType = "drawdown" | "dailyLoss" | "maxContracts";

export type Violation = {
  type: ViolationType;
  day: string;
  /** Violation éliminatoire (compte « breached ») ou simple avertissement. */
  fatal: boolean;
};

export type AlertType = "drawdown" | "dailyLoss" | "consistency";

export type Alert = { type: AlertType; usedPct: number };

export type DrawdownPoint = { day: string; threshold: Cents; closingBalance: Cents };

export type Evaluation = {
  status: "active" | "passed" | "breached";
  balance: Cents;
  profit: Cents;
  targetProgressPct: number;
  /** Solde sous lequel le compte est éliminé. */
  drawdownThreshold: Cents;
  drawdownRemaining: Cents;
  drawdownUsedPct: number;
  drawdownLocked: boolean;
  drawdownHistory: DrawdownPoint[];
  tradingDays: number;
  minDaysMet: boolean;
  bestDay: Cents;
  /** Part du meilleur jour dans le profit total (0–100+), null si profit ≤ 0. */
  bestDayShareOfProfitPct: number | null;
  consistencyOk: boolean;
  winningDays: number;
  violations: Violation[];
  alerts: Alert[];
};
