import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";
import { GrafanaSubTabBar as SubTabBar } from "../grafana/GrafanaSubTabBar";

interface TotalOutputTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalOutput: number;
}

const SUB_TABS = ["Overview", "Press Wise", "Shift Wise"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#10b981";

const BASE_OUTPUT = [2520, 760, 2380, 1580, 2760];
const BASE_OUTPUT_SUM = BASE_OUTPUT.reduce((a, b) => a + b, 0);
const BASE_YIELD = [91.5, 68.2, 88.7, 90.1, 94.8];

const SHIFT_DATA = [
  { shift: "A", outputMT: 10.4, targetMT: 11.0, yieldPct: 91.5 },
  { shift: "B", outputMT: 9.5, targetMT: 11.0, yieldPct: 89.2 },
  { shift: "C", outputMT: 8.6, targetMT: 11.0, yieldPct: 86.4 },
];

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
              {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TotalOutputTab({
  presses,
  filterBadge,
  totalOutput,
}: TotalOutputTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [pressFilter, setPressFilter] = useState("All");

  const pressOutputData = presses.map((p, i) => {
    const scaledOutput = Number.parseFloat(
      ((BASE_OUTPUT[i] / BASE_OUTPUT_SUM) * totalOutput * 1000).toFixed(0),
    );
    const yieldPct = BASE_YIELD[i];
    const share = ((scaledOutput / (totalOutput * 1000)) * 100).toFixed(1);
    const outputMT = Number.parseFloat((scaledOutput / 1000).toFixed(2));
    const outputRate = Math.round(p.kgPerHour * 0.95);
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      alloy: p.alloyGrade,
      outputKg: scaledOutput,
      outputMT,
      outputRate: Math.max(0, outputRate),
      yieldPct,
      share,
      color: PRESS_COLORS[i],
    };
  });

  const totalKg = pressOutputData.reduce((a, b) => a + b.outputKg, 0);
  const avgRate = Math.round(
    pressOutputData.reduce((a, b) => a + b.outputRate, 0) /
      Math.max(1, pressOutputData.length),
  );
  const avgYield = Number.parseFloat(
    (
      pressOutputData.reduce((a, b) => a + b.yieldPct, 0) /
      Math.max(1, pressOutputData.length)
    ).toFixed(1),
  );
  const avgOutputPerPress = totalOutput / Math.max(1, pressOutputData.length);

  const chartData = pressOutputData.map((p) => ({
    press: p.pressId,
    "Output (kg)": p.outputKg,
    color: p.color,
  }));

  const filtered =
    pressFilter === "All"
      ? pressOutputData
      : pressOutputData.filter((p) => p.pressId === pressFilter);

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
              background: "#ecfdf5",
              color: "#065f46",
              borderColor: "#a7f3d0",
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
                  label: "Total Output",
                  value: `${totalOutput.toFixed(2)} MT`,
                  color: ACCENT,
                  bg: "#ecfdf5",
                },
                {
                  label: "Avg Output/Press",
                  value: `${avgOutputPerPress.toFixed(2)} MT`,
                  color: "#7c3aed",
                  bg: "#faf5ff",
                },
                {
                  label: "Output Rate",
                  value: `${avgRate.toLocaleString()} kg/h`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  label: "Yield %",
                  value: `${avgYield}%`,
                  color:
                    avgYield >= 90
                      ? "#16a34a"
                      : avgYield >= 85
                        ? "#d97706"
                        : "#dc2626",
                  bg:
                    avgYield >= 90
                      ? "#f0fdf4"
                      : avgYield >= 85
                        ? "#fffbeb"
                        : "#fef2f2",
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
                Output by Press (kg)
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
                    dataKey="Output (kg)"
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
                data-ocid="total_output.press.select"
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
                      "ALLOY",
                      "OUTPUT MT",
                      "OUTPUT RATE (KG/H)",
                      "YIELD %",
                      "% SHARE",
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
                  {filtered.map((row, idx) => {
                    const yc =
                      row.yieldPct >= 90
                        ? "#16a34a"
                        : row.yieldPct >= 85
                          ? "#d97706"
                          : "#dc2626";
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`total_output.press.row.${idx + 1}`}
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
                          </div>
                        </td>
                        <td
                          className="px-3 py-2.5 font-mono text-[10px]"
                          style={{ color: "#475569" }}
                        >
                          {row.alloy}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: ACCENT,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.outputMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.outputRate.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: `${yc}20`,
                              color: yc,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {row.yieldPct}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{
                                background: "#e2e8f0",
                                minWidth: "50px",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.share}%`,
                                  background: ACCENT,
                                  opacity: 0.75,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                              style={{
                                color: ACCENT,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {row.share}%
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
                      background: "#ecfdf5",
                      borderTop: `2px solid ${ACCENT}`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: ACCENT }}
                      colSpan={3}
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
                      {(totalKg / 1000).toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgRate.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: "#ecfdf5",
                          color: ACCENT,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {avgYield}%
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT,
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

        {subTab === "Shift Wise" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "SHIFT",
                    "OUTPUT MT",
                    "TARGET MT",
                    "YIELD %",
                    "ACHIEVEMENT %",
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
                  const ach = ((row.outputMT / row.targetMT) * 100).toFixed(1);
                  const achNum = Number(ach);
                  const achColor =
                    achNum >= 95
                      ? "#16a34a"
                      : achNum >= 85
                        ? "#d97706"
                        : "#dc2626";
                  const yc =
                    row.yieldPct >= 90
                      ? "#16a34a"
                      : row.yieldPct >= 85
                        ? "#d97706"
                        : "#dc2626";
                  return (
                    <tr
                      key={row.shift}
                      data-ocid={`total_output.shift.row.${idx + 1}`}
                      style={{
                        background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td className="px-3 py-2.5">
                        <span
                          className="font-bold text-[10px] px-2 py-0.5 rounded"
                          style={{ background: "#eff6ff", color: "#1d4ed8" }}
                        >
                          SHIFT {row.shift}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums font-bold text-right"
                        style={{
                          color: ACCENT,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.outputMT.toFixed(2)}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#64748b",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.targetMT.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: `${yc}20`,
                            color: yc,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.yieldPct}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ background: "#e2e8f0", minWidth: "60px" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, achNum)}%`,
                                background: achColor,
                                opacity: 0.75,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] font-bold tabular-nums w-[40px] text-right shrink-0"
                            style={{
                              color: achColor,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            {ach}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
