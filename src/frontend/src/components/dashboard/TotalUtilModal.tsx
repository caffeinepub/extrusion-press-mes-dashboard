import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressUtilRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  utilPct: number;
  plannedHrs: number;
  actualRunHrs: number;
  idleHrs: number;
  breakdownHrs: number;
  accentColor: string;
}

interface TotalUtilModalProps {
  open: boolean;
  onClose: () => void;
  totalUtil: number;
}

const STATUS_STYLES: Record<
  PressUtilRow["status"],
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

const ACCENT_COLOR = "#2563eb";

const UTIL_PCTS = [91.2, 38.5, 87.3, 89.6, 95.8];
const PLANNED_HRS = 8;
const BREAKDOWN_HRS = [0, 3.0, 0, 0, 0];

function buildPressData(totalUtil: number): PressUtilRow[] {
  const baseAvg = UTIL_PCTS.reduce((a, b) => a + b, 0) / UTIL_PCTS.length;
  const scale = totalUtil / baseAvg;

  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressUtilRow["status"];
  }> = [
    { pressId: "P3300", pressName: "Titan", status: "Running" },
    { pressId: "P2500", pressName: "Atlas", status: "Breakdown" },
    { pressId: "P1800", pressName: "Vulcan", status: "Running" },
    { pressId: "P1460", pressName: "Hermes", status: "Running" },
    { pressId: "P1100", pressName: "Swift", status: "Running" },
  ];

  return presses.map((p, i) => {
    const utilPct = Math.min(99, UTIL_PCTS[i] * scale);
    const actualRunHrs = PLANNED_HRS * (utilPct / 100);
    const breakdownHrs = BREAKDOWN_HRS[i];
    const idleHrs = Math.max(0, PLANNED_HRS - actualRunHrs - breakdownHrs);

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      utilPct,
      plannedHrs: PLANNED_HRS,
      actualRunHrs,
      idleHrs,
      breakdownHrs,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalUtilModal({
  open,
  onClose,
  totalUtil,
}: TotalUtilModalProps) {
  const pressRows = buildPressData(totalUtil);
  const avgUtil =
    pressRows.reduce((acc, r) => acc + r.utilPct, 0) / pressRows.length;
  const totalPlanned = pressRows.reduce((acc, r) => acc + r.plannedHrs, 0);
  const totalActual = pressRows.reduce((acc, r) => acc + r.actualRunHrs, 0);
  const totalIdle = pressRows.reduce((acc, r) => acc + r.idleHrs, 0);
  const totalBreakdown = pressRows.reduce((acc, r) => acc + r.breakdownHrs, 0);

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
        data-ocid="kpi.total_util.modal"
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
          data-ocid="kpi.total_util.close_button"
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
                TOTAL UTILIZATION — PRESS WISE BREAKDOWN
              </DialogTitle>
              <p
                className="text-[10px] mt-0.5"
                style={{
                  color: "#64748b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {dateLabel} &nbsp;·&nbsp; SHIFT A &nbsp;·&nbsp; PLANNED: 8 HRS /
                PRESS
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
                {totalUtil.toFixed(1)}%
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#93c5fd" }}
              >
                FLEET UTILIZATION
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
              UTILIZATION % BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
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
                          width: `${row.utilPct}%`,
                          background:
                            row.utilPct >= 80
                              ? ACCENT_COLOR
                              : row.utilPct >= 60
                                ? "#d97706"
                                : "#dc2626",
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
                      {row.utilPct.toFixed(1)}%
                    </span>
                    <span
                      className="text-[10px] tabular-nums w-[52px] text-right shrink-0"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.actualRunHrs.toFixed(1)} hrs
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
                      "UTIL %",
                      "PLANNED (HRS)",
                      "ACTUAL RUN (HRS)",
                      "IDLE (HRS)",
                      "BREAKDOWN (HRS)",
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
                        data-ocid={`kpi.total_util_modal.row.${idx + 1}`}
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
                          className="px-3 py-2.5 tabular-nums font-black text-right"
                          style={{
                            color: row.utilPct >= 80 ? ACCENT_COLOR : "#dc2626",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.utilPct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.plannedHrs.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.actualRunHrs.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: row.idleHrs > 1 ? "#d97706" : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.idleHrs.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: row.breakdownHrs > 0 ? "#dc2626" : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.breakdownHrs.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#eff6ff",
                      borderTop: `2px solid ${ACCENT_COLOR}`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: ACCENT_COLOR }}
                      colSpan={2}
                    >
                      FLEET AVERAGE / TOTAL
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgUtil.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalPlanned.toFixed(1)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalActual.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalIdle.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalBreakdown.toFixed(1)}
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
                PressUtilRow["status"]
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
