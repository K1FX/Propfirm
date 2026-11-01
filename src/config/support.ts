/**
 * Support client – n'afficher QUE des affirmations vraies.
 * À REMPLIR : langues réellement couvertes, horaires, fuseaux des équipes.
 */
import type { CountryCode } from "@/components/ui/flag";

export type SupportLanguage = { code: string; greeting: string; flag: CountryCode };

export const support = {
  /** Langues réellement parlées par le support. */
  // À CONFIRMER : retirer toute langue que l'équipe ne parle pas réellement.
  languages: [
    { code: "en", greeting: "Hello", flag: "us" },
    { code: "fr", greeting: "Bonjour", flag: "fr" },
    { code: "es", greeting: "Hola", flag: "es" },
    { code: "pt", greeting: "Olá", flag: "br" },
    { code: "de", greeting: "Hallo", flag: "de" },
    { code: "it", greeting: "Ciao", flag: "it" },
  ] satisfies SupportLanguage[],
  /** Affiche une pastille « Et + » après les langues. */
  showMoreLanguages: true,
  /** À REMPLIR : ex. "Mon–Fri, 8:00–20:00 CT". null = non affiché (jamais « 24/7 » si faux). */
  hours: null as string | null,
  /** Fuseaux où l'équipe est présente (points lumineux sur la carte). */
  timeZones: ["America/Chicago", "Europe/Paris"] as const,
  channels: { discord: true, liveChat: false },
} as const;
