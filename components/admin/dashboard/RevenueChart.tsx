"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";

import { formatCompact, formatPrice } from "@/app/lib/format";
import type { SalesPoint } from "@/app/lib/admin/dashboardSampleData";

/** The hover box: the amount first (that's what you want), then the day and orders. */
function RevenueTooltip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as SalesPoint;

  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip-value">
        <span className="dash-tooltip-key" />
        {formatPrice(point.revenue)}
      </div>
      <div className="dash-tooltip-label">
        {point.label} · {point.orders} orders
      </div>
    </div>
  );
}

/** Revenue over time: one line with a light fill under it. */
export default function RevenueChart({ points }: { points: SalesPoint[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={points} margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
          {/* Horizontal hairlines only, so they stay in the background */}
          <CartesianGrid vertical={false} stroke="var(--luma-border)" />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--luma-muted)", fontSize: 12 }}
            minTickGap={24}
          />

          <YAxis
            tickFormatter={formatCompact}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--luma-muted)", fontSize: 12 }}
            width={48}
          />

          {/* A thin vertical line follows the mouse and the box shows that day */}
          <Tooltip
            content={RevenueTooltip}
            cursor={{ stroke: "var(--luma-muted)", strokeWidth: 1 }}
          />

          <Area
            dataKey="revenue"
            type="monotone"
            stroke="var(--luma-chart)"
            strokeWidth={2}
            fill="var(--luma-chart)"
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: "var(--luma-chart)", stroke: "var(--luma-surface)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* The same numbers without hovering (and for screen readers) */}
      <details className="dash-table-toggle">
        <summary>Show as a table</summary>
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th>Period</th>
              <th className="text-end">Orders</th>
              <th className="text-end">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <td>{point.label}</td>
                <td className="text-end">{point.orders}</td>
                <td className="text-end">{formatPrice(point.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
