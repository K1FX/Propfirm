import { describe, expect, it } from "vitest";

import { getRankProgress } from "./pass";

describe("getRankProgress", () => {
  it("place 0 XP en Bronze", () => {
    const r = getRankProgress(0);
    expect(r.current.id).toBe("bronze");
    expect(r.next?.id).toBe("silver");
    expect(r.progressPct).toBe(0);
  });

  it("calcule la progression entre deux rangs", () => {
    const r = getRankProgress(1_500);
    expect(r.current.id).toBe("silver");
    expect(r.progressPct).toBe(50);
    expect(r.xpToNext).toBe(500);
  });

  it("atteint un rang pile au seuil", () => {
    expect(getRankProgress(2_000).current.id).toBe("gold");
  });

  it("plafonne à Elite", () => {
    const r = getRankProgress(50_000);
    expect(r.current.id).toBe("elite");
    expect(r.next).toBeNull();
    expect(r.progressPct).toBe(100);
  });

  it("ignore l'XP négative", () => {
    expect(getRankProgress(-10).current.id).toBe("bronze");
  });
});
