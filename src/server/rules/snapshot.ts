import {
  getOffer,
  globalRules,
  riskTemplate,
  rulesForPhase,
  type ProgramType,
  type SizeId,
} from "@/config/plans";
import { ranks, type RankId } from "@/config/pass";

import type { Phase, RulesSnapshot } from "./types";

/**
 * Fige les règles d'un compte à partir de la config actuelle.
 * Les avantages de rang (payout plus fréquent, meilleur split) s'appliquent aux comptes financés.
 */
export function createRulesSnapshot(
  programType: ProgramType,
  size: SizeId,
  phase: Phase,
  rank: RankId = "bronze",
): RulesSnapshot {
  const offer = getOffer(programType, size);
  const rules = rulesForPhase(offer, phase);
  const perks = ranks.find((r) => r.id === rank);

  return {
    programType,
    size,
    phase,
    riskTemplate: riskTemplate(programType, size, phase),
    startBalance: offer.accountSize,
    profitTarget: phase === "evaluation" ? offer.profitTarget : null,
    maxDrawdown: rules.maxDrawdown,
    drawdownLockBuffer: globalRules.drawdownLockBuffer,
    dailyLossLimit: rules.dailyLossLimit,
    consistencyPct: rules.consistencyPct,
    minTradingDays: rules.minTradingDays,
    maxContracts: rules.maxContracts,
    winningDayMin: globalRules.winningDayMin,
    payoutEveryWinningDays:
      (phase === "funded" && perks?.payoutEveryWinningDays) || globalRules.payoutEveryWinningDays,
    payoutCap: phase === "funded" ? offer.funded.payoutCap : null,
    payoutMin: globalRules.payoutMin,
    profitSplitPct: (phase === "funded" && perks?.profitSplitPct) || globalRules.profitSplitPct,
    alertThresholdPct: globalRules.alertThresholdPct,
  };
}
