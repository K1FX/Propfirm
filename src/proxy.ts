import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next.js 16 : le middleware s'appelle désormais « proxy ».
// Pour l'instant : routage des langues. La protection des routes (auth/rôles) arrive en Phase 3.
export default createMiddleware(routing);

export const config = {
  // Toutes les routes sauf API, fichiers internes Next.js et fichiers statiques.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
