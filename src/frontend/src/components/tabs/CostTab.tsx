import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OEEData, Press } from "../../backend.d";
import type { PressData } from "../../mockData";
import { getLatest } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface CostTabProps {
  presses: Press[];
  oeeData: Record<string, OEEData[]>;
  isLoading: boolean;
  filterBadge?: string;
  mockPresses?: PressData[];
  kpis?: { totalEnergy: number; totalOutput: number; [key: string]: number };
}

const SUB_TABS = ["Cost Overview", "Energy Analysis", "Labour & Revenue"];

type Period = "Today" | "This Week" | "This Month";

function deriveCostMetrics(_press: Press, oeeData: OEEData | null) {
  if (!oeeData) {
    return {
      productionCostPerMT: 0,
      scrapCost: 0,
      energyCostPerMT: 0,
      powerConsumptionKwh: 0,
      labourEfficiencyPct: 0,
      revenuePerPressPerDay: 0,
    };
  }
  const productionCostPerMT = 850 + (100 - oeeData.oeePct) * 5;
  const scrapCost = oeeData.scrapKg * 2.8;
  const energyCostPerMT = 45 + (1 - oeeData.performancePct / 100) * 15;
  const powerConsumptionKwh = 280 + (oeeData.oeePct / 100) * 40;
  const labourEfficiencyPct = oeeData.performancePct * 0.92;
  const revenuePerPressPerDay = oeeData.oeePct * 180 * 12;
  return {
    productionCostPerMT,
    scrapCost,
    energyCostPerMT,
    powerConsumptionKwh,
    labourEfficiencyPct,
    revenuePerPressPerDay,
  };
}

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

