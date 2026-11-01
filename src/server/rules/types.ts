import type { ProgramType, SizeId } from "@/config/plans";
import type { Cents } from "@/lib/format";

export type Phase = "evaluation" | "funded";

/**
 * Règles figées d'un compte (copie prise au moment de l'achat ou du passage en financé).
 * Un changement de config ne modifie jamais un compte existant.
 */
export type RulesSnapshot = {
  programType: ProgramType;
  size: SizeId;
  phase: Phase;
  riskTemplate: string;
  startBalance: Cents;
  profitTarget: Cents | null;
  maxDrawdown: Cents;
  drawdownLockBuffer: Cents;
  /** Limite « soft » : la journée est bloquée, le compte n'est pas perdu. */
  dailyLossLimit: Cents | null;
  /** Éval : % du profit total ; financé : % du profit du cycle de payout. */
  consistencyPct: number | null;
  minTradingDays: number;
  maxContracts: { mini: number; micro: number };
  winningDayMin: Cents;
  payoutEveryWinningDays: number;
  payoutCap: Cents | null;
  payoutMin: Cents;
  profitSplitPct: number;
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
  /** Violation éliminatoire (compte « breached ») ou non (journée bloquée, avertissement). */
  fatal: boolean;
};

export type AlertType = "drawdown" | "dailyLoss" | "consistency";

export type Alert = { type: AlertType; usedPct: number };

export type DrawdownPoint = { day: string; threshold: Cents; closingBalance: Cents };

export type PayoutStatus = {
  eligible: boolean;
  winningDays: number;
  requiredWinningDays: number;
  /** Profit du cycle en cours (depuis le dernier payout). */
  cycleProfit: Cents;
  /** Montant retirable avant split (plafonné). */
  payable: Cents;
  /** Part du trader. */
  traderShare: Cents;
  payoutCap: Cents | null;
  minPayout: Cents;
  consistencyOk: boolean;
};

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
  /** Meilleur jour sur le périmètre de consistance (total en éval, cycle en financé). */
  bestDay: Cents;
  bestDayShareOfProfitPct: number | null;
  consistencyOk: boolean;
  /** Jours gagnants (≥ seuil) dans le cycle de payout en cours. */
  winningDays: number;
  /** Jours où la limite journalière « soft » a été atteinte (trading bloqué ce jour-là). */
  dailyLossLockedDays: string[];
  violations: Violation[];
  alerts: Alert[];
  payout: PayoutStatus | null;
};
