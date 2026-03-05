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
import { AlertTriangle, Gauge, RefreshCw, Thermometer } from "lucide-react";
import { useState } from "react";
import type { Alarm, MachineParameters, Press } from "../../backend.d";
import { useMachineParameters } from "../../hooks/useQueries";
import type { PressData } from "../../mockData";
import { formatTime, getAlarmSeverityColor } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface MachineTabProps {
  presses: Press[];
  alarms: Alarm[];
  isLoading: boolean;
  filterBadge?: string;
  mockPresses?: PressData[];
}

const SUB_TABS = ["Temperature", "Pressure & Speed", "Alarms"];

type SeverityFilter = "All" | "critical" | "warning" | "info";

function TempGauge({
  label,
  value,
  min,
  max,
  unit = "°C",
}: { label: string; value: number; min: number; max: number; unit?: string }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isHot = pct > 80;
  const isLow = pct < 20;
  const color = isHot ? "#ef4444" : isLow ? "#06b6d4" : "#10b981";
  return (
    <div className="mes-card p-3 flex flex-col items-center">
      <div className="flex items-center gap-1 mb-2">
        <Thermometer size={12} className="text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="relative h-20 w-6 bg-muted rounded-full overflow-hidden border border-border">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700"
          style={{ height: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-2 font-mono text-lg font-bold" style={{ color }}>
        {value.toFixed(0)}
        <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
      </div>
      <div className="text-[10px] text-muted-foreground">
        {min}–{max}
        {unit}
      </div>
    </div>
  );
}

function PressureCard({
  label,
  value,
  unit,
  maxVal,
}: { label: string; value: number; unit: string; maxVal: number }) {
  const pct = Math.max(0, Math.min(100, (value / maxVal) * 100));
  const isHigh = pct > 80;
  return (
    <div className="mes-card p-3">
      <div className="flex items-center gap-1 mb-1">
        <Gauge size={12} className="text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <div
        className={`font-mono text-xl font-bold ${isHigh ? "text-red-400" : "text-chart-2"}`}
      >
        {value.toFixed(1)}
        <span className="text-xs text-muted-foreground ml-1">{unit}</span>
      </div>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: isHigh ? "#ef4444" : "#06b6d4",
          }}
        />
      </div>
    </div>
  );
}

function MachineParamsContent({
  pressId,
  subTab,
}: { pressId: string; subTab: string }) {
  const { data: params, isLoading } = useMachineParameters(pressId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }, (_, i) => i).map((i) => (
          <Skeleton key={`skel-${i}`} className="h-28 bg-muted" />
        ))}
      </div>
    );
  }

  if (!params) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No parameter data for selected press
      </div>
    );
  }

  if (subTab === "Temperature") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <TempGauge
          label="Billet Temp"
          value={params.billetTemp}
          min={400}
          max={550}
        />
        <TempGauge
          label="Container Temp"
          value={params.containerTemp}
          min={350}
          max={500}
        />
        <TempGauge
          label="Die Temp"
          value={params.dieTemp}
          min={400}
          max={520}
        />
        <TempGauge
          label="Exit Temp"
          value={params.exitTemp}
          min={450}
          max={580}
        />
      </div>
    );
  }

  if (subTab === "Pressure & Speed") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <PressureCard
          label="Main Ram Pressure"
          value={params.mainRamPressure}
          unit="bar"
          maxVal={400}
        />
        <PressureCard
          label="Breakthrough Pressure"
          value={params.breakthroughPressure}
          unit="bar"
          maxVal={350}
        />
        <PressureCard
          label="Extrusion Pressure"
          value={params.extrusionPressure}
          unit="bar"
          maxVal={300}
        />
        <PressureCard
          label="Ram Speed"
          value={params.ramSpeed}
          unit="mm/s"
          maxVal={20}
        />
        <PressureCard
          label="Puller Force"
          value={params.pullerForce}
          unit="kN"
          maxVal={50}
        />
      </div>
    );
  }

  return null;
}

