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
import { SubTabBar } from "../ui/SubTabBar";

interface DieLoadUnloadTabProps {
  presses: PressData[];
  filterBadge?: string;
}

const SUB_TABS = ["Overview", "Press Wise", "Die Wise"];

const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];

// Target thresholds
const TARGET_LOAD = 12; // minutes
const TARGET_UNLOAD = 8; // minutes

// Die-wise mock data
const DIE_WISE_DATA = [
  {
    dieNo: "2003064",
    lastLoadPress: "P3300",
    loadTime: 12,
    unloadTime: 8,
    usesToday: 4,
    avgCycle: 20,
    condition: "Good",
  },
  {
    dieNo: "2001005",
    lastLoadPress: "P2500",
    loadTime: 0,
    unloadTime: 0,
    usesToday: 1,
    avgCycle: 0,
    condition: "Inspect",
  },
  {
    dieNo: "2002010",
    lastLoadPress: "P1800",
    loadTime: 14,
    unloadTime: 10,
    usesToday: 3,
    avgCycle: 24,
    condition: "Good",
  },
  {
    dieNo: "2004056",
    lastLoadPress: "P1460",
    loadTime: 11,
    unloadTime: 7,
    usesToday: 3,
    avgCycle: 18,
    condition: "Good",
  },
  {
    dieNo: "2000061",
    lastLoadPress: "P1100",
    loadTime: 9,
    unloadTime: 6,
    usesToday: 5,
    avgCycle: 15,
    condition: "Good",
  },
  {
    dieNo: "2001057",
    lastLoadPress: "P3300",
    loadTime: 18,
    unloadTime: 13,
    usesToday: 2,
    avgCycle: 31,
    condition: "Inspect",
  },
  {
    dieNo: "2003089",
    lastLoadPress: "P1800",
    loadTime: 22,
    unloadTime: 16,
    usesToday: 1,
    avgCycle: 38,
    condition: "Critical",
  },
  {
    dieNo: "2002234",
    lastLoadPress: "P1460",
    loadTime: 13,
    unloadTime: 9,
    usesToday: 3,
    avgCycle: 22,
    condition: "Good",
  },
  {
    dieNo: "2001178",
    lastLoadPress: "P1100",
    loadTime: 10,
    unloadTime: 7,
    usesToday: 4,
    avgCycle: 17,
    condition: "Good",
  },
  {
    dieNo: "2004001",
    lastLoadPress: "P3300",
    loadTime: 16,
    unloadTime: 11,
    usesToday: 2,
    avgCycle: 27,
    condition: "Inspect",
  },
];

// Recent die change events for expandable rows
const RECENT_EVENTS: Record<
  string,
  {
    time: string;
    loadTime: number;
    unloadTime: number;
    die: string;
    operator: string;
  }[]
> = {
  P3300: [
    {
      time: "08:14",
      loadTime: 11,
      unloadTime: 8,
      die: "2003064",
      operator: "Raj Kumar",
    },
    {
      time: "06:22",
      loadTime: 13,
      unloadTime: 9,
      die: "2004001",
      operator: "Raj Kumar",
    },
    {
      time: "04:10",
      loadTime: 12,
      unloadTime: 7,
      die: "2003064",
      operator: "Raj Kumar",
    },
  ],
  P2500: [
    {
      time: "02:45",
      loadTime: 0,
      unloadTime: 0,
      die: "2001005",
      operator: "Suresh M",
    },
  ],
  P1800: [
    {
      time: "07:55",
      loadTime: 14,
      unloadTime: 10,
      die: "2002010",
      operator: "Amit Patel",
    },
    {
      time: "05:30",
      loadTime: 15,
      unloadTime: 11,
      die: "2003089",
      operator: "Amit Patel",
    },
    {
      time: "03:20",
      loadTime: 13,
      unloadTime: 9,
      die: "2002010",
      operator: "Amit Patel",
    },
  ],
  P1460: [
    {
      time: "07:40",
      loadTime: 11,
      unloadTime: 7,
      die: "2004056",
      operator: "Priya S",
    },
    {
      time: "05:05",
      loadTime: 12,
      unloadTime: 8,
      die: "2002234",
      operator: "Priya S",
    },
  ],
  P1100: [
    {
      time: "08:20",
      loadTime: 9,
      unloadTime: 6,
      die: "2000061",
      operator: "Vikas N",
    },
    {
      time: "06:10",
      loadTime: 10,
      unloadTime: 6,
      die: "2001178",
      operator: "Vikas N",
    },
    {
      time: "04:05",
      loadTime: 9,
      unloadTime: 7,
      die: "2000061",
      operator: "Vikas N",
    },
  ],
};

function loadTimeColor(min: number): { bg: string; color: string } {
  if (min === 0) return { bg: "#f1f5f9", color: "#94a3b8" };
  if (min > 20) return { bg: "#fee2e2", color: "#dc2626" };
  if (min >= 15) return { bg: "#fffbeb", color: "#d97706" };
  return { bg: "#f0fdf4", color: "#16a34a" };
}

