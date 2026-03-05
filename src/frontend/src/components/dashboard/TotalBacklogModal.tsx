import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressBacklogRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  backlogMT: number;
  ordersPending: number;
  delayedOrders: number;
  onTimePct: number;
  avgAgingDays: number;
  accentColor: string;
}

interface TotalBacklogModalProps {
  open: boolean;
  onClose: () => void;
  totalBacklog: number;
}

const STATUS_STYLES: Record<
  PressBacklogRow["status"],
  { bg: string; color: string; label: string }
> = {
  Running: { bg: "#dcfce7", color: "#16a34a", label: "RUNNING" },
  Idle: { bg: "#ca8a0422", color: "#f59e0b", label: "IDLE" },
  Breakdown: { bg: "#dc262622", color: "#ef4444", label: "BREAKDOWN" },
  Setup: { bg: "#2563eb22", color: "#60a5fa", label: "SETUP" },
};

const PRESS_ACCENT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
];

const ACCENT_COLOR = "#7c3aed";

const WEIGHTS = [0.24, 0.12, 0.22, 0.21, 0.21];
const ORDERS_PENDING = [18, 12, 16, 15, 14];
const DELAYED_ORDERS = [2, 6, 2, 2, 1];
const ON_TIME_PCTS = [91.2, 62.3, 88.9, 90.1, 93.5];
const AVG_AGING_DAYS = [2.3, 6.1, 2.8, 2.1, 1.9];

function buildPressData(totalBacklog: number): PressBacklogRow[] {
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressBacklogRow["status"];
  }> = [
    { pressId: "P3300", pressName: "P3300", status: "Running" },
    { pressId: "P2500", pressName: "P2500", status: "Breakdown" },
    { pressId: "P1800", pressName: "P1800", status: "Running" },
    { pressId: "P1460", pressName: "P1460", status: "Running" },
    { pressId: "P1100", pressName: "P1100", status: "Running" },
  ];

  return presses.map((p, i) => ({
    pressId: p.pressId,
    pressName: p.pressName,
    status: p.status,
    backlogMT: totalBacklog * WEIGHTS[i],
    ordersPending: ORDERS_PENDING[i],
    delayedOrders: DELAYED_ORDERS[i],
    onTimePct: ON_TIME_PCTS[i],
    avgAgingDays: AVG_AGING_DAYS[i],
    accentColor: PRESS_ACCENT_COLORS[i],
  }));
}

export function TotalBacklogModal({
  open,
  onClose,
  totalBacklog,
}: TotalBacklogModalProps) {
  const pressRows = buildPressData(totalBacklog);
  const sumBacklog = pressRows.reduce((acc, r) => acc + r.backlogMT, 0);
  const totalOrders = pressRows.reduce((acc, r) => acc + r.ordersPending, 0);
  const totalDelayed = pressRows.reduce((acc, r) => acc + r.delayedOrders, 0);
  const avgOnTime =
    pressRows.reduce((acc, r) => acc + r.onTimePct, 0) / pressRows.length;
  const avgAging =
    pressRows.reduce((acc, r) => acc + r.avgAgingDays, 0) / pressRows.length;

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
        data-ocid="kpi.total_backlog.modal"
        style={{
          maxWidth: "860px",
          width: "95vw",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded transition-colors"
          style={{ color: "#64748b", background: "#f1f5f9" }}
          aria-label="Close"
          data-ocid="kpi.total_backlog.close_button"
        >
          <X size={14} />
        </button>

        <DialogHeader className="px-5 pt-5 pb-0">
          <div
            className="flex items-center gap-2 mb-1"
            style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}
          >
            <div
              className="w-1 h-8 rounded-full shrink-0"
              style={{ background: ACCENT_COLOR }}
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
                TOTAL BACKLOG — PRESS WISE BREAKDOWN
              </DialogTitle>
              <p
                className="text-[10px] mt-0.5"
                style={{
                  color: "#64748b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {dateLabel} &nbsp;·&nbsp; SHIFT A &nbsp;·&nbsp; ORDER AGING
                ANALYSIS
              </p>
            </div>
            <div
              className="ml-auto flex flex-col items-end"
              style={{ paddingRight: "28px" }}
            >
              <span
                className="text-[24px] font-black tabular-nums"
                style={{
                  color: ACCENT_COLOR,
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {totalBacklog.toFixed(1)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#d8b4fe" }}
              >
                MT TOTAL BACKLOG
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 pt-3 pb-5">
          {/* Mini bar chart */}
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
              BACKLOG DISTRIBUTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct =
                  sumBacklog > 0 ? (row.backlogMT / sumBacklog) * 100 : 0;
                return (
                  <div key={row.pressId} className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold w-[90px] shrink-0"
                      style={{
                        color: row.accentColor,
                        fontFamily: '"JetBrains Mono", monospace',
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
                          width: `${pct}%`,
                          background: ACCENT_COLOR,
                          opacity: row.status === "Breakdown" ? 0.5 : 0.85,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-bold w-[38px] text-right tabular-nums shrink-0"
                      style={{
                        color: row.accentColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {pct.toFixed(1)}%
                    </span>
                    <span
                      className="text-[10px] tabular-nums w-[48px] text-right shrink-0"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.backlogMT.toFixed(2)} MT
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Table */}
          <ScrollArea style={{ maxHeight: "300px" }}>
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
                      "BACKLOG (MT)",
                      "ORDERS PENDING",
                      "DELAYED ORDERS",
                      "ON-TIME %",
                      "AVG AGING (DAYS)",
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
                        data-ocid={`kpi.total_backlog_modal.row.${idx + 1}`}
                        style={{
                          background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
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
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: "#1e293b",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.backlogMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-center"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.ordersPending}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-center"
                          style={{
                            color:
                              row.delayedOrders > 3
                                ? "#dc2626"
                                : row.delayedOrders > 1
                                  ? "#d97706"
                                  : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.delayedOrders}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color:
                              row.onTimePct >= 90
                                ? "#16a34a"
                                : row.onTimePct >= 75
                                  ? "#d97706"
                                  : "#dc2626",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.onTimePct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color:
                              row.avgAgingDays > 5
                                ? "#dc2626"
                                : row.avgAgingDays > 3
                                  ? "#d97706"
                                  : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.avgAgingDays.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#fdf4ff",
                      borderTop: `2px solid ${ACCENT_COLOR}`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: ACCENT_COLOR }}
                      colSpan={2}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumBacklog.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-center"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalOrders}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-center"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalDelayed}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgOnTime.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgAging.toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ScrollArea>

          {/* Legend + timestamp */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {(
              ["Running", "Idle", "Breakdown", "Setup"] as Array<
                PressBacklogRow["status"]
              >
            ).map((s) => {
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
