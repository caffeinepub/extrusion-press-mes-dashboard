import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import type { Press, ProductionMetrics } from "../../backend.d";
import {
  formatNumber,
  getLatest,
  getPressStatusColor,
  getPressStatusDot,
} from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface ProductionTabProps {
  presses: Press[];
  productionData: Record<string, ProductionMetrics[]>;
  isLoading: boolean;
}

const SUB_TABS = ["Real-Time Status", "Output Metrics", "Throughput"];

// Mock throughput data since backend may not have all fields
const MOCK_THROUGHPUT: Record<
  string,
  {
    cycleTime: number;
    extSpeed: number;
    pullerSpeed: number;
    sawCycle: number;
    containerChange: number;
  }
> = {
  default: {
    cycleTime: 42,
    extSpeed: 8.2,
    pullerSpeed: 7.8,
    sawCycle: 18,
    containerChange: 12,
  },
};

function getMockThroughput(pressId: string) {
  const seeds: Record<string, typeof MOCK_THROUGHPUT.default> = {
    P3300: {
      cycleTime: 38,
      extSpeed: 8.2,
      pullerSpeed: 7.9,
      sawCycle: 16,
      containerChange: 11,
    },
    P2500: {
      cycleTime: 0,
      extSpeed: 0,
      pullerSpeed: 0,
      sawCycle: 0,
      containerChange: 0,
    },
    P1800: {
      cycleTime: 41,
      extSpeed: 7.8,
      pullerSpeed: 7.4,
      sawCycle: 18,
      containerChange: 13,
    },
    P1460: {
      cycleTime: 44,
      extSpeed: 7.1,
      pullerSpeed: 6.8,
      sawCycle: 20,
      containerChange: 14,
    },
    P1100: {
      cycleTime: 35,
      extSpeed: 9.5,
      pullerSpeed: 9.1,
      sawCycle: 15,
      containerChange: 10,
    },
  };
  const key = Object.keys(seeds).find((k) =>
    pressId.includes(k.replace("P", "")),
  );
  return key ? seeds[key] : MOCK_THROUGHPUT.default;
}

