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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Press, QualityRecord } from "../../backend.d";
import type { PressData } from "../../mockData";
import { getLatest } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface QualityTabProps {
  presses: Press[];
  qualityRecords: QualityRecord[];
  isLoading: boolean;
  filterBadge?: string;
  mockPresses?: PressData[];
}

const SUB_TABS = ["Rejection Analysis", "Defect Tracking", "Root Cause"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="mes-card p-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.fill || p.stroke }}>
            {p.name}:{" "}
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function QualityTab({
  qualityRecords,
  isLoading,
  filterBadge,
  mockPresses: _mockPresses = [],
}: QualityTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [alloyFilter, setAlloyFilter] = useState("All");
  const [dieFilter, setDieFilter] = useState("All");

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

  // Group by alloy
  const byAlloy: Record<string, QualityRecord[]> = {};
  for (const r of qualityRecords) {
    byAlloy[r.alloyGrade] = byAlloy[r.alloyGrade] || [];
    byAlloy[r.alloyGrade].push(r);
  }
  const alloyList = Object.keys(byAlloy);

  // Group by die
  const byDie: Record<string, QualityRecord[]> = {};
  for (const r of qualityRecords) {
    byDie[r.dieNo] = byDie[r.dieNo] || [];
    byDie[r.dieNo].push(r);
  }
  const dieList = Object.keys(byDie);

  const filteredRecords = qualityRecords.filter((r) => {
    if (alloyFilter !== "All" && r.alloyGrade !== alloyFilter) return false;
    if (dieFilter !== "All" && r.dieNo !== dieFilter) return false;
    return true;
  });

  const filteredByAlloy: Record<string, QualityRecord[]> = {};
  for (const r of filteredRecords) {
    filteredByAlloy[r.alloyGrade] = filteredByAlloy[r.alloyGrade] || [];
    filteredByAlloy[r.alloyGrade].push(r);
  }
  const rejectionByAlloy = Object.entries(filteredByAlloy).map(
    ([alloy, records]) => {
      const latest = getLatest(records);
      return { alloy, rejection: latest?.rejectionPctByAlloy ?? 0 };
    },
  );

  const filteredByDie: Record<string, QualityRecord[]> = {};
  for (const r of filteredRecords) {
    filteredByDie[r.dieNo] = filteredByDie[r.dieNo] || [];
    filteredByDie[r.dieNo].push(r);
  }
  const rejectionByDie = Object.entries(filteredByDie)
    .map(([die, records]) => {
      const latest = getLatest(records);
      return { die, rejection: latest?.rejectionPctByDie ?? 0 };
    })
    .sort((a, b) => b.rejection - a.rejection)
    .slice(0, 10);

  // Summary cards
  const totalSurfaceDefects = filteredRecords.reduce(
    (s, r) => s + Number(r.surfaceDefectCount),
    0,
  );
  const avgDimensionalFailure =
    filteredRecords.length > 0
      ? filteredRecords.reduce((s, r) => s + r.dimensionalFailurePct, 0) /
        filteredRecords.length
      : 0;
  const totalComplaints = filteredRecords.reduce(
    (s, r) => s + Number(r.customerComplaints),
    0,
  );
  const totalScrapCostImpact = filteredRecords.reduce(
    (s, r) => s + r.scrapCostImpact,
    0,
  );

  // Scrap cost trend
  const scrapTrend = [...filteredRecords]
    .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
    .slice(-10)
    .map((r, i) => ({ index: i + 1, scrapCost: r.scrapCostImpact }));

  // Root cause summary
  const rootCauseCounts: Record<string, number> = {};
  for (const r of qualityRecords) {
    if (r.rootCauseSummary) {
      rootCauseCounts[r.rootCauseSummary] =
        (rootCauseCounts[r.rootCauseSummary] || 0) + 1;
    }
  }

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />
      {filterBadge && subTab !== "Rejection Analysis" && (
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

      {/* Filter bar (Rejection Analysis only) */}
      {subTab === "Rejection Analysis" && (
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
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Alloy:
          </span>
          <Select value={alloyFilter} onValueChange={setAlloyFilter}>
            <SelectTrigger className="h-7 text-xs bg-secondary border-border w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="All" className="text-xs">
                All Alloys
              </SelectItem>
              {alloyList.map((a) => (
                <SelectItem key={a} value={a} className="text-xs">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Die:
          </span>
          <Select value={dieFilter} onValueChange={setDieFilter}>
            <SelectTrigger className="h-7 text-xs bg-secondary border-border w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="All" className="text-xs">
                All Dies
              </SelectItem>
              {dieList.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[10px] text-muted-foreground">
            {filteredRecords.length} records shown
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Rejection Analysis */}
        {subTab === "Rejection Analysis" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Rejection % by Alloy Grade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {rejectionByAlloy.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">
                    No quality data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={rejectionByAlloy}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.28 0.015 240)"
                      />
                      <XAxis
                        dataKey="alloy"
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
                        {rejectionByAlloy.map((entry) => (
                          <Cell
                            key={entry.alloy}
                            fill={
                              entry.rejection > 2
                                ? "#ef4444"
                                : entry.rejection > 1
                                  ? "#d97706"
                                  : "#10b981"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Rejection % by Die (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {rejectionByDie.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">
                    No quality data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={rejectionByDie}
                      margin={{ top: 0, right: 8, left: -20, bottom: 20 }}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.28 0.015 240)"
                      />
                      <XAxis
                        type="number"
                        unit="%"
                        tick={{ fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="die"
                        tick={{ fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                        width={50}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="rejection"
                        name="Rejection %"
                        fill="#d97706"
                        radius={[0, 2, 2, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Defect Tracking */}
        {subTab === "Defect Tracking" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-red-400">
                  {totalSurfaceDefects.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Surface Defects
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${avgDimensionalFailure > 2 ? "text-red-400" : "text-yellow-400"}`}
                >
                  {avgDimensionalFailure.toFixed(2)}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Dimensional Fail
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${totalComplaints > 5 ? "text-red-400" : totalComplaints > 0 ? "text-yellow-400" : "text-chart-3"}`}
                >
                  {totalComplaints}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Customer Complaints
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-chart-4">
                  $
                  {totalScrapCostImpact.toLocaleString("en", {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Scrap Cost Impact
                </div>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Quality Records Detail
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-72">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Alloy
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Die
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Rejection%
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Surface Defects
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Dim Failure%
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Complaints
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Scrap Cost
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualityRecords.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-xs text-muted-foreground text-center py-4"
                          >
                            No data
                          </TableCell>
                        </TableRow>
                      ) : (
                        qualityRecords.slice(0, 20).map((r, i) => (
                          <TableRow
                            key={`${r.alloyGrade}-${r.dieNo}-${i}`}
                            className="border-border hover:bg-muted/20"
                          >
                            <TableCell className="text-xs font-mono font-semibold text-chart-2">
                              {r.alloyGrade}
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              {r.dieNo}
                            </TableCell>
                            <TableCell
                              className={`text-xs font-mono text-right ${r.rejectionPctByAlloy > 2 ? "text-red-400" : "text-chart-3"}`}
                            >
                              {r.rejectionPctByAlloy.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right text-muted-foreground">
                              {Number(r.surfaceDefectCount).toLocaleString()}
                            </TableCell>
                            <TableCell
                              className={`text-xs font-mono text-right ${r.dimensionalFailurePct > 2 ? "text-red-400" : "text-yellow-400"}`}
                            >
                              {r.dimensionalFailurePct.toFixed(2)}%
                            </TableCell>
                            <TableCell
                              className={`text-xs font-mono text-right ${Number(r.customerComplaints) > 0 ? "text-yellow-400" : "text-muted-foreground"}`}
                            >
                              {Number(r.customerComplaints)}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right text-chart-4">
                              ${r.scrapCostImpact.toFixed(0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Root Cause */}
        {subTab === "Root Cause" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Scrap Cost Impact Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {scrapTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">
                    No data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart
                      data={scrapTrend}
                      margin={{ top: 0, right: 8, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.28 0.015 240)"
                      />
                      <XAxis
                        dataKey="index"
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="scrapCost"
                        name="Scrap Cost $"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Root Cause Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-52">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Root Cause
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Occurrences
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Share
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(rootCauseCounts).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-xs text-muted-foreground text-center py-4"
                          >
                            No root cause data
                          </TableCell>
                        </TableRow>
                      ) : (
                        Object.entries(rootCauseCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([cause, count]) => (
                            <TableRow
                              key={cause}
                              className="border-border hover:bg-muted/20"
                            >
                              <TableCell className="text-xs text-foreground">
                                {cause}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right">
                                {count}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right text-muted-foreground">
                                {(
                                  (count / qualityRecords.length) *
                                  100
                                ).toFixed(1)}
                                %
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
