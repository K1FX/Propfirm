import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { AccountStatus } from "@/server/accounts/service";

const variants = {
  evaluation: "neutral",
  passed: "cyan",
  funded: "cyan",
  failed: "danger",
  breached: "danger",
} as const;

export function StatusBadge({ status }: { status: AccountStatus }) {
  const t = useTranslations("Dashboard.status");
  return <Badge variant={variants[status]}>{t(status)}</Badge>;
}
