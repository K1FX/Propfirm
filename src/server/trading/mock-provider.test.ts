import { describe, expect, it } from "vitest";

import { getTradingDay } from "@/lib/session";

import { contractSpecs } from "./contracts";
import { generateTrades, MockTradingProvider, type MockScenario } from "./mock-provider";

const scenario: MockScenario = {
  seed: 42,
  startBalance: 5_000_000,
  dailyPnl: [420, -180, 610],
  endDay: "2026-10-30",
  symbols: ["ES", "NQ", "MES"],
};

describe("generateTrades", () => {
  const trades = generateTrades("T", scenario);

  it("est déterministe", () => {
    expect(generateTrades("T", scenario)).toEqual(trades);
  });

  it("respecte le P&L net visé par jour (au tick près)", () => {
    const byDay = new Map<string, number>();
    for (const t of trades) {
      const day = getTradingDay(new Date(t.closedAt));
      byDay.set(day, (byDay.get(day) ?? 0) + t.pnl - t.fees);
    }
    expect([...byDay.keys()]).toEqual(["2026-10-28", "2026-10-29", "2026-10-30"]);
    [...byDay.values()].forEach((net, i) => {
      expect(Math.abs(net - scenario.dailyPnl[i]! * 100)).toBeLessThan(10_000);
    });
  });

  it("produit des prix alignés sur le tick et un P&L cohérent", () => {
    for (const t of trades) {
      const spec = contractSpecs[t.symbol];
      const ticks = Math.abs(t.exitPrice - t.entryPrice) / spec.tickSize;
      expect(Math.abs(ticks - Math.round(ticks))).toBeLessThan(1e-6);
      const dir = t.side === "long" ? 1 : -1;
      const expected = Math.round(
        (t.exitPrice - t.entryPrice) * dir * spec.pointValue * t.quantity,
      );
      expect(t.pnl).toBe(expected);
      expect(Number.isInteger(t.pnl)).toBe(true);
    }
  });

  it("ne trade que les jours de semaine", () => {
    const weekend = generateTrades("W", { ...scenario, dailyPnl: [100, 100, 100, 100, 100, 100] });
    for (const t of weekend) {
      const dow = new Date(t.closedAt).getUTCDay();
      expect(dow).toBeGreaterThanOrEqual(1);
      expect(dow).toBeLessThanOrEqual(5);
    }
  });
});

describe("MockTradingProvider", () => {
  it("crée, lit, désactive et réinitialise un compte", async () => {
    const p = new MockTradingProvider();
    const { externalId } = await p.createAccount({ startBalance: 2_500_000, label: "25K" });
    expect((await p.getAccountState(externalId)).balance).toBe(2_500_000);
    await p.disableAccount(externalId);
    expect((await p.getAccountState(externalId)).disabled).toBe(true);
    await p.resetAccount(externalId);
    expect((await p.getAccountState(externalId)).disabled).toBe(false);
  });

  it("calcule le solde à partir des trades", async () => {
    const p = new MockTradingProvider();
    p.seed("A", scenario);
    const trades = await p.getTrades("A");
    const net = trades.reduce((s, t) => s + t.pnl - t.fees, 0);
    expect((await p.getAccountState("A")).balance).toBe(5_000_000 + net);
  });

  it("refuse un compte inconnu", async () => {
    await expect(new MockTradingProvider().getTrades("X")).rejects.toThrow();
  });
});
