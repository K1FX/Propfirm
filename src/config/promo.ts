import type { ProgramType } from "@/config/plans";
import type { Cents } from "@/lib/format";

/**
 * Code promo mis en avant sur le site (bandeau, prix barrés, « Save $XX »).
 * À REMPLIR avant le lancement : un VRAI code créé dans l'admin, sinon `enabled: false`.
 */
export const promo = {
  enabled: true,
  /** À REMPLIR : code réel (placeholder actuel). */
  code: "LAUNCH40",
  discountPct: 40,
  /** À REMPLIR : fin de l'offre (ISO 8601, avec fuseau). */
  endsAt: "2026-12-31T23:59:59-06:00",
  /** Types concernés (paiement unique uniquement : jamais cumulable avec le Pay Later). */
  types: ["rush", "flex", "instant"] as ProgramType[],
  appliesToResets: false,
};

/** Arrondi au dollar inférieur (les prix affichés sont des dollars entiers). */
const floorToDollar = (c: Cents) => Math.floor(c / 100) * 100;

/** Prix remisé d'un paiement unique, si le code s'applique à ce type. */
export function discountedPrice(price: Cents, type: ProgramType): Cents {
  if (!promo.enabled || !promo.types.includes(type)) return price;
  return floorToDollar((price * (100 - promo.discountPct)) / 100);
}

/** Économie réalisée avec le code (0 si non applicable). */
export function promoSavings(price: Cents, type: ProgramType): Cents {
  return price - discountedPrice(price, type);
}

/** Prix d'un reset, remisé seulement si le code s'applique aux resets. */
export function discountedReset(resetFee: Cents, type: ProgramType): Cents {
  return promo.appliesToResets ? discountedPrice(resetFee, type) : resetFee;
}

/** Le Pay Later ne se cumule jamais avec un code promo. */
export function canApplyPromo(paymentMode: "one_time" | "pay_later"): {
  ok: boolean;
  reason?: "payLater";
} {
  return paymentMode === "pay_later" ? { ok: false, reason: "payLater" } : { ok: true };
}
