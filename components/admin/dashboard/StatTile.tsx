"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";

interface StatTileProps {
  label: string;
  /** Already formatted, e.g. "KES 1.9M" */
  value: string;
  /** Change vs the previous period in %, e.g. 12.4 or -3.1 */
  changePercent?: number;
  /** Values for the small trend line under the number (oldest first) */
  trend?: number[];
}

/** One headline number: label, value, change vs last period, small trend line. */
export default function StatTile({ label, value, changePercent, trend }: StatTileProps) {
  const isUp = (changePercent ?? 0) >= 0;
  const data = (trend ?? []).map((point, index) => ({ index, point }));

  return (
    <div className="luma-card dash-tile h-100">
      <div className="dash-tile-label">{label}</div>
      <div className="dash-tile-value">{value}</div>

      {changePercent !== undefined && (
        <div className={`dash-tile-change ${isUp ? "is-up" : "is-down"}`}>
          {/* Arrow + sign + text, so the change never relies on colour alone */}
          {isUp ? <FiArrowUpRight aria-hidden="true" /> : <FiArrowDownRight aria-hidden="true" />}
          {isUp ? "+" : ""}
          {changePercent.toFixed(1)}%
          <span className="dash-tile-change-note">vs previous period</span>
        </div>
      )}

      {data.length > 1 && (
        <div className="dash-tile-spark" aria-hidden="true">
          <ResponsiveContainer width="100%" height={36}>
            <LineChart data={data} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
              <Line
                dataKey="point"
                type="monotone"
                stroke="var(--luma-chart-muted)"
                strokeWidth={2}
                isAnimationActive={false}
                // Only the latest point gets a dot, in the accent colour
                dot={({ index, cx, cy }) =>
                  index === data.length - 1 ? (
                    <circle
                      key="last"
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="var(--luma-chart)"
                      stroke="var(--luma-surface)"
                      strokeWidth={2}
                    />
                  ) : (
                    <g key={index} />
                  )
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
