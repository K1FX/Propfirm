import { ArrowUpRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Encadré lumineux affiché quand une évaluation est réussie. */
/** `activation` renseigné = Pay Later : frais d'activation à payer avant la date limite. */
export function PassedBanner({
  activation = null,
}: {
  activation?: { fee: string; deadline: string } | null;
}) {
  const t = useTranslations("Dashboard.account.passedCard");

  return (
    <section className="animated-glow flex flex-col gap-4 rounded-[20px] border border-cyan/30 bg-[linear-gradient(120deg,rgba(34,211,238,.12),rgba(17,19,23,1)_55%)] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Badge variant="cyan" className="self-start">
          <Sparkles className="size-3.5" aria-hidden />
          {t("update")}
        </Badge>
        <h2 className="text-chrome font-display text-2xl font-bold">{t("title")}</h2>
        <p className="max-w-xl text-sm text-text-muted">
          {activation ? t("descPayLater", activation) : t("desc")}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <Button variant="cyan" size="lg" disabled>
          {activation ? t("payActivation", { fee: activation.fee }) : t("cta")}
          <ArrowUpRight />
        </Button>
        <p className="max-w-xs text-xs text-text-muted sm:text-right">
          {activation ? t("payLaterSoon") : t("ctaSoon")}
        </p>
      </div>
    </section>
  );
}
