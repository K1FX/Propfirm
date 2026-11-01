import type { CountryCode } from "@/components/ui/flag";
import { ACCOUNT_SIZE, SIZES } from "@/config/plans";
import { ranks, type RankId } from "@/config/pass";

import type { LeaderboardEntry } from "./rank";

export { rankEntries, type LeaderboardEntry, type LeaderboardPeriod } from "./rank";

/**
 * Classement des traders par profit ($) sur comptes financés.
 * DONNÉES DE DÉMONSTRATION tant que la base n'est pas branchée (Phase 3) :
 * pseudos fictifs, toujours affichés avec un bandeau « démo ».
 */

const HANDLES = [
  "Falcon_ES",
  "TickHunter",
  "NQ_Nomad",
  "QuietBid",
  "DeltaDrift",
  "IronRange",
  "OpeningBell",
  "MeanRevert",
  "SilverTape",
  "VWAP_Vince",
  "ColdFill",
  "NightSession",
  "GapGlider",
  "OrderFlowOz",
  "StopRespecter",
  "CL_Cowboy",
  "GoldBugGrid",
  "MicroMara",
  "PatientPete",
  "RangeRider",
  "LimitLuna",
  "ScalpSensei",
  "TrendTariq",
  "BreakEvenBo",
  "ThetaTheo",
  "PivotPaz",
  "SlowHands",
  "DomWatcher",
  "CalmCarry",
  "TapeReader",
  "RiskFirst",
  "ZeroRevenge",
  "SteadyStack",
  "AuctionAce",
  "FadeFrank",
  "LiquidityLeo",
  "HighVolHal",
  "MarginMoe",
  "SessionSam",
] as const;

/** Pays de démonstration (répartition fictive, pondérée vers les marchés visés). */
const DEMO_COUNTRIES: readonly CountryCode[] = [
  "us",
  "gb",
  "ca",
  "fr",
  "us",
  "de",
  "au",
  "us",
  "nl",
  "es",
  "br",
  "us",
  "ch",
  "it",
  "us",
  "ae",
  "in",
  "mx",
  "us",
  "be",
  "sg",
  "pt",
  "us",
  "pl",
  "gb",
  "ca",
  "fr",
  "us",
];

/** Générateur déterministe (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rankForXp(xp: number): RankId {
  let id: RankId = "bronze";
  for (const r of ranks) if (xp >= r.minXp) id = r.id;
  return id;
}

let cache: LeaderboardEntry[] | null = null;

export function getLeaderboard(): LeaderboardEntry[] {
  if (cache) return cache;
  const rand = rng(20261101);

  const entries: LeaderboardEntry[] = HANDLES.map((handle, i) => {
    const size = SIZES[Math.floor(rand() * SIZES.length)]!;
    // Profit de saison proportionnel à la taille du compte, avec une dispersion réaliste.
    const sizeFactor = ACCOUNT_SIZE[size] / 5_000_000;
    const season = Math.round((40_000 + rand() * 600_000) * sizeFactor) * 1;
    const month = Math.round(season * (0.15 + rand() * 0.45));
    const allTime = Math.round(season * (1.1 + rand() * 1.8));
    const seasonDays = 8 + Math.floor(rand() * 40);
    return {
      id: `lb-${i}`,
      handle,
      rank: rankForXp(Math.floor(rand() * 9_500)),
      planId: size,
      country: DEMO_COUNTRIES[i % DEMO_COUNTRIES.length]!,
      profit: { season, month, allTime },
      tradingDays: {
        season: seasonDays,
        month: Math.max(3, Math.floor(seasonDays * 0.35)),
        allTime: seasonDays + Math.floor(rand() * 80),
      },
      change: Math.floor(rand() * 11) - 5,
    };
  });

  // L'utilisateur de démo (cohérent avec son compte financé 50K de la démo).
  entries.push({
    id: "lb-me",
    handle: "Trader démo",
    rank: "gold",
    planId: "50k",
    country: "fr",
    profit: { season: 364_600, month: 364_600, allTime: 364_600 },
    tradingDays: { season: 9, month: 9, allTime: 9 },
    change: 2,
    me: true,
  });

  cache = entries;
  return entries;
}
