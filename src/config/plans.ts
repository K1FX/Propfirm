import { z } from "zod";

import type { Cents } from "@/lib/format";

import { ACCOUNT_SIZE, SIZES, type SizeId } from "./sizes";

/**
 * Offres (CLAUDE.md §5) : 3 types de compte × 4 tailles.
 * TOUTES les valeurs commerciales et règles sont ici : modifier ce fichier, jamais le code.
 * Montants en centimes. Validé par Zod au chargement (une erreur de saisie casse le build).
 */

export const PROGRAM_TYPES = ["rush", "flex", "instant"] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export { ACCOUNT_SIZE, SIZES, type SizeId };
/** Alias historique (classement, démo). */
export type PlanId = SizeId;

/** Taille mise en avant (« MOST POPULAR »). */
export const POPULAR_SIZE: SizeId = "50k";

// ---------------------------------------------------------------------------
// Règles globales (communes aux 3 types)
// ---------------------------------------------------------------------------

export const globalRules = {
  /** Le drawdown EOD trailing se bloque au solde initial + ce montant. */
  drawdownLockBuffer: 10_000,
  /** Un « jour gagnant » = session clôturée à au moins ce profit. */
  winningDayMin: 15_000,
  /** Nombre de jours gagnants entre deux payouts (le compteur repart à 0 après un payout). */
  payoutEveryWinningDays: 5,
  payoutMin: 25_000,
  profitSplitPct: 90,
  /** Pay Later : interrupteur global (offre limitée) et délai pour payer l'activation. */
  payLaterEnabled: true,
  activationDeadlineDays: 14,
  maxActiveInstantAccounts: 5,
  /** Seuil d'alerte quand une règle approche de sa limite. */
  alertThresholdPct: 80,
  sessionTimeZone: "America/Chicago",
} as const;

// ---------------------------------------------------------------------------
// Schémas
// ---------------------------------------------------------------------------

const cents = z.number().int().nonnegative();
const pct = z.number().min(1).max(100);

const contractsSchema = z.object({
  mini: z.number().int().positive(),
  micro: z.number().int().positive(),
});

export const phaseRulesSchema = z.object({
  maxDrawdown: cents.positive(),
  /** Perte journalière « soft » : bloque la journée, ne fait pas perdre le compte. null = aucune. */
  dailyLossLimit: cents.positive().nullable(),
  /** Le meilleur jour ≤ X % du profit (éval : total ; financé : cycle de payout). null = aucune. */
  consistencyPct: pct.nullable(),
  minTradingDays: z.number().int().nonnegative(),
  maxContracts: contractsSchema,
});
export type PhaseRules = z.infer<typeof phaseRulesSchema>;

const fundedRulesSchema = phaseRulesSchema.extend({ payoutCap: cents.positive() });
export type FundedRules = z.infer<typeof fundedRulesSchema>;

const offerSchema = z
  .object({
    type: z.enum(PROGRAM_TYPES),
    size: z.enum(SIZES),
    accountSize: cents.positive(),
    price: cents.positive(),
    profitTarget: cents.positive().nullable(),
    resetFee: cents.positive().nullable(),
    payLater: z.object({ now: cents.positive(), activation: cents.positive() }).nullable(),
    evaluation: phaseRulesSchema.nullable(),
    funded: fundedRulesSchema,
  })
  .superRefine((o, ctx) => {
    const instant = o.type === "instant";
    if (instant && (o.evaluation || o.profitTarget || o.resetFee || o.payLater)) {
      ctx.addIssue({
        code: "custom",
        message: `${o.type} ${o.size} : INSTANT n'a ni évaluation, ni reset, ni Pay Later`,
      });
    }
    if (!instant && (!o.evaluation || !o.profitTarget)) {
      ctx.addIssue({
        code: "custom",
        message: `${o.type} ${o.size} : évaluation et objectif requis`,
      });
    }
    if (o.payLater && o.payLater.now >= o.price) {
      ctx.addIssue({
        code: "custom",
        message: `${o.type} ${o.size} : le Pay Later doit coûter moins aujourd'hui`,
      });
    }
  });
export type Offer = z.infer<typeof offerSchema>;

// ---------------------------------------------------------------------------
// Tableaux de prix et de règles (dollars → convertis en centimes ci-dessous)
// ---------------------------------------------------------------------------

type Row = {
  price: number;
  target?: number;
  drawdown: number;
  dll: number | null;
  reset?: number;
  contracts: [mini: number, micro: number];
  payLater?: [now: number, activation: number];
};

const CONTRACTS: Record<SizeId, [number, number]> = {
  "25k": [1, 10],
  "50k": [4, 40],
  "100k": [8, 80],
  "150k": [12, 120],
};

const PAYOUT_CAP: Record<SizeId, number> = {
  "25k": 1_000,
  "50k": 2_000,
  "100k": 2_500,
  "150k": 3_000,
};

const RUSH: Record<SizeId, Row> = {
  "25k": {
    price: 89,
    target: 1_500,
    drawdown: 1_000,
    dll: 600,
    reset: 55,
    contracts: CONTRACTS["25k"],
    payLater: [39, 69],
  },
  "50k": {
    price: 129,
    target: 3_000,
    drawdown: 2_000,
    dll: 1_250,
    reset: 89,
    contracts: CONTRACTS["50k"],
    payLater: [59, 99],
  },
  "100k": {
    price: 229,
    target: 6_000,
    drawdown: 3_500,
    dll: 2_500,
    reset: 155,
    contracts: CONTRACTS["100k"],
    payLater: [99, 179],
  },
  "150k": {
    price: 329,
    target: 9_000,
    drawdown: 5_000,
    dll: 3_750,
    reset: 215,
    contracts: CONTRACTS["150k"],
    payLater: [149, 259],
  },
};

