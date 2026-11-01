import { getPlan, type Plan } from "@/config/plans";
import { evaluationRules, fundedRules } from "@/config/rules";
import type { Cents } from "@/lib/format";

import { demoAccounts, type DemoAccount } from "../demo/data";
import { buildDailyResults } from "../rules/daily";
import { evaluateAccount } from "../rules/engine";
import type { DailyResult, Evaluation, RuleSet } from "../rules/types";
import { MockTradingProvider } from "../trading/mock-provider";
import type { Trade } from "../trading/types";

export type AccountStatus = "evaluation" | "passed" | "funded" | "failed" | "breached";

export type AccountView = {
  id: string;
  plan: Plan;
  phase: "evaluation" | "funded";
  status: AccountStatus;
  purchasedAt: string;
  startBalance: Cents;
  evaluation: Evaluation;
  days: DailyResult[];
  trades: Trade[];
  payout: PayoutInfo | null;
};

export type PayoutInfo = {
  eligible: boolean;
  winningDays: number;
  requiredWinningDays: number;
  /** Profit au-dessus du solde initial. */
  grossProfit: Cents;
  /** Part revenant au trader selon le split. */
  traderShare: Cents;
  minPayout: Cents;
};

export function rulesFor(plan: Plan, phase: "evaluation" | "funded"): RuleSet {
  return {
    startBalance: plan.accountSize,
    profitTarget: phase === "evaluation" ? plan.profitTarget : null,
    maxDrawdown: plan.maxDrawdown,
    drawdownLockBuffer: evaluationRules.drawdownLockBuffer,
    consistencyMaxBestDayPct:
      phase === "evaluation" ? evaluationRules.consistencyMaxBestDayPct : null,
    minTradingDays: evaluationRules.minTradingDays,
    maxContracts: plan.maxContracts,
    dailyLossLimit: plan.dailyLossLimit,
    alertThresholdPct: evaluationRules.alertThresholdPct,
  };
}

/** Part du trader : 100 % jusqu'au seuil, puis le split standard. */
export function traderShareOf(profit: Cents, splitPct: number = fundedRules.profitSplitPct): Cents {
  if (profit <= 0) return 0;
  const full = Math.min(profit, fundedRules.fullSplitThreshold);
  const rest = profit - full;
  return full + Math.floor((rest * splitPct) / 100);
}

function payoutInfo(e: Evaluation, startBalance: Cents): PayoutInfo {
  const grossProfit = Math.max(0, e.balance - startBalance);
  const traderShare = traderShareOf(grossProfit);
  return {
    eligible:
      e.status !== "breached" &&
      e.winningDays >= fundedRules.payoutMinWinningDays &&
      traderShare >= fundedRules.payoutMin,
    winningDays: e.winningDays,
    requiredWinningDays: fundedRules.payoutMinWinningDays,
    grossProfit,
    traderShare,
    minPayout: fundedRules.payoutMin,
  };
}

// --- Démo : fournisseur simulé pré-chargé (remplacé par la base en Phase 3) ---
let provider: MockTradingProvider | null = null;
function demoProvider(): MockTradingProvider {
  if (!provider) {
    provider = new MockTradingProvider();
    for (const a of demoAccounts) {
      provider.seed(a.id, { ...a.scenario, startBalance: getPlan(a.planId).accountSize });
    }
  }
  return provider;
}

async function buildView(a: DemoAccount): Promise<AccountView> {
  const plan = getPlan(a.planId);
  const trades = await demoProvider().getTrades(a.id);
  const days = buildDailyResults(plan.accountSize, trades);
  const evaluation = evaluateAccount(rulesFor(plan, a.phase), days, {
    winningDayMin: fundedRules.winningDayMin,
  });

  const status: AccountStatus =
    evaluation.status === "breached"
      ? "breached"
      : a.phase === "funded"
        ? "funded"
        : evaluation.status === "passed"
          ? "passed"
          : "evaluation";

  return {
    id: a.id,
    plan,
    phase: a.phase,
    status,
    purchasedAt: a.purchasedAt,
    startBalance: plan.accountSize,
    evaluation,
    days,
    trades: trades.sort((x, y) => y.closedAt.localeCompare(x.closedAt)),
    payout: a.phase === "funded" ? payoutInfo(evaluation, plan.accountSize) : null,
  };
}

/** Comptes de l'utilisateur connecté (démo pour l'instant). */
export async function listAccounts(): Promise<AccountView[]> {
  return Promise.all(demoAccounts.map(buildView));
}

export async function getAccount(id: string): Promise<AccountView | null> {
  const a = demoAccounts.find((x) => x.id === id);
  return a ? buildView(a) : null;
}
