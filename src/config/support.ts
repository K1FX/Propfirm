/**
 * Support client – n'afficher QUE des affirmations vraies.
 * À REMPLIR : langues réellement couvertes, horaires, fuseaux des équipes.
 */
export type SupportLanguage = {
  code: string;
  greeting: string;
  flag: "us" | "fr" | "es" | "pt" | "in";
};

export const support = {
  /** Langues réellement parlées par le support (ajouter es/pt/in seulement si c'est vrai). */
  languages: [
    { code: "en", greeting: "Hello", flag: "us" },
    { code: "fr", greeting: "Bonjour", flag: "fr" },
  ] satisfies SupportLanguage[],
  /** À REMPLIR : ex. "Mon–Fri, 8:00–20:00 CT". null = non affiché (jamais « 24/7 » si faux). */
  hours: null as string | null,
  /** Fuseaux où l'équipe est présente (points lumineux sur la carte). */
  timeZones: ["America/Chicago", "Europe/Paris"] as const,
  channels: { discord: true, liveChat: false },
} as const;
