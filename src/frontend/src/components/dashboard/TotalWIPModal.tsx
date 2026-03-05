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
  under24HrMT: number;
  h24to72MT: number;
  over72HrMT: number;
  accentColor: string;
}

interface TotalWIPModalProps {
  open: boolean;
  onClose: () => void;
  totalWIP: number;
}

const STATUS_STYLES: Record<
  PressWIPRow["status"],
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

const WEIGHTS = [0.25, 0.08, 0.24, 0.22, 0.21];

function buildPressData(totalWIP: number): PressWIPRow[] {
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressWIPRow["status"];
  }> = [
    { pressId: "P3300", pressName: "P3300", status: "Running" },
    { pressId: "P2500", pressName: "P2500", status: "Breakdown" },
    { pressId: "P1800", pressName: "P1800", status: "Running" },
    { pressId: "P1460", pressName: "P1460", status: "Running" },
    { pressId: "P1100", pressName: "P1100", status: "Running" },
  ];

  return presses.map((p, i) => {
    const wipMT = totalWIP * WEIGHTS[i];
    const isBreakdown = p.status === "Breakdown";

    // Breakdown press has higher aging proportion
    const under24Pct = isBreakdown ? 0.4 : 0.65;
    const h24to72Pct = isBreakdown ? 0.45 : 0.33;
    const over72Pct = isBreakdown ? 0.15 : 0.02;

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      wipMT,
      under24HrMT: wipMT * under24Pct,
      h24to72MT: wipMT * h24to72Pct,
      over72HrMT: wipMT * over72Pct,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalWIPModal({ open, onClose, totalWIP }: TotalWIPModalProps) {
  const pressRows = buildPressData(totalWIP);
  const sumWIP = pressRows.reduce((acc, r) => acc + r.wipMT, 0);
  const sumUnder24 = pressRows.reduce((acc, r) => acc + r.under24HrMT, 0);
  const sum24to72 = pressRows.reduce((acc, r) => acc + r.h24to72MT, 0);
  const sumOver72 = pressRows.reduce((acc, r) => acc + r.over72HrMT, 0);

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
        data-ocid="kpi.total_wip.modal"
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
          data-ocid="kpi.total_wip.close_button"
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
                WORK IN PROGRESS — PRESS WISE BREAKDOWN
              </DialogTitle>
              <p
                className="text-[10px] mt-0.5"
                style={{
                  color: "#64748b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {dateLabel} &nbsp;·&nbsp; SHIFT A &nbsp;·&nbsp; WIP AGING
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
                {totalWIP.toFixed(2)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#93c5fd" }}
              >
                MT TOTAL WIP
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
              WIP DISTRIBUTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct = sumWIP > 0 ? (row.wipMT / sumWIP) * 100 : 0;
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
                      {row.wipMT.toFixed(2)} MT
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
                      "WIP (MT)",
                      "<24HR (MT)",
                      "24-72HR (MT)",
                      ">72HR (MT)",
                      "WIP %",
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
                    const pct = sumWIP > 0 ? (row.wipMT / sumWIP) * 100 : 0;
                    const st = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`kpi.total_wip_modal.row.${idx + 1}`}
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
                          {row.wipMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#16a34a",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.under24HrMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#d97706",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.h24to72MT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: row.over72HrMT > 1 ? "#dc2626" : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.over72HrMT.toFixed(2)}
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
                      TOTAL / FLEET
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumWIP.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumUnder24.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sum24to72.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {sumOver72.toFixed(2)}
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
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#16a34a" }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                &lt;24HR — FRESH
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#d97706" }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                24–72HR — AGING
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#dc2626" }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b" }}
              >
                &gt;72HR — CRITICAL
              </span>
            </div>
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
