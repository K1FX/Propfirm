/**
 * Jour de trading CME Globex (CLAUDE.md §5) : de 17:00 à 16:00, heure de Chicago.
 * Une exécution à partir de 17:00 (Chicago) appartient au jour de trading suivant.
 */

export const SESSION_TIME_ZONE = "America/Chicago";
const SESSION_OPEN_HOUR = 17;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SESSION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

function chicagoParts(date: Date) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
  };
}

/** Ajoute n jours à une date « YYYY-MM-DD » (calcul calendaire pur, sans fuseau). */
export function addDays(isoDay: string, n: number): string {
  const d = new Date(`${isoDay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Jour de trading (YYYY-MM-DD) auquel appartient un instant donné. */
export function getTradingDay(date: Date): string {
  const p = chicagoParts(date);
  const calendarDay = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return p.hour >= SESSION_OPEN_HOUR ? addDays(calendarDay, 1) : calendarDay;
}

/** Vrai si le jour (YYYY-MM-DD) est un jour de semaine (lundi–vendredi). */
export function isWeekday(isoDay: string): boolean {
  const dow = new Date(`${isoDay}T00:00:00Z`).getUTCDay();
  return dow >= 1 && dow <= 5;
}
