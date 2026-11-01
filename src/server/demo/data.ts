import type { PlanId } from "@/config/plans";

import type { MockScenario } from "../trading/mock-provider";

/**
 * DONNÉES DE DÉMONSTRATION – affichées tant que l'auth et la base (Phase 3)
 * ne sont pas branchées. Toujours signalées comme telles dans l'interface.
 */

/** Date de référence fixe : rend la démo déterministe (pas de Date.now()). */
export const DEMO_TODAY = "2026-10-30";

export type DemoAccount = {
  id: string;
  planId: PlanId;
  phase: "evaluation" | "funded";
  purchasedAt: string;
  scenario: Omit<MockScenario, "startBalance">;
};

export const demoAccounts: readonly DemoAccount[] = [
  {
    id: "ACC-50K-1042",
    planId: "50k",
    phase: "evaluation",
    purchasedAt: "2026-10-19",
    scenario: {
      seed: 1042,
      dailyPnl: [420, -180, 610, 350, -240, 520, 380],
      endDay: "2026-10-30",
      symbols: ["ES", "NQ", "MES", "MNQ"],
    },
  },
  {
    id: "ACC-150K-2071",
    planId: "150k",
    phase: "evaluation",
    purchasedAt: "2026-10-21",
    scenario: {
      seed: 2071,
      dailyPnl: [900, -1_200, 650, -1_800, -1_400, 100],
      endDay: "2026-10-30",
      symbols: ["NQ", "CL", "GC"],
    },
  },
  {
    id: "ACC-50K-0815",
    planId: "50k",
    phase: "funded",
    purchasedAt: "2026-09-28",
    scenario: {
      seed: 815,
      dailyPnl: [650, 480, -220, 900, 310, 560, -150, 720, 400],
      endDay: "2026-10-29",
      symbols: ["ES", "MES", "GC"],
    },
  },
  {
    id: "ACC-25K-0377",
    planId: "25k",
    phase: "evaluation",
    purchasedAt: "2026-09-10",
    scenario: {
      seed: 377,
      dailyPnl: [300, -600, -800],
      endDay: "2026-09-18",
      symbols: ["MNQ", "MES"],
    },
  },
];

export const demoUser = {
  displayName: "Trader démo",
  totalXp: 2_640,
  seasonXp: 1_380,
  seasonTierXp: 100,
  seasonNumber: 1,
  seasonEndsAt: "2026-12-31",
  premium: false,
  claimedTiers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  streakDays: 3,
} as const;

export type DemoMission = {
  id: string;
  kind: "daily" | "weekly";
  key: "respectStop" | "positiveDay" | "halfMaxLoss" | "noViolation" | "threeSessions";
  progress: number;
  goal: number;
  xp: number;
};

export const demoMissions: readonly DemoMission[] = [
  { id: "m1", kind: "daily", key: "positiveDay", progress: 1, goal: 1, xp: 50 },
  { id: "m2", kind: "daily", key: "noViolation", progress: 0, goal: 1, xp: 50 },
  { id: "m3", kind: "weekly", key: "respectStop", progress: 2, goal: 3, xp: 150 },
  { id: "m4", kind: "weekly", key: "halfMaxLoss", progress: 3, goal: 3, xp: 150 },
  { id: "m5", kind: "weekly", key: "threeSessions", progress: 1, goal: 3, xp: 150 },
];

/** Classement de saison : pseudonymes fictifs, clairement marqués « démo » dans l'UI. */
export const demoLeaderboard = [
  { name: "Trader A", xp: 4_210 },
  { name: "Trader B", xp: 3_980 },
  { name: "Trader C", xp: 3_455 },
  { name: "Trader D", xp: 2_990 },
  { name: "Trader E", xp: 2_120 },
  { name: "Trader démo", xp: 1_380, me: true },
  { name: "Trader F", xp: 1_240 },
] as const;
