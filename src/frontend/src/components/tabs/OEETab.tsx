import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DowntimeEvent, OEEData, Press } from "../../backend.d";
import type { PressData } from "../../mockData";
import { formatDowntimeCategory, getLatest } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface OEETabProps {
  presses: Press[];
  oeeData: Record<string, OEEData[]>;
  downtimeEvents: DowntimeEvent[];
  isLoading: boolean;
  filterBadge?: string;
  mockPresses?: PressData[];
}

const SUB_TABS = ["Availability", "Performance", "Quality", "Loss Analysis"];

const CHART_COLORS = {
  amber: "#d97706",
  cyan: "#06b6d4",
  green: "#10b981",
  red: "#ef4444",
  purple: "#8b5cf6",
  slate: "#64748b",
};

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
        <p
          style={{
            color: "#f1f5f9",
            fontSize: "11px",
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        {payload.map((p: any) => (
          <div
            key={p.name}
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <span
              style={{
                color: p.fill || p.stroke,
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            >
              {p.name}:{" "}
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function OEEGauge({ press, oee }: { press: Press; oee: OEEData | null }) {
  if (!oee) {
    return (
      <div
        className="rounded-lg p-3 flex flex-col items-center justify-center h-36"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <span className="text-xs" style={{ color: "#64748b" }}>
          {press.name}
        </span>
        <span className="text-xs mt-1" style={{ color: "#64748b" }}>
          No data
        </span>
      </div>
    );
  }
  const data = [{ name: "OEE", value: oee.oeePct, fill: CHART_COLORS.amber }];
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
    >
      <div
        className="text-xs font-semibold text-center mb-1"
        style={{ color: "#1e293b" }}
      >
        {press.name}
      </div>
      <div className="relative h-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="100%"
            innerRadius="60%"
            outerRadius="100%"
            barSize={8}
            startAngle={180}
            endAngle={0}
            data={[{ value: 100, fill: "#f1f5f9" }, ...data]}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className="font-mono text-xl font-bold leading-none"
            style={{ color: "#d97706" }}
          >
            {oee.oeePct.toFixed(1)}%
          </span>
          <span className="text-[10px]" style={{ color: "#64748b" }}>
            OEE
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-2">
        <div className="text-center">
          <div
            className="font-mono text-xs font-bold"
            style={{ color: "#10b981" }}
          >
            {oee.availabilityPct.toFixed(0)}%
          </div>
          <div className="text-[10px]" style={{ color: "#64748b" }}>
            Avail
          </div>
        </div>
        <div className="text-center">
          <div
            className="font-mono text-xs font-bold"
            style={{ color: "#06b6d4" }}
          >
            {oee.performancePct.toFixed(0)}%
          </div>
          <div className="text-[10px]" style={{ color: "#64748b" }}>
            Perf
          </div>
        </div>
        <div className="text-center">
          <div
            className="font-mono text-xs font-bold"
            style={{ color: "#8b5cf6" }}
          >
            {oee.qualityPct.toFixed(0)}%
          </div>
          <div className="text-[10px]" style={{ color: "#64748b" }}>
            Qual
          </div>
        </div>
      </div>
    </div>
  );
}

export function OEETab({
  presses,
  oeeData,
  downtimeEvents,
  isLoading,
  filterBadge,
  mockPresses: _mockPresses = [],
}: OEETabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [highlightedPress, setHighlightedPress] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div>
        <SubTabBar tabs={SUB_TABS} active={SUB_TABS[0]} onChange={() => {}} />
        <div className="p-4 space-y-4">
          <Skeleton className="h-40 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  // Data preparation
  const timeBreakdownData = presses.map((press) => {
    const data = oeeData[press.id];
    const latest = data ? getLatest(data) : null;
    if (!latest)
      return {
        name: press.name.replace("Press ", "P"),
        actual: 0,
        breakdown: 0,
        setup: 0,
        dieChange: 0,
        idle: 0,
        planned: 0,
      };
    return {
      name: press.name.replace("Press ", "P"),
      actual: latest.actualRunTime,
      breakdown: latest.breakdownTime,
      setup: latest.setupTime,
      dieChange: latest.dieChangeTime,
      idle: latest.idleTime,
      planned: latest.plannedRunTime,
    };
  });

  const oeeCompData = presses.map((press) => {
    const data = oeeData[press.id];
    const latest = data ? getLatest(data) : null;
    if (!latest)
      return {
        name: press.name.replace("Press ", "P"),
        oee: 0,
        availability: 0,
        performance: 0,
        quality: 0,
      };
    return {
      name: press.name.replace("Press ", "P"),
      oee: latest.oeePct,
      availability: latest.availabilityPct,
      performance: latest.performancePct,
      quality: latest.qualityPct,
    };
  });

  const qualityData = presses.map((press) => {
    const data = oeeData[press.id];
    const latest = data ? getLatest(data) : null;
    if (!latest)
      return {
        name: press.name.replace("Press ", "P"),
        rejection: 0,
        rework: 0,
        fpYield: 0,
        scrapKg: 0,
      };
    return {
      name: press.name.replace("Press ", "P"),
      rejection: latest.rejectionPct,
      rework: latest.reworkPct ?? 0,
      fpYield: latest.firstPassYieldPct ?? 0,
      scrapKg: latest.scrapKg,
    };
  });

  const downtimeByCategory: Record<string, number> = {};
  for (const e of downtimeEvents) {
    const cat = formatDowntimeCategory(e.category);
    downtimeByCategory[cat] =
      (downtimeByCategory[cat] || 0) + Number(e.durationMinutes);
  }
  const downtimeChartData = Object.entries(downtimeByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  let cumulative = 0;
  const totalDowntime = downtimeChartData.reduce((s, d) => s + d.value, 0);
  const paretoData = downtimeChartData.map((d) => {
    cumulative += d.value;
    return {
      ...d,
      cumPct: totalDowntime > 0 ? (cumulative / totalDowntime) * 100 : 0,
    };
  });

  const highlightedPressName = highlightedPress
    ? presses
        .find(
          (p) =>
            p.id === highlightedPress ||
            p.name.replace("Press ", "P") === highlightedPress,
        )
        ?.name.replace("Press ", "P")
    : null;

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />
      {filterBadge && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b border-[#e2e8f0]"
          style={{ background: "#f8fafc" }}
        >
          <span className="text-[10px] text-[#64748b] uppercase tracking-wider">
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
        {/* Availability */}
        {subTab === "Availability" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Planned vs Actual Run Time (hrs)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={timeBreakdownData}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar
                        dataKey="planned"
                        name="Planned Run"
                        stackId="a"
                        fill={CHART_COLORS.slate}
                      />
                      <Bar
                        dataKey="actual"
                        name="Actual Run"
                        stackId="b"
                        fill={CHART_COLORS.green}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Time Breakdown by Category (hrs)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={timeBreakdownData}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar
                        dataKey="breakdown"
                        name="Breakdown"
                        stackId="a"
                        fill={CHART_COLORS.red}
                      />
                      <Bar
                        dataKey="setup"
                        name="Setup"
                        stackId="a"
                        fill={CHART_COLORS.amber}
                      />
                      <Bar
                        dataKey="dieChange"
                        name="Die Change"
                        stackId="a"
                        fill={CHART_COLORS.purple}
                      />
                      <Bar
                        dataKey="idle"
                        name="Idle"
                        stackId="a"
                        fill={CHART_COLORS.slate}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Availability Detail Table
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "#e2e8f0" }}>
                      <TableHead
                        className="text-xs h-8"
                        style={{ color: "#64748b" }}
                      >
                        Press
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Planned (hrs)
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Actual (hrs)
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Breakdown (hrs)
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Setup (hrs)
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Die Change (hrs)
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Idle (hrs)
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Availability%
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presses.map((press) => {
                      const data = oeeData[press.id];
                      const latest = data ? getLatest(data) : null;
                      const avail = latest?.availabilityPct ?? 0;
                      return (
                        <TableRow
                          key={press.id}
                          style={{ borderColor: "#f1f5f9" }}
                        >
                          <TableCell className="text-xs font-medium">
                            {press.name}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right">
                            {latest?.plannedRunTime.toFixed(1) ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-[#10b981]">
                            {latest?.actualRunTime.toFixed(1) ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-red-400">
                            {latest?.breakdownTime.toFixed(1) ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-yellow-400">
                            {latest?.setupTime.toFixed(1) ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-purple-400">
                            {latest?.dieChangeTime.toFixed(1) ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-[#64748b]">
                            {latest?.idleTime.toFixed(1) ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-2">
                              <Progress value={avail} className="h-1.5 w-16" />
                              <span
                                className={`font-mono text-xs ${avail >= 85 ? "text-[#10b981]" : avail >= 75 ? "text-yellow-400" : "text-red-400"}`}
                              >
                                {avail.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Performance */}
        {subTab === "Performance" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    OEE Component Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={oeeCompData}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                      onClick={(e) => {
                        if (e?.activePayload) {
                          const name = e.activePayload[0]?.payload?.name;
                          setHighlightedPress((prev) =>
                            prev === name ? null : name,
                          );
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar
                        dataKey="oee"
                        name="OEE"
                        fill={CHART_COLORS.amber}
                        radius={[2, 2, 0, 0]}
                      >
                        {oeeCompData.map((e) => (
                          <Cell
                            key={e.name}
                            fill={
                              highlightedPressName &&
                              e.name !== highlightedPressName
                                ? "#e2e8f0"
                                : CHART_COLORS.amber
                            }
                          />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="availability"
                        name="Availability"
                        fill={CHART_COLORS.green}
                        radius={[2, 2, 0, 0]}
                      >
                        {oeeCompData.map((e) => (
                          <Cell
                            key={e.name}
                            fill={
                              highlightedPressName &&
                              e.name !== highlightedPressName
                                ? "#e2e8f0"
                                : CHART_COLORS.green
                            }
                          />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="performance"
                        name="Performance"
                        fill={CHART_COLORS.cyan}
                        radius={[2, 2, 0, 0]}
                      >
                        {oeeCompData.map((e) => (
                          <Cell
                            key={e.name}
                            fill={
                              highlightedPressName &&
                              e.name !== highlightedPressName
                                ? "#e2e8f0"
                                : CHART_COLORS.cyan
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[10px] text-[#64748b] mt-1 text-center">
                    Click a bar to highlight press in table below
                  </p>
                </CardContent>
              </Card>
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Output vs Rated Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {presses.map((press) => {
                      const data = oeeData[press.id];
                      const latest = data ? getLatest(data) : null;
                      const perf = latest?.performancePct ?? 0;
                      const isHighlighted =
                        !highlightedPressName ||
                        press.name.replace("Press ", "P") ===
                          highlightedPressName;
                      return (
                        <div
                          key={press.id}
                          className={`transition-opacity ${isHighlighted ? "opacity-100" : "opacity-30"}`}
                        >
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">{press.name}</span>
                            <span
                              className={`font-mono ${perf >= 85 ? "text-[#10b981]" : perf >= 70 ? "text-yellow-400" : "text-red-400"}`}
                            >
                              {perf.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={perf} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Performance Detail Table{" "}
                  {highlightedPressName && (
                    <span className="text-[#06b6d4] font-normal">
                      — Filtered: {highlightedPressName}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "#e2e8f0" }}>
                      <TableHead
                        className="text-xs h-8"
                        style={{ color: "#64748b" }}
                      >
                        Press
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Actual OEE%
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Availability%
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Performance%
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Quality%
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oeeCompData
                      .filter(
                        (r) =>
                          !highlightedPressName ||
                          r.name === highlightedPressName,
                      )
                      .map((row) => (
                        <TableRow
                          key={row.name}
                          style={{ borderColor: "#f1f5f9" }}
                        >
                          <TableCell className="text-xs font-medium">
                            {row.name}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right font-bold ${row.oee >= 85 ? "text-[#10b981]" : row.oee >= 70 ? "text-yellow-400" : "text-red-400"}`}
                          >
                            {row.oee.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-[#10b981]">
                            {row.availability.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-[#06b6d4]">
                            {row.performance.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-[#8b5cf6]">
                            {row.quality.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Quality */}
        {subTab === "Quality" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Rejection % per Press
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={qualityData}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                        unit="%"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="rejection"
                        name="Rejection %"
                        radius={[2, 2, 0, 0]}
                      >
                        {qualityData.map((e) => (
                          <Cell
                            key={e.name}
                            fill={
                              e.rejection > 2
                                ? CHART_COLORS.red
                                : e.rejection > 1
                                  ? CHART_COLORS.amber
                                  : CHART_COLORS.green
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Scrap Kg per Press</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={qualityData}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="scrapKg"
                        name="Scrap Kg"
                        fill={CHART_COLORS.red}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card
              style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
            >
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Quality Metrics Table</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "#e2e8f0" }}>
                      <TableHead
                        className="text-xs h-8"
                        style={{ color: "#64748b" }}
                      >
                        Press
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Rejection%
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Rework%
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        First Pass Yield%
                      </TableHead>
                      <TableHead
                        className="text-xs h-8 text-right"
                        style={{ color: "#64748b" }}
                      >
                        Scrap Kg
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualityData.map((row) => (
                      <TableRow
                        key={row.name}
                        style={{ borderColor: "#f1f5f9" }}
                      >
                        <TableCell className="text-xs font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell
                          className={`text-xs font-mono text-right ${row.rejection > 2 ? "text-red-400" : row.rejection > 1 ? "text-yellow-400" : "text-[#10b981]"}`}
                        >
                          {row.rejection.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-yellow-400">
                          {row.rework.toFixed(2)}%
                        </TableCell>
                        <TableCell
                          className={`text-xs font-mono text-right ${row.fpYield >= 95 ? "text-[#10b981]" : row.fpYield >= 90 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {row.fpYield.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-red-400">
                          {row.scrapKg.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Loss Analysis */}
        {subTab === "Loss Analysis" && (
          <>
            <div>
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">
                OEE Gauges — Press View
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {presses.map((press) => {
                  const data = oeeData[press.id];
                  const latest = data ? getLatest(data) : null;
                  return <OEEGauge key={press.id} press={press} oee={latest} />;
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Top 5 Downtime Reasons (Pareto)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {paretoData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-[#64748b] text-xs">
                      No downtime data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={paretoData}
                        margin={{ top: 0, right: 8, left: -20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                          angle={-30}
                          textAnchor="end"
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                          unit="%"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          yAxisId="left"
                          dataKey="value"
                          name="Minutes"
                          radius={[2, 2, 0, 0]}
                        >
                          {paretoData.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={`oklch(${0.62 + i * 0.03} 0.22 ${25 + i * 8})`}
                            />
                          ))}
                        </Bar>
                        <Bar
                          yAxisId="right"
                          dataKey="cumPct"
                          name="Cumulative%"
                          fill={CHART_COLORS.amber}
                          opacity={0.6}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              <Card
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Loss Analysis by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {downtimeChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-[#64748b] text-xs">
                      No downtime data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={downtimeChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={{
                            stroke: "oklch(0.5 0.01 240)",
                            strokeWidth: 1,
                          }}
                        >
                          {downtimeChartData.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={
                                Object.values(CHART_COLORS)[
                                  i % Object.values(CHART_COLORS).length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
