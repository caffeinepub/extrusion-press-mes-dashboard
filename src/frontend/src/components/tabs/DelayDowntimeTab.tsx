import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DowntimeEvent, Press } from "../../backend.d";
import type { PressData } from "../../mockData";
import { formatDowntimeCategory, formatTime } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

export interface DelayDowntimeTabProps {
  presses: PressData[];
  backendPresses: Press[];
  downtimeEvents: DowntimeEvent[];
  isLoading: boolean;
  filterBadge?: string;
  totalDelay: number;
  downtimeCategories?: { name: string; percentage: number; color: string }[];
  totalDowntimeHrs?: number;
}

// ─── Delay section constants ────────────────────────────────────────────────
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
  "P3300 Titan": [22, 18, 25, 19, 17, 20, 18],
  "P2500 Atlas": [190, 180, 175, 200, 185, 178, 180],
  "P1800 Vulcan": [18, 22, 20, 19, 24, 21, 20],
  "P1460 Hermes": [14, 17, 15, 16, 13, 15, 15],
  "P1100 Swift": [10, 12, 11, 13, 12, 11, 12],
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

// ─── Downtime section constants ──────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  powerFailure: "#ef4444",
  dieFailure: "#d97706",
  billetQuality: "#06b6d4",
  operatorDelay: "#8b5cf6",
  mechanicalFailure: "#f59e0b",
  other: "#64748b",
};

// ─── All sub-tabs ──────────────────────────────────────────────────────────
const SUB_TABS = [
  "By Press",
  "By Reason",
  "Trend",
  "Breakdown Analysis",
  "Trend Analysis",
  "Event Log",
];

