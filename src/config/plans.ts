import type { Cents } from "@/lib/format";

/**
 * Offres d'évaluation (CLAUDE.md §5). Montants en centimes.
 * Prix indicatifs : modifier ici, sans toucher au reste du code.
 */

export type PlanId = "25k" | "50k" | "100k" | "150k";

export type Plan = {
  id: PlanId;
  accountSize: Cents;
  price: Cents;
  profitTarget: Cents;
  /** Drawdown EOD trailing maximum. */
  maxDrawdown: Cents;
  maxContracts: { mini: number; micro: number };
  /** Limite de perte journalière (optionnelle, null = aucune). */
  dailyLossLimit: Cents | null;
  recommended?: boolean;
};

export const plans: readonly Plan[] = [
  {
    id: "25k",
    accountSize: 2_500_000,
    price: 8_900,
    profitTarget: 150_000,
    maxDrawdown: 100_000,
    maxContracts: { mini: 2, micro: 20 },
    dailyLossLimit: null,
  },
  {
    id: "50k",
    accountSize: 5_000_000,
    price: 10_900,
    profitTarget: 300_000,
    maxDrawdown: 200_000,
    maxContracts: { mini: 5, micro: 50 },
    dailyLossLimit: null,
    recommended: true,
  },
  {
    id: "100k",
    accountSize: 10_000_000,
    price: 19_900,
    profitTarget: 600_000,
    maxDrawdown: 300_000,
    maxContracts: { mini: 10, micro: 100 },
    dailyLossLimit: null,
  },
  {
    id: "150k",
    accountSize: 15_000_000,
    price: 27_900,
    profitTarget: 900_000,
    maxDrawdown: 450_000,
    maxContracts: { mini: 15, micro: 150 },
    dailyLossLimit: null,
  },
];

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Plan inconnu : ${id}`);
  return plan;
}