function unloadTimeColor(min: number): { bg: string; color: string } {
  if (min === 0) return { bg: "#f1f5f9", color: "#94a3b8" };
  if (min > 15) return { bg: "#fee2e2", color: "#dc2626" };
  if (min >= 10) return { bg: "#fffbeb", color: "#d97706" };
  return { bg: "#f0fdf4", color: "#16a34a" };
}

function conditionStyle(cond: string): { bg: string; color: string } {
  if (cond === "Good") return { bg: "#f0fdf4", color: "#16a34a" };
  if (cond === "Inspect") return { bg: "#fffbeb", color: "#d97706" };
  return { bg: "#fee2e2", color: "#dc2626" };
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
            {p.name}: <strong>{p.value} min</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function ExpandablePressRow({ press, idx }: { press: PressData; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const loadCol = loadTimeColor(press.dieLoad);
  const unloadCol = unloadTimeColor(press.dieUnload);
  const cycleTime = press.dieLoad + press.dieUnload;
  const changesCount = RECENT_EVENTS[press.id]?.length ?? 0;
  const nextChangeDue = press.status === "Running" ? "~2h 30m" : "N/A";

  return (
    <>
      <tr
        data-ocid={`die_load_unload.press.row.${idx + 1}`}
        style={{
          background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((p) => !p);
          }
        }}
        tabIndex={0}
        aria-expanded={expanded}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span style={{ color: PRESS_COLORS[idx], fontSize: "10px" }}>
              {expanded ? "▼" : "▶"}
            </span>
            <span
              className="font-bold"
              style={{
                color: PRESS_COLORS[idx],
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "11px",
              }}
            >
              {press.id}
            </span>
            <span style={{ color: "#475569", fontSize: "11px" }}>
              {press.name}
            </span>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <span
            className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
            style={{
              background:
                press.status === "Running"
                  ? "#dcfce7"
                  : press.status === "Breakdown"
                    ? "#fee2e2"
                    : press.status === "Setup"
                      ? "#dbeafe"
                      : "#fef3c7",
              color:
                press.status === "Running"
                  ? "#16a34a"
                  : press.status === "Breakdown"
                    ? "#dc2626"
                    : press.status === "Setup"
                      ? "#2563eb"
                      : "#d97706",
            }}
          >
            {press.status.toUpperCase()}
          </span>
        </td>
        <td
          className="px-3 py-2.5 text-[10px]"
          style={{
            color: "#475569",
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {press.dieNumber}
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "#e2e8f0", minWidth: "40px", width: "60px" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (press.dieLoad / TARGET_LOAD) * 100)}%`,
                  background: loadCol.color,
                }}
              />
            </div>
            <span
              className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
              style={{
                background: loadCol.bg,
                color: loadCol.color,
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {press.dieLoad} min
            </span>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "#e2e8f0", minWidth: "40px", width: "60px" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (press.dieUnload / TARGET_UNLOAD) * 100)}%`,
                  background: unloadCol.color,
                }}
              />
            </div>
            <span
              className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
              style={{
                background: unloadCol.bg,
                color: unloadCol.color,
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {press.dieUnload} min
            </span>
          </div>
        </td>
        <td
          className="px-3 py-2.5 tabular-nums text-right font-bold"
          style={{
            color: "#7c3aed",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "11px",
          }}
        >
          {cycleTime} min
        </td>
        <td
          className="px-3 py-2.5 tabular-nums text-center"
          style={{
            color: "#0891b2",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "11px",
          }}
        >
          {changesCount}
        </td>
        <td className="px-3 py-2.5 text-[10px]" style={{ color: "#64748b" }}>
          {nextChangeDue}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: "#fafbff" }}>
          <td colSpan={8} className="px-6 py-3">
            <div
              className="text-[9px] font-bold uppercase tracking-wider mb-2"
              style={{ color: "#64748b" }}
            >
              Last {Math.min(5, changesCount)} Die Change Events
            </div>
            {(RECENT_EVENTS[press.id] ?? []).map((evt) => (
              <div
                key={`${evt.time}-${evt.die}`}
                className="flex items-center gap-4 text-[10px] py-1"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <span
                  style={{
                    color: "#3b82f6",
                    fontFamily: '"JetBrains Mono", monospace',
                    width: "45px",
                  }}
                >
                  {evt.time}
                </span>
                <span style={{ color: "#475569" }}>
                  Die <strong style={{ color: "#1e3a5f" }}>{evt.die}</strong>
                </span>
                <span style={{ color: "#16a34a" }}>
                  Load: {evt.loadTime} min
                </span>
                <span style={{ color: "#d97706" }}>
                  Unload: {evt.unloadTime} min
                </span>
                <span style={{ color: "#64748b" }}>by {evt.operator}</span>
              </div>
            ))}
            {(RECENT_EVENTS[press.id] ?? []).length === 0 && (
              <div className="text-[10px]" style={{ color: "#94a3b8" }}>
                No die change events recorded
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export function DieLoadUnloadTab({
  presses,
  filterBadge,
}: DieLoadUnloadTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const runningPresses = presses.filter((p) => p.status === "Running");
  const avgLoadTime =
    runningPresses.length > 0
      ? runningPresses.reduce((a, b) => a + b.dieLoad, 0) /
        runningPresses.length
      : 0;
  const avgUnloadTime =
    runningPresses.length > 0
      ? runningPresses.reduce((a, b) => a + b.dieUnload, 0) /
        runningPresses.length
      : 0;
  const totalChanges = Object.values(RECENT_EVENTS).reduce(
    (a, b) => a + b.length,
    0,
  );
  const avgCycleTime = avgLoadTime + avgUnloadTime;

  // Chart data
  const chartData = presses.map((p, i) => ({
    press: p.id,
    "Die Load": p.dieLoad,
    "Die Unload": p.dieUnload,
    color: PRESS_COLORS[i],
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
        {/* Overview */}
        {subTab === "Overview" && (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Avg Die Load Time",
                  value: `${avgLoadTime.toFixed(1)} min`,
                  color: loadTimeColor(avgLoadTime).color,
                  bg: loadTimeColor(avgLoadTime).bg,
                },
                {
                  label: "Avg Die Unload Time",
                  value: `${avgUnloadTime.toFixed(1)} min`,
                  color: unloadTimeColor(avgUnloadTime).color,
                  bg: unloadTimeColor(avgUnloadTime).bg,
                },
                {
                  label: "Total Die Changes Today",
                  value: totalChanges.toString(),
                  color: "#2563eb",
                  bg: "#eff6ff",
                },
                {
                  label: "Avg Cycle Time",
                  value: `${avgCycleTime.toFixed(1)} min`,
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

            {/* Grouped Bar Chart */}
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
                  Die Load & Unload Time by Press (minutes)
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-2 rounded-sm"
                      style={{ background: "#3b82f6" }}
                    />
                    <span className="text-[9px]" style={{ color: "#64748b" }}>
                      Load
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-2 rounded-sm"
                      style={{ background: "#f59e0b" }}
                    />
                    <span className="text-[9px]" style={{ color: "#64748b" }}>
                      Unload
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-1 border-dashed"
                      style={{ borderTop: "2px dashed #dc2626" }}
                    />
                    <span className="text-[9px]" style={{ color: "#dc2626" }}>
                      Target Load ({TARGET_LOAD}m)
                    </span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
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
                    dataKey="Die Load"
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="Die Unload"
                    fill="#f59e0b"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Color Legend */}
            <div
              className="rounded-lg p-3 flex flex-wrap gap-4"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                Color Guide:
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#16a34a" }}
                />
                <span className="text-[9px]" style={{ color: "#64748b" }}>
                  Load &lt;15 min / Unload &lt;10 min (Good)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#d97706" }}
                />
                <span className="text-[9px]" style={{ color: "#64748b" }}>
                  Load 15-20 min / Unload 10-15 min (Watch)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#dc2626" }}
                />
                <span className="text-[9px]" style={{ color: "#64748b" }}>
                  Load &gt;20 min / Unload &gt;15 min (Critical)
                </span>
              </div>
            </div>
          </>
        )}

        {/* Press Wise */}
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
                    "DIE NO",
                    `LOAD TIME (TGT: ${TARGET_LOAD}m)`,
                    `UNLOAD TIME (TGT: ${TARGET_UNLOAD}m)`,
                    "CYCLE TIME",
                    "CHANGES TODAY",
                    "NEXT CHANGE",
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
                {presses.map((press, idx) => (
                  <ExpandablePressRow key={press.id} press={press} idx={idx} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Die Wise */}
        {subTab === "Die Wise" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "DIE NO",
                    "LAST LOAD PRESS",
                    "LOAD TIME (MIN)",
                    "UNLOAD TIME (MIN)",
                    "USES TODAY",
                    "AVG CYCLE (MIN)",
                    "CONDITION",
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
                {DIE_WISE_DATA.map((die, idx) => {
                  const loadCol = loadTimeColor(die.loadTime);
                  const cond = conditionStyle(die.condition);
                  return (
                    <tr
                      key={die.dieNo}
                      data-ocid={`die_load_unload.die.row.${idx + 1}`}
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
                        {die.dieNo}
                      </td>
                      <td
                        className="px-3 py-2.5 font-bold"
                        style={{
                          color: "#3b82f6",
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "10px",
                        }}
                      >
                        {die.lastLoadPress}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold tabular-nums"
                          style={{
                            background: loadCol.bg,
                            color: loadCol.color,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {die.loadTime} min
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold tabular-nums"
                          style={{
                            background: unloadTimeColor(die.unloadTime).bg,
                            color: unloadTimeColor(die.unloadTime).color,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {die.unloadTime} min
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-center font-bold"
                        style={{
                          color: "#0891b2",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {die.usesToday}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right font-bold"
                        style={{
                          color: "#7c3aed",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {die.avgCycle} min
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                          style={{
                            background: cond.bg,
                            color: cond.color,
                            border: `1px solid ${cond.color}30`,
                          }}
                        >
                          {die.condition.toUpperCase()}
                        </span>
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
