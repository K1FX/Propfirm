/**
 * Configuration de marque – SEUL endroit où le nom de la marque est défini (CLAUDE.md §4).
 * Remplacer « [NOM] » le jour où le nom est fixé.
 */
export const brand = {
  name: "[NOM]",
  domain: "example.com",
  supportEmail: "support@example.com",
  passName: "[NOM] Pass",
  social: {
    discord: "",
    x: "",
    instagram: "",
    youtube: "",
  },
} as const;

export type Brand = typeof brand;
