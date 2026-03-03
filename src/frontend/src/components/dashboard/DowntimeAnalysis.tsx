import type { downtimeCategories } from "../../mockData";

type DowntimeCategory = (typeof downtimeCategories)[number];

interface DowntimeAnalysisProps {
  categories: DowntimeCategory[];
  totalHrs: number;
}

export function DowntimeAnalysis({
  categories,
  totalHrs,
}: DowntimeAnalysisProps) {
  const maxPct = Math.max(...categories.map((c) => c.percentage));

  return (
    <div
      className="flex flex-col rounded border border-[#1e2d45] overflow-hidden h-full"
      style={{ background: "#0f1729" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a2d45]"
        style={{ background: "#0a111e" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-0.5 h-3 rounded-full"
            style={{ background: "#ef4444" }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#7090b0", letterSpacing: "0.1em" }}
          >
            Downtime Analysis
          </span>
          <span
            className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded"
            style={{ color: "#ef4444", background: "#ef444418" }}
          >
            {totalHrs} HRS
          </span>
        </div>
        <span className="text-[9px]" style={{ color: "#253040" }}>
          dbl-click to reset
        </span>
      </div>

      {/* Bars */}
      <div className="flex-1 px-3 py-1.5 space-y-1 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div
              className="text-right text-[9px] font-semibold shrink-0 truncate"
              style={{ color: "#4a6080", width: "68px" }}
            >
              {cat.name}
            </div>
            <div
              className="flex-1 h-[14px] rounded-sm overflow-hidden"
              style={{ background: "#0d1826" }}
            >
              <div
                className="h-full rounded-sm flex items-center transition-all"
                style={{
                  width: `${(cat.percentage / maxPct) * 100}%`,
                  background: `linear-gradient(90deg, ${cat.color}cc, ${cat.color})`,
                  minWidth: "4px",
                }}
              />
            </div>
            <div
              className="text-right text-[9px] font-black font-mono shrink-0 tabular-nums"
              style={{ color: cat.color, width: "34px" }}
            >
              {cat.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
