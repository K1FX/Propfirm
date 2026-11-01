import type { AbstractIntlMessages } from "next-intl";
import { getMessages } from "next-intl/server";

/**
 * Namespaces envoyés aux composants client. Ne pas envoyer tout le dictionnaire :
 * chaque page n'embarque que ce dont ses composants client ont besoin (poids de page).
 */
export const CLIENT_NAMESPACES = {
  site: ["Nav", "LocaleSwitcher", "Promo", "StickyCta"],
  leaderboard: ["Leaderboard", "Pass"],
  dashboard: ["Nav", "LocaleSwitcher", "Dashboard", "Leaderboard", "Pass"],
} as const;

export async function pickClientMessages(
  group: keyof typeof CLIENT_NAMESPACES,
): Promise<AbstractIntlMessages> {
  const all = (await getMessages()) as AbstractIntlMessages;
  return Object.fromEntries(
    CLIENT_NAMESPACES[group].filter((ns) => ns in all).map((ns) => [ns, all[ns]!]),
  ) as AbstractIntlMessages;
}
