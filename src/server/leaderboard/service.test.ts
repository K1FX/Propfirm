import { describe, expect, it } from "vitest";

import { getLeaderboard, rankEntries } from "./service";

describe("leaderboard", () => {
  const entries = getLeaderboard();

  it("est déterministe et contient l'utilisateur", () => {
    expect(getLeaderboard()).toBe(entries);
    expect(entries.filter((e) => e.me)).toHaveLength(1);
  });

  it("trie par profit décroissant", () => {
    const ranked = rankEntries(entries, "season", "all");
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]!.profit.season).toBeGreaterThanOrEqual(ranked[i]!.profit.season);
    }
  });

  it("filtre par taille de compte", () => {
    const ranked = rankEntries(entries, "month", "50k");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.every((e) => e.planId === "50k")).toBe(true);
  });

  it("filtre par pays", () => {
    const ranked = rankEntries(entries, "season", "all", "us");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.every((e) => e.country === "us")).toBe(true);
  });

  it("des montants entiers en centimes", () => {
    for (const e of entries) {
      for (const v of Object.values(e.profit)) expect(Number.isInteger(v)).toBe(true);
    }
  });
});
