import type { downtimeCategories } from "../../mockData";

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

  return (
    <div
      className="flex flex-col rounded border border-[#e2e8f0] overflow-hidden h-full"
      style={{ background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[#e2e8f0]"
        style={{ background: "#f8fafc" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-0.5 h-3.5 rounded-full shrink-0"
            style={{ background: "#ef4444" }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#991b1b", letterSpacing: "0.08em" }}
          >
            Downtime Analysis
          </span>
          <span
            className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded"
            style={{ color: "#dc2626", background: "#fef2f2" }}
          >
            {totalHrs} HRS
          </span>
        </div>
        <span
          className="text-[9px] italic"
          style={{ color: "#94a3b8" }}
          data-ocid="dashboard.downtime.toggle"
        >
          Click bar for press detail
        </span>
      </div>

      {/* Bars */}
      <div className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
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
              className="text-right text-[9.5px] font-semibold shrink-0 truncate transition-colors group-hover:underline"
              style={{ color: "#475569", width: "72px" }}
            >
              {cat.name}
            </div>
            {/* Bar track */}
            <div
              className="flex-1 rounded overflow-hidden transition-opacity group-hover:opacity-80"
              style={{ background: "#f1f5f9", height: "20px" }}
            >
              <div
                className="h-full rounded flex items-center transition-all"
                style={{
                  width: `${(cat.percentage / maxPct) * 100}%`,
                  background: `linear-gradient(90deg, ${cat.color}cc, ${cat.color})`,
                  minWidth: "6px",
                }}
              />
            </div>
            {/* Value */}
            <div
              className="text-right text-[10px] font-black font-mono shrink-0 tabular-nums"
              style={{ color: cat.color, width: "36px" }}
            >
              {cat.percentage}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
