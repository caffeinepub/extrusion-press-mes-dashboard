import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";
import { SubTabBar } from "../ui/SubTabBar";

interface TotalDelayTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalDelay: number;
}

const SUB_TABS = ["By Press", "By Reason", "Trend"];

const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];

const BASE_DELAYS = [18, 180, 20, 15, 12];
const TOP_REASONS = [
  "Die Change",
  "Breakdown",
  "Maintenance",
  "Setup",
  "Operator Delay",
];
const SETUP_TIMES = [8, 45, 10, 7, 6];
const IDLE_TIMES = [10, 135, 10, 8, 6];
const BASE_DELAY_SUM = BASE_DELAYS.reduce((a, b) => a + b, 0);

const DELAY_REASONS = [
  { reason: "Die Change", baseMin: 85, occurrences: 14, color: "#3b82f6" },
  { reason: "Breakdown", baseMin: 180, occurrences: 2, color: "#ef4444" },
  { reason: "Maintenance", baseMin: 42, occurrences: 6, color: "#14b8a6" },
  { reason: "Setup", baseMin: 28, occurrences: 12, color: "#2563eb" },
  { reason: "Operator Delay", baseMin: 22, occurrences: 8, color: "#8b5cf6" },
  { reason: "Power Outage", baseMin: 15, occurrences: 1, color: "#ec4899" },
  { reason: "Material Wait", baseMin: 18, occurrences: 4, color: "#f59e0b" },
];

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TREND_BASE: Record<string, number[]> = {
  P3300: [22, 18, 25, 19, 17, 20, 18],
  P2500: [190, 180, 175, 200, 185, 178, 180],
  P1800: [18, 22, 20, 19, 24, 21, 20],
  P1460: [14, 17, 15, 16, 13, 15, 15],
  P1100: [10, 12, 11, 13, 12, 11, 12],
};

const STATUS_STYLES: Record<
  PressData["status"],
  { bg: string; color: string; label: string }
> = {
  Running: { bg: "#dcfce7", color: "#16a34a", label: "RUNNING" },
  Idle: { bg: "#fef3c722", color: "#f59e0b", label: "IDLE" },
  Breakdown: { bg: "#fee2e2", color: "#ef4444", label: "BREAKDOWN" },
  Setup: { bg: "#dbeafe", color: "#3b82f6", label: "SETUP" },
};

