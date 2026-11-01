# CLAUDE.md – [NOM] · Prop firm Futures

## 1. Le projet
[NOM] est une prop firm spécialisée dans les **futures (marchés CME)**, positionnée comme Lucid Trading ou Tradeify.
Un trader achète une évaluation, trade sur un compte **simulé**, et s'il atteint l'objectif sans enfreindre les règles,
il reçoit un compte financé (simulé) sur lequel il touche une part des profits (payouts).
Différenciateur principal : le **[NOM] Pass**, un système de progression type battle pass (XP, rangs, saisons, missions, récompenses).

Langues : français + anglais (i18n dès le départ). Devise d'affichage : USD.

## 2. Stack technique (ne pas changer sans me demander)
- **Framework** : Next.js (dernière version stable, App Router) + TypeScript en mode strict
- **UI** : Tailwind CSS + shadcn/ui (composants personnalisés au design system ci-dessous) + Framer Motion pour les animations
- **Base de données & Auth** : Supabase (Postgres, Auth email + Google, Row Level Security activée sur TOUTES les tables)
- **ORM** : Drizzle ORM + migrations versionnées
- **Validation** : Zod (toutes les entrées : formulaires, server actions, webhooks, API)
- **Paiements** : Stripe Checkout + webhooks (crypto plus tard via un 2e provider, prévoir une interface `PaymentProvider`)
- **Emails** : Resend + React Email
- **Jobs planifiés** : Inngest (ou Vercel Cron) pour : calcul fin de journée, missions, fin de saison
- **Graphiques** : Recharts
- **i18n** : next-intl
- **Tests** : Vitest (unitaires, surtout le moteur de règles et l'XP) + Playwright (parcours critiques)
- **Hébergement** : Vercel
- **Gestion de paquets** : pnpm

## 3. Design system (OBLIGATOIRE sur toutes les pages)
Style : **noir profond, effets chrome/argent métallisé, accents cyan**. Premium, moderne, un peu Y2K. Inspiration : sites de prop firms haut de gamme.

### 3.1 Couleurs (à mettre en tokens Tailwind / variables CSS)
| Token | Hex | Usage |
|---|---|---|
| `bg` | `#08090B` | Fond principal |
| `bg-elevated` | `#0C0E12` | Sections alternées, bandeau promo |
| `surface` | `#111317` | Cartes |
| `border` | `#262A31` | Bordures |
| `text` | `#ECEFF3` | Texte principal |
| `text-muted` | `#8E95A1` | Texte secondaire (contraste AA validé) |
| `cyan` | `#22D3EE` | Accent principal (CTA secondaires, badges, barres de progression) |
| `cyan-light` | `#67E8F9` | Petits labels, chiffres mis en avant |
| `cyan-deep` | `#0A5F74` | Ombres / dégradés cyan |
| `danger` | `#FF4D6A` | Pertes, violations, drawdown |
| `success` | `#22D3EE` | (le cyan sert aussi de "succès") |

Couleurs des rangs du Pass : Bronze `#C98A5A`, Silver `#B8C0CC`, Gold `#E8B04A`, Platinum `#7FE3D0`, Elite = `#22D3EE` avec effet glow.

### 3.2 Effets signature
- **Texte chrome** (H1, H2) :
  `background: linear-gradient(180deg,#FFFFFF 0%,#D5DAE1 50%,#8C939D 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;`
- **Bouton principal chrome** :
  `background: linear-gradient(180deg,#F6F8FA 0%,#C9CED6 55%,#9DA4AE 100%); color:#0B0D10; box-shadow: inset 0 1px 0 #FFF, 0 0 0 1px #3A3F47, 0 10px 30px rgba(34,211,238,.18);`
- **Bouton secondaire** : fond transparent, bordure `#262A31`, texte `#ECEFF3`, hover bordure cyan.
- **Glow cyan** sur les éléments importants : `box-shadow: 0 0 40px rgba(34,211,238,.22)`.
- **Cartes de compte** (visuel type carte bancaire) : une version métal brossé
  (`repeating-linear-gradient(90deg,#2B2F36 0 2px,#23262C 2px 4px)` + reflet en diagonale) et une version noire bordée de cyan pour les comptes financés.
- Coins arrondis : cartes 16–20px, boutons 10–12px, badges 999px.
- Pas d'emojis dans l'UI, icônes Lucide en trait fin.

### 3.3 Typographie (Google Fonts via next/font)
- Titres : **Sora** 600/700, letter-spacing -0.02em
- Texte : **Manrope** 400–700
- Chiffres, prix, P&L, tickers : **JetBrains Mono** 500/600 (chiffres tabulaires)

### 3.4 Accessibilité
Contraste texte ≥ 4.5:1, focus visibles (anneau cyan), vrais `<button>`/`<a>`, labels sur tous les inputs, site 100 % responsive (mobile d'abord pour le dashboard).

### 3.5 Référence de page d'accueil (structure validée)
1. Bandeau promo (code de réduction)
2. Header : logo + liens (Challenges, Règles, [NOM] Pass, Payouts, FAQ) + Connexion + bouton chrome « Commencer »
3. Hero : badge « PROP FIRM FUTURES · MARCHÉS CME », grand titre chrome, sous-titre, 2 CTA, 3 chiffres clés ; à droite, 2 cartes de compte inclinées (métal 150K « Évaluation » + noire/cyan 50K « Financé »)
4. Bandeau des contrats tradables : ES, NQ, YM, RTY, CL, GC, MES, MNQ
5. Grille des challenges (4 cartes, la 50K mise en avant « Recommandé »)
6. Section [NOM] Pass : carte du rang actuel avec barre d'XP, piste des 5 rangs, sources d'XP
7. « Financé en 3 étapes »
8. Footer + mention légale « comptes simulés »

### 3.6 Logo
Fichier `public/logo.svg` (symbole « Trèfle » : 4 pétales cyan gonflés à contour chrome autour d'un cœur nacré étoilé).
Pas de nom dans le symbole. Prévoir aussi : favicon, icône d'app 512px, version monochrome.

## 4. Configuration de marque (un seul endroit)
Tout ce qui est marque est dans `src/config/brand.ts` : `name`, `domain`, `supportEmail`, `passName`, réseaux sociaux.
Ne jamais écrire le nom de la marque en dur ailleurs.

## 5. Offres (dans `src/config/plans.ts`, modifiables sans toucher au code)
Évaluation **1 étape**, sans limite de temps, drawdown **EOD trailing** (calculé à la clôture du jour de trading).

| Plan | Prix | Objectif | Drawdown EOD | Contrats max | Perte jour (optionnelle) |
|---|---|---|---|---|---|
| 25K | 89 $ | 1 500 $ | 1 000 $ | 2 mini / 20 micro | – |
| 50K | 109 $ | 3 000 $ | 2 000 $ | 5 mini / 50 micro | – |
| 100K | 199 $ | 6 000 $ | 3 000 $ | 10 mini / 100 micro | – |
| 150K | 279 $ | 9 000 $ | 4 500 $ | 15 mini / 150 micro | – |

(Prix indicatifs, alignés sur le marché, à ajuster.)

Règles communes (toutes paramétrables) :
- Règle de consistance en évaluation : le meilleur jour ≤ 50 % du profit total
- Minimum de jours de trading pour valider : 2
- Positions fermées avant la fin de session ; pas de position pendant la pause quotidienne
- Le **jour de trading** suit la session CME Globex : de 17:00 à 16:00 heure de Chicago (America/Chicago). Tous les calculs "fin de journée" se font dans ce fuseau.
- Le drawdown trailing se bloque (lock) au solde initial + 100 $ une fois atteint
- Activation compte financé : frais d'activation 0 $ (argument marketing)

Comptes financés / payouts :
- Profit split : 90 % (100 % sur les premiers 10 000 $, paramétrable)
- Payout possible après 5 jours gagnants (jour gagnant ≥ 100 $), minimum 250 $
- Fréquence : toutes les 2 semaines ; **hebdomadaire à partir du rang Gold**
- Options payantes (add-ons) : reset du compte, payout quotidien, split amélioré

Codes promo : pourcentage ou montant fixe, date d'expiration, limite d'utilisations, restriction par plan.

## 6. Le [NOM] Pass (battle pass) – cœur de la rétention
### Rangs (permanents, basés sur l'XP totale)
| Rang | XP requise | Récompenses |
|---|---|---|
| Bronze | 0 | Badge profil, accès au Discord privé |
| Silver | 1 000 | -10 % sur tous les challenges |
| Gold | 2 000 | Payouts hebdomadaires, -15 % |
| Platinum | 4 000 | 1 reset gratuit / mois, split 95 % |
| Elite | 8 000 | Compte 50K offert, split 100 %, manager dédié |

### Saisons
- Saison = 3 mois. Chaque saison a sa propre **piste de 30 paliers** (XP de saison, remise à zéro à chaque saison)
  avec des récompenses : coupons, resets, add-ons, badges, cadres de profil, goodies.
- Piste **gratuite** + piste **Premium** (achat optionnel du Pass Premium par saison, ex. 29 $) avec de meilleures récompenses.
- L'XP totale (rangs) n'est jamais remise à zéro ; l'XP de saison oui.

### Sources d'XP (table `xp_rules`, paramétrable depuis l'admin)
| Action | XP |
|---|---|
| Jour de trading sans violation de règle | +20 |
| Mission quotidienne | +50 |
| Mission hebdomadaire | +150 |
| Évaluation validée | +500 |
| Payout encaissé | +1 000 |
| Parrainage d'un trader qui achète | +200 |
| Série de 5 jours disciplinés (streak) | +100 bonus |

**Important** : l'XP récompense la **discipline**, pas la prise de risque ni le volume. Jamais d'XP au nombre de contrats ou de trades.

### Missions
Exemples : « Respecte ton stop sur 3 jours », « Trade 3 sessions sans dépasser 50 % de ta perte max », « Termine un jour en positif ».
Missions quotidiennes et hebdomadaires générées par cron, progression suivie automatiquement à partir des données de trading.

### Anti-abus
Plafond d'XP par jour, XP attribuée uniquement côté serveur (jamais depuis le client), journal d'XP immuable (`xp_events`),
détection multi-comptes (même IP / même carte / même KYC).

### UI du Pass
Page dédiée avec : rang actuel + barre d'XP animée, piste de saison horizontale scrollable (paliers verrouillés / débloqués / réclamables),
missions du jour/de la semaine, bouton « Réclamer » avec animation, compte à rebours de fin de saison, leaderboard de saison.

## 7. Fonctionnalités par espace
### Site public
Accueil, Challenges (comparateur), Règles détaillées, [NOM] Pass, Payouts (preuves de paiement : à alimenter avec de vraies données uniquement),
FAQ, Affiliation, Blog (MDX), CGV / Confidentialité / Mentions légales / Avertissement sur les risques.

### Espace trader (dashboard)
- Inscription / connexion, profil, vérification KYC (prestataire type Sumsub ou Veriff, derrière une interface `KycProvider`)
- Achat d'un challenge (Stripe Checkout) + application de codes promo et réductions de rang
- Liste de ses comptes avec statut : `evaluation` · `passed` · `funded` · `failed` · `breached`
- Page compte : équité en temps réel, courbe de P&L, objectif (barre), drawdown restant (barre rouge), jours de trading, règle de consistance, historique des trades
- Alertes quand une règle approche de la limite (80 %), et notifications (in-app + email)
- Demandes de payout, historique, factures, certificats PDF (évaluation réussie / payout)
- Section Pass (voir §6)
- Parrainage : lien unique, suivi des filleuls et commissions

### Back-office admin (rôle `admin`, `support`)
- Tableau de bord : CA, ventes par plan, taux de réussite, payouts versés, ratio payouts/CA
- Utilisateurs, comptes, override manuel de statut (toujours journalisé)
- Validation KYC et payouts (workflow : demandé → en revue → approuvé → payé / refusé)
- Gestion des plans, règles, codes promo, XP, missions, saisons, récompenses
- Journal d'audit de toutes les actions admin

## 8. Intégration de la plateforme de trading
La plateforme d'exécution n'est PAS codée par nous. Elle viendra d'un fournisseur sous licence (Rithmic, Tradovate, ProjectX, etc., à choisir).
- Créer une interface `TradingProvider` dans `src/server/trading/` : `createAccount`, `getAccountState`, `getTrades`, `disableAccount`, `resetAccount`.
- Implémenter d'abord un **`MockTradingProvider`** qui simule des trades et des soldes réalistes sur ES/NQ/CL/GC, pour développer et tester tout le reste.
- Le **moteur de règles** (`src/server/rules/`) est indépendant du fournisseur : il prend l'état du compte + les trades et retourne objectifs atteints / violations. Il doit être 100 % testé unitairement.

## 9. Modèle de données (tables principales)
`profiles`, `plans`, `coupons`, `orders`, `trading_accounts`, `account_daily_snapshots`, `trades`, `rule_violations`,
`payout_requests`, `kyc_verifications`, `ranks`, `seasons`, `season_tiers`, `season_rewards`, `user_season_progress`,
`xp_rules`, `xp_events`, `missions`, `user_missions`, `reward_claims`, `affiliates`, `referrals`, `notifications`, `audit_logs`.
Montants toujours en **centimes (integer)**, jamais en float. Dates en UTC en base, affichage dans le fuseau de l'utilisateur, calculs de session en America/Chicago.

## 10. Arborescence
```
src/
  app/[locale]/(marketing)/...     pages publiques
  app/[locale]/(app)/dashboard/... espace trader
  app/[locale]/(admin)/admin/...   back-office
  app/api/webhooks/...             Stripe, KYC, trading provider
  components/ui/                   composants du design system
  components/marketing|dashboard|pass|admin/
  config/                          brand.ts, plans.ts, rules.ts, pass.ts
  server/                          db, rules, trading, payments, kyc, xp, emails
  lib/                             utils, formatters (argent, dates)
  messages/fr.json, en.json
```

## 11. Règles de travail pour Claude Code
- **Toujours planifier avant de coder** : pour chaque phase, propose un plan court, attends ma validation, puis exécute.
- Travaille **une phase à la fois**. À la fin de chaque phase : `pnpm lint`, `pnpm typecheck`, `pnpm test` doivent passer, puis commit git avec un message clair.
- Demande-moi avant d'ajouter une dépendance importante ou de changer la stack.
- Jamais de secrets dans le code : tout dans `.env.local`, et tiens `.env.example` à jour.
- Vérifie la signature de TOUS les webhooks. RLS sur toutes les tables. Rate limiting sur l'auth et les endpoints sensibles.
- Aucune donnée inventée présentée comme réelle (faux avis, faux payouts, faux nombre de traders) : utilise des placeholders clairement marqués.
- Code lisible, composants petits, pas de duplication du design : tout passe par les composants `components/ui`.
- Mets à jour la section « Avancement » en bas de ce fichier après chaque phase.

## 12. Juridique (à afficher sur le site)
« Tous les comptes fournis sont des comptes de trading simulés. [NOM] n'est pas un courtier et ne reçoit aucun dépôt de clients.
Les performances passées ne préjugent pas des performances futures. » Textes définitifs à faire valider par un avocat.

## Avancement
- [x] Phase 0 – Setup (Next.js 16.4, Tailwind 4, next-intl fr/en, Drizzle + Supabase prêts, Vitest + Playwright, structure §10)
- [x] Phase 1 – Design system (`components/ui` : Button/ButtonLink, Card, Badge, ProgressBar, AccountCard, Section, Reveal, Logo), page d'accueil §3.5, `/styleguide`, pages « en construction » via `(marketing)/[slug]`. Config remplie en avance : `plans.ts`, `rules.ts`, `pass.ts` (rangs/XP), `promo.ts` (code PLACEHOLDER).
- [ ] Phase 2 – Pages publiques

Notes techniques :
- Next.js 16 : avant de coder, lire les guides dans `node_modules/next/dist/docs/` (voir AGENTS.md). Le middleware s'appelle `src/proxy.ts`. `cacheComponents` est activé.
- Le registre shadcn (ui.shadcn.com) peut être bloqué dans l'environnement cloud : écrire les composants à la main si besoin.
- Ne jamais mettre `position: fixed` à l'intérieur d'un élément avec `backdrop-filter` (le header) : le fixed devient relatif à ce parent.
- Français : espace insécable (U+00A0) avant `%` dans messages/fr.json.
- Langue : utiliser `toLocale()` (`src/i18n/routing.ts`) pour valider le paramètre `[locale]`.
