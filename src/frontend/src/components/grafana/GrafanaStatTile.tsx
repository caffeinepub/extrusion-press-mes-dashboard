interface GrafanaStatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  thresholdColor?: string;
  onClick?: () => void;
  "data-ocid"?: string;
}

export function GrafanaStatTile({
  label,
  value,
  unit,
  thresholdColor = "#3b82f6",
  onClick,
  "data-ocid": dataOcid,
}: GrafanaStatTileProps) {
  const clickable = !!onClick;

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      data-ocid={dataOcid}
      className="relative flex flex-col justify-between"
      style={{
        background: "#ffffff",
        border: "1px solid #e4e7ed",
        borderRadius: "3px",
        minHeight: "68px",
        padding: "6px 10px 8px",
        cursor: clickable ? "pointer" : "default",
        transition: "background 0.1s ease",
      }}
      onMouseEnter={
        clickable
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#f7f8fa";
            }
          : undefined
      }
      onMouseLeave={
        clickable
          ? (e) => {
              (e.currentTarget as HTMLDivElement).style.background = "#ffffff";
            }
          : undefined
      }
    >
      {/* Label */}
      <div
        style={{
          fontSize: "9px",
          color: "#6e7783",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 500,
          fontFamily: '"General Sans", system-ui, sans-serif',
          marginBottom: "2px",
        }}
      >
        {label}
      </div>

      {/* Value + Unit */}
      <div className="flex items-baseline gap-1 flex-1">
        <span
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: thresholdColor,
            fontFamily: '"JetBrains Mono", monospace',
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: "10px",
              color: "#9ea6b3",
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Bottom threshold bar */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "3px",
          background: thresholdColor,
          borderRadius: "0 0 2px 2px",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