function PressStatusCard({
  press,
  metrics,
}: { press: Press; metrics: ProductionMetrics | null }) {
  const statusClass = getPressStatusColor(press.status);
  const dotClass = getPressStatusDot(press.status);
  const isRunning = press.status === "running";

  return (
    <div className="mes-card p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold text-sm text-foreground">
          {press.name}
        </span>
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded border ${statusClass}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${dotClass}`}
            style={isRunning ? { animation: "pulse 2s infinite" } : {}}
          />
          {press.status.toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <span className="text-muted-foreground">Die: </span>
          <span className="font-mono text-foreground">
            {press.activeDie || "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Alloy: </span>
          <span className="font-mono text-foreground">
            {press.alloyGrade || "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Order: </span>
          <span className="font-mono text-foreground truncate">
            {press.currentOrder || "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Shift: </span>
          <span className="font-mono text-foreground">
            {press.shift || "—"}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Operator: </span>
          <span className="text-foreground">{press.operatorName || "—"}</span>
        </div>
      </div>
      {metrics && (
        <div className="border-t border-border pt-2 mt-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Daily vs Target</span>
            <span className="font-mono text-foreground">
              {formatNumber(metrics.dailyProductionMT)} /{" "}
              {formatNumber(metrics.dailyTargetMT)} MT
            </span>
          </div>
          <Progress
            value={
              (metrics.dailyProductionMT / Math.max(metrics.dailyTargetMT, 1)) *
              100
            }
            className="h-1.5"
          />
          <div className="grid grid-cols-3 gap-1 mt-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Kg/hr: </span>
              <span className="font-mono text-chart-1">
                {formatNumber(metrics.pressKgPerHour)}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Billets: </span>
              <span className="font-mono text-chart-2">
                {metrics.billetCount.toString()}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Recov: </span>
              <span className="font-mono text-chart-3">
                {formatNumber(metrics.recoveryPct)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductionTab({
  presses,
  productionData,
  isLoading,
}: ProductionTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [pressFilter, setPressFilter] = useState("All");

  if (isLoading) {
    return (
      <div>
        <SubTabBar tabs={SUB_TABS} active={SUB_TABS[0]} onChange={() => {}} />
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => i).map((i) => (
            <Skeleton key={`skel-${i}`} className="h-48 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const filteredPresses =
    pressFilter === "All"
      ? presses
      : presses.filter((p) => p.id === pressFilter || p.name === pressFilter);

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b border-border/40"
        style={{ background: "#070c16" }}
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Press Filter:
        </span>
        <Select value={pressFilter} onValueChange={setPressFilter}>
          <SelectTrigger className="h-7 text-xs bg-secondary border-border w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="All" className="text-xs">
              All Presses
            </SelectItem>
            {presses.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.name} ({p.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[10px] text-muted-foreground">
          {filteredPresses.length} press(es) shown
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Real-Time Status */}
        {subTab === "Real-Time Status" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Press Status Overview
              </h3>
              <div className="flex items-center gap-4 text-[10px]">
                {(["Running", "Idle", "Breakdown", "Setup"] as const).map(
                  (s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 text-muted-foreground"
                    >
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${s === "Running" ? "bg-emerald-400" : s === "Idle" ? "bg-slate-400" : s === "Breakdown" ? "bg-red-400" : "bg-yellow-400"}`}
                      />
                      {s}:{" "}
                      {
                        presses.filter(
                          (p) => p.status.toLowerCase() === s.toLowerCase(),
                        ).length
                      }
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredPresses.map((press) => {
                const data = productionData[press.id];
                const latest = data ? getLatest(data) : null;
                return (
                  <PressStatusCard
                    key={press.id}
                    press={press}
                    metrics={latest}
                  />
                );
              })}
              {filteredPresses.length === 0 && (
                <div className="col-span-4 text-center text-muted-foreground text-sm py-8">
                  No press data available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Output Metrics */}
        {subTab === "Output Metrics" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">
                Output Metrics — All Presses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Press
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Status
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Total MT
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Shift A
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Shift B
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Shift C
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Kg/hr
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Billets
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Recovery%
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Daily vs Target
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPresses.map((press) => {
                      const data = productionData[press.id];
                      const m = data ? getLatest(data) : null;
                      const pct = m
                        ? (m.dailyProductionMT / Math.max(m.dailyTargetMT, 1)) *
                          100
                        : 0;
                      const statusDotColor =
                        press.status === "running"
                          ? "bg-emerald-400"
                          : press.status === "breakdown"
                            ? "bg-red-400"
                            : press.status === "idle"
                              ? "bg-slate-400"
                              : "bg-yellow-400";
                      return (
                        <TableRow
                          key={press.id}
                          className="border-border hover:bg-muted/30"
                        >
                          <TableCell className="text-xs font-medium text-foreground">
                            {press.name}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`}
                                style={
                                  press.status === "running"
                                    ? { animation: "pulse 2s infinite" }
                                    : {}
                                }
                              />
                              <span className="text-[10px] text-muted-foreground">
                                {press.status}
                              </span>
                            </span>
                          </TableCell>
                          {m ? (
                            <>
                              <TableCell className="text-xs font-mono text-right text-chart-1">
                                {formatNumber(m.totalProductionMT)}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right">
                                {formatNumber(m.shiftProductionA)}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right">
                                {formatNumber(m.shiftProductionB)}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right">
                                {formatNumber(m.shiftProductionC)}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right text-chart-2">
                                {formatNumber(m.pressKgPerHour)}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right">
                                {m.billetCount.toString()}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-right text-chart-3">
                                {formatNumber(m.recoveryPct)}%
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={pct}
                                    className="h-1.5 flex-1"
                                  />
                                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                                    {pct.toFixed(0)}%
                                  </span>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <TableCell
                              colSpan={8}
                              className="text-xs text-muted-foreground text-center"
                            >
                              No data
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Throughput */}
        {subTab === "Throughput" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Throughput Metrics</CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] text-chart-2 border-chart-2/30"
                >
                  Live Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Press
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Cycle Time (s)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Ext. Speed (m/min)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Puller Speed (m/min)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Saw Cycle (s)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Container Chg (min)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPresses.map((press) => {
                      const data = productionData[press.id];
                      const m = data ? getLatest(data) : null;
                      const mock = getMockThroughput(press.id);
                      const ct = m?.cycleTimePerBillet ?? mock.cycleTime;
                      const es = m?.extrusionSpeed ?? mock.extSpeed;
                      const ps = m?.pullerSpeed ?? mock.pullerSpeed;
                      const sc = m?.sawCycleTime ?? mock.sawCycle;
                      const cc = m?.containerChangeTime ?? mock.containerChange;
                      const isBreakdown = press.status === "breakdown";
                      return (
                        <TableRow
                          key={press.id}
                          className="border-border hover:bg-muted/30"
                        >
                          <TableCell className="text-xs font-medium">
                            {press.name}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right ${isBreakdown ? "text-muted-foreground" : "text-chart-2"}`}
                          >
                            {isBreakdown ? "—" : ct.toFixed(1)}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right ${isBreakdown ? "text-muted-foreground" : "text-chart-1"}`}
                          >
                            {isBreakdown ? "—" : es.toFixed(1)}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right ${isBreakdown ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {isBreakdown ? "—" : ps.toFixed(1)}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right ${isBreakdown ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {isBreakdown ? "—" : sc.toFixed(1)}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right ${isBreakdown ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {isBreakdown ? "—" : cc.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
