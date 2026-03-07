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

interface PPPlanVsActualTabProps {
  presses: PressData[];
  filterBadge?: string;
}

const SUB_TABS = ["Press Wise", "Shift Wise", "Trend"];

const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];

const SHIFT_DATA = [
  {
    shift: "Shift A",
    planned: 555,
    actual: 520,
    bestPress: "P1100",
    worstPress: "P2500",
  },
  {
    shift: "Shift B",
    planned: 555,
    actual: 468,
    bestPress: "P3300",
    worstPress: "P2500",
  },
  {
    shift: "Shift C",
    planned: 555,
    actual: 425,
    bestPress: "P1100",
    worstPress: "P2500",
  },
];

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FLEET_TREND = [93.5, 89.2, 91.4, 87.8, 92.1, 88.5, 90.0];

function achievementColor(pct: number): {
  bg: string;
  color: string;
  border: string;
} {
  if (pct >= 90)
    return { bg: "#f0fdf4", color: "#16a34a", border: "#22c55e30" };
  if (pct >= 70)
    return { bg: "#fffbeb", color: "#d97706", border: "#f59e0b30" };
  return { bg: "#fef2f2", color: "#dc2626", border: "#ef444430" };
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
              {typeof p.value === "number"
                ? p.dataKey === "achievement"
                  ? `${p.value.toFixed(1)}%`
                  : `${p.value} shots`
                : p.value}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PPPlanVsActualTab({
  presses,
  filterBadge,
}: PPPlanVsActualTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  // Build press-wise chart data
  const pressChartData = presses.map((p, i) => {
    const inputKgH = p.kgPerHour;
    const outputKgH = Number.parseFloat(
      (inputKgH * (p.recovery / 100)).toFixed(1),
    );
    const ioRatio =
      inputKgH > 0
        ? Number.parseFloat(((outputKgH / inputKgH) * 100).toFixed(1))
        : 0;
    return {
      press: `${p.id}`,
      pressName: p.name,
      planned: p.ppPlanBillets,
      actual: p.ppActBillets,
      achievement:
        p.ppPlanBillets > 0
          ? Number.parseFloat(
              ((p.ppActBillets / p.ppPlanBillets) * 100).toFixed(1),
            )
          : 0,
      shortfall: Math.max(0, p.ppPlanBillets - p.ppActBillets),
      alloy: p.alloyGrade,
      dieNo: p.dieNumber,
      color: PRESS_COLORS[i],
      status: p.status,
      inputKgH,
      outputKgH,
      ioRatio,
    };
  });

  const totalPlanned = pressChartData.reduce((a, b) => a + b.planned, 0);
  const totalActual = pressChartData.reduce((a, b) => a + b.actual, 0);
  const totalShortfall = pressChartData.reduce((a, b) => a + b.shortfall, 0);
  const fleetAchievement =
    totalPlanned > 0
      ? Number.parseFloat(((totalActual / totalPlanned) * 100).toFixed(1))
      : 0;

  const achStyle = achievementColor(fleetAchievement);

  // Trend data
  const trendData = TREND_DAYS.map((day, i) => ({
    day,
    achievement: FLEET_TREND[i],
  }));

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
        {/* Press Wise */}
        {subTab === "Press Wise" && (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Fleet Plan Achievement",
                  value: `${fleetAchievement}%`,
                  color: achStyle.color,
                  bg: achStyle.bg,
                },
                {
                  label: "Total Planned Shots",
                  value: totalPlanned.toString(),
                  color: "#2563eb",
                  bg: "#eff6ff",
                },
                {
                  label: "Total Actual Shots",
                  value: totalActual.toString(),
                  color: "#0891b2",
                  bg: "#ecfeff",
                },
                {
                  label: "Shortfall Shots",
                  value: totalShortfall.toString(),
                  color: totalShortfall > 0 ? "#dc2626" : "#16a34a",
                  bg: totalShortfall > 0 ? "#fef2f2" : "#f0fdf4",
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
                Plan vs Actual Shots by Press
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={pressChartData}
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
                    dataKey="planned"
                    name="Planned Shots"
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="actual"
                    name="Actual Shots"
                    fill="#22c55e"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detail Table */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "PRESS",
                      "ALLOY",
                      "DIE NO",
                      "PLAN SHOTS",
                      "ACTUAL SHOTS",
                      "INPUT vs OUTPUT (Kg/H)",
                      "ACHIEVEMENT %",
                      "SHORTFALL",
                      "STATUS",
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
                  {pressChartData.map((row, idx) => {
                    const ach = achievementColor(row.achievement);
                    return (
                      <tr
                        key={row.press}
                        data-ocid={`pp_plan_vs_actual.press.row.${idx + 1}`}
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
                              {row.press}
                            </span>
                            <span style={{ color: "#475569" }}>
                              {row.pressName}
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-3 py-2.5 font-mono text-[10px]"
                          style={{ color: "#475569" }}
                        >
                          {row.alloy}
                        </td>
                        <td
                          className="px-3 py-2.5 font-mono text-[10px]"
                          style={{ color: "#475569" }}
                        >
                          {row.dieNo}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right font-bold"
                          style={{
                            color: "#2563eb",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.planned}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right font-bold"
                          style={{
                            color: "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.actual}
                        </td>
                        <td className="px-3 py-2.5 min-w-[140px]">
                          <div className="flex flex-col gap-0.5">
                            <div
                              className="flex items-center justify-between text-[10px] tabular-nums font-semibold"
                              style={{
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              <span style={{ color: "#2563eb" }}>
                                {row.inputKgH}
                              </span>
                              <span
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "9px",
                                  margin: "0 3px",
                                }}
                              >
                                →
                              </span>
                              <span style={{ color: "#16a34a" }}>
                                {row.outputKgH}
                              </span>
                              <span
                                className="ml-1 text-[9px] font-bold px-1 py-0.5 rounded"
                                style={{
                                  background:
                                    row.ioRatio >= 90
                                      ? "#f0fdf4"
                                      : row.ioRatio >= 80
                                        ? "#fffbeb"
                                        : "#fef2f2",
                                  color:
                                    row.ioRatio >= 90
                                      ? "#16a34a"
                                      : row.ioRatio >= 80
                                        ? "#d97706"
                                        : "#dc2626",
                                }}
                              >
                                {row.ioRatio}%
                              </span>
                            </div>
                            <div
                              className="w-full rounded-full h-1.5 overflow-hidden"
                              style={{ background: "#e2e8f0" }}
                            >
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(row.ioRatio, 100)}%`,
                                  background:
                                    row.ioRatio >= 90
                                      ? "#22c55e"
                                      : row.ioRatio >= 80
                                        ? "#f59e0b"
                                        : "#ef4444",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold tabular-nums"
                            style={{
                              background: ach.bg,
                              color: ach.color,
                              border: `1px solid ${ach.border}`,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.achievement}%
                          </span>
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: row.shortfall > 0 ? "#dc2626" : "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: "bold",
                          }}
                        >
                          {row.shortfall > 0 ? `-${row.shortfall}` : "0"}
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
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#eff6ff",
                      borderTop: "2px solid #3b82f6",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: "#2563eb" }}
                      colSpan={3}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#2563eb",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalPlanned}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalActual}
                    </td>
                    <td className="px-3 py-2.5">
                      {(() => {
                        const totalInput = pressChartData.reduce(
                          (a, b) => a + b.inputKgH,
                          0,
                        );
                        const totalOutput = pressChartData.reduce(
                          (a, b) => a + b.outputKgH,
                          0,
                        );
                        const fleetIORatio =
                          totalInput > 0
                            ? Number.parseFloat(
                                ((totalOutput / totalInput) * 100).toFixed(1),
                              )
                            : 0;
                        return (
                          <div className="flex flex-col gap-0.5">
                            <div
                              className="flex items-center gap-1 text-[10px] tabular-nums font-semibold"
                              style={{
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              <span style={{ color: "#2563eb" }}>
                                {totalInput.toFixed(0)}
                              </span>
                              <span
                                style={{ color: "#94a3b8", fontSize: "9px" }}
                              >
                                →
                              </span>
                              <span style={{ color: "#16a34a" }}>
                                {totalOutput.toFixed(0)}
                              </span>
                              <span
                                className="ml-1 text-[9px] font-bold px-1 py-0.5 rounded"
                                style={{
                                  background:
                                    fleetIORatio >= 90
                                      ? "#f0fdf4"
                                      : fleetIORatio >= 80
                                        ? "#fffbeb"
                                        : "#fef2f2",
                                  color:
                                    fleetIORatio >= 90
                                      ? "#16a34a"
                                      : fleetIORatio >= 80
                                        ? "#d97706"
                                        : "#dc2626",
                                }}
                              >
                                {fleetIORatio}%
                              </span>
                            </div>
                            <div
                              className="w-full rounded-full h-1.5 overflow-hidden"
                              style={{ background: "#e2e8f0" }}
                            >
                              <div
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(fleetIORatio, 100)}%`,
                                  background:
                                    fleetIORatio >= 90
                                      ? "#22c55e"
                                      : fleetIORatio >= 80
                                        ? "#f59e0b"
                                        : "#ef4444",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-bold tabular-nums"
                        style={{
                          background: achStyle.bg,
                          color: achStyle.color,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {fleetAchievement}%
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: totalShortfall > 0 ? "#dc2626" : "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalShortfall > 0 ? `-${totalShortfall}` : "0"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* Shift Wise */}
        {subTab === "Shift Wise" && (
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
                Plan vs Actual Shots by Shift
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={SHIFT_DATA}
                  margin={{ top: 4, right: 12, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shift"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="planned"
                    name="Planned Shots"
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="actual"
                    name="Actual Shots"
                    fill="#22c55e"
                    radius={[3, 3, 0, 0]}
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
                      "SHIFT",
                      "TOTAL PLANNED",
                      "TOTAL ACTUAL",
                      "ACHIEVEMENT %",
                      "BEST PRESS",
                      "WORST PRESS",
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
                  {SHIFT_DATA.map((row, idx) => {
                    const ach =
                      row.planned > 0
                        ? Number.parseFloat(
                            ((row.actual / row.planned) * 100).toFixed(1),
                          )
                        : 0;
                    const achStyle2 = achievementColor(ach);
                    return (
                      <tr
                        key={row.shift}
                        data-ocid={`pp_plan_vs_actual.shift.row.${idx + 1}`}
                        style={{
                          background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <td
                          className="px-3 py-2.5 font-bold"
                          style={{
                            color: "#1e3a5f",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.shift}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right font-bold"
                          style={{
                            color: "#2563eb",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.planned}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right font-bold"
                          style={{
                            color: "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.actual}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold tabular-nums"
                            style={{
                              background: achStyle2.bg,
                              color: achStyle2.color,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {ach}%
                          </span>
                        </td>
                        <td
                          className="px-3 py-2.5 text-[10px]"
                          style={{ color: "#16a34a" }}
                        >
                          {row.bestPress}
                        </td>
                        <td
                          className="px-3 py-2.5 text-[10px]"
                          style={{ color: "#dc2626" }}
                        >
                          {row.worstPress}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Today vs Yesterday",
                  value: `${FLEET_TREND[6].toFixed(1)}% vs ${FLEET_TREND[5].toFixed(1)}%`,
                  color:
                    FLEET_TREND[6] >= FLEET_TREND[5] ? "#16a34a" : "#dc2626",
                  bg: FLEET_TREND[6] >= FLEET_TREND[5] ? "#f0fdf4" : "#fef2f2",
                },
                {
                  label: "7-Day Average",
                  value: `${(FLEET_TREND.reduce((a, b) => a + b, 0) / FLEET_TREND.length).toFixed(1)}%`,
                  color: "#2563eb",
                  bg: "#eff6ff",
                },
                {
                  label: "Best / Worst Day",
                  value: `${Math.max(...FLEET_TREND).toFixed(1)}% / ${Math.min(...FLEET_TREND).toFixed(1)}%`,
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
                    className="font-black text-base tabular-nums"
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
                7-Day Plan Achievement % Trend (Fleet Average)
              </h3>
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
                    domain={[80, 100]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="achievement"
                    name="Achievement %"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6" }}
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
