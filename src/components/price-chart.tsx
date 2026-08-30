import {
  Area,
  Bar,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import type { Candle } from "@/lib/market";
import { formatPrice, formatUsd } from "@/lib/utils";

function hourLabel(ts: number, lang: string) {
  return new Date(ts * 1000).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
  });
}

export function PriceVolumeChart({
  data,
  compact = false,
  peg = false,
}: {
  data: Candle[];
  compact?: boolean;
  peg?: boolean;
}) {
  const { lang, t } = useI18n();
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-muted">{t.market.error}</p>;
  }

  const rows = data.map((c) => ({
    ...c,
    label: hourLabel(c.t, lang),
  }));
  const fillId = peg ? "nusdPriceFill" : "flyPriceFill";
  const prices = rows.map((r) => r.c).filter(Number.isFinite);
  const lo = prices.length ? Math.min(...prices) : 0.97;
  const hi = prices.length ? Math.max(...prices) : 1.03;
  const domain = peg
    ? [Math.min(0.97, lo * 0.998), Math.max(1.03, hi * 1.002)]
    : (["auto", "auto"] as const);

  return (
    <div className={compact ? "h-28 w-full" : "h-72 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.38} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={compact ? 64 : 48}
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPrice(v)}
            width={64}
            domain={domain}
          />
          <YAxis yAxisId="vol" orientation="right" hide domain={[0, "auto"]} />
          {peg ? (
            <ReferenceLine
              yAxisId="price"
              y={1}
              stroke="var(--color-amber)"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
            />
          ) : null}
          <Tooltip
            cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.35 }}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              color: "var(--color-fg)",
            }}
            formatter={(value, name) => {
              const n = Number(value ?? 0);
              if (name === "c") return [formatPrice(n), t.market.price];
              if (name === "v") return [formatUsd(n), t.market.vol];
              return [formatUsd(n), String(name)];
            }}
            labelFormatter={(label) => String(label)}
          />
          <Bar
            yAxisId="vol"
            dataKey="v"
            fill="var(--color-amber)"
            fillOpacity={0.28}
            radius={[4, 4, 0, 0]}
            maxBarSize={compact ? 10 : 18}
          />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="c"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill={`url(#${fillId})`}
            dot={false}
            activeDot={{ r: 3, fill: "var(--color-primary)" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
