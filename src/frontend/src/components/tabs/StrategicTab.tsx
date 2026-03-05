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
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import type {
  OEEData,
  Order,
  Plant,
  Press,
  ProductionMetrics,
} from "../../backend.d";
import { OrderStatus } from "../../backend.d";
import type { PressData } from "../../mockData";
import { getLatest } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface StrategicTabProps {
  presses: Press[];
  plants: Plant[];
  oeeData: Record<string, OEEData[]>;
  productionData: Record<string, ProductionMetrics[]>;
  orders: Order[];
  isLoading: boolean;
  filterBadge?: string;
  strategicKPIs?: Array<{
    kpi: string;
    target: string;
    actual: string;
    status: "green" | "yellow" | "red";
  }>;
  mockPresses?: PressData[];
}

const SUB_TABS = ["KPI Summary", "Trend Analysis", "Plant Scorecard"];

interface KPIRowData {
  kpi: string;
  target: number;
  actual: number;
  unit: string;
  lowerIsBetter?: boolean;
  trend: number[];
}

function StatusDot({ status }: { status: "green" | "yellow" | "red" }) {
  return (
    <div
      className={`w-3 h-3 rounded-full inline-block ${
        status === "green"
          ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
          : status === "yellow"
            ? "bg-yellow-400 shadow-[0_0_6px_#facc15]"
            : "bg-red-400 shadow-[0_0_6px_#f87171]"
      }`}
    />
  );
}

