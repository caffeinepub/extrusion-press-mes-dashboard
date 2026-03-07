import {
  Activity,
  AlertTriangle,
  BarChart2,
  Battery,
  Clock,
  Flame,
  Gauge,
  Package,
  Recycle,
  RefreshCw,
  Timer,
  Zap,
} from "lucide-react";
import { GrafanaStatTile } from "../grafana/GrafanaStatTile";

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

type KPITileVisibility = {
  totalInput?: boolean;
  totalOutput?: boolean;
  totalScrap?: boolean;
  recovery?: boolean;
  wipStock?: boolean;
  contactTime?: boolean;
  totalDelay?: boolean;
  ppPlanAct?: boolean;
  fleetOEE?: boolean;
  totalUtil?: boolean;
  energy?: boolean;
  gasConsumption?: boolean;
};

interface KPIRibbonProps {
  data: {
    totalInput: number;
    totalOutput: number;
    totalScrap: number;
    totalRecovery: number;
    totalWIP: number;
    contactTime: number;
    totalDelay: number;
    pressKgH: number;
    fleetOEE: number;
    totalUtil: number;
    totalEnergy: number;
    totalGas: number;
    // legacy (still kept for modals)
    totalBacklog?: number;
  };
  onTotalInputClick?: () => void;
  onTotalOutputClick?: () => void;
  onTotalScrapClick?: () => void;
  onTotalRecoveryClick?: () => void;
  onTotalWIPClick?: () => void;
  onContactTimeClick?: () => void;
  onTotalDelayClick?: () => void;
  onPressKgHClick?: () => void;
  onFleetOEEClick?: () => void;
  onTotalUtilClick?: () => void;
  onTotalEnergyClick?: () => void;
  onTotalGasClick?: () => void;
  visibleTiles?: KPITileVisibility;
}

export function KPIRibbon({
  data,
  onTotalInputClick,
  onTotalOutputClick,
  onTotalScrapClick,
  onTotalRecoveryClick,
  onTotalWIPClick,
  onContactTimeClick,
  onTotalDelayClick,
  onPressKgHClick,
  onFleetOEEClick,
  onTotalUtilClick,
  onTotalEnergyClick,
  onTotalGasClick,
  visibleTiles,
}: KPIRibbonProps) {
  const allTiles: (KPITile & { visKey: keyof KPITileVisibility })[] = [
    {
      visKey: "totalInput",
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
      visKey: "totalOutput",
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
      visKey: "totalScrap",
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
      visKey: "recovery",
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
      visKey: "wipStock",
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
      visKey: "contactTime",
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
      visKey: "totalDelay",
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
      visKey: "ppPlanAct",
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
      visKey: "fleetOEE",
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
      visKey: "totalUtil",
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
      visKey: "energy",
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
    {
      visKey: "gasConsumption",
      label: "Gas",
      value: data.totalGas.toFixed(2),
      unit: "Nm³",
      icon: <Flame size={14} />,
      color: "#9333ea",
      bgColor: "#faf5ff",
      borderColor: "#a855f7",
      onClick: onTotalGasClick,
      ocid: "kpi.gas.button",
    },
  ];

  // Filter tiles based on visibility settings
  const tiles = visibleTiles
    ? allTiles.filter((t) => visibleTiles[t.visKey] !== false)
    : allTiles;

  return (
    <div
      className="grid border-b"
      style={{
        gridTemplateColumns: `repeat(${tiles.length}, 1fr)`,
        background: "#f0f2f5",
        borderColor: "#e4e7ed",
        gap: "1px",
        padding: "1px",
      }}
    >
      {tiles.map((tile) => (
        <GrafanaStatTile
          key={tile.label}
          label={tile.label}
          value={tile.value}
          unit={tile.unit}
          thresholdColor={tile.color}
          onClick={tile.onClick}
          data-ocid={tile.onClick ? tile.ocid : undefined}
        />
      ))}
    </div>
  );
}
