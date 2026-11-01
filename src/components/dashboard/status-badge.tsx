import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { ProgramType } from "@/config/plans";
import type { AccountStatus } from "@/server/accounts/service";

const variants = {
  evaluation: "neutral",
  passed: "cyan",
  passed_awaiting_activation: "cyan",
  expired: "danger",
  funded: "cyan",
  failed: "danger",
  breached: "danger",
} as const;

export function StatusBadge({ status }: { status: AccountStatus }) {
  const t = useTranslations("Dashboard.status");
  return <Badge variant={variants[status]}>{t(status)}</Badge>;
}

/** Type de compte (Rush / Flex / Instant). */
export function ProgramBadge({ type }: { type: ProgramType }) {
  const t = useTranslations("Dashboard.program");
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold tracking-[0.15em] text-text-muted uppercase">
      {t(type)}
    </span>
  );
}
