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
  const pad = Math.max((max - min) * 0.1, 200);

  return (
    <figure className="h-72 w-full sm:h-80" aria-label={title}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#262A31" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#8E95A1"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#262A31" }}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tickFormatter={money}
            stroke="#8E95A1"
            tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }}
            tickLine={false}
            axisLine={false}
            width={78}
          />
          <Tooltip
            contentStyle={{
              background: "#111317",
              border: "1px solid #262A31",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#ECEFF3" }}
            formatter={(value, name) => [money(Number(value)), String(name)]}
          />
          {target !== null && (
            <ReferenceLine
              y={target}
              stroke="#67E8F9"
              strokeDasharray="6 4"
              label={{
                value: labels.target,
                fill: "#67E8F9",
                fontSize: 11,
                position: "insideTopLeft",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="balance"
            name={labels.balance}
            stroke="#22D3EE"
            strokeWidth={2}
            fill="url(#balanceFill)"
            dot={{ r: 2.5, fill: "#22D3EE" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="stepAfter"
            dataKey="threshold"
            name={labels.threshold}
            stroke="#FF4D6A"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </figure>
  );
}