function Sparkline({
  data,
  color = "#d97706",
}: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart
        data={chartData}
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function getStatus(
  actual: number,
  target: number,
  lowerIsBetter = false,
): "green" | "yellow" | "red" {
  if (lowerIsBetter) {
    if (actual <= target * 0.7) return "green";
    if (actual <= target) return "yellow";
    return "red";
  }
  if (actual >= target * 0.95) return "green";
  if (actual >= target * 0.85) return "yellow";
  return "red";
}

export function StrategicTab({
  presses,
  plants,
  oeeData,
  productionData,
  orders,
  isLoading,
  filterBadge,
  strategicKPIs: _strategicKPIs,
  mockPresses: _mockPresses = [],
}: StrategicTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  if (isLoading) {
    return (
      <div>
        <SubTabBar tabs={SUB_TABS} active={SUB_TABS[0]} onChange={() => {}} />
        <div className="p-4 space-y-4">
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  // Compute KPI values
  const oeeValues = presses
    .map((p) => {
      const data = oeeData[p.id];
      if (!data || data.length === 0) return null;
      return getLatest(data)?.oeePct ?? null;
    })
    .filter((v): v is number => v !== null);
  const avgOEE =
    oeeValues.length > 0
      ? oeeValues.reduce((a, b) => a + b, 0) / oeeValues.length
      : 0;

  const totalProduction = presses.reduce((sum, p) => {
    const data = productionData[p.id];
    if (!data || data.length === 0) return sum;
    return sum + (getLatest(data)?.dailyProductionMT ?? 0);
  }, 0);

  const rejectionValues = presses
    .map((p) => {
      const data = oeeData[p.id];
      if (!data || data.length === 0) return null;
      return getLatest(data)?.rejectionPct ?? null;
    })
    .filter((v): v is number => v !== null);
  const avgRejection =
    rejectionValues.length > 0
      ? rejectionValues.reduce((a, b) => a + b, 0) / rejectionValues.length
      : 0;

  const delayedOrders = orders.filter((o) => o.status === OrderStatus.delayed);
  const onTimeDelivery =
    orders.length > 0
      ? ((orders.length - delayedOrders.length) / orders.length) * 100
      : 0;

  const firstPassYields = presses
    .map((p) => {
      const data = oeeData[p.id];
      if (!data || data.length === 0) return null;
      return getLatest(data)?.firstPassYieldPct ?? null;
    })
    .filter((v): v is number => v !== null);
  const avgFPY =
    firstPassYields.length > 0
      ? firstPassYields.reduce((a, b) => a + b, 0) / firstPassYields.length
      : 0;

  const kpis: KPIRowData[] = [
    {
      kpi: "Daily Production",
      target: 120,
      actual: totalProduction,
      unit: "MT",
      trend: [85, 92, 88, 95, 102, 108, totalProduction],
    },
    {
      kpi: "Overall OEE",
      target: 85,
      actual: avgOEE,
      unit: "%",
      trend: [72, 75, 78, 74, 76, 79, avgOEE],
    },
    {
      kpi: "Rejection Rate",
      target: 2,
      actual: avgRejection,
      unit: "%",
      lowerIsBetter: true,
      trend: [2.4, 2.1, 1.9, 2.2, 1.8, 1.7, avgRejection],
    },
    {
      kpi: "On-Time Delivery",
      target: 95,
      actual: onTimeDelivery,
      unit: "%",
      trend: [88, 90, 87, 92, 89, 91, onTimeDelivery],
    },
    {
      kpi: "First Pass Yield",
      target: 98,
      actual: avgFPY,
      unit: "%",
      trend: [94, 95, 96, 95.5, 96.5, 97, avgFPY],
    },
  ];

  const plantSummary = plants.map((plant) => {
    const plantPresses = presses.filter(
      (p) => p.plant === plant.id || p.plant === plant.name,
    );
    const running = plantPresses.filter((p) => p.status === "running").length;
    const totalProd = plantPresses.reduce((sum, p) => {
      const data = productionData[p.id];
      if (!data || data.length === 0) return sum;
      return sum + (getLatest(data)?.dailyProductionMT ?? 0);
    }, 0);
    return {
      name: plant.name,
      location: plant.location,
      oee: plant.oeePct,
      capacity: plant.capacityUtilizationPct,
      activePresses: running,
      totalPresses: plantPresses.length,
      production: totalProd,
      totalCapacity: plant.totalCapacityMT,
    };
  });

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />
      {filterBadge && (
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
      <div className="p-4 space-y-4">
        {/* KPI Summary */}
        {subTab === "KPI Summary" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {kpis.map((row) => {
                const status = getStatus(
                  row.actual,
                  row.target,
                  row.lowerIsBetter,
                );
                const valueColor =
                  status === "green"
                    ? "text-emerald-400"
                    : status === "yellow"
                      ? "text-yellow-400"
                      : "text-red-400";
                const glowClass =
                  status === "green"
                    ? "kpi-glow-green border-emerald-400/20"
                    : status === "yellow"
                      ? "kpi-glow-yellow border-yellow-400/20"
                      : "kpi-glow-red border-red-400/20";
                const sparkColor =
                  status === "green"
                    ? "#34d399"
                    : status === "yellow"
                      ? "#facc15"
                      : "#f87171";
                return (
                  <div
                    key={row.kpi}
                    className={`mes-card ${glowClass} p-4 text-center`}
                  >
                    <StatusDot status={status} />
                    <div
                      className={`font-mono text-3xl font-black mt-2 mb-1 ${valueColor}`}
                    >
                      {row.actual.toFixed(1)}
                      <span className="text-base font-normal">{row.unit}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.kpi}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1">
                      Target: {row.lowerIsBetter ? "<" : ""}
                      {row.target}
                      {row.unit}
                    </div>
                    <div className="mt-2 h-8">
                      <Sparkline data={row.trend} color={sparkColor} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick summary tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Active Presses",
                  value: presses.filter((p) => p.status === "running").length,
                  unit: `/ ${presses.length}`,
                  color: "text-chart-3",
                },
                {
                  label: "Total Plants",
                  value: plants.length,
                  unit: "plants",
                  color: "text-chart-2",
                },
                {
                  label: "Delayed Orders",
                  value: delayedOrders.length,
                  unit: "orders",
                  color:
                    delayedOrders.length > 0 ? "text-red-400" : "text-chart-3",
                },
                {
                  label: "Open Orders",
                  value: orders.filter(
                    (o) =>
                      o.status === OrderStatus.open ||
                      o.status === OrderStatus.inProgress,
                  ).length,
                  unit: "orders",
                  color: "text-chart-2",
                },
              ].map((tile) => (
                <div key={tile.label} className="mes-card p-3 text-center">
                  <div className={`font-mono text-3xl font-bold ${tile.color}`}>
                    {tile.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    {tile.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60">
                    {tile.unit}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Trend Analysis */}
        {subTab === "Trend Analysis" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-chart-1">▶</span>
                Strategic KPIs — 7-Day Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground h-9 w-[180px]">
                      KPI
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-9 text-right">
                      Target
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-9 text-right">
                      Actual
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-9 text-center w-20">
                      Status
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-9">
                      vs Target
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground h-9 w-28">
                      7-Day Trend
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpis.map((row) => {
                    const status = getStatus(
                      row.actual,
                      row.target,
                      row.lowerIsBetter,
                    );
                    const valueColor =
                      status === "green"
                        ? "text-emerald-400"
                        : status === "yellow"
                          ? "text-yellow-400"
                          : "text-red-400";
                    const sparkColor =
                      status === "green"
                        ? "#34d399"
                        : status === "yellow"
                          ? "#facc15"
                          : "#f87171";
                    const vsTarget = row.lowerIsBetter
                      ? ((row.target - row.actual) / row.target) * 100
                      : ((row.actual - row.target) / row.target) * 100;
                    return (
                      <TableRow
                        key={row.kpi}
                        className="border-border hover:bg-muted/20"
                      >
                        <TableCell className="font-medium text-sm">
                          {row.kpi}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">
                          {row.lowerIsBetter ? "<" : ""}
                          {row.target}
                          {row.unit}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono text-lg font-bold ${valueColor}`}
                        >
                          {row.actual.toFixed(1)}
                          {row.unit}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <StatusDot status={status} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(
                                100,
                                Math.max(0, 50 + vsTarget * 5),
                              )}
                              className="h-1.5 w-16"
                            />
                            <span
                              className={`text-[10px] font-mono ${vsTarget >= 0 ? "text-chart-3" : "text-red-400"}`}
                            >
                              {vsTarget >= 0 ? "+" : ""}
                              {vsTarget.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Sparkline data={row.trend} color={sparkColor} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Plant Scorecard */}
        {subTab === "Plant Scorecard" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">
                Plant Performance Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {plantSummary.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                  No plant data
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Plant
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Location
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        OEE%
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        OEE Progress
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Capacity%
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Capacity Progress
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Active Presses
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Production
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plantSummary.map((plant) => {
                      const oeeStatus = getStatus(plant.oee, 85);
                      const oeeColor =
                        oeeStatus === "green"
                          ? "text-emerald-400"
                          : oeeStatus === "yellow"
                            ? "text-yellow-400"
                            : "text-red-400";
                      const capStatus = getStatus(plant.capacity, 85);
                      const capColor =
                        capStatus === "green"
                          ? "text-emerald-400"
                          : capStatus === "yellow"
                            ? "text-yellow-400"
                            : "text-red-400";
                      const prodPct =
                        plant.totalCapacity > 0
                          ? (plant.production / plant.totalCapacity) * 100
                          : 0;
                      return (
                        <TableRow
                          key={plant.name}
                          className="border-border hover:bg-muted/20"
                        >
                          <TableCell className="text-sm font-semibold">
                            {plant.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {plant.location}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono font-bold ${oeeColor}`}
                          >
                            {plant.oee.toFixed(1)}%
                          </TableCell>
                          <TableCell className="min-w-[80px]">
                            <Progress
                              value={plant.oee}
                              className="h-1.5 w-20"
                            />
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono ${capColor}`}
                          >
                            {plant.capacity.toFixed(1)}%
                          </TableCell>
                          <TableCell className="min-w-[80px]">
                            <Progress
                              value={plant.capacity}
                              className="h-1.5 w-20"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {plant.activePresses}/{plant.totalPresses}
                          </TableCell>
                          <TableCell className="min-w-[100px]">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={prodPct}
                                className="h-1.5 w-16"
                              />
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {plant.production.toFixed(1)} MT
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
