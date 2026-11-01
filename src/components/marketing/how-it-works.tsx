import { CheckCircle2, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { plans } from "@/config/plans";
import { evaluationRules, fundedRules } from "@/config/rules";
import { minDaysToFirstPayout } from "@/config/trust";
import { formatAccountSize, formatMoney } from "@/lib/format";

/** Scène illustrée en code (pas d'image) : fond, grille de points, widget en verre. */
function Scene({ children, widget }: { children: ReactNode; widget: ReactNode }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] border border-border bg-[radial-gradient(120%_90%_at_30%_10%,#0b2a33,#07080a_60%)]">
      <div aria-hidden className="absolute inset-0 bg-dots opacity-70" />
      <div className="absolute inset-0">{children}</div>
      <div className="absolute right-3 bottom-6 left-3 rounded-[12px] px-3.5 py-2.5 glass sm:left-auto sm:min-w-[60%]">
        {widget}
      </div>
    </div>
  );
}

function RisingChart() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="hiw-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22D3EE" stopOpacity=".35" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#1F232A" />
      ))}
      <path
        d="M0 150 L40 140 L70 146 L110 118 L150 124 L190 92 L230 98 L270 60 L320 40 L320 200 L0 200 Z"
        fill="url(#hiw-fill)"
      />
      <polyline
        points="0,150 40,140 70,146 110,118 150,124 190,92 230,98 270,60 320,40"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="3"
        style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,.7))" }}
      />
      <line x1="0" x2="320" y1="30" y2="30" stroke="#67E8F9" strokeDasharray="6 5" opacity=".6" />
    </svg>
  );
}

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const locale = useLocale();
  const days = minDaysToFirstPayout(evaluationRules.minTradingDays);
  const maxSize = formatAccountSize(Math.max(...plans.map((p) => p.accountSize)));
  const size = locale === "fr" ? `${maxSize} $` : `$${maxSize}`;
  const money = (c: number) => formatMoney(c, { locale, showCents: false });
  const recommended = plans.find((p) => p.recommended) ?? plans[0]!;

  const hl = (chunks: ReactNode) => (
    <span className="text-cyan drop-shadow-[0_0_18px_rgba(34,211,238,.5)] [-webkit-text-fill-color:currentColor]">
      {chunks}
    </span>
  );

  const steps = [
    {
      key: "one" as const,
      pill: t("steps.one.pill"),
      desc: t("steps.one.desc"),
      scene: (
        <Scene
          widget={
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-text-muted">
                <CheckCircle2 className="size-4 text-cyan" aria-hidden />
                {t("steps.one.widget")}
              </span>
              <span className="tabular font-semibold text-text">
                {money(recommended.accountSize)}
              </span>
            </div>
          }
        >
          <div className="flex h-full items-start justify-center px-[8%] pt-[9%]">
            <div className="grid w-full grid-cols-4 gap-2">
              {plans.map((p) => (
                <span
                  key={p.id}
                  className={
                    p.recommended
                      ? "rounded-[10px] border border-cyan bg-cyan/15 py-3 text-center tabular text-sm font-semibold text-cyan-light shadow-[0_0_24px_rgba(34,211,238,.45)]"
                      : "rounded-[10px] border border-border bg-bg/60 py-3 text-center tabular text-sm text-text-muted"
                  }
                >
                  {formatAccountSize(p.accountSize)}
                </span>
              ))}
            </div>
          </div>
        </Scene>
      ),
    },
    {
      key: "two" as const,
      pill: t("steps.two.pill", { min: evaluationRules.minTradingDays }),
      desc: t("steps.two.desc", { size }),
      scene: (
        <Scene
          widget={
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-muted">{t("steps.two.widget")}</span>
              <svg viewBox="0 0 80 24" className="h-5 w-20" aria-hidden>
                <polyline
                  points="0,20 12,17 22,19 34,12 46,14 58,7 70,8 80,2"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="2"
                />
              </svg>
            </div>
          }
        >
          <RisingChart />
        </Scene>
      ),
    },
    {
      key: "three" as const,
      pill: t("steps.three.pill", { days }),
      desc: t("steps.three.desc", {
        threshold: money(fundedRules.fullSplitThreshold),
        split: fundedRules.profitSplitPct,
      }),
      scene: (
        <Scene
          widget={
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">{t("steps.three.widget")}</span>
                <span className="label-caps !text-[9px]">{t("example")}</span>
              </div>
              {[
                [1, 42_000],
                [2, 128_000],
                [3, 324_000],
              ].map(([n, v]) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{t("steps.three.day", { n: n! })}</span>
                  <span className="tabular font-semibold text-cyan-light">
                    {formatMoney(v!, { locale, signed: true, showCents: false })}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          <div
            aria-hidden
            className="absolute top-[10%] left-[14%] size-28 rounded-full bg-cyan/25 blur-2xl"
          />
          <div className="absolute top-[12%] left-[10%] flex size-16 items-center justify-center rounded-2xl border border-cyan/50 bg-cyan/10 shadow-[0_0_30px_rgba(34,211,238,.4)] sm:size-20">
            <Wallet className="size-8 text-cyan sm:size-10" strokeWidth={1.25} aria-hidden />
          </div>
        </Scene>
      ),
    },
  ];

  return (
    <Section id="how-it-works" className="overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-dots [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[420px] w-[900px] -translate-1/2 rounded-full bg-cyan-deep/20 blur-[150px]"
      />
      <div className="relative">
        <SectionHeading eyebrow={t("eyebrow")} title={t.rich("title", { days, hl })} />
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.key}>
              <Reveal delay={i * 0.1} className="h-full">
                <article className="flex h-full flex-col gap-6 rounded-[20px] border border-border bg-surface p-3 pb-6">
                  <div className="relative">
                    {s.scene}
                    <span className="absolute -bottom-3.5 left-5 rounded-full bg-cyan px-3.5 py-1 text-xs font-bold text-[#04181D] shadow-[0_0_20px_rgba(34,211,238,.5)]">
                      {s.pill}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 px-3 pt-2">
                    <h3 className="font-display text-xl font-semibold">
                      {t(`steps.${s.key}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-muted">{s.desc}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
