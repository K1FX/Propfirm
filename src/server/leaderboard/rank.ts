import type { CountryCode } from "@/components/ui/flag";
import type { SizeId as PlanId } from "@/config/sizes";
import type { RankId } from "@/config/pass";
import type { Cents } from "@/lib/format";

/** Types et tri du classement (pur, utilisable côté client). */

export type LeaderboardPeriod = "season" | "month" | "allTime";

export type LeaderboardEntry = {
  id: string;
  handle: string;
  rank: RankId;
  planId: PlanId;
  country: CountryCode;
  profit: Record<LeaderboardPeriod, Cents>;
  tradingDays: Record<LeaderboardPeriod, number>;
  /** Variation de position depuis la veille (positif = monte). */
  change: number;
  me?: boolean;
};

/** Trie par profit décroissant sur la période, avec filtre optionnel de taille de compte. */
export function rankEntries(
  entries: readonly LeaderboardEntry[],
  period: LeaderboardPeriod,
  planId: PlanId | "all",
  country: CountryCode | "all" = "all",
): LeaderboardEntry[] {
  return entries
    .filter((e) => planId === "all" || e.planId === planId)
    .filter((e) => country === "all" || e.country === country)
    .sort((a, b) => b.profit[period] - a.profit[period] || a.handle.localeCompare(b.handle));
}
