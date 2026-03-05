import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressDowntimeRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  downtimeHrs: number;
  incidents: number;
  avgDurationMin: number;
  mttr: number; // Mean Time To Repair (min)
  share: number; // % of this category's total downtime
  accentColor: string;
}

interface DowntimePressModalProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  categoryColor: string;
  totalHrs: number; // total plant downtime hrs for context
}

const STATUS_STYLES: Record<
  PressDowntimeRow["status"],
  { bg: string; color: string; label: string }
> = {
  Running: { bg: "#dcfce7", color: "#16a34a", label: "RUNNING" },
  Idle: { bg: "#fef3c722", color: "#f59e0b", label: "IDLE" },
  Breakdown: { bg: "#fecaca", color: "#ef4444", label: "BREAKDOWN" },
  Setup: { bg: "#dbeafe", color: "#3b82f6", label: "SETUP" },
};

const PRESS_ACCENT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
];

// Seeded pseudo-random for deterministic mock data
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildDowntimePressData(
  categoryName: string,
  totalHrs: number,
): PressDowntimeRow[] {
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressDowntimeRow["status"];
  }> = [
    { pressId: "P3300", pressName: "Titan", status: "Running" },
    { pressId: "P2500", pressName: "Atlas", status: "Breakdown" },
    { pressId: "P1800", pressName: "Vulcan", status: "Running" },
    { pressId: "P1460", pressName: "Hermes", status: "Idle" },
    { pressId: "P1100", pressName: "Swift", status: "Running" },
  ];

  // Use category name as seed for deterministic distribution
  const seed = categoryName.charCodeAt(0) + categoryName.length * 7;
  const rawWeights = presses.map(
    (_, i) => 0.5 + seededRand(seed + i * 3) * 1.5,
  );
  const sumW = rawWeights.reduce((a, b) => a + b, 0);
  const weights = rawWeights.map((w) => w / sumW);

  const categoryHrs = totalHrs * (0.08 + seededRand(seed + 100) * 0.18); // 8-26% of total

  return presses.map((p, i) => {
    const downtimeHrs = categoryHrs * weights[i];
    const incidents = Math.round(1 + seededRand(seed + i * 5 + 1) * 7);
    const avgDurationMin = (downtimeHrs * 60) / Math.max(incidents, 1);
    const mttr = avgDurationMin * (0.7 + seededRand(seed + i * 5 + 2) * 0.6);

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      downtimeHrs,
      incidents,
      avgDurationMin,
      mttr,
      share: weights[i] * 100,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function DowntimePressModal({
  open,
  onClose,
  categoryName,
  categoryColor,
  totalHrs,
}: DowntimePressModalProps) {
  const pressRows = buildDowntimePressData(categoryName, totalHrs);
  const totalCategoryHrs = pressRows.reduce((s, r) => s + r.downtimeHrs, 0);
  const totalIncidents = pressRows.reduce((s, r) => s + r.incidents, 0);
  const avgMTTR = pressRows.reduce((s, r) => s + r.mttr, 0) / pressRows.length;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 border-0 overflow-hidden"
        style={{
          maxWidth: "880px",
          width: "95vw",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        data-ocid="dashboard.downtime_press.modal"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded transition-colors"
          style={{ color: "#64748b", background: "#f1f5f9" }}
          aria-label="Close"
          data-ocid="dashboard.downtime_press.close_button"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0">
          <div
            className="flex items-center gap-2 mb-1"
            style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}
          >
            <div
              className="w-1 h-8 rounded-full shrink-0"
              style={{ background: categoryColor }}
            />
            <div>
              <DialogTitle
                className="text-base font-bold tracking-wide"
                style={{
                  color: "#1e3a5f",
                  fontFamily: '"Mona Sans", system-ui, sans-serif',
                  letterSpacing: "0.04em",
                }}
              >
                DOWNTIME — {categoryName.toUpperCase()} — PRESS WISE BREAKDOWN
              </DialogTitle>
              <p
                className="text-[10px] mt-0.5"
                style={{
                  color: "#64748b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {dateLabel} &nbsp;·&nbsp; SHIFT A &nbsp;·&nbsp; 5 PRESSES
                MONITORED
              </p>
            </div>
            {/* Total badge */}
            <div
              className="ml-auto flex flex-col items-end"
              style={{ paddingRight: "28px" }}
            >
              <span
                className="text-[24px] font-black tabular-nums"
                style={{
                  color: categoryColor,
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {totalCategoryHrs.toFixed(2)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: categoryColor }}
              >
                HRS — {categoryName.toUpperCase()}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 pt-3 pb-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                label: "TOTAL DOWNTIME",
                value: `${totalCategoryHrs.toFixed(2)} HRS`,
                color: categoryColor,
              },
              {
                label: "TOTAL INCIDENTS",
                value: `${totalIncidents}`,
                color: "#ef4444",
              },
              {
                label: "AVG MTTR",
                value: `${avgMTTR.toFixed(1)} MIN`,
                color: "#f59e0b",
              },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded px-3 py-2.5 flex flex-col gap-0.5"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: "#64748b" }}
                >
                  {k.label}
                </span>
                <span
                  className="font-black font-mono text-[18px] leading-tight tabular-nums"
                  style={{ color: k.color }}
                >
                  {k.value}
                </span>
              </div>
            ))}
          </div>

          {/* Horizontal contribution bar chart */}
          <div
            className="mb-4 rounded"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              padding: "10px 14px",
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "#64748b" }}
            >
              DOWNTIME CONTRIBUTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => (
                <div key={row.pressId} className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold shrink-0"
                    style={{
                      color: row.accentColor,
                      fontFamily: '"JetBrains Mono", monospace',
                      width: "100px",
                    }}
                  >
                    {row.pressId} {row.pressName}
                  </span>
                  <div
                    className="flex-1 h-3 rounded-sm overflow-hidden"
                    style={{ background: "#e2e8f0" }}
                  >
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${row.share}%`,
                        background: row.accentColor,
                        opacity: row.status === "Breakdown" ? 0.5 : 0.88,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold tabular-nums shrink-0"
                    style={{
                      color: row.accentColor,
                      fontFamily: '"JetBrains Mono", monospace',
                      width: "38px",
                      textAlign: "right",
                    }}
                  >
                    {row.share.toFixed(1)}%
                  </span>
                  <span
                    className="text-[10px] tabular-nums shrink-0"
                    style={{
                      color: "#475569",
                      fontFamily: '"JetBrains Mono", monospace',
                      width: "52px",
                      textAlign: "right",
                    }}
                  >
                    {row.downtimeHrs.toFixed(2)} hr
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Table */}
          <ScrollArea style={{ maxHeight: "260px" }}>
            <div
              className="rounded overflow-hidden"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "PRESS",
                      "STATUS",
                      "DOWNTIME (HRS)",
                      "INCIDENTS",
                      "AVG DUR (MIN)",
                      "MTTR (MIN)",
                      "% SHARE",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left font-bold uppercase tracking-widest whitespace-nowrap"
                        style={{
                          color: "#64748b",
                          fontSize: "9px",
                          borderBottom: "1px solid #e2e8f0",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pressRows.map((row, idx) => {
                    const st = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.pressId}
                        style={{
                          background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                        data-ocid={`dashboard.downtime_press.row.${idx + 1}`}
                      >
                        {/* Press */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: row.accentColor }}
                            />
                            <span
                              className="font-bold"
                              style={{
                                color: row.accentColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {row.pressId}
                            </span>
                            <span style={{ color: "#475569" }}>
                              {row.pressName}
                            </span>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                            style={{
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.color}30`,
                            }}
                          >
                            {st.label}
                          </span>
                        </td>
                        {/* Downtime hrs */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: categoryColor,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.downtimeHrs.toFixed(2)}
                        </td>
                        {/* Incidents */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-center"
                          style={{
                            color: "#ef4444",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.incidents}
                        </td>
                        {/* Avg Duration */}
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.avgDurationMin.toFixed(1)}
                        </td>
                        {/* MTTR */}
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color:
                              row.mttr > 60
                                ? "#dc2626"
                                : row.mttr > 30
                                  ? "#f59e0b"
                                  : "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 600,
                          }}
                        >
                          {row.mttr.toFixed(1)}
                        </td>
                        {/* % Share with bar */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{
                                background: "#e2e8f0",
                                minWidth: "50px",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.share}%`,
                                  background: row.accentColor,
                                  opacity: 0.85,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums shrink-0"
                              style={{
                                color: row.accentColor,
                                fontFamily: '"JetBrains Mono", monospace',
                                width: "34px",
                                textAlign: "right",
                              }}
                            >
                              {row.share.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr
                    style={{
                      background: `${categoryColor}11`,
                      borderTop: `2px solid ${categoryColor}55`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: categoryColor }}
                      colSpan={2}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: categoryColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalCategoryHrs.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-center"
                      style={{
                        color: "#ef4444",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalIncidents}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {pressRows.reduce((s, r) => s + r.avgDurationMin, 0) /
                        pressRows.length >
                      0
                        ? (
                            pressRows.reduce(
                              (s, r) => s + r.avgDurationMin,
                              0,
                            ) / pressRows.length
                          ).toFixed(1)
                        : "—"}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#f59e0b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgMTTR.toFixed(1)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: categoryColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      100.0%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ScrollArea>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {(["Running", "Idle", "Breakdown", "Setup"] as const).map((s) => {
              const st = STATUS_STYLES[s];
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: st.color }}
                  />
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#64748b" }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
            <span
              className="ml-auto text-[9px]"
              style={{
                color: "#64748b",
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              DATA AS OF{" "}
              {today.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