// ─── Shared custom tooltip ───────────────────────────────────────────────────
const DelayTooltip = ({ active, payload, label }: any) => {
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

const DowntimeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="mes-card p-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.fill || p.stroke }}>
            {p.name}:{" "}
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main merged component ───────────────────────────────────────────────────
export function DelayDowntimeTab({
  presses,
  backendPresses,
  downtimeEvents,
  isLoading,
  filterBadge,
  totalDelay,
  downtimeCategories = [],
  totalDowntimeHrs = 0,
}: DelayDowntimeTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [pressFilter, setPressFilter] = useState("All");
  const [trendPress, setTrendPress] = useState("All");
  const [trendPressFilter, setTrendPressFilter] = useState("All");
  const [logPressFilter, setLogPressFilter] = useState("All");
  const [logCategoryFilter, setLogCategoryFilter] = useState("All");

  // ── Delay: By Press derived data ──────────────────────────────────────────
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

  const filteredPressData =
    pressFilter === "All"
      ? pressDelayData
      : pressDelayData.filter((p) => p.pressId === pressFilter);

  // ── Delay: By Reason derived data ────────────────────────────────────────
  const reasonBaseSum = DELAY_REASONS.reduce((a, b) => a + b.baseMin, 0);
  const reasonData = DELAY_REASONS.map((r) => ({
    ...r,
    totalMin: Math.round((r.baseMin / reasonBaseSum) * totalDelay),
    avgMinOcc: Math.round(r.baseMin / r.occurrences),
  }));
  const reasonTotalMin = reasonData.reduce((a, b) => a + b.totalMin, 0);

  // ── Delay: Trend derived data ─────────────────────────────────────────────
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

  // ── Downtime: Breakdown Analysis derived data ─────────────────────────────
  const avgMTBF =
    downtimeEvents.length > 0
      ? downtimeEvents.reduce((s, e) => s + e.mtbfHours, 0) /
        downtimeEvents.length
      : 0;
  const avgMTTR =
    downtimeEvents.length > 0
      ? downtimeEvents.reduce((s, e) => s + e.mttrHours, 0) /
        downtimeEvents.length
      : 0;
  const totalDowntimeMins = downtimeEvents.reduce(
    (s, e) => s + Number(e.durationMinutes),
    0,
  );
  const displayTotalDowntimeHrs =
    downtimeEvents.length > 0 ? totalDowntimeMins / 60 : totalDowntimeHrs;

  const byCategory: Record<string, number> = {};
  for (const e of downtimeEvents) {
    byCategory[e.category] =
      (byCategory[e.category] || 0) + Number(e.durationMinutes);
  }
  const pieData =
    downtimeEvents.length > 0
      ? Object.entries(byCategory).map(([cat, value]) => ({
          name: formatDowntimeCategory(cat),
          value,
          fill: CATEGORY_COLORS[cat] || "#64748b",
        }))
      : downtimeCategories.map((cat) => ({
          name: cat.name,
          value: cat.percentage,
          fill: cat.color,
        }));

  const byPress: Record<string, number> = {};
  for (const e of downtimeEvents) {
    byPress[e.pressId] = (byPress[e.pressId] || 0) + Number(e.durationMinutes);
  }
  const pressCompData = Object.entries(byPress).map(([pressId, mins]) => {
    const press = backendPresses.find((p) => p.id === pressId);
    return { name: press?.name ?? pressId, downtime: mins };
  });

  // ── Downtime: Trend Analysis derived data ─────────────────────────────────
  const trendPresses =
    trendPressFilter === "All"
      ? backendPresses
      : backendPresses.filter(
          (p) => p.id === trendPressFilter || p.name === trendPressFilter,
        );
  const shiftData = trendPresses.map((press) => {
    const pressEvents = downtimeEvents.filter((e) => e.pressId === press.id);
    const third = Math.floor(pressEvents.length / 3);
    const shiftA = pressEvents
      .slice(0, third)
      .reduce((s, e) => s + Number(e.durationMinutes), 0);
    const shiftB = pressEvents
      .slice(third, third * 2)
      .reduce((s, e) => s + Number(e.durationMinutes), 0);
    const shiftC = pressEvents
      .slice(third * 2)
      .reduce((s, e) => s + Number(e.durationMinutes), 0);
    return {
      name: press.name.replace("Press ", "P"),
      "Shift A": shiftA,
      "Shift B": shiftB,
      "Shift C": shiftC,
    };
  });

  // ── Downtime: Event Log filters ───────────────────────────────────────────
  const filteredEvents = downtimeEvents.filter((e) => {
    if (logPressFilter !== "All" && e.pressId !== logPressFilter) return false;
    if (logCategoryFilter !== "All" && e.category !== logCategoryFilter)
      return false;
    return true;
  });
  const sortedEvents = [...filteredEvents].sort((a, b) =>
    a.timestamp > b.timestamp ? -1 : 1,
  );
  const uniqueCategories = Array.from(
    new Set(downtimeEvents.map((e) => e.category)),
  );

  // ── Shared filter badge ───────────────────────────────────────────────────
  const isDelaySubTab = ["By Press", "By Reason", "Trend"].includes(subTab);
  const isDowntimeSubTab = [
    "Breakdown Analysis",
    "Trend Analysis",
    "Event Log",
  ].includes(subTab);

  if (
    isLoading &&
    (subTab === "Breakdown Analysis" ||
      subTab === "Trend Analysis" ||
      subTab === "Event Log")
  ) {
    return (
      <div>
        <SubTabBar tabs={SUB_TABS} active={SUB_TABS[0]} onChange={() => {}} />
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />

      {/* Filter badge / filter bar */}
      {isDelaySubTab && filterBadge && (
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

      {isDowntimeSubTab &&
        (subTab === "Breakdown Analysis" ? filterBadge : true) && (
          <div
            className="flex items-center gap-3 px-4 py-2 border-b border-border/40 flex-wrap"
            style={{ background: "#f8fafc" }}
          >
            {filterBadge && (
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
            )}
            {subTab === "Trend Analysis" && (
              <>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Press:
                </span>
                <Select
                  value={trendPressFilter}
                  onValueChange={setTrendPressFilter}
                >
                  <SelectTrigger
                    className="h-7 text-xs bg-secondary border-border w-40"
                    data-ocid="downtime.trend.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="All" className="text-xs">
                      All Presses
                    </SelectItem>
                    {backendPresses.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {subTab === "Event Log" && (
              <>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Press:
                </span>
                <Select
                  value={logPressFilter}
                  onValueChange={setLogPressFilter}
                >
                  <SelectTrigger
                    className="h-7 text-xs bg-secondary border-border w-36"
                    data-ocid="downtime.log.press.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="All" className="text-xs">
                      All Presses
                    </SelectItem>
                    {backendPresses.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Category:
                </span>
                <Select
                  value={logCategoryFilter}
                  onValueChange={setLogCategoryFilter}
                >
                  <SelectTrigger
                    className="h-7 text-xs bg-secondary border-border w-40"
                    data-ocid="downtime.log.category.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="All" className="text-xs">
                      All Categories
                    </SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {formatDowntimeCategory(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground">
                  {sortedEvents.length} events
                </span>
              </>
            )}
          </div>
        )}

      <div className="p-4 space-y-4">
        {/* ── By Press ──────────────────────────────────────────────────────── */}
        {subTab === "By Press" && (
          <>
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
                  data-ocid="delay.press.select"
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
                  <Tooltip content={<DelayTooltip />} />
                  <Bar
                    dataKey="delayMin"
                    name="Delay (min)"
                    radius={[3, 3, 0, 0]}
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
                        data-ocid={`delay.press.row.${idx + 1}`}
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

        {/* ── By Reason ─────────────────────────────────────────────────────── */}
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
                  <Tooltip content={<DelayTooltip />} />
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
                          data-ocid={`delay.reason.row.${idx + 1}`}
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

        {/* ── Trend (Delay) ─────────────────────────────────────────────────── */}
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
                  data-ocid="delay.trend.select"
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
                  <Tooltip content={<DelayTooltip />} />
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

        {/* ── Breakdown Analysis (Downtime) ─────────────────────────────────── */}
        {subTab === "Breakdown Analysis" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-chart-2">
                  {avgMTBF.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  MTBF (hrs)
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${avgMTTR > 4 ? "text-red-400" : avgMTTR > 2 ? "text-yellow-400" : "text-chart-3"}`}
                >
                  {avgMTTR.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  MTTR (hrs)
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-chart-4">
                  {downtimeEvents.length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Breakdown Events
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-red-400">
                  {displayTotalDowntimeHrs.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Total Downtime (hrs)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Downtime by Category (min)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {pieData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                      No downtime events
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          innerRadius={45}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={{
                            stroke: "oklch(0.5 0.01 240)",
                            strokeWidth: 1,
                          }}
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<DowntimeTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Press-wise Downtime (min)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {pressCompData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                      No data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={pressCompData}
                        margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.28 0.015 240)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                        />
                        <Tooltip content={<DowntimeTooltip />} />
                        <Bar
                          dataKey="downtime"
                          name="Downtime (min)"
                          fill="#ef4444"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ── Trend Analysis (Downtime) ─────────────────────────────────────── */}
        {subTab === "Trend Analysis" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">
                Shift-wise Downtime Trend (min){" "}
                {trendPressFilter !== "All" && (
                  <span className="text-chart-2 font-normal">
                    —{" "}
                    {
                      backendPresses.find((p) => p.id === trendPressFilter)
                        ?.name
                    }
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {shiftData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
                  No data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={shiftData}
                    margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0.015 240)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                    />
                    <Tooltip content={<DowntimeTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar
                      dataKey="Shift A"
                      fill="#06b6d4"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="Shift B"
                      fill="#d97706"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="Shift C"
                      fill="#8b5cf6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Event Log (Downtime) ──────────────────────────────────────────── */}
        {subTab === "Event Log" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Breakdown Event Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Press
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Category
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Duration (min)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        MTBF (hrs)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        MTTR (hrs)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEvents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-xs text-muted-foreground text-center py-4"
                          data-ocid="downtime.event_log.empty_state"
                        >
                          No breakdown events
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedEvents.slice(0, 30).map((event, idx) => (
                        <TableRow
                          key={event.id}
                          className="border-border hover:bg-muted/20"
                          data-ocid={`downtime.event.row.${idx + 1}`}
                        >
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {formatTime(event.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {backendPresses.find((p) => p.id === event.pressId)
                              ?.name ?? event.pressId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px]"
                              style={{
                                color:
                                  CATEGORY_COLORS[event.category] || "#64748b",
                                borderColor: `${CATEGORY_COLORS[event.category] || "#64748b"}66`,
                                backgroundColor: `${CATEGORY_COLORS[event.category] || "#64748b"}22`,
                              }}
                            >
                              {formatDowntimeCategory(event.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-red-400">
                            {event.durationMinutes.toString()}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-chart-2">
                            {event.mtbfHours.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right">
                            {event.mttrHours.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
