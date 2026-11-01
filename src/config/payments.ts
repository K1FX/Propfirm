/** Moyens de paiement réellement disponibles (affichés sous les plans). */
export const paymentMethods = {
  card: true,
  /** Passer à true quand le 2e provider (crypto) sera branché. */
  crypto: false,
} as const;

/** Onglets de la section plans : seuls les types d'offre activés s'affichent. */
export const planTypes = {
  evaluation: true,
  instantFunding: false,
} as const;
