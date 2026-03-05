import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressWIPRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  wipMT: number;
  orderCount: number;
  avgAgingHrs: number;
  oldestOrderHrs: number;
  share: number; // % of this bucket's total WIP
  accentColor: string;
}

interface WIPAgingPressModalProps {
  open: boolean;
  onClose: () => void;
  bucketLabel: string; // e.g. "< 24 HR"
  bucketColor: string;
  bucketTotalMT: number;
}

const STATUS_STYLES: Record<
  PressWIPRow["status"],
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

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildWIPPressData(
  bucketLabel: string,
  bucketTotalMT: number,
): PressWIPRow[] {
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressWIPRow["status"];
  }> = [
    { pressId: "P3300", pressName: "Titan", status: "Running" },
    { pressId: "P2500", pressName: "Atlas", status: "Breakdown" },
    { pressId: "P1800", pressName: "Vulcan", status: "Running" },
    { pressId: "P1460", pressName: "Hermes", status: "Idle" },
    { pressId: "P1100", pressName: "Swift", status: "Running" },
  ];

  const seed = bucketLabel.charCodeAt(0) + bucketLabel.length * 11;
  const rawWeights = presses.map(
    (_, i) => 0.4 + seededRand(seed + i * 4) * 1.6,
  );
  const sumW = rawWeights.reduce((a, b) => a + b, 0);
  const weights = rawWeights.map((w) => w / sumW);

  // Bucket-specific aging ranges
  let minHrs = 0;
  let maxHrs = 24;
  if (bucketLabel.includes("24-72")) {
    minHrs = 24;
    maxHrs = 72;
  } else if (bucketLabel.includes("72")) {
    minHrs = 72;
    maxHrs = 120;
  }

  return presses.map((p, i) => {
    const wipMT = bucketTotalMT * weights[i];
    const orderCount = Math.round(1 + seededRand(seed + i * 3 + 1) * 8);
    const avgAgingHrs =
      minHrs + seededRand(seed + i * 3 + 2) * (maxHrs - minHrs);
    const oldestOrderHrs = Math.min(
      maxHrs + seededRand(seed + i * 3 + 3) * 12,
      avgAgingHrs * 1.6,
    );

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      wipMT,
      orderCount,
      avgAgingHrs,
      oldestOrderHrs,
      share: weights[i] * 100,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function WIPAgingPressModal({
  open,
  onClose,
  bucketLabel,
  bucketColor,
  bucketTotalMT,
}: WIPAgingPressModalProps) {
  const pressRows = buildWIPPressData(bucketLabel, bucketTotalMT);
  const totalWIP = pressRows.reduce((s, r) => s + r.wipMT, 0);
  const totalOrders = pressRows.reduce((s, r) => s + r.orderCount, 0);
  const avgAging =
    pressRows.reduce((s, r) => s + r.avgAgingHrs, 0) / pressRows.length;

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
          maxWidth: "900px",
          width: "95vw",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        data-ocid="dashboard.wip_press.modal"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded transition-colors"
          style={{ color: "#64748b", background: "#f1f5f9" }}
          aria-label="Close"
          data-ocid="dashboard.wip_press.close_button"
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
              style={{ background: bucketColor }}
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
                WIP AGING — {bucketLabel} — PRESS WISE BREAKDOWN
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
                  color: bucketColor,
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {totalWIP.toFixed(1)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: bucketColor }}
              >
                MT — {bucketLabel}
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
                label: "TOTAL WIP",
                value: `${totalWIP.toFixed(1)} MT`,
                color: bucketColor,
              },
              {
                label: "OPEN ORDERS",
                value: `${totalOrders}`,
                color: "#3b82f6",
              },
              {
                label: "AVG AGING",
                value: `${avgAging.toFixed(1)} HRS`,
                color:
                  avgAging > 72
                    ? "#ef4444"
                    : avgAging > 24
                      ? "#f59e0b"
                      : "#22c55e",
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
              WIP CONTRIBUTION BY PRESS — {bucketLabel}
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
                    {row.wipMT.toFixed(2)} MT
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
                      "WIP (MT)",
                      "ORDERS",
                      "AVG AGING (HRS)",
                      "OLDEST ORDER (HRS)",
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
                        data-ocid={`dashboard.wip_press.row.${idx + 1}`}
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
                        {/* WIP MT */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: bucketColor,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.wipMT.toFixed(2)}
                        </td>
                        {/* Orders */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-center"
                          style={{
                            color: "#3b82f6",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.orderCount}
                        </td>
                        {/* Avg Aging */}
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color:
                              row.avgAgingHrs > 72
                                ? "#dc2626"
                                : row.avgAgingHrs > 24
                                  ? "#f59e0b"
                                  : "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 600,
                          }}
                        >
                          {row.avgAgingHrs.toFixed(1)}
                        </td>
                        {/* Oldest Order */}
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color:
                              row.oldestOrderHrs > 72
                                ? "#dc2626"
                                : row.oldestOrderHrs > 24
                                  ? "#f59e0b"
                                  : "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 600,
                          }}
                        >
                          {row.oldestOrderHrs.toFixed(1)}
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
                      background: `${bucketColor}11`,
                      borderTop: `2px solid ${bucketColor}55`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: bucketColor }}
                      colSpan={2}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: bucketColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalWIP.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-center"
                      style={{
                        color: "#3b82f6",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalOrders}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color:
                          avgAging > 72
                            ? "#dc2626"
                            : avgAging > 24
                              ? "#f59e0b"
                              : "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgAging.toFixed(1)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      —
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: bucketColor,
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
