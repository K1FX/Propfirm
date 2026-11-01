import type { Cents } from "@/lib/format";

export type ContractSymbol = "ES" | "NQ" | "YM" | "RTY" | "CL" | "GC" | "MES" | "MNQ";

export type Trade = {
  id: string;
  symbol: ContractSymbol;
  isMicro: boolean;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  openedAt: string; // ISO UTC
  closedAt: string; // ISO UTC
  /** P&L brut en centimes. */
  pnl: Cents;
  fees: Cents;
  /** Pire excursion défavorable pendant le trade (centimes, ≥ 0). */
  maxAdverse: Cents;
};

export type ProviderAccountState = {
  externalId: string;
  balance: Cents;
  /** Solde + P&L latent des positions ouvertes. */
  equity: Cents;
  openPositions: number;
  disabled: boolean;
};

export type CreateAccountInput = { startBalance: Cents; label: string };

/** Contrat avec le fournisseur d'exécution (Rithmic, Tradovate, ProjectX… – CLAUDE.md §8). */
export interface TradingProvider {
  createAccount(input: CreateAccountInput): Promise<{ externalId: string }>;
  getAccountState(externalId: string): Promise<ProviderAccountState>;
  getTrades(externalId: string): Promise<Trade[]>;
  disableAccount(externalId: string): Promise<void>;
  resetAccount(externalId: string): Promise<void>;
}
