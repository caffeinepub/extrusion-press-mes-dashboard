import { Info, Settings } from "lucide-react";
import type { ReactNode } from "react";

interface GrafanaPanelProps {
  title: string;
  accentColor?: string;
  children: ReactNode;
  className?: string;
  onGearClick?: () => void;
  onInfoClick?: () => void;
  badge?: ReactNode;
}

export function GrafanaPanel({
  title,
  accentColor = "#464c54",
  children,
  className = "",
  onGearClick,
  onInfoClick,
  badge,
}: GrafanaPanelProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{
        border: "1px solid #e4e7ed",
        borderRadius: "3px",
        background: "#ffffff",
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: "32px",
          background: "#f7f8fa",
          borderBottom: "1px solid #e4e7ed",
        }}
      >
        {/* Left accent bar */}
        <div
          className="shrink-0 self-stretch"
          style={{ width: "3px", background: accentColor }}
        />

        {/* Title */}
        <div className="flex items-center gap-2 flex-1 px-2 min-w-0">
          <span
            className="truncate"
            style={{
              color: "#464c54",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: '"General Sans", system-ui, sans-serif',
            }}
          >
            {title}
          </span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 px-2 shrink-0">
          {onInfoClick && (
            <button
              type="button"
              onClick={onInfoClick}
              className="flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-gray-100"
              title="Panel info"
            >
              <Info
                size={11}
                style={{ color: "#9ea6b3" }}
                className="hover:text-[#464c54] transition-colors"
              />
            </button>
          )}
          {onGearClick && (
            <button
              type="button"
              onClick={onGearClick}
              className="flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-gray-100"
              title="Panel settings"
            >
              <Settings
                size={11}
                style={{ color: "#9ea6b3" }}
                className="hover:text-[#464c54] transition-colors"
              />
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      <div
        className="flex-1 overflow-hidden"
        style={{ background: "#ffffff", padding: "8px" }}
      >
        {children}
      </div>
    </div>
  );
}
