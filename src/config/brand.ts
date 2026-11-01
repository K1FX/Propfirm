/**
 * Configuration de marque – SEUL endroit où le nom de la marque est défini (CLAUDE.md §4).
 * Le domaine et l'email de support restent des placeholders tant que le domaine n'est pas acheté.
 */
export const brand = {
  name: "Aurum Funded",
  domain: "example.com",
  supportEmail: "support@example.com",
  passName: "Aurum Pass",
  social: {
    discord: "",
    x: "",
    instagram: "",
    youtube: "",
  },
} as const;

export type Brand = typeof brand;
