import { useLocale, useTranslations } from "next-intl";

import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { contractSpecs } from "@/server/trading/contracts";
import type { Trade } from "@/server/trading/types";

import { formatDay, formatTime } from "./format";

export function TradesTable({ trades }: { trades: Trade[] }) {
  const t = useTranslations("Dashboard.table");
  const locale = useLocale();

  return (
    <div className="overflow-x-auto rounded-[16px] border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">{t("caption")}</caption>
        <thead className="bg-bg-elevated text-left text-xs text-text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              {t("date")}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t("symbol")}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t("side")}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              {t("qty")}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              {t("entry")}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              {t("exit")}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              {t("pnl")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trades.map((tr) => {
            const net = tr.pnl - tr.fees;
            return (
              <tr key={tr.id} className="bg-surface transition-colors hover:bg-bg-elevated">
                <td className="px-4 py-3 tabular whitespace-nowrap text-text-muted">
                  {formatDay(tr.closedAt.slice(0, 10), locale)} · {formatTime(tr.closedAt, locale)}
                </td>
                <td className="px-4 py-3 tabular font-semibold">{tr.symbol}</td>
                <td className="px-4 py-3">
                  <span className={tr.side === "long" ? "text-cyan-light" : "text-rank-silver"}>
                    {t(tr.side)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular">{tr.quantity}</td>
                <td className="px-4 py-3 text-right tabular text-text-muted">
                  {tr.entryPrice.toFixed(contractSpecs[tr.symbol].decimals)}
                </td>
                <td className="px-4 py-3 text-right tabular text-text-muted">
                  {tr.exitPrice.toFixed(contractSpecs[tr.symbol].decimals)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right tabular font-semibold",
                    net >= 0 ? "text-cyan-light" : "text-danger",
                  )}
                >
                  {formatMoney(net, { locale, signed: true, showCents: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
