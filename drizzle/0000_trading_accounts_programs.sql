CREATE TYPE "public"."account_phase" AS ENUM('evaluation', 'funded');--> statement-breakpoint
CREATE TYPE "public"."account_size" AS ENUM('25k', '50k', '100k', '150k');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('evaluation', 'passed', 'passed_awaiting_activation', 'expired', 'funded', 'failed', 'breached');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('one_time', 'pay_later');--> statement-breakpoint
CREATE TYPE "public"."program_type" AS ENUM('rush', 'flex', 'instant');--> statement-breakpoint
CREATE TABLE "trading_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"program_type" "program_type" NOT NULL,
	"size" "account_size" NOT NULL,
	"payment_mode" "payment_mode" DEFAULT 'one_time' NOT NULL,
	"phase" "account_phase" NOT NULL,
	"status" "account_status" NOT NULL,
	"external_id" text,
	"risk_template" text NOT NULL,
	"start_balance" integer NOT NULL,
	"rules_snapshot" jsonb NOT NULL,
	"winning_days_count" integer DEFAULT 0 NOT NULL,
	"activation_fee" integer,
	"activation_deadline" timestamp with time zone,
	"activation_paid_at" timestamp with time zone,
	"passed_at" timestamp with time zone,
	"last_payout_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trading_accounts_amounts_positive" CHECK ("trading_accounts"."start_balance" > 0 AND "trading_accounts"."winning_days_count" >= 0),
	CONSTRAINT "trading_accounts_instant_rules" CHECK ("trading_accounts"."program_type" <> 'instant' OR ("trading_accounts"."phase" = 'funded' AND "trading_accounts"."payment_mode" = 'one_time'))
);
--> statement-breakpoint
ALTER TABLE "trading_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "trading_accounts_user_idx" ON "trading_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trading_accounts_user_type_status_idx" ON "trading_accounts" USING btree ("user_id","program_type","status");--> statement-breakpoint
CREATE POLICY "trading_accounts_select_own" ON "trading_accounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("trading_accounts"."user_id" = (select auth.uid()));