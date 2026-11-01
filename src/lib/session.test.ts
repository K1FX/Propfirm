import { describe, expect, it } from "vitest";

import { addDays, getTradingDay, isWeekday } from "./session";

describe("getTradingDay (session CME, America/Chicago)", () => {
  it("une exécution à 10:00 Chicago appartient au jour même", () => {
    // 2026-10-27 10:00 CDT = 15:00 UTC
    expect(getTradingDay(new Date("2026-10-27T15:00:00Z"))).toBe("2026-10-27");
  });

  it("une exécution à 17:00 Chicago appartient au jour suivant", () => {
    // 2026-10-27 17:00 CDT = 22:00 UTC
    expect(getTradingDay(new Date("2026-10-27T22:00:00Z"))).toBe("2026-10-28");
  });

  it("15:59 Chicago reste sur le jour courant", () => {
    expect(getTradingDay(new Date("2026-10-27T20:59:00Z"))).toBe("2026-10-27");
  });

  it("l'ouverture du dimanche soir compte pour le lundi", () => {
    // Dimanche 2026-10-25 18:00 CDT = 23:00 UTC
    expect(getTradingDay(new Date("2026-10-25T23:00:00Z"))).toBe("2026-10-26");
  });

  it("gère l'heure d'hiver (CST, UTC-6)", () => {
    // 2026-12-01 16:30 CST = 22:30 UTC → après 16:00 mais avant 17:00 : jour même
    expect(getTradingDay(new Date("2026-12-01T22:30:00Z"))).toBe("2026-12-01");
    // 2026-12-01 17:30 CST = 23:30 UTC → jour suivant
    expect(getTradingDay(new Date("2026-12-01T23:30:00Z"))).toBe("2026-12-02");
  });

  it("passe correctement les fins de mois", () => {
    expect(getTradingDay(new Date("2026-10-31T23:00:00Z"))).toBe("2026-11-01");
  });
});

describe("helpers de dates", () => {
  it("addDays", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("isWeekday", () => {
    expect(isWeekday("2026-10-30")).toBe(true); // vendredi
    expect(isWeekday("2026-10-31")).toBe(false); // samedi
  });
});
