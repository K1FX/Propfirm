"use client";

import { useEffect, useRef, useState } from "react";

import type { TrustKind } from "@/config/trust";
import { formatAccountSize, formatMoney } from "@/lib/format";

type Item = { id: string; value: number; kind: TrustKind; label: string };

function format(kind: TrustKind, v: number, locale: string): string {
  switch (kind) {
    case "moneyK": {
      const size = formatAccountSize(v);
      return locale === "fr" ? `${size} $` : `$${size}`;
    }
    case "money":
      return formatMoney(v, { locale, showCents: false });
    case "percent":
      return locale === "fr" ? `${v} %` : `${v}%`;
    case "hours":
      return `${v}h`;
    case "count":
      return new Intl.NumberFormat(locale).format(v);
  }
}

const DIGITS = "0123456789";

/**
 * Valeur affichée en « rouleaux » : chaque chiffre est une colonne 0–9 positionnée sur sa valeur.
 * L'animation ne touche qu'au `transform` (le texte ne change jamais : pas d'impact sur le LCP).
 */
function RollingValue({ text, roll }: { text: string; roll: boolean }) {
  return (
    <span aria-label={text} role="text" className="inline-flex leading-none">
      {[...text].map((ch, i) => {
        const d = DIGITS.indexOf(ch);
        if (d < 0) {
          return (
            <span key={i} aria-hidden>
              {ch}
            </span>
          );
        }
        return (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden">
            <span
              className={roll ? "block digit-rolling" : "block"}
              style={
                {
                  "--roll-to": `-${d}em`,
                  transform: `translateY(-${d}em)`,
                  animationDelay: `${i * 60}ms`,
                } as React.CSSProperties
              }
            >
              {[...DIGITS].map((n) => (
                <span key={n} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Barre de confiance : gros chiffres + libellés, séparés par de fines lignes. */
export function TrustBar({
  items,
  locale,
  label,
}: {
  items: Item[];
  locale: string;
  label: string;
}) {
  const ref = useRef<HTMLDListElement>(null);
  const [roll, setRoll] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const o = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setRoll(true);
        o.disconnect();
      }
    });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <dl
      ref={ref}
      aria-label={label}
      className="grid w-full grid-cols-3 divide-x divide-border border-t border-border pt-6 sm:flex sm:w-auto sm:divide-x"
    >
      {items.map((it) => (
        <div key={it.id} className="flex flex-col gap-1.5 px-3 first:pl-0 sm:px-6">
          <dd className="order-1 tabular text-2xl font-semibold text-text sm:text-3xl">
            <RollingValue text={format(it.kind, it.value, locale)} roll={roll} />
          </dd>
          <dt className="order-2 text-xs text-text-muted">{it.label}</dt>
        </div>
      ))}
    </dl>
  );
}
