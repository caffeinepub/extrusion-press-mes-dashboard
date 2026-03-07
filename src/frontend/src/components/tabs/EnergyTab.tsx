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

interface EnergyTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalEnergy: number;
}

const SUB_TABS = ["Overview", "Press Wise", "Trend"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#f97316";

const BASE_ENERGY = [98, 15, 78, 55, 29];
const BASE_ENERGY_SUM = BASE_ENERGY.reduce((a, b) => a + b, 0);
const ENERGY_COST_PER_KWH = 8.5;
const BASE_ENERGY_MT = [26.5, 38.2, 28.1, 27.4, 24.8];

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TREND_BASE = [268.5, 271.2, 278.4, 265.8, 282.6, 273.5, 275.0];

function effColor(kwhPerMT: number): string {
  if (kwhPerMT <= 27) return "#16a34a";
  if (kwhPerMT <= 30) return "#d97706";
  return "#dc2626";
}
function effBg(kwhPerMT: number): string {
  if (kwhPerMT <= 27) return "#f0fdf4";
  if (kwhPerMT <= 30) return "#fffbeb";
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
              {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function EnergyTab({
  presses,
  filterBadge,
  totalEnergy,
}: EnergyTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [period, setPeriod] = useState<"Today" | "Week" | "Month">("Today");

  const periodMul = period === "Today" ? 1 : period === "Week" ? 6.8 : 27.5;

  const pressEnergyData = presses.map((p, i) => {
    const energyKwh = Number.parseFloat(
      ((BASE_ENERGY[i] / BASE_ENERGY_SUM) * totalEnergy).toFixed(2),
    );
    const energyPerMT = Number.parseFloat(BASE_ENERGY_MT[i].toFixed(2));
    const cost = Number.parseFloat(
      (energyKwh * ENERGY_COST_PER_KWH).toFixed(2),
    );
    const effPct = Number.parseFloat(
      Math.max(0, 100 - (energyPerMT - 25) * 3).toFixed(2),
    );
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      energyKwh,
      energyPerMT,
      cost,
      effPct,
      color: PRESS_COLORS[i],
    };
  });

  const totalKwh = Number.parseFloat(
    pressEnergyData.reduce((a, b) => a + b.energyKwh, 0).toFixed(2),
  );
  const avgEnergyPerMT = Number.parseFloat(
    (
      pressEnergyData.reduce((a, b) => a + b.energyPerMT, 0) /
      Math.max(1, pressEnergyData.length)
    ).toFixed(2),
  );
  const totalCost = Number.parseFloat(
    pressEnergyData.reduce((a, b) => a + b.cost, 0).toFixed(2),
  );
  const peakDemand = Number.parseFloat((totalKwh * 0.75).toFixed(2));

  const chartData = pressEnergyData.map((p) => ({
    press: p.pressId,
    "Energy (kWh)": p.energyKwh,
    color: p.color,
  }));

  const trendData = TREND_DAYS.map((day, di) => ({
    day,
    "Energy (kWh)": Number.parseFloat(TREND_BASE[di].toFixed(2)),
  }));

  const avgTrendEnergy = Number.parseFloat(
    (TREND_BASE.reduce((a, b) => a + b, 0) / TREND_BASE.length).toFixed(2),
  );
  const bestDay = TREND_DAYS[TREND_BASE.indexOf(Math.min(...TREND_BASE))];
  const worstDay = TREND_DAYS[TREND_BASE.indexOf(Math.max(...TREND_BASE))];

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
              background: "#fff7ed",
              color: "#c2410c",
              borderColor: "#fed7aa",
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
                  label: "Total Energy kWh",
                  value: `${totalKwh.toFixed(2)} kWh`,
                  color: ACCENT,
                  bg: "#fff7ed",
                },
                {
                  label: "Energy/MT",
                  value: `${avgEnergyPerMT.toFixed(2)} kWh/MT`,
                  color: effColor(avgEnergyPerMT),
                  bg: effBg(avgEnergyPerMT),
                },
                {
                  label: "Energy Cost ₹",
                  value: `₹${totalCost.toFixed(2)}`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  label: "Peak Demand kW",
                  value: `${peakDemand.toFixed(2)} kW`,
                  color: "#7c3aed",
                  bg: "#faf5ff",
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
                Energy Consumption by Press (kWh)
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
                    dataKey="Energy (kWh)"
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
                    "ENERGY (KWH)",
                    "ENERGY/MT",
                    "COST (₹)",
                    "EFFICIENCY %",
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
                {pressEnergyData.map((row, idx) => (
                  <tr
                    key={row.pressId}
                    data-ocid={`energy.press.row.${idx + 1}`}
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
                        className="px-2 py-0.5 rounded text-[9px] font-bold"
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
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.energyKwh.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: effColor(row.energyPerMT),
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.energyPerMT.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      ₹{row.cost.toFixed(2)}
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
                              width: `${Math.min(100, row.effPct)}%`,
                              background: ACCENT,
                              opacity: 0.75,
                            }}
                          />
                        </div>
                        <span
                          className="text-[9px] font-bold tabular-nums w-[44px] text-right shrink-0"
                          style={{
                            color: ACCENT,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.effPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#fff7ed",
                    borderTop: `2px solid ${ACCENT}`,
                  }}
                >
                  <td
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                    style={{ color: ACCENT }}
                    colSpan={2}
                  >
                    TOTAL / FLEET
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-black text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalKwh.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: effColor(avgEnergyPerMT),
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {avgEnergyPerMT.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#d97706",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    ₹{totalCost.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {subTab === "Trend" && (
          <>
            <div className="flex items-center gap-2 mb-2">
              {(["Today", "Week", "Month"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                  data-ocid="energy.period.toggle"
                  style={{
                    background: period === p ? ACCENT : "#f1f5f9",
                    color: period === p ? "#ffffff" : "#64748b",
                    border: "none",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

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
                  value: `${avgTrendEnergy.toFixed(2)} kWh`,
                  color: ACCENT,
                  bg: "#fff7ed",
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
                7-Day Energy Trend (kWh)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={trendData.map((d) => ({
                    ...d,
                    "Energy (kWh)": Number.parseFloat(
                      (d["Energy (kWh)"] * periodMul).toFixed(2),
                    ),
                  }))}
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
                  <Line
                    type="monotone"
                    dataKey="Energy (kWh)"
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
