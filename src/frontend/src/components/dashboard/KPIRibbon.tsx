import {
  Activity,
  AlertTriangle,
  BarChart2,
  Battery,
  Box,
  Clock,
  Package,
  Recycle,
  TrendingDown,
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
}

interface KPIRibbonProps {
  data: {
    totalInput: number;
    totalOutput: number;
    totalDelay: number;
    totalScrap: number;
    fleetOEE: number;
    totalUtil: number;
    totalEnergy: number;
    totalFGS: number;
    totalWIP: number;
    totalBacklog: number;
  };
  onTotalInputClick?: () => void;
}

export function KPIRibbon({ data, onTotalInputClick }: KPIRibbonProps) {
  const tiles: KPITile[] = [
    {
      label: "Total Input",
      value: data.totalInput.toFixed(1),
      unit: "MT",
      icon: <Package size={14} />,
      color: "#22c55e",
      bgColor: "#22c55e15",
      borderColor: "#22c55e",
    },
    {
      label: "Total Output",
      value: data.totalOutput.toFixed(1),
      unit: "MT",
      icon: <Activity size={14} />,
      color: "#22c55e",
      bgColor: "#22c55e15",
      borderColor: "#22c55e",
    },
    {
      label: "Total Delay",
      value: data.totalDelay,
      unit: "min",
      icon: <AlertTriangle size={14} />,
      color: "#ef4444",
      bgColor: "#ef444415",
      borderColor: "#ef4444",
    },
    {
      label: "Total Scrap",
      value: data.totalScrap.toFixed(1),
      unit: "%",
      icon: <Recycle size={14} />,
      color: "#f97316",
      bgColor: "#f9731615",
      borderColor: "#f97316",
    },
    {
      label: "Fleet OEE",
      value: data.fleetOEE.toFixed(1),
      unit: "%",
      icon: <BarChart2 size={14} />,
      color: "#06b6d4",
      bgColor: "#06b6d415",
      borderColor: "#06b6d4",
    },
    {
      label: "Total Util",
      value: data.totalUtil.toFixed(1),
      unit: "%",
      icon: <TrendingDown size={14} />,
      color: "#3b82f6",
      bgColor: "#3b82f615",
      borderColor: "#3b82f6",
    },
    {
      label: "Total Energy",
      value: data.totalEnergy.toFixed(2),
      unit: "kWh",
      icon: <Zap size={14} />,
      color: "#f59e0b",
      bgColor: "#f59e0b15",
      borderColor: "#f59e0b",
    },
    {
      label: "Total FGS",
      value: data.totalFGS.toFixed(1),
      unit: "MT",
      icon: <Box size={14} />,
      color: "#22c55e",
      bgColor: "#22c55e15",
      borderColor: "#22c55e",
    },
    {
      label: "Total WIP",
      value: data.totalWIP.toFixed(1),
      unit: "MT",
      icon: <Clock size={14} />,
      color: "#3b82f6",
      bgColor: "#3b82f615",
      borderColor: "#3b82f6",
    },
    {
      label: "Total Backlog",
      value: data.totalBacklog.toLocaleString(),
      unit: "MT",
      icon: <Battery size={14} />,
      color: "#a855f7",
      bgColor: "#a855f715",
      borderColor: "#a855f7",
    },
  ];

  return (
    <div
      className="grid border-b border-[#162030]"
      style={{
        gridTemplateColumns: `repeat(${tiles.length}, 1fr)`,
        background: "#07101d",
        boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
      }}
    >
      {tiles.map((tile, i) => {
        const isTotalInput = tile.label === "Total Input";
        const clickable = isTotalInput && onTotalInputClick;
        return (
          <div
            key={tile.label}
            className="relative flex flex-col justify-between px-2.5 py-2"
            onClick={clickable ? onTotalInputClick : undefined}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTotalInputClick();
                    }
                  }
                : undefined
            }
            aria-label={
              clickable ? "View press wise input breakdown" : undefined
            }
            style={{
              background: tile.bgColor,
              borderRight: i < tiles.length - 1 ? "1px solid #162035" : "none",
              borderTop: `2px solid ${tile.borderColor}`,
              minHeight: "62px",
              cursor: clickable ? "pointer" : "default",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={
              clickable
                ? (e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#22c55e20";
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
                style={{ color: "#4a6080", letterSpacing: "0.08em" }}
              >
                {tile.label}
                {isTotalInput && onTotalInputClick && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    role="img"
                    aria-label="View details"
                    style={{ color: "#22c55e60", marginLeft: "2px" }}
                  >
                    <path
                      d="M1 1h6v6M7 1L1 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className="flex items-center justify-center w-5 h-5 rounded"
                style={{
                  color: tile.color,
                  background: `${tile.borderColor}18`,
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
                  fontSize: "22px",
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                  textShadow: `0 0 20px ${tile.borderColor}60`,
                }}
              >
                {tile.value}
              </span>
              <span
                className="text-[10px] font-bold ml-0.5"
                style={{ color: `${tile.borderColor}99` }}
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
