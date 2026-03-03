import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  Factory,
  Timer,
  TrendingDown,
  Zap,
} from "lucide-react";
import type { Alarm, OEEData, Press, ProductionMetrics } from "../backend.d";
import { getKPIStatus } from "../utils/mes";

interface KPIRibbonProps {
  presses: Press[];
  oeeData: Record<string, OEEData[]>;
  productionData: Record<string, ProductionMetrics[]>;
  alarms: Alarm[];
  isLoading: boolean;
  lastRefresh: Date | null;
}

interface KPICardProps {
  label: string;
  value: string;
  unit?: string;
  status: "green" | "yellow" | "red" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
  isLoading?: boolean;
}

function KPICard({
  label,
  value,
  unit,
  status,
  icon,
  subtitle,
  isLoading,
}: KPICardProps) {
  const glowClass =
    status === "green"
      ? "kpi-glow-green border-emerald-400/30"
      : status === "yellow"
        ? "kpi-glow-yellow border-yellow-400/30"
        : status === "red"
          ? "kpi-glow-red border-red-400/30"
          : "border-border";

  const valueColor =
    status === "green"
      ? "text-emerald-400"
      : status === "yellow"
        ? "text-yellow-400"
        : status === "red"
          ? "text-red-400"
          : "text-foreground";

  const dotColor =
    status === "green"
      ? "bg-emerald-400 pulse-dot"
      : status === "yellow"
        ? "bg-yellow-400"
        : status === "red"
          ? "bg-red-400 pulse-dot"
          : "bg-slate-500";

  return (
    <div
      className={`mes-card ${glowClass} flex items-center gap-3 px-4 py-3 min-w-0`}
    >
      <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase truncate mb-0.5">
          {label}
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-20 bg-muted" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono text-2xl font-bold leading-none ${valueColor}`}
            >
              {value}
            </span>
            {unit && (
              <span className="font-mono text-xs text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
        )}
        {subtitle && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </div>
        )}
      </div>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
    </div>
  );
}

export function KPIRibbon({
  presses,
  oeeData,
  productionData,
  alarms,
  isLoading,
  lastRefresh,
}: KPIRibbonProps) {
  // Compute plant-average OEE
  const oeeValues = presses
    .map((p) => {
      const data = oeeData[p.id];
      if (!data || data.length === 0) return null;
      const latest = data.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
      return latest.oeePct;
    })
    .filter((v): v is number => v !== null);

  const avgOEE =
    oeeValues.length > 0
      ? oeeValues.reduce((a, b) => a + b, 0) / oeeValues.length
      : 0;

  // Today's production
  const totalProduction = presses.reduce((sum, p) => {
    const data = productionData[p.id];
    if (!data || data.length === 0) return sum;
    const latest = data.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
    return sum + latest.dailyProductionMT;
  }, 0);

  // Active presses
  const activeCount = presses.filter((p) => p.status === "running").length;

  // Avg rejection
  const rejectionValues = presses
    .map((p) => {
      const data = oeeData[p.id];
      if (!data || data.length === 0) return null;
      const latest = data.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
      return latest.rejectionPct;
    })
    .filter((v): v is number => v !== null);

  const avgRejection =
    rejectionValues.length > 0
      ? rejectionValues.reduce((a, b) => a + b, 0) / rejectionValues.length
      : 0;

  // Downtime hours (sum of breakdown time across all presses)
  const downtimeHours = presses.reduce((sum, p) => {
    const data = oeeData[p.id];
    if (!data || data.length === 0) return sum;
    const latest = data.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
    return sum + latest.breakdownTime;
  }, 0);

  const activeAlarms = alarms.filter((a) => a.isActive).length;
  const criticalAlarms = alarms.filter(
    (a) => a.isActive && a.severity === "critical",
  ).length;

  const oeeStatus = getKPIStatus(avgOEE, 85);
  const prodStatus = getKPIStatus(totalProduction, 120);
  const rejStatus = getKPIStatus(avgRejection, 2, true);
  const alarmStatus: "green" | "yellow" | "red" =
    criticalAlarms > 0 ? "red" : activeAlarms > 3 ? "yellow" : "green";

  return (
    <div className="border-b border-border bg-[oklch(0.14_0.01_240)]">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Factory size={14} className="text-primary" />
          <span className="text-xs font-semibold tracking-wider text-primary uppercase font-display">
            AlumEx MES — Production Control System
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {lastRefresh
            ? `Last refresh: ${lastRefresh.toLocaleTimeString()}`
            : "Connecting..."}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
        <KPICard
          label="OEE"
          value={avgOEE.toFixed(1)}
          unit="%"
          status={oeeStatus}
          icon={<Activity size={16} />}
          subtitle={`Target: 85% | ${presses.length} presses`}
          isLoading={isLoading}
        />
        <KPICard
          label="Today Production"
          value={totalProduction.toFixed(1)}
          unit="MT"
          status={prodStatus}
          icon={<TrendingDown size={16} />}
          subtitle="Target: 120 MT"
          isLoading={isLoading}
        />
        <KPICard
          label="Active Presses"
          value={String(activeCount)}
          unit={`/ ${presses.length}`}
          status={
            activeCount === presses.length
              ? "green"
              : activeCount > 0
                ? "yellow"
                : "red"
          }
          icon={<Zap size={16} />}
          subtitle="Currently running"
          isLoading={isLoading}
        />
        <KPICard
          label="Rejection"
          value={avgRejection.toFixed(2)}
          unit="%"
          status={rejStatus}
          icon={<AlertTriangle size={16} />}
          subtitle="Target: <2%"
          isLoading={isLoading}
        />
        <KPICard
          label="Downtime"
          value={downtimeHours.toFixed(1)}
          unit="hrs"
          status={
            downtimeHours > 4 ? "red" : downtimeHours > 2 ? "yellow" : "green"
          }
          icon={<Timer size={16} />}
          subtitle="Today's losses"
          isLoading={isLoading}
        />
        <KPICard
          label="Active Alarms"
          value={String(activeAlarms)}
          status={alarmStatus}
          icon={<AlertTriangle size={16} />}
          subtitle={
            criticalAlarms > 0
              ? `${criticalAlarms} critical`
              : "No critical alerts"
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
