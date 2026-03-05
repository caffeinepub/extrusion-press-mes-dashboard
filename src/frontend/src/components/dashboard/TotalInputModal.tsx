import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressInputRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  billetCount: number;
  inputWeightMT: number;
  avgBilletWtKg: number;
  inputRateMTHr: number;
  accentColor: string;
}

interface TotalInputModalProps {
  open: boolean;
  onClose: () => void;
  totalInput: number;
}

const STATUS_STYLES: Record<
  PressInputRow["status"],
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

function buildPressData(totalInput: number): PressInputRow[] {
  // Realistic distribution — sums to ~totalInput
  const weights = [0.26, 0.05, 0.24, 0.22, 0.23];
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressInputRow["status"];
    billetCount: number;
    tonnesPerBillet: number;
  }> = [
    {
      pressId: "P3300",
      pressName: "P3300",
      status: "Running",
      billetCount: 42,
      tonnesPerBillet: 0.062,
    },
    {
      pressId: "P2500",
      pressName: "P2500",
      status: "Breakdown",
      billetCount: 8,
      tonnesPerBillet: 0.063,
    },
    {
      pressId: "P1800",
      pressName: "P1800",
      status: "Running",
      billetCount: 38,
      tonnesPerBillet: 0.063,
    },
    {
      pressId: "P1460",
      pressName: "P1460",
      status: "Running",
      billetCount: 36,
      tonnesPerBillet: 0.064,
    },
    {
      pressId: "P1100",
      pressName: "P1100",
      status: "Running",
      billetCount: 37,
      tonnesPerBillet: 0.062,
    },
  ];

  return presses.map((p, i) => {
    const inputWeightMT = totalInput * weights[i];
    const avgBilletWtKg = (inputWeightMT * 1000) / p.billetCount;
    // Running presses have a real input rate; broken press has reduced rate
    const hoursElapsed = p.status === "Breakdown" ? 6 : 4.5;
    const inputRateMTHr =
      p.status === "Breakdown"
        ? inputWeightMT / 8
        : inputWeightMT / hoursElapsed;

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      billetCount: p.billetCount,
      inputWeightMT,
      avgBilletWtKg,
      inputRateMTHr,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalInputModal({
  open,
  onClose,
  totalInput,
}: TotalInputModalProps) {
  const pressRows = buildPressData(totalInput);
  const sumInput = pressRows.reduce((acc, r) => acc + r.inputWeightMT, 0);
  const sumBillets = pressRows.reduce((acc, r) => acc + r.billetCount, 0);
  const sumAvgBillet = sumInput > 0 ? (sumInput * 1000) / sumBillets : 0;
  const sumInputRate = pressRows.reduce((acc, r) => acc + r.inputRateMTHr, 0);

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
        {/* Custom close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex items-center justify-center w-7 h-7 rounded transition-colors"
          style={{ color: "#64748b", background: "#f1f5f9" }}
          aria-label="Close"
          data-ocid="kpi.total_input.close_button"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0">
          <div
            className="flex items-center gap-2 mb-1"
            style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}
          >
            {/* Accent strip */}
            <div
              className="w-1 h-8 rounded-full shrink-0"
              style={{ background: "#22c55e" }}
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
                TOTAL INPUT — PRESS WISE BREAKDOWN
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
                  color: "#16a34a",
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {totalInput.toFixed(2)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#86efac" }}
              >
                MT TOTAL INPUT
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
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
              INPUT CONTRIBUTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct =
                  sumInput > 0 ? (row.inputWeightMT / sumInput) * 100 : 0;
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
                      {row.inputWeightMT.toFixed(2)} MT
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
                      "BILLET CT",
                      "INPUT WT (MT)",
                      "AVG BILLET WT (KG)",
                      "INPUT RATE (MT/HR)",
                      "% OF TOTAL",
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
                      sumInput > 0 ? (row.inputWeightMT / sumInput) * 100 : 0;
                    const st = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.pressId}
                        style={{
                          background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {/* Press ID */}
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
                        {/* Status badge */}
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
                        {/* Billet Count */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-center"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.billetCount}
                        </td>
                        {/* Input Weight */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: "#1e293b",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.inputWeightMT.toFixed(2)}
                        </td>
                        {/* Avg Billet Wt */}
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.avgBilletWtKg.toFixed(1)}
                        </td>
                        {/* Input Rate */}
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color:
                              row.status === "Breakdown"
                                ? "#dc2626"
                                : "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.inputRateMTHr.toFixed(2)}
                        </td>
                        {/* % of Total with progress bar */}
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
                                  background: row.accentColor,
                                  opacity:
                                    row.status === "Breakdown" ? 0.5 : 0.85,
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

                {/* Summary / Totals row */}
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
                      className="px-3 py-2.5 tabular-nums font-bold text-center"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumBillets}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumInput.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumAvgBillet.toFixed(1)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumInputRate.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#16a34a",
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

          {/* Legend row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {(
              ["Running", "Idle", "Breakdown", "Setup"] as Array<
                PressInputRow["status"]
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
