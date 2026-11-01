/**
 * Formateurs d'affichage. Les montants sont TOUJOURS stockés en centimes (integer).
 */

export type Cents = number;

function assertCents(value: Cents): void {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`Montant invalide (centimes entiers attendus) : ${value}`);
  }
}

/** Convertit des dollars (saisie humaine / config) en centimes sans erreur de flottant. */
export function dollarsToCents(dollars: number): Cents {
  if (!Number.isFinite(dollars)) {
    throw new TypeError(`Montant invalide : ${dollars}`);
  }
  return Math.round(dollars * 100);
}

type FormatMoneyOptions = {
  locale?: string;
  currency?: string;
  /** Affiche les centimes (par défaut : seulement si non nuls). */
  showCents?: boolean;
  /** Affiche toujours le signe (+/−), utile pour le P&L. */
  signed?: boolean;
};

/** Formate un montant en centimes, ex. 300000 → « 3 000 $ » (fr) / « $3,000 » (en). */
export function formatMoney(cents: Cents, options: FormatMoneyOptions = {}): string {
  assertCents(cents);
  const { locale = "fr", currency = "USD", signed = false } = options;
  const showCents = options.showCents ?? cents % 100 !== 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(cents / 100);
}

/** Taille de compte compacte, ex. 5000000 → « 50K ». */
export function formatAccountSize(cents: Cents): string {
  assertCents(cents);
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `${dollars / 1_000_000}M`;
  if (dollars >= 1_000) return `${dollars / 1_000}K`;
  return String(dollars);
}
