import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressFGSRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  fgsMT: number;
  targetMT: number;
  achievementPct: number;
  pendingMT: number;
  fgsRateMTHr: number;
  accentColor: string;
}

interface TotalFGSModalProps {
  open: boolean;
  onClose: () => void;
  totalFGS: number;
}

const STATUS_STYLES: Record<
  PressFGSRow["status"],
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

const ACCENT_COLOR = "#16a34a";

const WEIGHTS = [0.24, 0.08, 0.23, 0.22, 0.23];
const TARGET_DAILY_MT = 120;
const TARGET_WEIGHTS = [0.24, 0.2, 0.2, 0.19, 0.17]; // target share per press

function buildPressData(totalFGS: number): PressFGSRow[] {
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressFGSRow["status"];
  }> = [
    { pressId: "P3300", pressName: "P3300", status: "Running" },
    { pressId: "P2500", pressName: "P2500", status: "Breakdown" },
    { pressId: "P1800", pressName: "P1800", status: "Running" },
    { pressId: "P1460", pressName: "P1460", status: "Running" },
    { pressId: "P1100", pressName: "P1100", status: "Running" },
  ];

  return presses.map((p, i) => {
    const fgsMT = totalFGS * WEIGHTS[i];
    const targetMT = TARGET_DAILY_MT * TARGET_WEIGHTS[i];
    const achievementPct = (fgsMT / targetMT) * 100;
    const pendingMT = Math.max(0, targetMT - fgsMT);
    const fgsRateMTHr = fgsMT / 4.5;

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      fgsMT,
      targetMT,
      achievementPct,
      pendingMT,
      fgsRateMTHr,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalFGSModal({ open, onClose, totalFGS }: TotalFGSModalProps) {
  const pressRows = buildPressData(totalFGS);
  const sumFGS = pressRows.reduce((acc, r) => acc + r.fgsMT, 0);
  const sumTarget = pressRows.reduce((acc, r) => acc + r.targetMT, 0);
  const avgAchievement =
    pressRows.reduce((acc, r) => acc + r.achievementPct, 0) / pressRows.length;
  const sumPending = pressRows.reduce((acc, r) => acc + r.pendingMT, 0);
  const sumRate = pressRows.reduce((acc, r) => acc + r.fgsRateMTHr, 0);

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
        data-ocid="kpi.total_fgs.modal"
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
          data-ocid="kpi.total_fgs.close_button"
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
                FINISHED GOODS STOCK — PRESS WISE BREAKDOWN
              </DialogTitle>
              <p
                className="text-[10px] mt-0.5"
                style={{
                  color: "#64748b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {dateLabel} &nbsp;·&nbsp; SHIFT A &nbsp;·&nbsp; DAILY TARGET:{" "}
                {TARGET_DAILY_MT} MT
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
                {totalFGS.toFixed(2)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#86efac" }}
              >
                MT FINISHED GOODS
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
              FGS CONTRIBUTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct = sumFGS > 0 ? (row.fgsMT / sumFGS) * 100 : 0;
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
                          background: row.accentColor,
                          opacity: row.status === "Breakdown" ? 0.45 : 0.9,
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
                      {row.fgsMT.toFixed(2)} MT
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
                      "FGS (MT)",
                      "TARGET (MT)",
                      "ACHIEVEMENT %",
                      "PENDING (MT)",
                      "FGS RATE (MT/HR)",
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
                        data-ocid={`kpi.total_fgs_modal.row.${idx + 1}`}
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
                          {row.fgsMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.targetMT.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color:
                              row.achievementPct >= 90
                                ? "#16a34a"
                                : row.achievementPct >= 70
                                  ? "#d97706"
                                  : "#dc2626",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.achievementPct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: row.pendingMT > 5 ? "#dc2626" : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.pendingMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: ACCENT_COLOR,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.fgsRateMTHr.toFixed(2)}
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
                      {sumFGS.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumTarget.toFixed(1)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgAchievement.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumPending.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumRate.toFixed(2)}
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
                PressFGSRow["status"]
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
