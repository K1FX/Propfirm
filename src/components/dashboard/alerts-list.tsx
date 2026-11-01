import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { AccountView } from "@/server/accounts/service";

export function AlertsList({ accounts }: { accounts: AccountView[] }) {
  const t = useTranslations("Dashboard");
  const alerts = accounts.flatMap((a) =>
    a.status === "breached" ? [] : a.evaluation.alerts.map((al) => ({ account: a.id, ...al })),
  );

  if (alerts.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
        <ShieldCheck className="size-4 text-cyan" strokeWidth={1.5} aria-hidden />
        {t("overview.noAlerts")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2" role="list">
      {alerts.map((a) => (
        <li key={`${a.account}-${a.type}`}>
          <Link
            href={`/dashboard/accounts/${a.account}`}
            className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-text transition-colors hover:border-danger"
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-danger"
              strokeWidth={1.5}
              aria-hidden
            />
            {t(`alerts.${a.type}`, { account: a.account, pct: Math.round(a.usedPct) })}
          </Link>
        </li>
      ))}
    </ul>
  );
}
