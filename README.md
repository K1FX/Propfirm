# [NOM] · Prop firm Futures

Référence du projet : [`CLAUDE.md`](./CLAUDE.md).

## Démarrer en local

Prérequis : Node.js 20+ et pnpm 10+.

```bash
pnpm install
cp .env.example .env.local   # puis remplir les valeurs (facultatif en Phase 0)
pnpm dev                     # http://localhost:3000
```

## Scripts

| Commande                                        | Rôle                                                       |
| ----------------------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                                      | Serveur de développement                                   |
| `pnpm build` / `pnpm start`                     | Build et serveur de production                             |
| `pnpm lint`                                     | ESLint                                                     |
| `pnpm typecheck`                                | Génère les types de routes puis `tsc --noEmit`             |
| `pnpm format`                                   | Prettier (+ tri des classes Tailwind)                      |
| `pnpm test`                                     | Tests unitaires Vitest                                     |
| `pnpm test:e2e`                                 | Tests Playwright (lance `build` + `start` automatiquement) |
| `pnpm db:generate` / `db:migrate` / `db:studio` | Drizzle (à partir de la Phase 3)                           |

Première exécution de Playwright sur une nouvelle machine : `pnpm exec playwright install chromium`.

## Notes techniques

- Next.js 16 : le middleware s'appelle `src/proxy.ts`. Cache Components est activé.
- shadcn/ui est configuré à la main (`components.json`). Ajouter un composant : `pnpm dlx shadcn@latest add button`.
- Langues : `/fr` (défaut) et `/en`. La racine `/` redirige selon la langue du navigateur.
