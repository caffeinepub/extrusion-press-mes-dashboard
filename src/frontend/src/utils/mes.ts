import type { AlarmSeverity, OrderStatus, PressStatus } from "../backend.d";

export function formatTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString();
}

export function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString();
}

export function getPressStatusColor(status: PressStatus): string {
  switch (status) {
    case "running":
      return "text-emerald-400 bg-emerald-400/15 border-emerald-400/40";
    case "idle":
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
    case "breakdown":
      return "text-red-400 bg-red-400/15 border-red-400/40";
    case "setup":
      return "text-orange-400 bg-orange-400/15 border-orange-400/40";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function getPressStatusDot(status: PressStatus): string {
  switch (status) {
    case "running":
      return "bg-emerald-400";
    case "idle":
      return "bg-slate-500";
    case "breakdown":
      return "bg-red-400";
    case "setup":
      return "bg-orange-400";
    default:
      return "bg-slate-500";
  }
}

export function getAlarmSeverityColor(severity: AlarmSeverity): string {
  switch (severity) {
    case "critical":
      return "text-red-400 bg-red-400/15 border-red-400/40";
    case "warning":
      return "text-yellow-400 bg-yellow-400/15 border-yellow-400/40";
    case "info":
      return "text-blue-400 bg-blue-400/15 border-blue-400/40";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case "completed":
      return "text-emerald-400 bg-emerald-400/15 border-emerald-400/40";
    case "inProgress":
      return "text-blue-400 bg-blue-400/15 border-blue-400/40";
    case "open":
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
    case "delayed":
      return "text-red-400 bg-red-400/15 border-red-400/40";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function getKPIStatus(
  value: number,
  target: number,
  lowerIsBetter = false,
): "green" | "yellow" | "red" {
  if (lowerIsBetter) {
    if (value <= target * 0.8) return "green";
    if (value <= target) return "yellow";
    return "red";
  }
  if (value >= target * 0.95) return "green";
  if (value >= target * 0.85) return "yellow";
  return "red";
}

export function getKPIStatusClass(status: "green" | "yellow" | "red"): string {
  switch (status) {
    case "green":
      return "signal-green";
    case "yellow":
      return "signal-yellow";
    case "red":
      return "signal-red";
  }
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

export function formatDowntimeCategory(cat: string): string {
  const map: Record<string, string> = {
    powerFailure: "Power Failure",
    dieFailure: "Die Failure",
    billetQuality: "Billet Quality",
    operatorDelay: "Operator Delay",
    mechanicalFailure: "Mechanical Failure",
    other: "Other",
  };
  return map[cat] ?? cat;
}

export function getLatest<T extends { timestamp: bigint }>(
  items: T[],
): T | null {
  if (!items || items.length === 0) return null;
  return items.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
}
