import { getRankProgress } from "@/config/pass";
import { getOffer, globalRules, type ProgramType, type SizeId } from "@/config/plans";
import { addDays } from "@/lib/session";
import type { Cents } from "@/lib/format";

import { demoAccounts, DEMO_TODAY, demoUser, type DemoAccount } from "../demo/data";
import { buildDailyResults } from "../rules/daily";
import { evaluateAccount } from "../rules/engine";
import { createRulesSnapshot } from "../rules/snapshot";
import type { DailyResult, Evaluation, RulesSnapshot } from "../rules/types";
import { MockTradingProvider } from "../trading/mock-provider";
import type { Trade } from "../trading/types";

export type AccountStatus =
  | "evaluation"
  | "passed"
  | "passed_awaiting_activation"
  | "expired"
  | "funded"
  | "failed"
  | "breached";

export type PaymentMode = "one_time" | "pay_later";

export type AccountView = {
  id: string;
  programType: ProgramType;
  size: SizeId;
  paymentMode: PaymentMode;
  phase: "evaluation" | "funded";
  status: AccountStatus;
  purchasedAt: string;
  startBalance: Cents;
  /** Règles figées du compte (jamais relues depuis la config). */
  rules: RulesSnapshot;
  evaluation: Evaluation;
  days: DailyResult[];
  trades: Trade[];
  /** Pay Later : frais à payer et date limite (après réussite de l'évaluation). */
  activation: { fee: Cents; deadline: string } | null;
};

// --- Démo : fournisseur simulé pré-chargé (remplacé par la base en Phase 3) ---
let provider: MockTradingProvider | null = null;
function demoProvider(): MockTradingProvider {
  if (!provider) {
    provider = new MockTradingProvider();
    for (const a of demoAccounts) {
      provider.seed(a.id, {
        ...a.scenario,
        startBalance: getOffer(a.programType, a.size).accountSize,
      });
    }
  }
  return provider;
}

/** Statut affiché, à partir du résultat du moteur et du mode de paiement. */
export function resolveStatus(
  a: Pick<DemoAccount, "phase" | "paymentMode">,
  e: Evaluation,
  passedOn: string | null,
  today: string,
): { status: AccountStatus; activation: AccountView["activation"] } {
  if (e.status === "breached") return { status: "breached", activation: null };
  if (a.phase === "funded") return { status: "funded", activation: null };
  if (e.status !== "passed") return { status: "evaluation", activation: null };
  if (a.paymentMode === "pay_later" && passedOn) {
    const deadline = addDays(passedOn, globalRules.activationDeadlineDays);
    return {
      status: today > deadline ? "expired" : "passed_awaiting_activation",
      activation: { fee: 0, deadline },
    };
  }
  return { status: "passed", activation: null };
}

async function buildView(a: DemoAccount): Promise<AccountView> {
  const offer = getOffer(a.programType, a.size);
  const rank = getRankProgress(demoUser.totalXp).current.id;
  const rules = createRulesSnapshot(a.programType, a.size, a.phase, rank);
  const trades = await demoProvider().getTrades(a.id);
  const days = buildDailyResults(offer.accountSize, trades);
  const evaluation = evaluateAccount(rules, days);
  const passedOn = evaluation.status === "passed" ? (days.at(-1)?.day ?? null) : null;
  const resolved = resolveStatus(a, evaluation, passedOn, DEMO_TODAY);

  return {
    id: a.id,
    programType: a.programType,
    size: a.size,
    paymentMode: a.paymentMode,
    phase: a.phase,
    status: resolved.status,
    purchasedAt: a.purchasedAt,
    startBalance: offer.accountSize,
    rules,
    evaluation,
    days,
    trades: trades.sort((x, y) => y.closedAt.localeCompare(x.closedAt)),
    activation:
      resolved.activation && offer.payLater
        ? { ...resolved.activation, fee: offer.payLater.activation }
        : null,
  };
}

/** Comptes de l'utilisateur connecté (démo pour l'instant). */
export async function listAccounts(): Promise<AccountView[]> {
  return Promise.all(demoAccounts.map(buildView));
}

export async function getAccount(id: string): Promise<AccountView | null> {
  const a = demoAccounts.find((x) => x.id === id);
  return a ? buildView(a) : null;
}

/** Vrai si le trader peut encore ouvrir un compte INSTANT (limite de comptes actifs). */
export function canOpenInstantAccount(
  accounts: readonly Pick<AccountView, "programType" | "status">[],
): boolean {
  const active = accounts.filter(
    (a) => a.programType === "instant" && a.status !== "breached" && a.status !== "failed",
  ).length;
  return active < globalRules.maxActiveInstantAccounts;
}
