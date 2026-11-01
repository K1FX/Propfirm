"use client";

import { Bitcoin, CreditCard, Lock, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { InfoTip } from "@/components/ui/info-tip";
import { Modal } from "@/components/ui/modal";
import type { Offer, ProgramType, SizeId } from "@/config/plans";
import { discountedPrice, promoSavings } from "@/config/promo";
import { formatAccountSize, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

import { TrackedButtonLink } from "./tracked-link";

export type PlansData = {
  offers: Offer[];
  popularSize: SizeId;
  payLaterEnabled: boolean;
  rules: {
    winningDayMin: number;
    payoutEveryWinningDays: number;
    payoutMin: number;
    profitSplitPct: number;
    maxActiveInstantAccounts: number;
    activationDeadlineDays: number;
  };
  promo: { enabled: boolean; code: string; discountPct: number; types: ProgramType[] };
  payment: { card: boolean; crypto: boolean };
};

type Mode = "one_time" | "pay_later";
const TYPES: ProgramType[] = ["rush", "flex", "instant"];

type Row = { key: string; label: string; value: string; none?: boolean; tip?: string };

export function PlansExplorer({ data }: { data: PlansData }) {
  const t = useTranslations("Plans");
  const locale = useLocale();
  const [type, setType] = useState<ProgramType>("rush");
  const [mode, setMode] = useState<Mode>("one_time");
  const [fundedOf, setFundedOf] = useState<Offer | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const money = (c: number) => formatMoney(c, { locale });
  const pct = (n: number) => (locale === "fr" ? `${n} %` : `${n}%`);
  const isInstant = type === "instant";
  const payLaterVisible = data.payLaterEnabled && !isInstant;
  const effectiveMode: Mode = payLaterVisible ? mode : "one_time";
  const promoActive =
    data.promo.enabled && data.promo.types.includes(type) && effectiveMode === "one_time";
  const cards = data.offers.filter((o) => o.type === type);

  // Mobile : la carte « populaire » centrée au chargement et à chaque changement d'onglet.
  useEffect(() => {
    const box = scrollRef.current;
    const card = box?.querySelector<HTMLElement>(`[data-size="${data.popularSize}"]`);
    if (box && card && box.scrollWidth > box.clientWidth) {
      box.scrollLeft = card.offsetLeft - (box.clientWidth - card.clientWidth) / 2;
    }
  }, [type, data.popularSize]);

  function rowsFor(o: Offer): Row[] {
    const none = t("none");
    if (o.type === "instant") {
      const f = o.funded;
      return [
        {
          key: "maxAccounts",
          label: t("rows.maxAccounts"),
          value: String(data.rules.maxActiveInstantAccounts),
        },
        {
          key: "consistency",
          label: t("rows.consistency"),
          value: f.consistencyPct === null ? none : pct(f.consistencyPct),
          none: f.consistencyPct === null,
          tip: t("tips.consistencyFunded"),
        },
        {
          key: "dll",
          label: t("rows.dailyLoss"),
          value: f.dailyLossLimit === null ? none : money(f.dailyLossLimit),
          none: f.dailyLossLimit === null,
          tip: t("tips.dailyLoss"),
        },
        { key: "dd", label: t("rows.drawdownFunded"), value: money(f.maxDrawdown) },
        {
          key: "contracts",
          label: t("rows.contracts"),
          value: t("contractsValue", f.maxContracts),
        },
      ];
    }
    const e = o.evaluation!;
    const activation =
      effectiveMode === "pay_later" && o.payLater ? money(o.payLater.activation) : none;
    return [
      { key: "target", label: t("rows.target"), value: money(o.profitTarget!) },
      { key: "dd", label: t("rows.drawdown"), value: money(e.maxDrawdown) },
      {
        key: "dll",
        label: t("rows.dailyLoss"),
        value: e.dailyLossLimit === null ? none : money(e.dailyLossLimit),
        none: e.dailyLossLimit === null,
        tip: t("tips.dailyLoss"),
      },
      {
        key: "consistency",
        label: t("rows.consistency"),
        value: e.consistencyPct === null ? none : pct(e.consistencyPct),
        none: e.consistencyPct === null,
        tip: t("tips.consistencyEval"),
      },
      { key: "days", label: t("rows.minDays"), value: String(e.minTradingDays) },
      { key: "reset", label: t("rows.reset"), value: o.resetFee ? money(o.resetFee) : none },
      {
        key: "activation",
        label: t("rows.activation"),
        value: activation,
        none: activation === none,
      },
      { key: "contracts", label: t("rows.contracts"), value: t("contractsValue", e.maxContracts) },
    ];
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Onglets des types de compte */}
      <div role="tablist" aria-label={t("tabs.label")} className="grid gap-2 sm:grid-cols-3">
        {TYPES.map((ty) => (
          <button
            key={ty}
            type="button"
            role="tab"
            aria-selected={type === ty}
            onClick={() => setType(ty)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-[14px] border px-4 py-3 text-left transition-all",
              type === ty
                ? "border-cyan/60 bg-cyan/10 shadow-[0_0_30px_rgba(34,211,238,.18)]"
                : "border-border bg-surface hover:border-cyan/30",
            )}
          >
            <span className="font-display text-base font-semibold">
              <span className={type === ty ? "text-cyan-light" : "text-text"}>
                {t(`tabs.${ty}.name`)}
              </span>
              <span className="text-text-muted"> · {t(`tabs.${ty}.label`)}</span>
            </span>
            <span className="text-xs text-text-muted">{t(`tabs.${ty}.sub`)}</span>
          </button>
        ))}
      </div>

      {/* Paiement unique / Pay Later */}
      {payLaterVisible && (
        <div className="flex flex-col items-center gap-2">
          <div
            role="radiogroup"
            aria-label={t("modes.label")}
            className="inline-flex rounded-[12px] border border-border bg-surface p-1"
          >
            {(["one_time", "pay_later"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-[9px] px-4 py-1.5 text-sm font-semibold transition-all",
                  mode === m ? "bg-chrome" : "text-text-muted hover:text-text",
                )}
              >
                {t(`modes.${m}`)}
              </button>
            ))}
          </div>
          {mode === "pay_later" && <p className="text-xs text-text-muted">{t("payLaterHint")}</p>}
        </div>
      )}

      {/* Cartes : défilement horizontal sur mobile, grille sur grand écran */}
      <div
        ref={scrollRef}
        className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pt-4 pb-4 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0"
      >
        {cards.map((o) => {
          const size = formatAccountSize(o.accountSize);
          const popular = o.size === data.popularSize;
          const finalPrice = promoActive ? discountedPrice(o.price, o.type) : o.price;
          const savings = promoActive ? promoSavings(o.price, o.type) : 0;
          const payLater = effectiveMode === "pay_later" ? o.payLater : null;

          return (
            <article
              key={o.size}
              data-size={o.size}
              className={cn(
                "relative flex w-[82vw] max-w-[340px] shrink-0 snap-center flex-col gap-5 rounded-[20px] border bg-surface p-6 transition-transform duration-300 hover:-translate-y-1 sm:w-[300px] xl:w-auto xl:max-w-none",
                popular
                  ? "border-cyan/60 bg-[linear-gradient(180deg,rgba(34,211,238,.09),transparent_40%)] glow-cyan"
                  : "border-border",
              )}
            >
              {popular && (
                <Badge
                  variant="cyan"
                  className="absolute -top-3 left-6 bg-bg tracking-[0.15em] uppercase"
                >
                  {t("popular")}
                </Badge>
              )}
              <h3 className="text-chrome font-display text-2xl font-bold">
                {t(isInstant ? "titleFunded" : "titleEval", { size })}
              </h3>

              {/* Prix */}
              <div className="flex min-h-[76px] flex-col justify-end gap-1">
                {payLater ? (
                  <>
                    <p className="tabular text-3xl font-semibold text-cyan-light">
                      {money(payLater.now)}
                    </p>
                    <p className="text-sm text-text-muted">
                      {t("payLaterPrice", { activation: money(payLater.activation) })}
                    </p>
                  </>
                ) : (
                  <>
                    {promoActive && (
                      <s className="tabular text-sm text-text-muted">{money(o.price)}</s>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "tabular text-3xl font-semibold",
                          promoActive
                            ? "text-cyan-light drop-shadow-[0_0_14px_rgba(34,211,238,.45)]"
                            : "text-text",
                        )}
                      >
                        {money(finalPrice)}
                      </span>
                      <span className="text-sm text-text-muted">{t("oneTime")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Règles */}
              <dl className="flex flex-col gap-2.5 border-t border-border pt-5 text-sm">
                {rowsFor(o).map((r) => (
                  <div key={r.key} className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-1.5 text-text-muted">
                      {r.label}
                      {r.tip && <InfoTip label={r.label} text={r.tip} />}
                    </dt>
                    <dd
                      className={cn("text-right tabular", r.none ? "text-cyan-light" : "text-text")}
                    >
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                onClick={() => setFundedOf(o)}
                className="self-start text-sm font-semibold text-cyan-light underline-offset-4 hover:underline"
              >
                {t("viewFunded")}
              </button>

              <div className="mt-auto flex flex-col gap-2">
                <TrackedButtonLink
                  href={`/challenges?type=${o.type}&size=${o.size}&mode=${effectiveMode}`}
                  event={`plan_click_${o.type}_${o.size}`}
                  variant={popular ? "chrome" : "secondary"}
                  className="w-full"
                >
                  {t(isInstant ? "ctaInstant" : "ctaEval", { size })}
                </TrackedButtonLink>
                <p className="min-h-4 text-center text-xs">
                  {promoActive && savings > 0 ? (
                    <span className="text-cyan-light">
                      {t("save", { amount: money(savings), code: data.promo.code })}
                    </span>
                  ) : payLater ? (
                    <span className="text-text-muted">{t("payLaterNoPromo")}</span>
                  ) : null}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
        <li className="flex items-center gap-2">
          <Lock className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          {t("secure")}
        </li>
        <li className="flex items-center gap-2">
          {data.payment.crypto ? (
            <Bitcoin className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          ) : (
            <CreditCard className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          )}
          {[data.payment.card && t("card"), data.payment.crypto && t("crypto")]
            .filter(Boolean)
            .join(" & ")}
        </li>
        <li className="flex items-center gap-2">
          <Zap className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
          {t("instant")}
        </li>
      </ul>

      {/* Règles du compte financé (masquées des cartes, affichées à la demande) */}
      <Modal
        open={fundedOf !== null}
        onClose={() => setFundedOf(null)}
        closeLabel={t("funded.close")}
        title={
          fundedOf &&
          t("funded.title", {
            type: t(`tabs.${fundedOf.type}.name`),
            size: formatAccountSize(fundedOf.accountSize),
          })
        }
      >
        {fundedOf && (
          <FundedRules offer={fundedOf} data={data} money={money} pct={pct} mode={effectiveMode} />
        )}
      </Modal>
    </div>
  );
}

function FundedRules({
  offer,
  data,
  money,
  pct,
  mode,
}: {
  offer: Offer;
  data: PlansData;
  money: (c: number) => string;
  pct: (n: number) => string;
  mode: Mode;
}) {
  const t = useTranslations("Plans");
  const f = offer.funded;
  const none = t("none");

  const rows: Row[] = [
    {
      key: "payout",
      label: t("funded.payoutFrequency"),
      value: t("funded.payoutFrequencyValue", { days: data.rules.payoutEveryWinningDays }),
    },
    {
      key: "winning",
      label: t("funded.winningDay"),
      value: t("funded.winningDayValue", { amount: money(data.rules.winningDayMin) }),
      tip: t("tips.winningDay", { amount: money(data.rules.winningDayMin) }),
    },
    { key: "cap", label: t("funded.payoutCap"), value: money(f.payoutCap) },
    { key: "min", label: t("funded.payoutMin"), value: money(data.rules.payoutMin) },
    { key: "split", label: t("funded.split"), value: pct(data.rules.profitSplitPct) },
    {
      key: "consistency",
      label: t("rows.consistency"),
      value: f.consistencyPct === null ? none : pct(f.consistencyPct),
      none: f.consistencyPct === null,
      tip: t("tips.consistencyFunded"),
    },
    {
      key: "dll",
      label: t("rows.dailyLoss"),
      value: f.dailyLossLimit === null ? none : money(f.dailyLossLimit),
      none: f.dailyLossLimit === null,
      tip: t("tips.dailyLoss"),
    },
    { key: "dd", label: t("rows.drawdownFunded"), value: money(f.maxDrawdown) },
    { key: "contracts", label: t("rows.contracts"), value: t("contractsValue", f.maxContracts) },
  ];

  if (offer.type === "instant") {
    rows.push({
      key: "max",
      label: t("rows.maxAccounts"),
      value: String(data.rules.maxActiveInstantAccounts),
    });
  } else {
    const activation =
      mode === "pay_later" && offer.payLater ? money(offer.payLater.activation) : none;
    rows.push({
      key: "activation",
      label: t("rows.activation"),
      value: activation,
      none: activation === none,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col divide-y divide-border text-sm">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-1.5 text-text-muted">
              {r.label}
              {r.tip && <InfoTip label={r.label} text={r.tip} />}
            </dt>
            <dd className={cn("text-right tabular", r.none ? "text-cyan-light" : "text-text")}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-relaxed text-text-muted">{t("funded.note")}</p>
    </div>
  );
}
