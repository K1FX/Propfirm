import type { ContractSymbol } from "./types";

/** Spécifications CME : taille du tick et valeur d'un point (en centimes). */
export const contractSpecs: Record<
  ContractSymbol,
  { tickSize: number; pointValue: number; micro: boolean; basePrice: number; decimals: number }
> = {
  ES: { tickSize: 0.25, pointValue: 5_000, micro: false, basePrice: 5_850, decimals: 2 },
  NQ: { tickSize: 0.25, pointValue: 2_000, micro: false, basePrice: 20_600, decimals: 2 },
  YM: { tickSize: 1, pointValue: 500, micro: false, basePrice: 42_300, decimals: 0 },
  RTY: { tickSize: 0.1, pointValue: 5_000, micro: false, basePrice: 2_250, decimals: 1 },
  CL: { tickSize: 0.01, pointValue: 100_000, micro: false, basePrice: 70.5, decimals: 2 },
  GC: { tickSize: 0.1, pointValue: 10_000, micro: false, basePrice: 2_740, decimals: 1 },
  MES: { tickSize: 0.25, pointValue: 500, micro: true, basePrice: 5_850, decimals: 2 },
  MNQ: { tickSize: 0.25, pointValue: 200, micro: true, basePrice: 20_600, decimals: 2 },
};

/** Frais aller-retour par contrat (centimes). */
export function feesPerContract(symbol: ContractSymbol): number {
  return contractSpecs[symbol].micro ? 100 : 400;
}
