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
import { GrafanaSubTabBar as SubTabBar } from "../grafana/GrafanaSubTabBar";

interface GasTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalGas: number;
}

const SUB_TABS = ["Overview", "Press Wise", "Trend"];

const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT_COLOR = "#9333ea";

// Base gas consumption per press
const BASE_GAS = [6800, 1200, 4900, 3800, 1700];
const BASE_GAS_SUM = BASE_GAS.reduce((a, b) => a + b, 0);
const BASE_TARGETS = [6500, 6000, 5500, 4800, 4200];
const GAS_PER_MT = [4.8, 8.2, 5.1, 5.4, 4.2];
// Gas cost per Nm³ (₹)
const GAS_COST_PER_NM3 = 12.5;

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Weekly gas trend per press (Nm³)
const TREND_BASE: Record<string, number[]> = {
  P3300: [6200, 6500, 6800, 6400, 7000, 6700, 6800],
  P2500: [5800, 1400, 1300, 1200, 1100, 1200, 1200],
  P1800: [4500, 4700, 4900, 4600, 5100, 4800, 4900],
  P1460: [3400, 3600, 3800, 3700, 3900, 3700, 3800],
  P1100: [1500, 1600, 1700, 1600, 1750, 1650, 1700],
};

function efficiencyColor(pct: number): string {
  if (pct >= 95) return "#16a34a";
  if (pct >= 85) return "#d97706";
  return "#dc2626";
}

