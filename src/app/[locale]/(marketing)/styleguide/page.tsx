import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use, type ReactNode } from "react";

import { AccountCard } from "@/components/ui/account-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Container, SectionHeading } from "@/components/ui/section";
import { toLocale } from "@/i18n/routing";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

const colors = [
  ["bg", "#08090B"],
  ["bg-elevated", "#0C0E12"],
  ["surface", "#111317"],
  ["border", "#262A31"],
  ["text", "#ECEFF3"],
  ["text-muted", "#8E95A1"],
  ["cyan", "#22D3EE"],
  ["cyan-light", "#67E8F9"],
  ["cyan-deep", "#0A5F74"],
  ["danger", "#FF4D6A"],
] as const;

const rankColors = [
  ["bronze", "#C98A5A"],
  ["silver", "#B8C0CC"],
  ["gold", "#E8B04A"],
  ["platinum", "#7FE3D0"],
  ["elite", "#22D3EE"],
] as const;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-border py-10">
      <h2 className="text-xs font-semibold tracking-[0.2em] text-cyan-light uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-16 rounded-xl border border-border" style={{ background: hex }} />
      <p className="text-sm text-text">{name}</p>
      <p className="tabular text-xs text-text-muted">{hex}</p>
    </div>
  );
}

export default function StyleguidePage({ params }: PageProps<"/[locale]/styleguide">) {
  const { locale } = use(params);
  setRequestLocale(toLocale(locale));
  const t = useTranslations("Styleguide");

  return (
    <Container className="py-16">
      <SectionHeading
        as="h1"
        align="left"
        eyebrow="UI"
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mt-12">
        <Block title={t("colors")}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {colors.map(([n, h]) => (
              <Swatch key={n} name={n} hex={h} />
            ))}
          </div>
        </Block>

        <Block title={t("ranks")}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {rankColors.map(([n, h]) => (
              <Swatch key={n} name={n} hex={h} />
            ))}
          </div>
        </Block>

        <Block title={t("typography")}>
          <p className="text-chrome font-display text-5xl font-bold">Sora 700 · Chrome</p>
          <p className="font-display text-2xl font-semibold">Sora 600 – Titres</p>
          <p className="text-base">Manrope – Texte courant, lisible et moderne.</p>
          <p className="tabular text-2xl text-cyan-light">
            +$1,250.00 · ES 5,412.25 · NQ 19,804.50
          </p>
        </Block>

        <Block title={t("buttons")}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Chrome</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="cyan">Cyan</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Block>

        <Block title={t("badges")}>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="cyan">Cyan</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="chrome">Chrome</Badge>
            <Badge variant="bronze">Bronze</Badge>
            <Badge variant="silver">Silver</Badge>
            <Badge variant="gold">Gold</Badge>
            <Badge variant="platinum">Platinum</Badge>
            <Badge variant="elite">Elite</Badge>
          </div>
        </Block>

        <Block title={t("cards")}>
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardTitle>{t("sample")}</CardTitle>
              <CardDescription className="mt-2">{t("sampleDesc")}</CardDescription>
            </Card>
            <Card highlighted>
              <CardTitle>Highlighted</CardTitle>
              <CardDescription className="mt-2">{t("sampleDesc")}</CardDescription>
            </Card>
            <Card className="border-chrome">
              <CardTitle>Chrome border</CardTitle>
              <CardDescription className="mt-2">{t("sampleDesc")}</CardDescription>
            </Card>
          </div>
        </Block>

        <Block title={t("progress")}>
          <div className="grid max-w-xl gap-6">
            <ProgressBar value={62} label="Objectif" valueLabel="$1,860 / $3,000" />
            <ProgressBar
              value={35}
              tone="danger"
              label="Drawdown utilisé"
              valueLabel="$700 / $2,000"
            />
            <ProgressBar value={80} tone="chrome" label="XP" valueLabel="1,600 / 2,000" />
          </div>
        </Block>

        <Block title={t("accounts")}>
          <div className="grid gap-8 md:grid-cols-2">
            <AccountCard variant="metal" size="150K" status="Évaluation" footer="ACC-0001" />
            <AccountCard variant="funded" size="50K" status="Financé" footer="ACC-0002" />
          </div>
        </Block>
      </div>
    </Container>
  );
}
