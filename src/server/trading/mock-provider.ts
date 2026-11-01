import { addDays, isWeekday } from "@/lib/session";

import { contractSpecs, feesPerContract } from "./contracts";
import type {
  ContractSymbol,
  CreateAccountInput,
  ProviderAccountState,
  Trade,
  TradingProvider,
} from "./types";

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type MockScenario = {
  seed: number;
  startBalance: number;
  /** P&L visé par jour de trading, en dollars (le résultat réel est arrondi au tick). */
  dailyPnl: readonly number[];
  /** Dernier jour de trading du scénario (YYYY-MM-DD). */
  endDay: string;
  symbols: readonly ContractSymbol[];
};

/** Génère des trades réalistes (prix au tick près, horaires RTH) qui suivent le scénario. */
export function generateTrades(externalId: string, s: MockScenario): Trade[] {
  const rand = rng(s.seed);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]!;

  // Jours de semaine se terminant à endDay.
  const days: string[] = [];
  let d = s.endDay;
  while (days.length < s.dailyPnl.length) {
    if (isWeekday(d)) days.unshift(d);
    d = addDays(d, -1);
  }

  const trades: Trade[] = [];
  const prices = Object.fromEntries(
    Object.entries(contractSpecs).map(([k, v]) => [k, v.basePrice]),
  ) as Record<ContractSymbol, number>;

  days.forEach((day, dayIndex) => {
    const target = Math.round(s.dailyPnl[dayIndex]! * 100);
    const count = 2 + Math.floor(rand() * 3);
    // Répartition du P&L du jour : parts dans le sens du résultat, plus éventuellement
    // un petit trade à contre-sens (≤ 30 % du résultat ou 150 $) pour rester réaliste.
    const counter =
      count > 2 && rand() > 0.5
        ? -Math.sign(target || 1) * Math.round(Math.max(Math.abs(target) * 0.3, 15_000) * rand())
        : 0;
    const weights = Array.from({ length: count }, () => 0.3 + rand());
    if (counter !== 0) weights[0] = 0;
    const sum = weights.reduce((a, b) => a + b, 0);
    const planned = weights.map((w, i) =>
      i === 0 && counter !== 0 ? counter : Math.round(((target - counter) * w) / sum),
    );
    let remaining = target;
    // Heure d'ouverture : 8:30 Chicago ≈ 13:30 UTC (heure d'été) ; on reste dans la séance.
    let minute = 13 * 60 + 30 + Math.floor(rand() * 30);

    for (let i = 0; i < count; i++) {
      const symbol = pick(s.symbols);
      const spec = contractSpecs[symbol];
      const quantity = 1 + Math.floor(rand() * (spec.micro ? 5 : 2));
      const tickValue = spec.tickSize * spec.pointValue; // centimes par tick et par contrat
      const fees = feesPerContract(symbol) * quantity;
      const wanted = i === count - 1 ? remaining : planned[i]!;
      // Le P&L brut compense les frais pour que le net suive le scénario.
      const ticks = Math.round((wanted + fees) / (tickValue * quantity));
      const pnl = ticks * tickValue * quantity;
      remaining -= pnl - fees;

      const side = rand() > 0.5 ? "long" : "short";
      prices[symbol] += (rand() - 0.5) * spec.basePrice * 0.004;
      const entry = Math.round(prices[symbol] / spec.tickSize) * spec.tickSize;
      const move = ticks * spec.tickSize;
      const exit = side === "long" ? entry + move : entry - move;

      const duration = 3 + Math.floor(rand() * 40);
      const opened = new Date(`${day}T00:00:00Z`);
      opened.setUTCMinutes(minute);
      const closed = new Date(opened.getTime() + duration * 60_000);
      minute += duration + 5 + Math.floor(rand() * 30);

      const maxAdverse = pnl < 0 ? Math.round(-pnl * 1.1) : Math.round(pnl * 0.3 * rand());

      trades.push({
        id: `${externalId}-${day}-${i}`,
        symbol,
        isMicro: spec.micro,
        side,
        quantity,
        entryPrice: Number(entry.toFixed(spec.decimals)),
        exitPrice: Number(exit.toFixed(spec.decimals)),
        openedAt: opened.toISOString(),
        closedAt: closed.toISOString(),
        pnl,
        fees,
        maxAdverse,
      });
    }
  });

  return trades;
}

type MockAccount = {
  startBalance: number;
  trades: Trade[];
  disabled: boolean;
};

/** Fournisseur simulé pour le développement et les tests (CLAUDE.md §8). */
export class MockTradingProvider implements TradingProvider {
  private accounts = new Map<string, MockAccount>();
  private counter = 0;

  /** Pré-charge un compte avec un historique généré. */
  seed(externalId: string, scenario: MockScenario): void {
    this.accounts.set(externalId, {
      startBalance: scenario.startBalance,
      trades: generateTrades(externalId, scenario),
      disabled: false,
    });
  }

  async createAccount(input: CreateAccountInput): Promise<{ externalId: string }> {
    const externalId = `MOCK-${input.label}-${++this.counter}`;
    this.accounts.set(externalId, {
      startBalance: input.startBalance,
      trades: [],
      disabled: false,
    });
    return { externalId };
  }

  async getAccountState(externalId: string): Promise<ProviderAccountState> {
    const acc = this.get(externalId);
    const balance = acc.trades.reduce((b, t) => b + t.pnl - t.fees, acc.startBalance);
    return { externalId, balance, equity: balance, openPositions: 0, disabled: acc.disabled };
  }

  async getTrades(externalId: string): Promise<Trade[]> {
    return [...this.get(externalId).trades];
  }

  async disableAccount(externalId: string): Promise<void> {
    this.get(externalId).disabled = true;
  }

  async resetAccount(externalId: string): Promise<void> {
    const acc = this.get(externalId);
    acc.trades = [];
    acc.disabled = false;
  }

  private get(externalId: string): MockAccount {
    const acc = this.accounts.get(externalId);
    if (!acc) throw new Error(`Compte inconnu : ${externalId}`);
    return acc;
  }
}