function efficiencyBg(pct: number): string {
  if (pct >= 95) return "#f0fdf4";
  if (pct >= 85) return "#fffbeb";
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
              {typeof p.value === "number" ? p.value.toFixed(0) : p.value} Nm³
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function GasTab({ presses, filterBadge, totalGas }: GasTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [pressFilter, setPressFilter] = useState("All");
  const [period, setPeriod] = useState<"Today" | "Week" | "Month">("Today");
  const [trendPress, setTrendPress] = useState("All");

  // Build press gas data scaled from totalGas
  const pressGasData = presses.map((p, i) => {
    const scaledGas = Math.round((BASE_GAS[i] / BASE_GAS_SUM) * totalGas);
    const scaledTarget = Math.round(
      (BASE_TARGETS[i] / BASE_GAS_SUM) * totalGas,
    );
    const effPct =
      scaledTarget > 0
        ? Number.parseFloat(
            Math.min(100, (scaledTarget / scaledGas) * 100).toFixed(1),
          )
        : 0;
    const cost = Math.round(scaledGas * GAS_COST_PER_NM3);
    const variance = scaledGas - scaledTarget;

    return {
      press: p.id,
      pressName: p.name,
      pressId: p.id,
      status: p.status,
      alloy: p.alloyGrade,
      gasConsumed: scaledGas,
      target: scaledTarget,
      gasPerMT: GAS_PER_MT[i],
      efficiency: effPct,
      cost,
      variance,
      color: PRESS_COLORS[i],
    };
  });

  const sumGas = pressGasData.reduce((a, b) => a + b.gasConsumed, 0);
  const sumTarget = pressGasData.reduce((a, b) => a + b.target, 0);
  const totalCost = pressGasData.reduce((a, b) => a + b.cost, 0);
  const avgEfficiency =
    pressGasData.length > 0
      ? Number.parseFloat(
          (
            pressGasData.reduce((a, b) => a + b.efficiency, 0) /
            pressGasData.length
          ).toFixed(1),
        )
      : 0;
  const avgGasPerMT =
    sumGas > 0 && presses.length > 0
      ? Number.parseFloat(
          (
            pressGasData.reduce((a, b) => a + b.gasPerMT, 0) /
            pressGasData.length
          ).toFixed(2),
        )
      : 0;

  // Period multipliers for cost display
  const periodMul = period === "Today" ? 1 : period === "Week" ? 6.8 : 27.5;

  // Chart data
  const chartData = pressGasData.map((p) => ({
    press: p.press,
    "Actual Gas": p.gasConsumed,
    "Target Gas": p.target,
    color: p.color,
  }));

  // Trend data
  const trendData = TREND_DAYS.map((day, di) => {
    const row: Record<string, string | number> = { day };
    if (trendPress === "All") {
      let total = 0;
      for (const key of Object.keys(TREND_BASE)) {
        total += TREND_BASE[key][di];
      }
      row["Fleet Total"] = total;
    } else {
      row[trendPress] = TREND_BASE[trendPress]?.[di] ?? 0;
    }
    return row;
  });

  const filteredPressData =
    pressFilter === "All"
      ? pressGasData
      : pressGasData.filter((p) => p.pressId === pressFilter);

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
              background: "#faf5ff",
              color: "#7c3aed",
              borderColor: "#c4b5fd",
            }}
          >
            {filterBadge}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Overview */}
        {subTab === "Overview" && (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Gas",
                  value: `${sumGas.toLocaleString()} Nm³`,
                  color: ACCENT_COLOR,
                  bg: "#faf5ff",
                },
                {
                  label: "Gas per MT",
                  value: `${avgGasPerMT} Nm³/MT`,
                  color: "#0891b2",
                  bg: "#ecfeff",
                },
                {
                  label: "Gas Cost",
                  value: `₹${Math.round(totalCost * periodMul).toLocaleString()}`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  label: "Gas Efficiency",
                  value: `${avgEfficiency}%`,
                  color: efficiencyColor(avgEfficiency),
                  bg: efficiencyBg(avgEfficiency),
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

            {/* Grouped Bar Chart */}
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
                Actual vs Target Gas Consumption by Press (Nm³)
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
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Actual Gas"
                    fill={ACCENT_COLOR}
                    radius={[3, 3, 0, 0]}
                    opacity={0.85}
                  />
                  <Bar
                    dataKey="Target Gas"
                    fill="#c4b5fd"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-2 rounded-sm"
                    style={{ background: ACCENT_COLOR }}
                  />
                  <span className="text-[9px]" style={{ color: "#64748b" }}>
                    Actual
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-2 rounded-sm"
                    style={{ background: "#c4b5fd" }}
                  />
                  <span className="text-[9px]" style={{ color: "#64748b" }}>
                    Target
                  </span>
                </div>
              </div>
            </div>

            {/* Efficiency color legend */}
            <div
              className="rounded-lg p-3 flex flex-wrap gap-4"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                Efficiency Guide:
              </span>
              {[
                { label: "≥95% — Excellent", color: "#16a34a" },
                { label: "85–94% — Watch", color: "#d97706" },
                { label: "<85% — Action Required", color: "#dc2626" },
              ].map((e) => (
                <div key={e.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: e.color }}
                  />
                  <span className="text-[9px]" style={{ color: "#64748b" }}>
                    {e.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Press Wise */}
        {subTab === "Press Wise" && (
          <>
            <div className="flex items-center gap-3 mb-2">
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
                data-ocid="gas.press.select"
              >
                <option value="All">All Presses</option>
                {presses.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} {p.name}
                  </option>
                ))}
              </select>
            </div>

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
                      "ALLOY",
                      "GAS CONSUMED (Nm³)",
                      "TARGET (Nm³)",
                      "GAS/MT",
                      "EFFICIENCY %",
                      "COST (₹)",
                      "VARIANCE",
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
                  {filteredPressData.map((row, idx) => (
                    <tr
                      key={row.pressId}
                      data-ocid={`gas.press.row.${idx + 1}`}
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
                            background:
                              row.status === "Running"
                                ? "#dcfce7"
                                : row.status === "Breakdown"
                                  ? "#fee2e2"
                                  : row.status === "Setup"
                                    ? "#dbeafe"
                                    : "#fef3c7",
                            color:
                              row.status === "Running"
                                ? "#16a34a"
                                : row.status === "Breakdown"
                                  ? "#dc2626"
                                  : row.status === "Setup"
                                    ? "#2563eb"
                                    : "#d97706",
                          }}
                        >
                          {row.status.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 text-[10px] font-mono"
                        style={{ color: "#475569" }}
                      >
                        {row.alloy}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right font-bold"
                        style={{
                          color: ACCENT_COLOR,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.gasConsumed.toLocaleString()}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#475569",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.target.toLocaleString()}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#475569",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.gasPerMT}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: "#e2e8f0", width: "40px" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${row.efficiency}%`,
                                background: efficiencyColor(row.efficiency),
                              }}
                            />
                          </div>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: efficiencyBg(row.efficiency),
                              color: efficiencyColor(row.efficiency),
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.efficiency}%
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#d97706",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        ₹{row.cost.toLocaleString()}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right font-bold"
                        style={{
                          color: row.variance > 0 ? "#dc2626" : "#16a34a",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.variance > 0
                          ? `+${row.variance.toLocaleString()}`
                          : row.variance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#faf5ff",
                      borderTop: `2px solid ${ACCENT_COLOR}`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: ACCENT_COLOR }}
                      colSpan={3}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumGas.toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumTarget.toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgGasPerMT}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: efficiencyBg(avgEfficiency),
                          color: efficiencyColor(avgEfficiency),
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {avgEfficiency}%
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      ₹{totalCost.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* Trend */}
        {subTab === "Trend" && (
          <>
            {/* Period toggle */}
            <div className="flex items-center gap-2">
              {(["Today", "Week", "Month"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                  data-ocid="gas.period.toggle"
                  style={{
                    background: period === p ? ACCENT_COLOR : "#f1f5f9",
                    color: period === p ? "#ffffff" : "#64748b",
                    border: "none",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Total Gas Cost",
                  value: `₹${Math.round(totalCost * periodMul).toLocaleString()}`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  label: "Avg Daily Gas",
                  value: `${(sumGas / 1).toFixed(0)} Nm³`,
                  color: ACCENT_COLOR,
                  bg: "#faf5ff",
                },
                {
                  label: "Best Efficiency Day",
                  value: "Thursday",
                  color: "#16a34a",
                  bg: "#f0fdf4",
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
                  7-Day Gas Consumption Trend (Nm³)
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
                  data-ocid="gas.trend.select"
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
                  margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
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
                      stroke={ACCENT_COLOR}
                      strokeWidth={2}
                      dot={{ r: 3, fill: ACCENT_COLOR }}
                    />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={trendPress}
                      stroke={ACCENT_COLOR}
                      strokeWidth={2}
                      dot={{ r: 3, fill: ACCENT_COLOR }}
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
