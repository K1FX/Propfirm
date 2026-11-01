import { useTranslations } from "next-intl";

const contracts = ["ES", "NQ", "YM", "RTY", "CL", "GC", "MES", "MNQ"] as const;

/** Bandeau défilant des contrats tradables (contenu statique, pas de cours de marché). */
export function ContractsTicker() {
  const t = useTranslations("Contracts");

  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {contracts.map((c) => (
        <li key={c} className="flex items-center gap-3 px-8">
          <span className="tabular text-base font-semibold text-text">{c}</span>
          <span className="text-sm whitespace-nowrap text-text-muted">{t(c)}</span>
          <span aria-hidden className="ml-8 size-1.5 rounded-full bg-cyan/60" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={t("label")} className="border-y border-border bg-bg-elevated py-5">
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