function delayColor(min: number): string {
  if (min > 60) return "#dc2626";
  if (min >= 20) return "#ea580c";
  return "#475569";
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
              {typeof p.value === "number" ? p.value.toFixed(0) : p.value} min
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TotalDelayTab({
  presses,
  filterBadge,
  totalDelay,
}: TotalDelayTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [pressFilter, setPressFilter] = useState("All");
  const [trendPress, setTrendPress] = useState("All");

  // Build scaled press delay data
  const pressDelayData = presses.map((p, i) => {
    const scaledDelay = Math.round(
      (BASE_DELAYS[i] / BASE_DELAY_SUM) * totalDelay,
    );
    const scale = scaledDelay / Math.max(1, BASE_DELAYS[i]);
    return {
      press: `${p.id} ${p.name}`,
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      delayMin: scaledDelay,
      topReason: TOP_REASONS[i],
      setupTime: Math.round(SETUP_TIMES[i] * scale),
      idleTime: Math.round(IDLE_TIMES[i] * scale),
      delayPct: ((scaledDelay / totalDelay) * 100).toFixed(1),
      color: PRESS_COLORS[i],
    };
  });

  const totalDelayMin = pressDelayData.reduce((a, b) => a + b.delayMin, 0);
  const avgDelayPerPress = totalDelayMin / Math.max(1, pressDelayData.length);
  const maxDelayPress = pressDelayData.reduce(
    (max, p) => (p.delayMin > max.delayMin ? p : max),
    pressDelayData[0] ?? { pressId: "—", delayMin: 0 },
  );
  const budgetDelay = Math.round(totalDelay * 0.8);
  const budgetPct = Math.min(100, (totalDelayMin / budgetDelay) * 100).toFixed(
    1,
  );

  // Reason data scaled proportionally
  const reasonBaseSum = DELAY_REASONS.reduce((a, b) => a + b.baseMin, 0);
  const reasonData = DELAY_REASONS.map((r) => ({
    ...r,
    totalMin: Math.round((r.baseMin / reasonBaseSum) * totalDelay),
    avgMinOcc: Math.round(r.baseMin / r.occurrences),
  }));
  const reasonTotalMin = reasonData.reduce((a, b) => a + b.totalMin, 0);

  // Trend data
  const trendData = TREND_DAYS.map((day, di) => {
    const row: Record<string, string | number> = { day };
    if (trendPress === "All") {
      const allPresses = Object.keys(TREND_BASE);
      let total = 0;
      for (const key of allPresses) {
        total += TREND_BASE[key][di];
      }
      row["Fleet Total"] = total;
    } else {
      row[trendPress] = TREND_BASE[trendPress]?.[di] ?? 0;
    }
    return row;
  });

  const trendValues =
    trendPress === "All"
      ? trendData.map((d) => d["Fleet Total"] as number)
      : trendData.map((d) => d[trendPress] as number);
  const bestDay = TREND_DAYS[trendValues.indexOf(Math.min(...trendValues))];
  const worstDay = TREND_DAYS[trendValues.indexOf(Math.max(...trendValues))];
  const avgTrend = (
    trendValues.reduce((a, b) => a + b, 0) / trendValues.length
  ).toFixed(0);
  const trend = trendValues[6] < trendValues[0] ? "↓ Improving" : "↑ Worsening";

  const filteredPressData =
    pressFilter === "All"
      ? pressDelayData
      : pressDelayData.filter((p) => p.pressId === pressFilter);

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
              background: "#eff6ff",
              color: "#1d4ed8",
              borderColor: "#bfdbfe",
            }}
          >
            {filterBadge}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* By Press */}
        {subTab === "By Press" && (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Fleet Delay",
                  value: `${totalDelayMin} min`,
                  color: "#dc2626",
                  bg: "#fef2f2",
                },
                {
                  label: "Avg Delay / Press",
                  value: `${avgDelayPerPress.toFixed(0)} min`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  label: "Max Delay Press",
                  value: maxDelayPress?.pressId ?? "—",
                  color: "#7c3aed",
                  bg: "#faf5ff",
                },
                {
                  label: "Delay Budget",
                  value: `${budgetPct}%`,
                  color: Number(budgetPct) > 100 ? "#dc2626" : "#16a34a",
                  bg: Number(budgetPct) > 100 ? "#fef2f2" : "#f0fdf4",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: k.bg, border: `1px solid ${k.color}30` }}
                >
                  <div
                    className="font-black tabular-nums text-xl"
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

            {/* Bar Chart */}
            <div
              className="rounded-lg p-4"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "#1e3a5f" }}
                >
                  Delay Minutes by Press
                </h3>
                <select
                  value={pressFilter}
                  onChange={(e) => setPressFilter(e.target.value)}
                  className="text-[10px] px-2 py-1 rounded border"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#f8fafc",
                    color: "#475569",
                    outline: "none",
                  }}
                  data-ocid="total_delay.press.select"
                >
                  <option value="All">All Presses</option>
                  {presses.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={filteredPressData}
                  margin={{ top: 4, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="press"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="delayMin"
                    name="Delay (min)"
                    radius={[3, 3, 0, 0]}
                    fill="#dc2626"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
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
                      "DELAY (MIN)",
                      "TOP REASON",
                      "SETUP TIME",
                      "IDLE TIME",
                      "DELAY %",
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
                  {filteredPressData.map((row, idx) => {
                    const st = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`total_delay.press.row.${idx + 1}`}
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
                            style={{
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.color}30`,
                            }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: delayColor(row.delayMin),
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.delayMin}
                        </td>
                        <td
                          className="px-3 py-2.5 text-[10px]"
                          style={{ color: "#475569" }}
                        >
                          {row.topReason}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.setupTime} min
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.idleTime} min
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{
                                background: "#e2e8f0",
                                minWidth: "60px",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.delayPct}%`,
                                  background: delayColor(row.delayMin),
                                  opacity: 0.8,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                              style={{
                                color: row.color,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {row.delayPct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#fef2f2",
                      borderTop: "2px solid #dc2626",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: "#dc2626" }}
                      colSpan={2}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalDelayMin}
                    </td>
                    <td
                      className="px-3 py-2.5 text-[10px]"
                      style={{ color: "#64748b" }}
                    >
                      —
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {pressDelayData.reduce((a, b) => a + b.setupTime, 0)} min
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {pressDelayData.reduce((a, b) => a + b.idleTime, 0)} min
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* By Reason */}
        {subTab === "By Reason" && (
          <>
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
                Delay by Category (Minutes)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={reasonData}
                  layout="vertical"
                  margin={{ top: 4, right: 40, left: 80, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="reason"
                    type="category"
                    tick={{ fontSize: 9, fill: "#475569" }}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="totalMin"
                    name="Total (min)"
                    radius={[0, 3, 3, 0]}
                    fill="#dc2626"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "REASON",
                      "TOTAL MIN",
                      "PRESS COUNT",
                      "AVG MIN/OCCURRENCE",
                      "% OF TOTAL",
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
                  {reasonData
                    .sort((a, b) => b.totalMin - a.totalMin)
                    .map((row, idx) => {
                      const pct =
                        reasonTotalMin > 0
                          ? ((row.totalMin / reasonTotalMin) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <tr
                          key={row.reason}
                          data-ocid={`total_delay.reason.row.${idx + 1}`}
                          style={{
                            background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: row.color }}
                              />
                              <span
                                className="font-semibold"
                                style={{ color: "#334155" }}
                              >
                                {row.reason}
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-3 py-2.5 tabular-nums font-bold text-right"
                            style={{
                              color: row.color,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.totalMin}
                          </td>
                          <td
                            className="px-3 py-2.5 tabular-nums text-center"
                            style={{
                              color: "#475569",
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.occurrences}
                          </td>
                          <td
                            className="px-3 py-2.5 tabular-nums text-right"
                            style={{
                              color: "#475569",
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.avgMinOcc} min
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex-1 h-2 rounded-full overflow-hidden"
                                style={{
                                  background: "#e2e8f0",
                                  minWidth: "60px",
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${pct}%`,
                                    background: row.color,
                                    opacity: 0.75,
                                  }}
                                />
                              </div>
                              <span
                                className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                                style={{
                                  color: row.color,
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Trend */}
        {subTab === "Trend" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  value: `${avgTrend} min`,
                  color: "#2563eb",
                  bg: "#eff6ff",
                },
                {
                  label: "Trend",
                  value: trend,
                  color: trend.startsWith("↓") ? "#16a34a" : "#dc2626",
                  bg: trend.startsWith("↓") ? "#f0fdf4" : "#fef2f2",
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
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "#1e3a5f" }}
                >
                  7-Day Delay Trend (minutes)
                </h3>
                <select
                  value={trendPress}
                  onChange={(e) => setTrendPress(e.target.value)}
                  className="text-[10px] px-2 py-1 rounded border"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#f8fafc",
                    color: "#475569",
                    outline: "none",
                  }}
                  data-ocid="total_delay.trend.select"
                >
                  <option value="All">Fleet Total</option>
                  {Object.keys(TREND_BASE).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={trendData}
                  margin={{ top: 4, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {trendPress === "All" ? (
                    <Line
                      type="monotone"
                      dataKey="Fleet Total"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#dc2626" }}
                    />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={trendPress}
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#dc2626" }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
