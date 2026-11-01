"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type EquityPoint = { label: string; balance: number; threshold: number };

type Props = {
  data: EquityPoint[];
  /** Solde visé (dollars), null pour un compte financé. */
  target: number | null;
  locale: string;
  labels: { balance: string; threshold: string; target: string };
  title: string;
};

function LegendDot({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 label-caps">
      {dashed ? (
        <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <span
          className="size-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      )}
      {label}
    </span>
  );
}

export function EquityChart({ data, target, locale, labels, title }: Props) {
  const money = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(v);

  const values = data.flatMap((d) => [d.balance, d.threshold]).concat(target ? [target] : []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.08, 200);

  return (
    <figure className="flex flex-col gap-4" aria-label={title}>
      <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-4">
        <LegendDot color="#22D3EE" label={labels.balance} />
        <LegendDot color="#FF4D6A" label={labels.threshold} dashed />
        {target !== null && <LegendDot color="#67E8F9" label={labels.target} dashed />}
      </figcaption>
      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.32} />
                <stop offset="70%" stopColor="#0A5F74" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#0A5F74" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B1E24" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#8E95A1"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              orientation="right"
              domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
              tickFormatter={money}
              stroke="#8E95A1"
              tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }}
              tickLine={false}
              axisLine={false}
              width={82}
              tickCount={6}
            />
            <Tooltip
              cursor={{ stroke: "#3A3F47", strokeDasharray: "4 4" }}
              contentStyle={{
                background: "#111317",
                border: "1px solid #262A31",
                borderRadius: 12,
                fontSize: 12,
                fontFamily: "var(--font-jetbrains-mono)",
              }}
              labelStyle={{ color: "#ECEFF3", marginBottom: 4 }}
              formatter={(value, name) => [money(Number(value)), String(name)]}
            />
            {target !== null && (
              <ReferenceLine
                y={target}
                stroke="#67E8F9"
                strokeOpacity={0.7}
                strokeDasharray="6 5"
              />
            )}
            <Area
              type="monotone"
              dataKey="balance"
              name={labels.balance}
              stroke="#22D3EE"
              strokeWidth={2.5}
              fill="url(#balanceFill)"
              dot={false}
              activeDot={{ r: 5, fill: "#67E8F9", stroke: "#08090B", strokeWidth: 2 }}
              style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,.55))" }}
            />
            <Line
              type="stepAfter"
              dataKey="threshold"
              name={labels.threshold}
              stroke="#FF4D6A"
              strokeWidth={1.75}
              strokeDasharray="6 5"
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
