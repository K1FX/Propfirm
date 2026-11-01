/**
 * Avis (Trustpilot) et certificats de payout RÉELS uniquement.
 * Tant qu'aucune donnée n'existe (base en Phase 3), la section n'est pas affichée.
 */
export type Review = { id: string; author: string; rating: number; text: string; date: string };

export function getPublicReviews(): Review[] {
  // TODO Phase 3 : lire les avis importés et les payouts réels depuis la base.
  return [];
}

export function ReviewsSection() {
  const reviews = getPublicReviews();
  if (reviews.length === 0) return null;
  return null; // Rendu à construire quand les premières vraies données existeront.
}
