/**
 * Promotion affichée sur le site (bandeau, prix barrés, bouton mobile).
 * À REMPLIR avant le lancement : un VRAI code créé dans l'admin, sinon `enabled: false`.
 * Afficher une réduction qui ne fonctionne pas au paiement serait trompeur.
 */
export const promo = {
  enabled: true,
  /** À REMPLIR : code réel (placeholder actuel). */
  code: "LAUNCH20",
  discountPct: 20,
  /** À REMPLIR : fin de l'offre (ISO 8601, avec fuseau). */
  endsAt: "2026-12-31T23:59:59-06:00",
} as const;

/** Prix après réduction (centimes). */
export function promoPrice(price: number): number {
  return promo.enabled ? Math.round((price * (100 - promo.discountPct)) / 100) : price;
}
