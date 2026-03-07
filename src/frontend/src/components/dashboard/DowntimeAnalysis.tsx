import type { downtimeCategories } from "../../mockData";
import { GrafanaPanel } from "../grafana/GrafanaPanel";

type DowntimeCategory = (typeof downtimeCategories)[number];

interface DowntimeAnalysisProps {
  categories: DowntimeCategory[];
  totalHrs: number;
  onCategoryClick?: (category: DowntimeCategory) => void;
}

export function DowntimeAnalysis({
  categories,
  totalHrs,
  onCategoryClick,
}: DowntimeAnalysisProps) {
  const maxPct = Math.max(...categories.map((c) => c.percentage));

  const totalBadge = (
    <span
      className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
      style={{ color: "#dc2626", background: "#fef2f2" }}
    >
      {totalHrs} HRS
    </span>
  );

  return (
    <GrafanaPanel
      title="Downtime Analysis"
      accentColor="#ef4444"
      badge={totalBadge}
      className="h-full"
    >
      <div
        className="flex flex-col gap-1.5 overflow-y-auto"
        style={{ minHeight: 140 }}
      >
        <div
          className="text-right mb-0.5"
          style={{ fontSize: "8px", color: "#9ea6b3", fontStyle: "italic" }}
          data-ocid="dashboard.downtime.toggle"
        >
          Click bar for press detail
        </div>
        {categories.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            className="w-full flex items-center gap-2.5 rounded transition-colors group"
            style={{ cursor: "pointer", background: "transparent" }}
            onClick={() => onCategoryClick?.(cat)}
            data-ocid={`dashboard.downtime.bar.${idx + 1}`}
            title={`Click to see press-wise breakdown for ${cat.name}`}
          >
            {/* Label */}
            <div
              className="text-right text-[9px] font-semibold shrink-0 truncate group-hover:underline"
              style={{ color: "#6e7783", width: "68px" }}
            >
              {cat.name}
            </div>
            {/* Bar track */}
            <div
              className="flex-1 rounded overflow-hidden group-hover:opacity-80 transition-opacity"
              style={{ background: "#f0f2f5", height: "18px" }}
            >
              <div
                className="h-full rounded flex items-center transition-all"
                style={{
                  width: `${(cat.percentage / maxPct) * 100}%`,
                  background: cat.color,
                  minWidth: "6px",
                  opacity: 0.85,
                }}
              />
            </div>
            {/* Value */}
            <div
              className="text-right text-[10px] font-bold font-mono shrink-0 tabular-nums"
              style={{ color: cat.color, width: "34px" }}
            >
              {cat.percentage}%
            </div>
          </button>
        ))}
      </div>
    </GrafanaPanel>
  );
}
