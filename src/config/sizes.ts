import type { Cents } from "@/lib/format";

/** Tailles de compte (module léger, sans Zod : importable côté client). */
export const SIZES = ["25k", "50k", "100k", "150k"] as const;
export type SizeId = (typeof SIZES)[number];

export const ACCOUNT_SIZE: Record<SizeId, Cents> = {
  "25k": 2_500_000,
  "50k": 5_000_000,
  "100k": 10_000_000,
  "150k": 15_000_000,
};
