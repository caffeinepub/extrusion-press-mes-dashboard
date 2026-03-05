import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressDelayRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  delayMin: number;
  topReason: string;
  setupTimeMin: number;
  idleTimeMin: number;
  accentColor: string;
}

interface TotalDelayModalProps {
  open: boolean;
  onClose: () => void;
  totalDelay: number;
}

const STATUS_STYLES: Record<
  PressDelayRow["status"],
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

const ACCENT_COLOR = "#dc2626";

const BASE_DELAYS = [18, 180, 20, 15, 12];
const TOP_REASONS = [
  "Die Change",
  "Breakdown",
  "Maintenance",
  "Setup",
  "Operator Delay",
];
const SETUP_TIMES = [8, 45, 10, 7, 6];
const IDLE_TIMES = [10, 135, 10, 8, 6];

function buildPressData(totalDelay: number): PressDelayRow[] {
  const baseSum = BASE_DELAYS.reduce((a, b) => a + b, 0);
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressDelayRow["status"];
  }> = [
    { pressId: "P3300", pressName: "Titan", status: "Running" },
    { pressId: "P2500", pressName: "Atlas", status: "Breakdown" },
    { pressId: "P1800", pressName: "Vulcan", status: "Running" },
    { pressId: "P1460", pressName: "Hermes", status: "Running" },
    { pressId: "P1100", pressName: "Swift", status: "Running" },
  ];

  return presses.map((p, i) => {
    const scaledDelay = Math.round((BASE_DELAYS[i] / baseSum) * totalDelay);
    const scale = scaledDelay / BASE_DELAYS[i];
    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      delayMin: scaledDelay,
      topReason: TOP_REASONS[i],
      setupTimeMin: Math.round(SETUP_TIMES[i] * scale),
      idleTimeMin: Math.round(IDLE_TIMES[i] * scale),
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

function delayColor(min: number): string {
  if (min > 60) return "#dc2626";
  if (min >= 20) return "#ea580c";
  return "#475569";
}

export function TotalDelayModal({
  open,
  onClose,
  totalDelay,
}: TotalDelayModalProps) {
  const pressRows = buildPressData(totalDelay);
  const sumDelay = pressRows.reduce((acc, r) => acc + r.delayMin, 0);
  const sumSetup = pressRows.reduce((acc, r) => acc + r.setupTimeMin, 0);
  const sumIdle = pressRows.reduce((acc, r) => acc + r.idleTimeMin, 0);

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
        data-ocid="kpi.total_delay.modal"
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
          data-ocid="kpi.total_delay.close_button"
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
                TOTAL DELAY — PRESS WISE BREAKDOWN
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
                {totalDelay}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#fca5a5" }}
              >
                MIN TOTAL DELAY
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
              DELAY CONTRIBUTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct = sumDelay > 0 ? (row.delayMin / sumDelay) * 100 : 0;
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
                          background: delayColor(row.delayMin),
                          opacity: 0.85,
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
                      className="text-[10px] tabular-nums w-[52px] text-right shrink-0"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.delayMin} min
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
                      "DELAY (MIN)",
                      "TOP REASON",
                      "SETUP TIME (MIN)",
                      "IDLE TIME (MIN)",
                      "DELAY %",
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
                    const pct =
                      sumDelay > 0 ? (row.delayMin / sumDelay) * 100 : 0;
                    const st = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`kpi.total_delay_modal.row.${idx + 1}`}
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
                            color: delayColor(row.delayMin),
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.delayMin}
                        </td>
                        <td
                          className="px-3 py-2.5 text-[10px]"
                          style={{ color: "#475569" }}
                        >
                          {row.topReason}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.setupTimeMin}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.idleTimeMin}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{
                                background: "#e2e8f0",
                                minWidth: "60px",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: delayColor(row.delayMin),
                                  opacity: 0.8,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums w-[32px] text-right shrink-0"
                              style={{
                                color: row.accentColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#fef2f2",
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
                      {sumDelay}
                    </td>
                    <td
                      className="px-3 py-2.5 text-[10px]"
                      style={{ color: "#64748b" }}
                    >
                      —
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumSetup}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumIdle}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      100%
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
                PressDelayRow["status"]
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
