/**
 * Titre du hero : variante active + variantes prêtes pour un A/B test.
 * Les clés renvoient à messages/*.json → Hero.titles.<clé>.
 */
export const heroTitles = ["fundedUpTo", "levelUp", "fastTrack"] as const;
export type HeroTitle = (typeof heroTitles)[number];

export const activeHeroTitle: HeroTitle = "fundedUpTo";
