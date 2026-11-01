/** Formate un jour « YYYY-MM-DD » sans décalage de fuseau. */
export function formatDay(
  isoDay: string,
  locale: string,
  style: "short" | "long" = "short",
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: style === "long" ? "numeric" : undefined,
  }).format(new Date(`${isoDay}T12:00:00Z`));
}

export function formatTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
