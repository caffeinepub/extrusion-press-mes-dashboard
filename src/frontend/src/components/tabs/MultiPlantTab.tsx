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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OEEData, Plant, Press, ProductionMetrics } from "../../backend.d";
import { getLatest } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface MultiPlantTabProps {
  plants: Plant[];
  presses: Press[];
  oeeData: Record<string, OEEData[]>;
  productionData: Record<string, ProductionMetrics[]>;
  isLoading: boolean;
}

const SUB_TABS = ["Plant Overview", "OEE Comparison", "Corporate KPIs"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="mes-card p-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.fill }}>
            {p.name}:{" "}
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MultiPlantTab({
  plants,
  presses,
  oeeData: _oeeData,
  productionData,
  isLoading,
}: MultiPlantTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [plantFilter, setPlantFilter] = useState("All");

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

  // Augment plant data
  const plantMetrics = plants.map((plant) => {
    const plantPresses = presses.filter(
      (p) => p.plant === plant.id || p.plant === plant.name,
    );
    const activePresses = plantPresses.filter(
      (p) => p.status === "running",
    ).length;
    const prodValues = plantPresses.map((p) => {
      const data = productionData[p.id];
      if (!data || data.length === 0) return 0;
      return getLatest(data)?.dailyProductionMT ?? 0;
    });
    const totalProd = prodValues.reduce((a, b) => a + b, 0);
    return {
      ...plant,
      activePressesCalc: BigInt(activePresses),
      totalProduction: totalProd,
    };
  });

  const filteredPlantMetrics =
    plantFilter === "All"
      ? plantMetrics
      : plantMetrics.filter(
          (p) => p.id === plantFilter || p.name === plantFilter,
        );

  const productionChartData = filteredPlantMetrics.map((p) => ({
    name: p.name,
    production: p.totalProduction,
    capacity: p.totalCapacityMT,
  }));

  const oeeChartData = filteredPlantMetrics.map((p) => ({
    name: p.name,
    oee: p.oeePct,
    target: 85,
  }));

  const totalProdAll = plantMetrics.reduce((s, p) => s + p.totalProduction, 0);
  const totalCapAll = plantMetrics.reduce((s, p) => s + p.totalCapacityMT, 0);
  const avgOEEAll =
    plantMetrics.length > 0
      ? plantMetrics.reduce((s, p) => s + p.oeePct, 0) / plantMetrics.length
      : 0;
  const avgCapAll =
    plantMetrics.length > 0
      ? plantMetrics.reduce((s, p) => s + p.capacityUtilizationPct, 0) /
        plantMetrics.length
      : 0;

  const corpKPIs = [
    {
      kpi: "Total Production",
      target: `${totalCapAll.toFixed(0)} MT`,
      actual: `${totalProdAll.toFixed(1)} MT`,
      pct: (totalProdAll / Math.max(totalCapAll, 1)) * 100,
    },
    {
      kpi: "Avg OEE",
      target: "85%",
      actual: `${avgOEEAll.toFixed(1)}%`,
      pct: avgOEEAll,
    },
    {
      kpi: "Avg Capacity Utilization",
      target: "90%",
      actual: `${avgCapAll.toFixed(1)}%`,
      pct: avgCapAll,
    },
    {
      kpi: "Active Plants",
      target: `${plants.length}`,
      actual: `${plants.length}`,
      pct: 100,
    },
    {
      kpi: "Total Presses Active",
      target: `${presses.length}`,
      actual: `${presses.filter((p) => p.status === "running").length}`,
      pct:
        presses.length > 0
          ? (presses.filter((p) => p.status === "running").length /
              presses.length) *
            100
          : 0,
    },
  ];

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />

      {/* Filter bar for OEE Comparison and Corporate KPIs */}
      {(subTab === "OEE Comparison" || subTab === "Corporate KPIs") &&
        plants.length > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-2 border-b border-border/40"
            style={{ background: "#070c16" }}
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Plant:
            </span>
            <Select value={plantFilter} onValueChange={setPlantFilter}>
              <SelectTrigger className="h-7 text-xs bg-secondary border-border w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="All" className="text-xs">
                  All Plants
                </SelectItem>
                {plants.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

      <div className="p-4 space-y-4">
        {/* Plant Overview */}
        {subTab === "Plant Overview" && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Plant Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants.length === 0 ? (
                <div className="col-span-3 text-center text-muted-foreground text-sm py-8">
                  No plant data
                </div>
              ) : (
                plantMetrics.map((plant) => (
                  <div key={plant.id} className="mes-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-display font-bold text-foreground">
                          {plant.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {plant.location}
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${plant.oeePct >= 85 ? "bg-emerald-400" : plant.oeePct >= 75 ? "bg-yellow-400" : "bg-red-400"}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center mes-card p-2">
                        <div
                          className={`font-mono text-xl font-bold ${plant.oeePct >= 85 ? "text-chart-3" : plant.oeePct >= 75 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {plant.oeePct.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          OEE
                        </div>
                      </div>
                      <div className="text-center mes-card p-2">
                        <div className="font-mono text-xl font-bold text-chart-2">
                          {plant.capacityUtilizationPct.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Capacity
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Production vs Capacity
                        </span>
                        <span className="font-mono">
                          {plant.totalProduction.toFixed(1)} /{" "}
                          {plant.totalCapacityMT.toFixed(0)} MT
                        </span>
                      </div>
                      <Progress
                        value={
                          (plant.totalProduction /
                            Math.max(plant.totalCapacityMT, 1)) *
                          100
                        }
                        className="h-1.5"
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>
                        Active Presses:{" "}
                        <span className="font-mono text-foreground">
                          {plant.activePresses.toString()}
                        </span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* OEE Comparison */}
        {subTab === "OEE Comparison" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Plant-wise Production vs Capacity (MT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {productionChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                      No data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={productionChartData}
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
                          dataKey="production"
                          name="Production (MT)"
                          fill="#10b981"
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey="capacity"
                          name="Capacity (MT)"
                          fill="#d97706"
                          opacity={0.6}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    OEE Comparison by Plant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {oeeChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                      No data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={oeeChartData}
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
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar
                          dataKey="oee"
                          name="Actual OEE%"
                          fill="#d97706"
                          radius={[2, 2, 0, 0]}
                        />
                        <Bar
                          dataKey="target"
                          name="Target OEE%"
                          fill="#06b6d4"
                          opacity={0.5}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Capacity Utilization %
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {filteredPlantMetrics.map((plant) => (
                    <div key={plant.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{plant.name}</span>
                        <span
                          className={`font-mono ${plant.capacityUtilizationPct >= 85 ? "text-chart-3" : plant.capacityUtilizationPct >= 70 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {plant.capacityUtilizationPct.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={plant.capacityUtilizationPct}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Corporate KPIs */}
        {subTab === "Corporate KPIs" && (
          <>
            {/* Summary KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {corpKPIs.map((kpi) => {
                const color =
                  kpi.pct >= 90
                    ? "text-chart-3"
                    : kpi.pct >= 75
                      ? "text-yellow-400"
                      : "text-red-400";
                return (
                  <div key={kpi.kpi} className="mes-card p-3 text-center">
                    <div className={`font-mono text-xl font-bold ${color}`}>
                      {kpi.actual}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                      {kpi.kpi}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Target: {kpi.target}
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Corporate KPI Summary{" "}
                  {plantFilter !== "All" && (
                    <span className="text-chart-2 font-normal">
                      — {plants.find((p) => p.id === plantFilter)?.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        KPI
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Target
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Actual
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Progress
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {corpKPIs.map((kpi) => {
                      const pct = Math.min(100, kpi.pct);
                      const color =
                        pct >= 95
                          ? "text-chart-3"
                          : pct >= 85
                            ? "text-yellow-400"
                            : "text-red-400";
                      return (
                        <TableRow
                          key={kpi.kpi}
                          className="border-border hover:bg-muted/20"
                        >
                          <TableCell className="text-xs font-medium">
                            {kpi.kpi}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-right text-muted-foreground">
                            {kpi.target}
                          </TableCell>
                          <TableCell
                            className={`text-xs font-mono text-right font-semibold ${color}`}
                          >
                            {kpi.actual}
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span
                                className={`text-xs font-mono w-10 text-right ${color}`}
                              >
                                {pct.toFixed(0)}%
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
      </div>
    </div>
  );
}
