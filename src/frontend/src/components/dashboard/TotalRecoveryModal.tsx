import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressRecoveryRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  inputMT: number;
  outputMT: number;
  scrapMT: number;
  recovery: number;
  accentColor: string;
}

interface TotalRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  totalRecovery: number;
}

const STATUS_STYLES: Record<
  PressRecoveryRow["status"],
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

const BASE_PRESSES: Array<{
  pressId: string;
  pressName: string;
  status: PressRecoveryRow["status"];
  inputMT: number;
  recovery: number;
}> = [
  {
    pressId: "P3300",
    pressName: "P3300",
    status: "Running",
    inputMT: 2.76,
    recovery: 91.5,
  },
  {
    pressId: "P2500",
    pressName: "P2500",
    status: "Breakdown",
    inputMT: 0.53,
    recovery: 68.2,
  },
  {
    pressId: "P1800",
    pressName: "P1800",
    status: "Running",
    inputMT: 2.55,
    recovery: 88.7,
  },
  {
    pressId: "P1460",
    pressName: "P1460",
    status: "Running",
    inputMT: 2.38,
    recovery: 90.1,
  },
  {
    pressId: "P1100",
    pressName: "P1100",
    status: "Running",
    inputMT: 2.43,
    recovery: 94.8,
  },
];

function buildPressData(totalRecovery: number): PressRecoveryRow[] {
  const scale =
    totalRecovery /
    (BASE_PRESSES.reduce((s, p) => s + p.recovery, 0) / BASE_PRESSES.length);
  return BASE_PRESSES.map((p, i) => {
    const recovery = Math.min(99, Math.max(0, p.recovery * scale));
    const outputMT = p.inputMT * (recovery / 100);
    const scrapMT = p.inputMT - outputMT;
    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      inputMT: p.inputMT,
      outputMT,
      scrapMT,
      recovery,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalRecoveryModal({
  open,
  onClose,
  totalRecovery,
}: TotalRecoveryModalProps) {
  const pressRows = buildPressData(totalRecovery);
  const sumInput = pressRows.reduce((s, r) => s + r.inputMT, 0);
  const sumOutput = pressRows.reduce((s, r) => s + r.outputMT, 0);
  const sumScrap = pressRows.reduce((s, r) => s + r.scrapMT, 0);
  const fleetRecovery = sumInput > 0 ? (sumOutput / sumInput) * 100 : 0;

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
          data-ocid="kpi.total_recovery.close_button"
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
              style={{ background: "#16a34a" }}
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
                TOTAL RECOVERY — PRESS WISE BREAKDOWN
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
                  color: "#16a34a",
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {fleetRecovery.toFixed(1)}%
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#86efac" }}
              >
                FLEET RECOVERY
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
              RECOVERY % BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => (
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
                        width: `${row.recovery}%`,
                        background:
                          row.recovery >= 90
                            ? "#22c55e"
                            : row.recovery >= 80
                              ? "#f59e0b"
                              : "#ef4444",
                        opacity: row.status === "Breakdown" ? 0.45 : 0.9,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold w-[42px] text-right tabular-nums shrink-0"
                    style={{
                      color: row.accentColor,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {row.recovery.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

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
                      "INPUT (MT)",
                      "OUTPUT (MT)",
                      "SCRAP (MT)",
                      "RECOVERY %",
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
                    const recColor =
                      row.recovery >= 90
                        ? "#16a34a"
                        : row.recovery >= 80
                          ? "#d97706"
                          : "#dc2626";
                    return (
                      <tr
                        key={row.pressId}
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
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.inputMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.outputMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#dc2626",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.scrapMT.toFixed(2)}
                        </td>
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
                                  width: `${row.recovery}%`,
                                  background: recColor,
                                  opacity:
                                    row.status === "Breakdown" ? 0.5 : 0.85,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                              style={{
                                color: recColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {row.recovery.toFixed(1)}%
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
                      background: "#f0fdf4",
                      borderTop: "2px solid #86efac",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: "#16a34a" }}
                      colSpan={2}
                    >
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumInput.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumOutput.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumScrap.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {fleetRecovery.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ScrollArea>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {(
              ["Running", "Idle", "Breakdown", "Setup"] as Array<
                PressRecoveryRow["status"]
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
            <div className="flex items-center gap-3 ml-auto">
              {[
                { label: "≥90% GOOD", color: "#22c55e" },
                { label: "80-90% WARN", color: "#f59e0b" },
                { label: "<80% POOR", color: "#ef4444" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: l.color }}
                  />
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: "#64748b" }}
                  >
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
