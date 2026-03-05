import {
  Activity,
  AlertTriangle,
  BarChart2,
  Battery,
  Box,
  Clock,
  Gauge,
  Package,
  Recycle,
  RefreshCw,
  Timer,
  Zap,
} from "lucide-react";

interface KPITile {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick?: () => void;
  ocid: string;
}

interface KPIRibbonProps {
  data: {
    totalInput: number;
    totalOutput: number;
    totalScrap: number;
    totalRecovery: number;
    totalFGS: number;
    totalWIP: number;
    contactTime: number;
    totalDelay: number;
    pressKgH: number;
    fleetOEE: number;
    totalUtil: number;
    totalEnergy: number;
    // legacy (still kept for modals)
    totalBacklog?: number;
  };
  onTotalInputClick?: () => void;
  onTotalOutputClick?: () => void;
  onTotalScrapClick?: () => void;
  onTotalRecoveryClick?: () => void;
  onTotalFGSClick?: () => void;
  onTotalWIPClick?: () => void;
  onContactTimeClick?: () => void;
  onTotalDelayClick?: () => void;
  onPressKgHClick?: () => void;
  onFleetOEEClick?: () => void;
  onTotalUtilClick?: () => void;
  onTotalEnergyClick?: () => void;
}

// Expand arrow icon for clickable tiles
function ExpandArrow({ color }: { color: string }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      role="img"
      aria-label="View details"
      style={{ color, marginLeft: "2px" }}
    >
      <path
        d="M1 1h6v6M7 1L1 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KPIRibbon({
  data,
  onTotalInputClick,
  onTotalOutputClick,
  onTotalScrapClick,
  onTotalRecoveryClick,
  onTotalFGSClick,
  onTotalWIPClick,
  onContactTimeClick,
  onTotalDelayClick,
  onPressKgHClick,
  onFleetOEEClick,
  onTotalUtilClick,
  onTotalEnergyClick,
}: KPIRibbonProps) {
  const tiles: KPITile[] = [
    {
      label: "Total Input",
      value: data.totalInput.toFixed(1),
      unit: "MT",
      icon: <Package size={14} />,
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#22c55e",
      onClick: onTotalInputClick,
      ocid: "kpi.total_input.button",
    },
    {
      label: "Total Output",
      value: data.totalOutput.toFixed(1),
      unit: "MT",
      icon: <Activity size={14} />,
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#22c55e",
      onClick: onTotalOutputClick,
      ocid: "kpi.total_output.button",
    },
    {
      label: "Total Scrap",
      value: data.totalScrap.toFixed(1),
      unit: "%",
      icon: <Recycle size={14} />,
      color: "#ea580c",
      bgColor: "#fff7ed",
      borderColor: "#f97316",
      onClick: onTotalScrapClick,
      ocid: "kpi.total_scrap.button",
    },
    {
      label: "Total Recovery",
      value: data.totalRecovery.toFixed(1),
      unit: "%",
      icon: <RefreshCw size={14} />,
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#22c55e",
      onClick: onTotalRecoveryClick,
      ocid: "kpi.total_recovery.button",
    },
    {
      label: "FGS Stock",
      value: data.totalFGS.toFixed(1),
      unit: "MT",
      icon: <Box size={14} />,
      color: "#0f766e",
      bgColor: "#f0fdfa",
      borderColor: "#14b8a6",
      onClick: onTotalFGSClick,
      ocid: "kpi.fgs_stock.button",
    },
    {
      label: "WIP Stock",
      value: data.totalWIP.toFixed(1),
      unit: "MT",
      icon: <Battery size={14} />,
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#3b82f6",
      onClick: onTotalWIPClick,
      ocid: "kpi.wip_stock.button",
    },
    {
      label: "Contact Time",
      value: data.contactTime.toFixed(1),
      unit: "sec",
      icon: <Timer size={14} />,
      color: "#0891b2",
      bgColor: "#ecfeff",
      borderColor: "#06b6d4",
      onClick: onContactTimeClick,
      ocid: "kpi.contact_time.button",
    },
    {
      label: "Total Delay",
      value: data.totalDelay,
      unit: "min",
      icon: <AlertTriangle size={14} />,
      color: "#dc2626",
      bgColor: "#fef2f2",
      borderColor: "#ef4444",
      onClick: onTotalDelayClick,
      ocid: "kpi.total_delay.button",
    },
    {
      label: "Press Kg/H",
      value: Math.round(data.pressKgH).toLocaleString(),
      unit: "kg/h",
      icon: <Gauge size={14} />,
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#3b82f6",
      onClick: onPressKgHClick,
      ocid: "kpi.press_kgh.button",
    },
    {
      label: "Fleet OEE",
      value: data.fleetOEE.toFixed(1),
      unit: "%",
      icon: <BarChart2 size={14} />,
      color: "#0891b2",
      bgColor: "#ecfeff",
      borderColor: "#06b6d4",
      onClick: onFleetOEEClick,
      ocid: "kpi.fleet_oee.button",
    },
    {
      label: "Total Util",
      value: data.totalUtil.toFixed(1),
      unit: "%",
      icon: <Clock size={14} />,
      color: "#7c3aed",
      bgColor: "#faf5ff",
      borderColor: "#a855f7",
      onClick: onTotalUtilClick,
      ocid: "kpi.total_util.button",
    },
    {
      label: "Energy",
      value: data.totalEnergy.toFixed(2),
      unit: "kWh",
      icon: <Zap size={14} />,
      color: "#d97706",
      bgColor: "#fffbeb",
      borderColor: "#f59e0b",
      onClick: onTotalEnergyClick,
      ocid: "kpi.total_energy.button",
    },
  ];

  return (
    <div
      className="grid border-b border-[#e2e8f0]"
      style={{
        gridTemplateColumns: `repeat(${tiles.length}, 1fr)`,
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {tiles.map((tile, i) => {
        const clickable = !!tile.onClick;
        return (
          <div
            key={tile.label}
            className="relative flex flex-col justify-between px-2.5 py-2"
            onClick={clickable ? tile.onClick : undefined}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            data-ocid={clickable ? tile.ocid : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tile.onClick?.();
                    }
                  }
                : undefined
            }
            aria-label={
              clickable
                ? `View press wise ${tile.label.toLowerCase()} breakdown`
                : undefined
            }
            style={{
              background: tile.bgColor,
              borderRight: i < tiles.length - 1 ? "1px solid #e2e8f0" : "none",
              borderTop: `2px solid ${tile.borderColor}`,
              minHeight: "62px",
              cursor: clickable ? "pointer" : "default",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={
              clickable
                ? (e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      `${tile.borderColor}20`;
                  }
                : undefined
            }
            onMouseLeave={
              clickable
                ? (e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      tile.bgColor;
                  }
                : undefined
            }
          >
            {/* Label row with icon */}
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[9px] font-bold uppercase tracking-widest leading-tight flex items-center gap-1"
                style={{ color: "#64748b", letterSpacing: "0.08em" }}
              >
                {tile.label}
                {clickable && <ExpandArrow color={tile.borderColor} />}
              </span>
              <span
                className="flex items-center justify-center w-5 h-5 rounded"
                style={{
                  color: tile.color,
                  background: `${tile.borderColor}15`,
                }}
              >
                {tile.icon}
              </span>
            </div>
            {/* Value */}
            <div className="flex items-baseline gap-0.5">
              <span
                className="font-black tabular-nums leading-none"
                style={{
                  color: tile.color,
                  fontSize: "20px",
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {tile.value}
              </span>
              <span
                className="text-[10px] font-bold ml-0.5"
                style={{ color: `${tile.borderColor}cc` }}
              >
                {tile.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
