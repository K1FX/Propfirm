import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { authenticatedRole, authUid } from "drizzle-orm/supabase";

import type { RulesSnapshot } from "@/server/rules/types";

/**
 * Schéma Drizzle (CLAUDE.md §9). Montants en centimes (integer), dates en UTC (timestamptz).
 * Le reste des tables (profiles, orders, payouts, Pass…) arrive en Phase 3, avec la RLS.
 */

export const programType = pgEnum("program_type", ["rush", "flex", "instant"]);
export const accountSize = pgEnum("account_size", ["25k", "50k", "100k", "150k"]);
export const paymentMode = pgEnum("payment_mode", ["one_time", "pay_later"]);
export const accountPhase = pgEnum("account_phase", ["evaluation", "funded"]);
export const accountStatus = pgEnum("account_status", [
  "evaluation",
  "passed",
  "passed_awaiting_activation",
  "expired",
  "funded",
  "failed",
  "breached",
]);

export const tradingAccounts = pgTable(
  "trading_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Référence à profiles.id (clé étrangère ajoutée en Phase 3 avec la table profiles). */
    userId: uuid("user_id").notNull(),
    programType: programType("program_type").notNull(),
    size: accountSize("size").notNull(),
    paymentMode: paymentMode("payment_mode").notNull().default("one_time"),
    phase: accountPhase("phase").notNull(),
    status: accountStatus("status").notNull(),
    /** Identifiant du compte chez le fournisseur de trading. */
    externalId: text("external_id"),
    /** Gabarit de risque chez le fournisseur (ex. RUSH_50K_EVAL). */
    riskTemplate: text("risk_template").notNull(),
    startBalance: integer("start_balance").notNull(),
    /**
     * Copie des règles au moment de l'achat (ou du passage en financé).
     * Un changement de config ne modifie JAMAIS les règles d'un compte existant.
     */
    rulesSnapshot: jsonb("rules_snapshot").$type<RulesSnapshot>().notNull(),
    winningDaysCount: integer("winning_days_count").notNull().default(0),
    /** Pay Later : frais d'activation dus, date limite et date de paiement. */
    activationFee: integer("activation_fee"),
    activationDeadline: timestamp("activation_deadline", { withTimezone: true }),
    activationPaidAt: timestamp("activation_paid_at", { withTimezone: true }),
    passedAt: timestamp("passed_at", { withTimezone: true }),
    lastPayoutAt: timestamp("last_payout_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("trading_accounts_user_idx").on(t.userId),
    index("trading_accounts_user_type_status_idx").on(t.userId, t.programType, t.status),
    check(
      "trading_accounts_amounts_positive",
      sql`${t.startBalance} > 0 AND ${t.winningDaysCount} >= 0`,
    ),
    check(
      "trading_accounts_instant_rules",
      sql`${t.programType} <> 'instant' OR (${t.phase} = 'funded' AND ${t.paymentMode} = 'one_time')`,
    ),
    // RLS : un trader ne lit que ses propres comptes. Aucune écriture côté client :
    // créations et mises à jour passent par le serveur (clé service, qui contourne la RLS).
    pgPolicy("trading_accounts_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
    }),
  ],
).enableRLS();

export type TradingAccountRow = typeof tradingAccounts.$inferSelect;
export type NewTradingAccountRow = typeof tradingAccounts.$inferInsert;
