import { useLiveData } from "../../context/LiveDataContext";

interface DataSourceBadgeProps {
  onSettingsClick?: () => void;
}

export function DataSourceBadge({ onSettingsClick }: DataSourceBadgeProps) {
  const { isLiveMode, livePressList } = useLiveData();

  const isActuallyLive = isLiveMode && livePressList.length > 0;

  return (
    <button
      type="button"
      onClick={onSettingsClick}
      data-ocid="nav.datasource.badge"
      title={
        isActuallyLive
          ? "Live data connected — click to configure"
          : "Using mock data — click to configure live connection"
      }
      className="flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[9px] transition-opacity hover:opacity-85 shrink-0"
      style={{
        background: isActuallyLive ? "#22c55e" : "#94a3b8",
        color: "#ffffff",
        letterSpacing: "0.06em",
        border: "none",
        cursor: "pointer",
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          background: isActuallyLive ? "#bbf7d0" : "#e2e8f0",
          boxShadow: isActuallyLive ? "0 0 0 2px #16a34a40" : "none",
        }}
      />
      {isActuallyLive ? "LIVE" : "MOCK"}
    </button>
  );
}
