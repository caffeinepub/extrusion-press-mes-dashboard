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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DowntimeEvent, Press } from "../../backend.d";
import { formatDowntimeCategory, formatTime } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface DowntimeTabProps {
  presses: Press[];
  downtimeEvents: DowntimeEvent[];
  isLoading: boolean;
  filterBadge?: string;
  downtimeCategories?: { name: string; percentage: number; color: string }[];
  totalDowntimeHrs?: number;
}

const SUB_TABS = ["Breakdown Analysis", "Trend Analysis", "Event Log"];

const CATEGORY_COLORS: Record<string, string> = {
  powerFailure: "#ef4444",
  dieFailure: "#d97706",
  billetQuality: "#06b6d4",
  operatorDelay: "#8b5cf6",
  mechanicalFailure: "#f59e0b",
  other: "#64748b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
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

export function DowntimeTab({
  presses,
  downtimeEvents,
  isLoading,
  filterBadge,
  downtimeCategories = [],
  totalDowntimeHrs = 0,
}: DowntimeTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [trendPressFilter, setTrendPressFilter] = useState("All");
  const [logPressFilter, setLogPressFilter] = useState("All");
  const [logCategoryFilter, setLogCategoryFilter] = useState("All");

  if (isLoading) {
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

  // Summary statistics
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

  // Use passed totalDowntimeHrs if no backend events available
  const displayTotalDowntimeHrs =
    downtimeEvents.length > 0 ? totalDowntimeMins / 60 : totalDowntimeHrs;

  // By category for pie chart — prefer mock categories when no backend events
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

  // Press-wise comparison
  const byPress: Record<string, number> = {};
  for (const e of downtimeEvents) {
    byPress[e.pressId] = (byPress[e.pressId] || 0) + Number(e.durationMinutes);
  }
  const pressCompData = Object.entries(byPress).map(([pressId, mins]) => {
    const press = presses.find((p) => p.id === pressId);
    return { name: press?.name ?? pressId, downtime: mins };
  });

  // Shift-wise trend
  const trendPresses =
    trendPressFilter === "All"
      ? presses
      : presses.filter(
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

  // Event log with filters
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

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />

      {/* Filter badge for Breakdown Analysis */}
      {subTab === "Breakdown Analysis" && filterBadge && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b border-border/40"
          style={{ background: "#f8fafc" }}
        >
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
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

      {/* Filter bar for Trend Analysis and Event Log */}
      {(subTab === "Trend Analysis" || subTab === "Event Log") && (
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
                <SelectTrigger className="h-7 text-xs bg-secondary border-border w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="All" className="text-xs">
                    All Presses
                  </SelectItem>
                  {presses.map((p) => (
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
              <Select value={logPressFilter} onValueChange={setLogPressFilter}>
                <SelectTrigger className="h-7 text-xs bg-secondary border-border w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="All" className="text-xs">
                    All Presses
                  </SelectItem>
                  {presses.map((p) => (
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
                <SelectTrigger className="h-7 text-xs bg-secondary border-border w-40">
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
        {/* Breakdown Analysis */}
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
                        <Tooltip content={<CustomTooltip />} />
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
                        <Tooltip content={<CustomTooltip />} />
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

        {/* Trend Analysis */}
        {subTab === "Trend Analysis" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">
                Shift-wise Downtime Trend (min){" "}
                {trendPressFilter !== "All" && (
                  <span className="text-chart-2 font-normal">
                    — {presses.find((p) => p.id === trendPressFilter)?.name}
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
                    <Tooltip content={<CustomTooltip />} />
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

        {/* Event Log */}
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
                        >
                          No breakdown events
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedEvents.slice(0, 30).map((event) => (
                        <TableRow
                          key={event.id}
                          className="border-border hover:bg-muted/20"
                        >
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {formatTime(event.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {presses.find((p) => p.id === event.pressId)
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
