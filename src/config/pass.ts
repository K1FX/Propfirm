/**
 * Configuration du Pass (CLAUDE.md §6).
 * Les libellés des récompenses sont dans messages/*.json (clé Pass.ranks.<id>).
 */

export type RankId = "bronze" | "silver" | "gold" | "platinum" | "elite";

export type Rank = {
  id: RankId;
  minXp: number;
  /** Réduction sur les challenges, en %. */
  discountPct: number;
  /** Avantages sur les comptes financés (remplacent les valeurs globales de plans.ts). */
  payoutEveryWinningDays?: number;
  profitSplitPct?: number;
};

export const ranks: readonly Rank[] = [
  { id: "bronze", minXp: 0, discountPct: 0 },
  { id: "silver", minXp: 1_000, discountPct: 10 },
  { id: "gold", minXp: 2_000, discountPct: 15, payoutEveryWinningDays: 4 },
  { id: "platinum", minXp: 4_000, discountPct: 15, payoutEveryWinningDays: 4, profitSplitPct: 95 },
  { id: "elite", minXp: 8_000, discountPct: 15, payoutEveryWinningDays: 4, profitSplitPct: 100 },
];

export type XpSourceId =
  | "disciplinedDay"
  | "dailyMission"
  | "weeklyMission"
  | "evaluationPassed"
  | "payout"
  | "referral"
  | "streak";

/** Valeurs par défaut – la source de vérité sera la table `xp_rules` (Phase 6). */
export const xpSources: readonly { id: XpSourceId; xp: number }[] = [
  { id: "disciplinedDay", xp: 20 },
  { id: "dailyMission", xp: 50 },
  { id: "weeklyMission", xp: 150 },
  { id: "evaluationPassed", xp: 500 },
  { id: "payout", xp: 1_000 },
  { id: "referral", xp: 200 },
  { id: "streak", xp: 100 },
];

export const seasonConfig = {
  durationMonths: 3,
  tiers: 30,
  premiumPrice: 2_900,
} as const;

/** Rang correspondant à une XP totale + progression vers le rang suivant. */
export function getRankProgress(totalXp: number) {
  const xp = Math.max(0, Math.floor(totalXp));
  let index = 0;
  for (let i = 0; i < ranks.length; i++) {
    if (xp >= ranks[i]!.minXp) index = i;
  }
  const current = ranks[index]!;
  const next = ranks[index + 1] ?? null;
  const progressPct = next
    ? Math.min(100, ((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100;
  return { current, next, xp, progressPct, xpToNext: next ? next.minXp - xp : 0 };
}

export type SeasonReward =
  | { type: "coupon"; pct: number }
  | { type: "reset" }
  | { type: "badge" }
  | { type: "frame" }
  | { type: "dailyPayout" }
  | { type: "goodies" };

export type SeasonTier = { tier: number; free: SeasonReward | null; premium: SeasonReward };

/** Modèle de piste de saison (30 paliers) – modifiable depuis l'admin en Phase 8. */
export function defaultSeasonTrack(): SeasonTier[] {
  return Array.from({ length: seasonConfig.tiers }, (_, i) => {
    const tier = i + 1;
    let free: SeasonReward | null = null;
    if (tier % 10 === 0) free = { type: "reset" };
    else if (tier % 5 === 0) free = { type: "coupon", pct: 10 };
    else if (tier % 3 === 0) free = { type: "badge" };

    let premium: SeasonReward;
    if (tier === seasonConfig.tiers) premium = { type: "goodies" };
    else if (tier % 10 === 0) premium = { type: "dailyPayout" };
    else if (tier % 5 === 0) premium = { type: "reset" };
    else if (tier % 2 === 0) premium = { type: "coupon", pct: 15 };
    else premium = { type: "frame" };

    return { tier, free, premium };
  });
}