const FLEX: Record<SizeId, Row> = {
  "25k": {
    price: 99,
    target: 1_500,
    drawdown: 1_000,
    dll: null,
    reset: 69,
    contracts: CONTRACTS["25k"],
    payLater: [45, 79],
  },
  "50k": {
    price: 149,
    target: 3_000,
    drawdown: 2_000,
    dll: null,
    reset: 99,
    contracts: CONTRACTS["50k"],
    payLater: [65, 119],
  },
  "100k": {
    price: 239,
    target: 6_000,
    drawdown: 3_000,
    dll: null,
    reset: 155,
    contracts: CONTRACTS["100k"],
    payLater: [105, 189],
  },
  "150k": {
    price: 335,
    target: 9_000,
    drawdown: 4_500,
    dll: null,
    reset: 219,
    contracts: CONTRACTS["150k"],
    payLater: [149, 265],
  },
};

const INSTANT: Record<SizeId, Row> = {
  "25k": { price: 309, drawdown: 1_000, dll: null, contracts: CONTRACTS["25k"] },
  "50k": { price: 439, drawdown: 2_000, dll: 1_250, contracts: CONTRACTS["50k"] },
  "100k": { price: 589, drawdown: 4_000, dll: 2_500, contracts: CONTRACTS["100k"] },
  "150k": { price: 719, drawdown: 5_250, dll: 3_000, contracts: CONTRACTS["150k"] },
};

/** Paramètres propres à chaque type. */
export const programs = {
  rush: {
    evalConsistencyPct: null,
    evalMinDays: 1,
    fundedConsistencyPct: 35,
    fundedDll: "same" as const,
    hasEvaluation: true,
  },
  flex: {
    evalConsistencyPct: 40,
    evalMinDays: 3,
    fundedConsistencyPct: null,
    fundedDll: "none" as const,
    hasEvaluation: true,
  },
  instant: {
    evalConsistencyPct: null,
    evalMinDays: 0,
    fundedConsistencyPct: 20,
    fundedDll: "same" as const,
    hasEvaluation: false,
  },
} satisfies Record<ProgramType, unknown>;

const $ = (dollars: number) => Math.round(dollars * 100);

function build(type: ProgramType, size: SizeId, r: Row): Offer {
  const p = programs[type];
  const contracts = { mini: r.contracts[0], micro: r.contracts[1] };
  const dll = r.dll === null ? null : $(r.dll);
  return {
    type,
    size,
    accountSize: ACCOUNT_SIZE[size],
    price: $(r.price),
    profitTarget: r.target ? $(r.target) : null,
    resetFee: r.reset ? $(r.reset) : null,
    payLater: r.payLater ? { now: $(r.payLater[0]), activation: $(r.payLater[1]) } : null,
    evaluation: p.hasEvaluation
      ? {
          maxDrawdown: $(r.drawdown),
          dailyLossLimit: dll,
          consistencyPct: p.evalConsistencyPct,
          minTradingDays: p.evalMinDays,
          maxContracts: contracts,
        }
      : null,
    funded: {
      maxDrawdown: $(r.drawdown),
      dailyLossLimit: p.fundedDll === "none" ? null : dll,
      consistencyPct: p.fundedConsistencyPct,
      minTradingDays: 0,
      maxContracts: contracts,
      payoutCap: $(PAYOUT_CAP[size]),
    },
  };
}

const TABLES: Record<ProgramType, Record<SizeId, Row>> = {
  rush: RUSH,
  flex: FLEX,
  instant: INSTANT,
};

/** Toutes les offres, validées. */
export const offers: readonly Offer[] = PROGRAM_TYPES.flatMap((type) =>
  SIZES.map((size) => offerSchema.parse(build(type, size, TABLES[type][size]))),
);

export function getOffer(type: ProgramType, size: SizeId): Offer {
  const o = offers.find((x) => x.type === type && x.size === size);
  if (!o) throw new Error(`Offre inconnue : ${type} ${size}`);
  return o;
}

export function offersOf(type: ProgramType): Offer[] {
  return offers.filter((o) => o.type === type);
}

/** Règles applicables à une phase donnée. */
export function rulesForPhase(
  offer: Offer,
  phase: "evaluation" | "funded",
): PhaseRules & { payoutCap?: Cents } {
  if (phase === "evaluation") {
    if (!offer.evaluation) throw new Error(`${offer.type} n'a pas de phase d'évaluation`);
    return offer.evaluation;
  }
  return offer.funded;
}

/** Nom du gabarit de risque côté fournisseur (ex. RUSH_50K_EVAL). */
export function riskTemplate(
  type: ProgramType,
  size: SizeId,
  phase: "evaluation" | "funded",
): string {
  return `${type.toUpperCase()}_${size.toUpperCase()}_${phase === "evaluation" ? "EVAL" : "FUNDED"}`;
}

export const MAX_ACCOUNT_SIZE: Cents = Math.max(...Object.values(ACCOUNT_SIZE));
/** Jours minimum avant un premier payout, tous types confondus (INSTANT : 5 jours gagnants). */
export const MIN_DAYS_TO_FIRST_PAYOUT = Math.min(
  ...PROGRAM_TYPES.map((t) => programs[t].evalMinDays + globalRules.payoutEveryWinningDays),
);
