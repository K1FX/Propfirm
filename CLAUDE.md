# CLAUDE.md – Aurum Funded · Prop firm Futures

## 1. Le projet
Aurum Funded est une prop firm spécialisée dans les **futures (marchés CME)**, positionnée comme Lucid Trading ou Tradeify.
Un trader achète une évaluation, trade sur un compte **simulé**, et s'il atteint l'objectif sans enfreindre les règles,
il reçoit un compte financé (simulé) sur lequel il touche une part des profits (payouts).
Différenciateur principal : le **Aurum Pass**, un système de progression type battle pass (XP, rangs, saisons, missions, récompenses).

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
| `bg` | `#030405` | Fond principal (quasi noir, validé) |
| `bg-elevated` | `#07080A` | Sections alternées, bandeau promo |
| `surface` | `#0D0F12` | Cartes |
| `border` | `#1F232A` | Bordures |
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
- **Visuel de compte = billet « Aurum Pass »** (`components/ui/account-pass.tsx`, validé à la place des cartes bancaires) :
  billet vertical avec bande holographique animée, logo, taille du compte, mini-courbe, ligne prédécoupée à encoches et talon à code-barres
  (généré depuis le n° de compte). Version évaluation : chrome/argent. Version financée : bordure et accents cyan avec glow.
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
2. Header : logo + liens (Challenges, Règles, Aurum Pass, Payouts, FAQ) + Connexion + bouton chrome « Commencer »
3. Hero : badge « PROP FIRM FUTURES · MARCHÉS CME », grand titre chrome, sous-titre, 2 CTA, 3 chiffres clés ; à droite, 2 billets Aurum Pass inclinés (150K « Évaluation » chrome + 50K « Financé » cyan)
4. Bandeau des contrats tradables : ES, NQ, YM, RTY, CL, GC, MES, MNQ
5. Grille des challenges (4 cartes, la 50K mise en avant « Recommandé »)
6. Section Aurum Pass : carte du rang actuel avec barre d'XP, piste des 5 rangs, sources d'XP
7. « Financé en 3 étapes »
8. Footer + mention légale « comptes simulés »