export function CostTab({
  presses,
  oeeData,
  isLoading,
  filterBadge,
  mockPresses: _mockPresses = [],
  kpis: _kpis,
}: CostTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [period, setPeriod] = useState<Period>("Today");

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

  const pressMetrics = presses.map((press) => {
    const data = oeeData[press.id];
    const latest = data ? getLatest(data) : null;
    const costs = deriveCostMetrics(press, latest);
    return { press, costs };
  });

  // Aggregates
  const totalScrapCost = pressMetrics.reduce(
    (s, p) => s + p.costs.scrapCost,
    0,
  );
  const avgProductionCost =
    pressMetrics.length > 0
      ? pressMetrics.reduce((s, p) => s + p.costs.productionCostPerMT, 0) /
        pressMetrics.length
      : 0;
  const avgEnergyCost =
    pressMetrics.length > 0
      ? pressMetrics.reduce((s, p) => s + p.costs.energyCostPerMT, 0) /
        pressMetrics.length
      : 0;
  const totalPowerKwh = pressMetrics.reduce(
    (s, p) => s + p.costs.powerConsumptionKwh,
    0,
  );
  const avgLabour =
    pressMetrics.length > 0
      ? pressMetrics.reduce((s, p) => s + p.costs.labourEfficiencyPct, 0) /
        pressMetrics.length
      : 0;
  const totalRevenue = pressMetrics.reduce(
    (s, p) => s + p.costs.revenuePerPressPerDay,
    0,
  );

  const revenueData = pressMetrics.map((p) => ({
    name: p.press.name.replace("Press ", "P"),
    revenue: p.costs.revenuePerPressPerDay,
    scrap: p.costs.scrapCost,
  }));

  const labourData = pressMetrics.map((p) => ({
    name: p.press.name.replace("Press ", "P"),
    labour: p.costs.labourEfficiencyPct,
  }));

  // Energy trend — period label changes but data stays same (UX only)
  const periodMultiplier: Record<Period, number> = {
    Today: 1,
    "This Week": 7,
    "This Month": 30,
  };
  const energyTrend = presses.flatMap((press) => {
    const data = oeeData[press.id] ?? [];
    return data
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
      .slice(-5)
      .map((d, i) => ({
        index: i + 1,
        press: press.name.replace("Press ", "P"),
        energy:
          (45 + (1 - d.performancePct / 100) * 15) *
          (periodMultiplier[period] > 1 ? 1 + Math.sin(i) * 0.05 : 1),
      }));
  });

  const energyTableData = pressMetrics.map((p) => ({
    name: p.press.name,
    powerKwh: p.costs.powerConsumptionKwh * periodMultiplier[period],
    energyCostPerMT: p.costs.energyCostPerMT,
  }));

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
        {/* Cost Overview */}
        {subTab === "Cost Overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  label: "Prod Cost/MT",
                  value: `$${avgProductionCost.toFixed(0)}`,
                  color: "text-chart-1",
                },
                {
                  label: "Total Scrap Cost",
                  value: `$${totalScrapCost.toLocaleString("en", { maximumFractionDigits: 0 })}`,
                  color: "text-red-400",
                },
                {
                  label: "Energy Cost/MT",
                  value: `$${avgEnergyCost.toFixed(1)}`,
                  color: "text-chart-2",
                },
                {
                  label: "Power (kWh)",
                  value: totalPowerKwh.toFixed(0),
                  color: "text-chart-3",
                },
                {
                  label: "Labour Efficiency",
                  value: `${avgLabour.toFixed(1)}%`,
                  color:
                    avgLabour >= 85
                      ? "text-chart-3"
                      : avgLabour >= 75
                        ? "text-yellow-400"
                        : "text-red-400",
                },
                {
                  label: "Revenue/Day",
                  value: `$${(totalRevenue / 1000).toFixed(1)}K`,
                  color: "text-chart-1",
                },
              ].map((kpi) => (
                <div key={kpi.label} className="mes-card p-3 text-center">
                  <div className={`font-mono text-xl font-bold ${kpi.color}`}>
                    {kpi.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Cost Breakdown by Press
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
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Prod Cost/MT
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Scrap Cost
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Energy $/MT
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Power kWh
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Labour Eff%
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Revenue/Day
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pressMetrics.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground text-xs py-8"
                          >
                            No data
                          </TableCell>
                        </TableRow>
                      ) : (
                        pressMetrics.map(({ press, costs }) => (
                          <TableRow
                            key={press.id}
                            className="border-border hover:bg-muted/20"
                          >
                            <TableCell className="text-xs font-medium">
                              {press.name}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right">
                              ${costs.productionCostPerMT.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right text-red-400">
                              ${costs.scrapCost.toFixed(0)}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right">
                              ${costs.energyCostPerMT.toFixed(1)}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right">
                              {costs.powerConsumptionKwh.toFixed(0)}
                            </TableCell>
                            <TableCell
                              className={`text-xs font-mono text-right ${costs.labourEfficiencyPct >= 85 ? "text-chart-3" : "text-yellow-400"}`}
                            >
                              {costs.labourEfficiencyPct.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right text-chart-1">
                              ${(costs.revenuePerPressPerDay / 1000).toFixed(1)}
                              K
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

        {/* Energy Analysis */}
        {subTab === "Energy Analysis" && (
          <>
            {/* Period toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Period:
              </span>
              {(["Today", "This Week", "This Month"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1 text-[10px] font-semibold rounded border transition-colors"
                  style={{
                    background: period === p ? "#ecfeff" : "transparent",
                    borderColor: period === p ? "#06b6d4" : "#e2e8f0",
                    color: period === p ? "#0e7490" : "#64748b",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Energy Cost Trend — {period} ($/MT)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {energyTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                    No data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={energyTrend}
                      margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
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
                        dataKey="energy"
                        name="Energy $/MT"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ fill: "#06b6d4", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Per-Press Energy — {period}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Press
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Power (kWh)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Energy Cost/MT ($)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {energyTableData.map((row) => (
                      <TableRow
                        key={row.name}
                        className="border-border hover:bg-muted/20"
                      >
                        <TableCell className="text-xs font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-chart-3">
                          {row.powerKwh.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-chart-2">
                          ${row.energyCostPerMT.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Labour & Revenue */}
        {subTab === "Labour & Revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Revenue & Scrap Cost per Press
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {revenueData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                    No data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={revenueData}
                      margin={{ top: 0, right: 8, left: -10, bottom: 0 }}
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
                        dataKey="revenue"
                        name="Revenue $"
                        fill="#d97706"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="scrap"
                        name="Scrap Cost $"
                        fill="#ef4444"
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
                  Labour Efficiency % per Press
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {labourData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                    No data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={labourData}
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
                        unit="%"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="labour"
                        name="Labour Eff%"
                        fill="#10b981"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
