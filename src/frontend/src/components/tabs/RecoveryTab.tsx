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
import { SubTabBar } from "../ui/SubTabBar";

interface RecoveryTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalRecovery: number;
}

const SUB_TABS = ["Overview", "Press Wise", "Trend"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#8b5cf6";
const TARGET = 90;

const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TREND_BASE = [88.5, 89.2, 91.4, 90.8, 92.1, 88.5, 90.0];

const STATUS_STYLES: Record<
  PressData["status"],
  { bg: string; color: string }
> = {
  Running: { bg: "#dcfce7", color: "#16a34a" },
  Idle: { bg: "#fef3c7", color: "#d97706" },
  Breakdown: { bg: "#fee2e2", color: "#dc2626" },
  Setup: { bg: "#dbeafe", color: "#2563eb" },
};

function recColor(pct: number): string {
  if (pct >= 90) return "#16a34a";
  if (pct >= 80) return "#d97706";
  return "#dc2626";
}
function recBg(pct: number): string {
  if (pct >= 90) return "#f0fdf4";
  if (pct >= 80) return "#fffbeb";
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

export function RecoveryTab({
  presses,
  filterBadge,
  totalRecovery,
}: RecoveryTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressRecoveryData = presses.map((p, i) => {
    const inputMT = Number.parseFloat((p.actual * 1.1).toFixed(2));
    const outputMT = p.actual;
    const vsTarget = Number.parseFloat((p.recovery - TARGET).toFixed(1));
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      alloy: p.alloyGrade,
      inputMT,
      outputMT,
      recovery: p.recovery,
      vsTarget,
      color: PRESS_COLORS[i],
    };
  });

  const bestPress = pressRecoveryData.reduce(
    (best, p) => (p.recovery > best.recovery ? p : best),
    pressRecoveryData[0] ?? { pressId: "—", recovery: 0 },
  );
  const worstPress = pressRecoveryData.reduce(
    (worst, p) => (p.recovery < worst.recovery ? p : worst),
    pressRecoveryData[0] ?? { pressId: "—", recovery: 0 },
  );
  const avgInput = pressRecoveryData.reduce((a, b) => a + b.inputMT, 0);
  const avgOutput = pressRecoveryData.reduce((a, b) => a + b.outputMT, 0);
  const inputVsOutput = `${avgInput.toFixed(1)} / ${avgOutput.toFixed(1)} MT`;

  const chartData = pressRecoveryData.map((p) => ({
    press: p.pressId,
    "Recovery %": p.recovery,
    color: p.color,
  }));

  const trendData = TREND_DAYS.map((day, di) => ({
    day,
    "Recovery %": TREND_BASE[di],
    Target: TARGET,
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
        {subTab === "Overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Fleet Recovery %",
                  value: `${totalRecovery.toFixed(1)}%`,
                  color: recColor(totalRecovery),
                  bg: recBg(totalRecovery),
                },
                {
                  label: "Best Press",
                  value: bestPress?.pressId ?? "—",
                  color: "#16a34a",
                  bg: "#f0fdf4",
                },
                {
                  label: "Worst Press",
                  value: worstPress?.pressId ?? "—",
                  color: "#dc2626",
                  bg: "#fef2f2",
                },
                {
                  label: "Input / Output",
                  value: inputVsOutput,
                  color: ACCENT,
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
                Recovery % by Press (Target: 90%)
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
                    domain={[50, 100]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={TARGET}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                    label={{
                      value: "Target 90%",
                      position: "right",
                      fontSize: 9,
                      fill: "#d97706",
                    }}
                  />
                  <Bar
                    dataKey="Recovery %"
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
                    "ALLOY",
                    "INPUT MT",
                    "OUTPUT MT",
                    "RECOVERY %",
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
                {pressRecoveryData.map((row, idx) => {
                  const st = STATUS_STYLES[row.status];
                  return (
                    <tr
                      key={row.pressId}
                      data-ocid={`recovery.press.row.${idx + 1}`}
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
                        className="px-3 py-2.5 font-mono text-[10px]"
                        style={{ color: "#475569" }}
                      >
                        {row.alloy}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#475569",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.inputMT.toFixed(2)}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#475569",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.outputMT.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: recBg(row.recovery),
                            color: recColor(row.recovery),
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.recovery.toFixed(1)}%
                        </span>
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
                    background: "#faf5ff",
                    borderTop: `2px solid ${ACCENT}`,
                  }}
                >
                  <td
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                    style={{ color: ACCENT }}
                    colSpan={3}
                  >
                    FLEET AVG
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#475569",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {avgInput.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#475569",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {avgOutput.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: recBg(totalRecovery),
                        color: recColor(totalRecovery),
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalRecovery.toFixed(1)}%
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
                7-Day Fleet Recovery Trend (%)
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
                    domain={[80, 100]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={TARGET}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="Recovery %"
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
