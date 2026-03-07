import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";
import { GrafanaSubTabBar as SubTabBar } from "../grafana/GrafanaSubTabBar";

interface TotalUtilTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalUtil: number;
}

const SUB_TABS = ["Overview", "Press Wise", "Trend"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#6366f1";
const UTIL_TARGET = 85;

const BASE_UTIL = [92.5, 35.2, 88.4, 91.2, 95.8];
const PLANNED_HRS = [8, 8, 8, 8, 8];
const IDLE_HRS = [0.4, 4.8, 0.6, 0.5, 0.2];

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TREND_BASE = [84.2, 87.5, 85.8, 88.1, 86.4, 82.9, 85.2];

const STATUS_STYLES: Record<
  PressData["status"],
  { bg: string; color: string }
> = {
  Running: { bg: "#dcfce7", color: "#16a34a" },
  Idle: { bg: "#fef3c7", color: "#d97706" },
  Breakdown: { bg: "#fee2e2", color: "#dc2626" },
  Setup: { bg: "#dbeafe", color: "#2563eb" },
};

function utilColor(pct: number): string {
  if (pct >= 85) return "#16a34a";
  if (pct >= 70) return "#d97706";
  return "#dc2626";
}
function utilBg(pct: number): string {
  if (pct >= 85) return "#f0fdf4";
  if (pct >= 70) return "#fffbeb";
  return "#fef2f2";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "6px",
          padding: "8px 12px",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>
          {label}
        </p>
        {payload.map((p: any) => (
          <div
            key={p.name}
            style={{ color: p.fill || p.stroke, fontSize: "11px" }}
          >
            {p.name}:{" "}
            <strong>
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}%
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TotalUtilTab({
  presses,
  filterBadge,
  totalUtil,
}: TotalUtilTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressUtilData = presses.map((p, i) => {
    const utilPct = BASE_UTIL[i];
    const plannedHrs = PLANNED_HRS[i];
    const actualHrs = Number.parseFloat(
      ((plannedHrs * utilPct) / 100).toFixed(1),
    );
    const idleHrs = IDLE_HRS[i];
    const vsTarget = Number.parseFloat((utilPct - UTIL_TARGET).toFixed(1));
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      utilPct,
      plannedHrs,
      actualHrs,
      idleHrs,
      vsTarget,
      color: PRESS_COLORS[i],
    };
  });

  const totalPlanned = pressUtilData.reduce((a, b) => a + b.plannedHrs, 0);
  const totalActual = pressUtilData.reduce((a, b) => a + b.actualHrs, 0);
  const totalIdle = pressUtilData.reduce((a, b) => a + b.idleHrs, 0);

  const chartData = pressUtilData.map((p) => ({
    press: p.pressId,
    "Util %": p.utilPct,
    color: p.color,
  }));

  const trendData = TREND_DAYS.map((day, di) => ({
    day,
    "Util %": TREND_BASE[di],
    Target: UTIL_TARGET,
  }));

  const bestDay = TREND_DAYS[TREND_BASE.indexOf(Math.max(...TREND_BASE))];
  const worstDay = TREND_DAYS[TREND_BASE.indexOf(Math.min(...TREND_BASE))];
  const avgTrend = (
    TREND_BASE.reduce((a, b) => a + b, 0) / TREND_BASE.length
  ).toFixed(1);

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />
      {filterBadge && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b"
          style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
        >
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "#64748b" }}
          >
            Filter:
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{
              background: "#eef2ff",
              color: "#4338ca",
              borderColor: "#c7d2fe",
            }}
          >
            {filterBadge}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {subTab === "Overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Fleet Util %",
                  value: `${totalUtil.toFixed(1)}%`,
                  color: utilColor(totalUtil),
                  bg: utilBg(totalUtil),
                },
                {
                  label: "Planned Run Time",
                  value: `${totalPlanned}h`,
                  color: "#3b82f6",
                  bg: "#eff6ff",
                },
                {
                  label: "Actual Run Time",
                  value: `${totalActual.toFixed(1)}h`,
                  color: ACCENT,
                  bg: "#eef2ff",
                },
                {
                  label: "Total Idle Time",
                  value: `${totalIdle.toFixed(1)}h`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: k.bg, border: `1px solid ${k.color}30` }}
                >
                  <div
                    className="font-black text-xl tabular-nums"
                    style={{
                      color: k.color,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {k.value}
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mt-1"
                    style={{ color: "#64748b" }}
                  >
                    {k.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-4"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                className="text-[11px] font-bold uppercase tracking-wider mb-3"
                style={{ color: "#1e3a5f" }}
              >
                Utilization % by Press (Target: {UTIL_TARGET}%)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="press"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={UTIL_TARGET}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                    label={{
                      value: `Target ${UTIL_TARGET}%`,
                      position: "right",
                      fontSize: 9,
                      fill: "#d97706",
                    }}
                  />
                  <Bar
                    dataKey="Util %"
                    fill={ACCENT}
                    radius={[3, 3, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {subTab === "Press Wise" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "PRESS",
                    "STATUS",
                    "PLANNED (HRS)",
                    "ACTUAL (HRS)",
                    "IDLE (HRS)",
                    "UTIL %",
                    "VS TARGET",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left font-bold uppercase tracking-widest whitespace-nowrap"
                      style={{
                        color: "#64748b",
                        fontSize: "9px",
                        borderBottom: "1px solid #e2e8f0",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pressUtilData.map((row, idx) => {
                  const st = STATUS_STYLES[row.status];
                  return (
                    <tr
                      key={row.pressId}
                      data-ocid={`total_util.press.row.${idx + 1}`}
                      style={{
                        background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: row.color }}
                          />
                          <span
                            className="font-bold"
                            style={{
                              color: row.color,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.pressId}
                          </span>
                          <span style={{ color: "#475569" }}>
                            {row.pressName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {row.status.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#475569",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.plannedHrs}h
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums font-bold text-right"
                        style={{
                          color: ACCENT,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.actualHrs}h
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#d97706",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.idleHrs}h
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ background: "#e2e8f0", minWidth: "50px" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${row.utilPct}%`,
                                background: utilColor(row.utilPct),
                                opacity: 0.75,
                              }}
                            />
                          </div>
                          <span
                            className="text-[9px] font-bold tabular-nums w-[40px] text-right shrink-0"
                            style={{
                              color: utilColor(row.utilPct),
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.utilPct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums font-bold text-right"
                        style={{
                          color: row.vsTarget >= 0 ? "#16a34a" : "#dc2626",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.vsTarget >= 0 ? `+${row.vsTarget}` : row.vsTarget}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#eef2ff",
                    borderTop: `2px solid ${ACCENT}`,
                  }}
                >
                  <td
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                    style={{ color: ACCENT }}
                    colSpan={2}
                  >
                    FLEET TOTAL
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#475569",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalPlanned}h
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-black text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalActual.toFixed(1)}h
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#d97706",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalIdle.toFixed(1)}h
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: utilBg(totalUtil),
                        color: utilColor(totalUtil),
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalUtil.toFixed(1)}%
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {subTab === "Trend" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Best Day",
                  value: bestDay,
                  color: "#16a34a",
                  bg: "#f0fdf4",
                },
                {
                  label: "Worst Day",
                  value: worstDay,
                  color: "#dc2626",
                  bg: "#fef2f2",
                },
                {
                  label: "7-Day Avg",
                  value: `${avgTrend}%`,
                  color: ACCENT,
                  bg: "#eef2ff",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: k.bg, border: `1px solid ${k.color}30` }}
                >
                  <div
                    className="font-black text-xl tabular-nums"
                    style={{
                      color: k.color,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {k.value}
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mt-1"
                    style={{ color: "#64748b" }}
                  >
                    {k.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-4"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                className="text-[11px] font-bold uppercase tracking-wider mb-3"
                style={{ color: "#1e3a5f" }}
              >
                7-Day Utilization Trend (%)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={trendData}
                  margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[70, 100]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={UTIL_TARGET}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="Util %"
                    stroke={ACCENT}
                    strokeWidth={2}
                    dot={{ r: 3, fill: ACCENT }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