export function MachineTab({
  presses,
  alarms,
  isLoading,
  filterBadge,
  mockPresses = [],
}: MachineTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [selectedPress, setSelectedPress] = useState<string>(
    presses[0]?.id || mockPresses[0]?.id || "",
  );
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return (
      <div>
        <SubTabBar tabs={SUB_TABS} active={SUB_TABS[0]} onChange={() => {}} />
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-64 bg-muted" />
          <Skeleton className="h-40 bg-muted" />
        </div>
      </div>
    );
  }

  const sortedAlarms = [...alarms].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  const activeAlarms = sortedAlarms.filter((a) => a.isActive);
  const historicalAlarms = sortedAlarms.filter((a) => !a.isActive);

  const filteredActive =
    severityFilter === "All"
      ? activeAlarms
      : activeAlarms.filter((a) => a.severity === severityFilter);
  const filteredHistory =
    severityFilter === "All"
      ? historicalAlarms
      : historicalAlarms.filter((a) => a.severity === severityFilter);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />

      {/* Controls bar */}
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
          Select Press:
        </span>
        <Select value={selectedPress} onValueChange={setSelectedPress}>
          <SelectTrigger className="h-7 text-xs bg-secondary border-border w-48">
            <SelectValue placeholder="Select press" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {presses.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.name} ({p.id})
              </SelectItem>
            ))}
            {presses.length === 0 &&
              mockPresses.map((mp) => (
                <SelectItem key={mp.id} value={mp.id} className="text-xs">
                  {mp.name} ({mp.id})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {subTab === "Alarms" && (
          <>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Severity:
            </span>
            <Select
              value={severityFilter}
              onValueChange={(v) => setSeverityFilter(v as SeverityFilter)}
            >
              <SelectTrigger className="h-7 text-xs bg-secondary border-border w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="All" className="text-xs">
                  All
                </SelectItem>
                <SelectItem value="critical" className="text-xs">
                  Critical
                </SelectItem>
                <SelectItem value="warning" className="text-xs">
                  Warning
                </SelectItem>
                <SelectItem value="info" className="text-xs">
                  Info
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-1 rounded border border-border/40 text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <RefreshCw
            size={11}
            className={isRefreshing ? "animate-spin text-chart-2" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Temperature sub-tab */}
        {subTab === "Temperature" && selectedPress && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Temperature Parameters
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] text-chart-2 border-chart-2/30"
              >
                {presses.find((p) => p.id === selectedPress)?.name ??
                  selectedPress}
              </Badge>
            </div>
            <MachineParamsContent
              pressId={selectedPress}
              subTab="Temperature"
            />
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Temperature Reference Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Parameter
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Min (°C)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Max (°C)
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Optimal Range
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        name: "Billet Temperature",
                        min: 400,
                        max: 550,
                        opt: "440–510°C",
                      },
                      {
                        name: "Container Temperature",
                        min: 350,
                        max: 500,
                        opt: "380–450°C",
                      },
                      {
                        name: "Die Temperature",
                        min: 400,
                        max: 520,
                        opt: "430–480°C",
                      },
                      {
                        name: "Exit Temperature",
                        min: 450,
                        max: 580,
                        opt: "480–540°C",
                      },
                    ].map((row) => (
                      <TableRow
                        key={row.name}
                        className="border-border hover:bg-muted/30"
                      >
                        <TableCell className="text-xs font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-chart-2">
                          {row.min}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-red-400">
                          {row.max}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-chart-3">
                          {row.opt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pressure & Speed sub-tab */}
        {subTab === "Pressure & Speed" && selectedPress && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Pressure & Speed Parameters
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] text-chart-2 border-chart-2/30"
              >
                {presses.find((p) => p.id === selectedPress)?.name ??
                  selectedPress}
              </Badge>
            </div>
            <MachineParamsContent
              pressId={selectedPress}
              subTab="Pressure & Speed"
            />
            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Pressure & Speed Reference Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Parameter
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Unit
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Max Safe
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Alert Threshold
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        name: "Main Ram Pressure",
                        unit: "bar",
                        max: 400,
                        alert: 320,
                      },
                      {
                        name: "Breakthrough Pressure",
                        unit: "bar",
                        max: 350,
                        alert: 280,
                      },
                      {
                        name: "Extrusion Pressure",
                        unit: "bar",
                        max: 300,
                        alert: 240,
                      },
                      { name: "Ram Speed", unit: "mm/s", max: 20, alert: 16 },
                      { name: "Puller Force", unit: "kN", max: 50, alert: 40 },
                    ].map((row) => (
                      <TableRow
                        key={row.name}
                        className="border-border hover:bg-muted/30"
                      >
                        <TableCell className="text-xs font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-muted-foreground">
                          {row.unit}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-red-400">
                          {row.max}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-right text-yellow-400">
                          {row.alert}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alarms sub-tab */}
        {subTab === "Alarms" && (
          <>
            {/* Active alarms count */}
            <div className="grid grid-cols-3 gap-3">
              {(["critical", "warning", "info"] as const).map((sev) => {
                const cnt = activeAlarms.filter(
                  (a) => a.severity === sev,
                ).length;
                return (
                  <div key={sev} className="mes-card p-3 text-center">
                    <div
                      className={`font-mono text-2xl font-bold ${sev === "critical" ? "text-red-400" : sev === "warning" ? "text-yellow-400" : "text-chart-2"}`}
                    >
                      {cnt}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                      {sev} Alarms
                    </div>
                  </div>
                );
              })}
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400" />
                  Active Alarms ({filteredActive.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  {filteredActive.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
                      No active alarms
                      {severityFilter !== "All" ? ` (${severityFilter})` : ""}
                    </div>
                  ) : (
                    filteredActive.map((alarm) => (
                      <div
                        key={alarm.id}
                        className="flex items-start gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <Badge
                          variant="outline"
                          className={`text-[10px] shrink-0 ${getAlarmSeverityColor(alarm.severity)}`}
                        >
                          {alarm.severity.toUpperCase()}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-foreground truncate">
                            {alarm.description}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Press: {alarm.pressId} •{" "}
                            {formatTime(alarm.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Alarm History ({filteredHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Severity
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Press
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Description
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Timestamp
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-xs text-muted-foreground text-center py-4"
                          >
                            No historical alarms
                            {severityFilter !== "All"
                              ? ` (${severityFilter})`
                              : ""}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHistory.slice(0, 20).map((alarm) => (
                          <TableRow
                            key={alarm.id}
                            className="border-border hover:bg-muted/20 opacity-60 hover:opacity-80"
                          >
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] shrink-0 ${getAlarmSeverityColor(alarm.severity)}`}
                              >
                                {alarm.severity.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              {alarm.pressId}
                            </TableCell>
                            <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                              {alarm.description}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {formatTime(alarm.timestamp)}
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
      </div>
    </div>
  );
}