### 3.6 Logo
Fichier `public/logo.svg` (symbole « Trèfle » : 4 pétales cyan gonflés à contour chrome autour d'un cœur nacré étoilé).
Pas de nom dans le symbole. Prévoir aussi : favicon, icône d'app 512px, version monochrome.

## 4. Configuration de marque (un seul endroit)
Tout ce qui est marque est dans `src/config/brand.ts` : `name`, `domain`, `supportEmail`, `passName`, réseaux sociaux.
Ne jamais écrire le nom de la marque en dur ailleurs.

## 5. Offres (source de vérité : `src/config/plans.ts`, typé et validé par Zod — jamais de valeur en dur ailleurs)
3 types de compte × 4 tailles (25K, 50K, 100K, 150K). Montants en centimes en base. « MOST POPULAR » = 50K.

**RUSH** — « Validé en 1 jour » — évaluation 1 étape, sans consistance, 1 jour min, perte journalière **soft**
| Taille | Prix | Objectif | DD EOD | Perte/jour (soft) | Reset | Contrats | Pay Later (now + activation) |
|---|---|---|---|---|---|---|---|
| 25K | 89 $ | 1 500 $ | 1 000 $ | 600 $ | 55 $ | 1 / 10 | 39 $ + 69 $ |
| 50K | 129 $ | 3 000 $ | 2 000 $ | 1 250 $ | 89 $ | 4 / 40 | 59 $ + 99 $ |
| 100K | 229 $ | 6 000 $ | 3 500 $ | 2 500 $ | 155 $ | 8 / 80 | 99 $ + 179 $ |
| 150K | 329 $ | 9 000 $ | 5 000 $ | 3 750 $ | 215 $ | 12 / 120 | 149 $ + 259 $ |

**FLEX** — « Validé en 3 jours » — évaluation 1 étape, consistance 40 %, 3 jours min, pas de perte journalière
| Taille | Prix | Objectif | DD EOD | Reset | Contrats | Pay Later |
|---|---|---|---|---|---|---|
| 25K | 99 $ | 1 500 $ | 1 000 $ | 69 $ | 1 / 10 | 45 $ + 79 $ |
| 50K | 149 $ | 3 000 $ | 2 000 $ | 99 $ | 4 / 40 | 65 $ + 119 $ |
| 100K | 239 $ | 6 000 $ | 3 000 $ | 155 $ | 8 / 80 | 105 $ + 189 $ |
| 150K | 335 $ | 9 000 $ | 4 500 $ | 219 $ | 12 / 120 | 149 $ + 265 $ |

**INSTANT** — « Financement immédiat » — pas d'évaluation, pas de reset (racheter), pas de Pay Later, max 5 comptes actifs
| Taille | Prix | DD EOD | Perte/jour (soft) | Consistance | Contrats |
|---|---|---|---|---|---|
| 25K | 309 $ | 1 000 $ | – | 20 % | 1 / 10 |
| 50K | 439 $ | 2 000 $ | 1 250 $ | 20 % | 4 / 40 |
| 100K | 589 $ | 4 000 $ | 2 500 $ | 20 % | 8 / 80 |
| 150K | 719 $ | 5 250 $ | 3 000 $ | 20 % | 12 / 120 |

**Règles communes** : drawdown EOD trailing (mis à jour à la clôture, bloqué au solde initial + 100 $) ; jour de trading = session CME 17:00–16:00 America/Chicago ;
perte journalière « soft » = trading suspendu jusqu'à la session suivante, compte conservé ; positions fermées avant la fin de session.

**Comptes financés** : DD et contrats identiques à l'évaluation (INSTANT : tableau ci-dessus) ; perte/jour : RUSH = éval, FLEX = aucune, INSTANT = tableau ;
consistance (meilleur jour ≤ X % du profit du cycle de payout) : RUSH 35 %, FLEX aucune, INSTANT 20 %.
**Payouts** : pas de payout quotidien ; un payout tous les **5 jours gagnants** (session clôturée à **≥ +150 $**), compteur remis à 0 après chaque payout ;
minimum 250 $ ; plafond par payout 25K 1 000 $ · 50K 2 000 $ · 100K 2 500 $ · 150K 3 000 $ ; profit split 90 %.
Sur la page des plans, les règles de payout ne sont PAS sur les cartes : elles sont dans la fenêtre « Voir les règles Funded ».

**Paiement** : unique (prix plein, 0 $ d'activation) ou **Pay Later** (RUSH/FLEX : prix réduit + frais d'activation seulement si réussite ;
interrupteur global `payLaterEnabled` ; non cumulable avec un code promo ; statut `passed_awaiting_activation` puis `expired` après 14 jours).
**Promo** (`config/promo.ts`) : -40 % sur le paiement unique (arrondi au dollar inférieur), types concernés, date de fin, `appliesToResets`.
**Règles figées** : chaque compte stocke une copie de ses règles (`rules_snapshot`) ; un changement de config ne modifie jamais un compte existant.
**Fournisseur** : un gabarit de risque par type × taille × phase (ex. `RUSH_50K_EVAL`, `INSTANT_50K_FUNDED`).

## 6. Le Aurum Pass (battle pass) – cœur de la rétention
### Rangs (permanents, basés sur l'XP totale)
| Rang | XP requise | Récompenses |
|---|---|---|
| Bronze | 0 | Badge profil, accès au Discord privé |
| Silver | 1 000 | -10 % sur tous les challenges |
| Gold | 2 000 | Payout tous les 4 jours gagnants (au lieu de 5), -15 % |
| Platinum | 4 000 | 1 reset gratuit / mois, split 95 % (au lieu de 90 %) |
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
Accueil, Challenges (comparateur), Règles détaillées, Aurum Pass, Payouts (preuves de paiement : à alimenter avec de vraies données uniquement),
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
« Tous les comptes fournis sont des comptes de trading simulés. Aurum Funded n'est pas un courtier et ne reçoit aucun dépôt de clients.
Les performances passées ne préjugent pas des performances futures. » Textes définitifs à faire valider par un avocat.

## Avancement
- [x] Phase 0 – Setup (Next.js 16.4, Tailwind 4, next-intl fr/en, Drizzle + Supabase prêts, Vitest + Playwright, structure §10)
- [x] Phase 1 – Design system (`components/ui` : Button/ButtonLink, Card, Badge, ProgressBar, AccountPass (billet), Section, Reveal, Logo), page d'accueil §3.5, `/styleguide`, pages « en construction » via `(marketing)/[slug]`. Config remplie en avance : `plans.ts`, `rules.ts`, `pass.ts` (rangs/XP), `promo.ts` (code PLACEHOLDER).
- [~] Intérieur (en avance, en mode démo) : moteur de règles `server/rules` (drawdown EOD trailing + lock, consistance, jours min, contrats, perte jour, alertes 80 %) + `lib/session.ts` (jour CME Chicago) + `TradingProvider`/`MockTradingProvider` – tous testés. Dashboard trader : vue d'ensemble, comptes, page compte refaite façon terminal premium (5 indicateurs, courbe avec légende, barre minimum→départ→objectif, calendrier P&L/trades, règles, trades), compte validé = contour lumineux animé + « Passer en Funded », Pass (rang, piste 30 paliers, missions, classement), payouts. Données : `server/demo/data.ts` (DÉMO, à remplacer par la base en Phase 3). « Connexion » pointe vers /dashboard en attendant l'auth.
- [~] Classement (choix : par profit $ réalisé sur comptes financés) : page publique `/leaderboard` (dans le menu) + `/dashboard/leaderboard` avec position de l'utilisateur épinglée. Podium top 3, filtres période (saison / mois / toujours) et taille de compte. Données : `server/leaderboard/service.ts` (DÉMO, bandeau obligatoire). À faire en Phase 3 : vraies données + option « ne pas apparaître » dans le profil.
- [x] Refonte landing « conversion » : fond quasi noir ; hero (titre en config `hero.ts` + variantes A/B, chiffres cyan), barre de confiance (`config/trust.ts` : promesses tirées de la config, vraies stats seulement au-delà de seuils), bandeau promo avec compte à rebours masquable (`promo.ts`), bouton fixe mobile, How it works (visuels en code), plans avec onglets/prix barré/moyens de paiement (`payments.ts`), Pourquoi nous, Pass, Support (`support.ts`, carte en points), avis (masqué sans vraies données), FAQ, CTA final. `track()` dans `lib/analytics.ts` (dataLayer). Langue par défaut : FR pendant la construction (passer `defaultLocale` à "en" au lancement). Lighthouse mobile ≈ 86–91 (a11y/SEO/bonnes pratiques 100).
- [x] Types de compte RUSH / FLEX / INSTANT : `config/plans.ts` (Zod), `config/promo.ts` (-40 %), moteur de règles par type × phase (`server/rules/engine.ts` + `snapshot.ts`, 27 tests), statuts Pay Later, limite INSTANT, schéma Drizzle `trading_accounts` + migration `drizzle/0000_…` (RLS : lecture de ses propres comptes). Page des plans : onglets, interrupteur Pay Later, infobulles, fenêtre « Voir les règles Funded », défilement mobile. À faire avec Supabase/Stripe (Phases 3–4) : checkout (refus du code en Pay Later, limite 5 INSTANT), paiement de l'activation + email + expiration, achat de resets, stats back-office par type.
- [ ] Phase 2 – Pages publiques

Notes techniques :
- Next.js 16 : avant de coder, lire les guides dans `node_modules/next/dist/docs/` (voir AGENTS.md). Le middleware s'appelle `src/proxy.ts`. `cacheComponents` est activé.
- Le registre shadcn (ui.shadcn.com) peut être bloqué dans l'environnement cloud : écrire les composants à la main si besoin.
- Ne jamais mettre `position: fixed` à l'intérieur d'un élément avec `backdrop-filter` (le header) : le fixed devient relatif à ce parent.
- Français : espace insécable (U+00A0) avant `%` dans messages/fr.json.
- Cache Components : `dynamicParams` est interdit ; un paramètre non listé dans `generateStaticParams` peut répondre 200 à la 1re visite avant d'afficher la 404 (`notFound()`). Tester le contenu, pas le statut.
- `tailwind-merge` (cn) supprime les classes inconnues qui ressemblent à `border-*`/`ring-*` : nommer les utilitaires maison autrement (ex. `animated-glow`).
- Grilles : ajouter `min-w-0` aux enfants d'une grille qui contient un élément large (tableau, calendrier), sinon débordement horizontal sur mobile. Un test e2e vérifie l'absence de débordement.
- Performance landing : pas de framer-motion sur le site public (animations en CSS : `.reveal`, `animate-float`, `useInViewOnce`). Ne jamais animer un texte du hero en changeant son contenu (pénalise le LCP) : animer via `transform`.
- next-intl : ne pas envoyer tout le dictionnaire au client ; utiliser `pickClientMessages()` (`src/i18n/client-messages.ts`) et ajouter le namespace d'un nouveau composant client au bon groupe.
- À REMPLIR avant lancement : `brand.discordUrl`, `promo` (vrai code + date), `trust.payoutProcessingHours`, `support` (langues/horaires), FAQ plateformes/remboursement/pays.
- Ne jamais importer `config/plans.ts` (Zod) dans un composant client : passer les données en props depuis un composant serveur, ou utiliser `config/sizes.ts` (léger).
- Langue : utiliser `toLocale()` (`src/i18n/routing.ts`) pour valider le paramètre `[locale]`.
