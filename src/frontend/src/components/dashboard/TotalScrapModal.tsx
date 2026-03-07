import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressScrapRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  scrapPct: number;
  scrapKg: number;
  reworkPct: number;
  firstPassYield: number;
  scrapCost: number;
  accentColor: string;
}

interface TotalScrapModalProps {
  open: boolean;
  onClose: () => void;
  totalScrap: number;
}

const PRESS_ACCENT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
];

const ACCENT_COLOR = "#ea580c";

const SCRAP_PCTS = [1.4, 2.3, 1.6, 1.5, 1.3];
const REWORK_PCTS = [0.6, 1.2, 0.7, 0.5, 0.8];
// Output weights proportional to production weights
const OUTPUT_WEIGHTS_MT = [0.26, 0.04, 0.24, 0.22, 0.24];

function buildPressData(_totalScrap: number): PressScrapRow[] {
  // totalScrap is a %, use it to scale output reference
  const baseOutputMT = 108; // reference daily output MT
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressScrapRow["status"];
  }> = [
    { pressId: "P3300", pressName: "P3300", status: "Running" },
    { pressId: "P2500", pressName: "P2500", status: "Breakdown" },
    { pressId: "P1800", pressName: "P1800", status: "Running" },
    { pressId: "P1460", pressName: "P1460", status: "Running" },
    { pressId: "P1100", pressName: "P1100", status: "Running" },
  ];

  return presses.map((p, i) => {
    const outputMT = baseOutputMT * OUTPUT_WEIGHTS_MT[i];
    const scrapPct = SCRAP_PCTS[i];
    const scrapKg = outputMT * (scrapPct / 100) * 1000;
    const reworkPct = REWORK_PCTS[i];
    const firstPassYield = 100 - scrapPct - reworkPct;
    const scrapCost = scrapKg * 2.8;

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      scrapPct,
      scrapKg,
      reworkPct,
      firstPassYield,
      scrapCost,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalScrapModal({
  open,
  onClose,
  totalScrap,
}: TotalScrapModalProps) {
  const pressRows = buildPressData(totalScrap);
  const totalScrapKg = pressRows.reduce((acc, r) => acc + r.scrapKg, 0);
  const avgScrapPct =
    pressRows.reduce((acc, r) => acc + r.scrapPct, 0) / pressRows.length;
  const avgReworkPct =
    pressRows.reduce((acc, r) => acc + r.reworkPct, 0) / pressRows.length;
  const avgFPY =
    pressRows.reduce((acc, r) => acc + r.firstPassYield, 0) / pressRows.length;
  const totalCost = pressRows.reduce((acc, r) => acc + r.scrapCost, 0);

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
        data-ocid="kpi.total_scrap.modal"
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
          data-ocid="kpi.total_scrap.close_button"
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
                TOTAL SCRAP — PRESS WISE BREAKDOWN
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
                {totalScrap.toFixed(1)}%
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#fdba74" }}
              >
                AVG SCRAP RATE
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
              SCRAP % BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct = (row.scrapPct / 5) * 100; // normalize against 5% max
                return (
                  <div key={row.pressId} className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold w-[90px] shrink-0"
                      style={{
                        color: row.accentColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.pressId}
                    </span>
                    <div
                      className="flex-1 h-3 rounded-sm overflow-hidden"
                      style={{ background: "#e2e8f0" }}
                    >
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            row.scrapPct > 2 ? "#dc2626" : ACCENT_COLOR,
                          opacity: row.status === "Breakdown" ? 0.6 : 0.85,
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
                      {row.scrapPct.toFixed(1)}%
                    </span>
                    <span
                      className="text-[10px] tabular-nums w-[52px] text-right shrink-0"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.scrapKg.toFixed(0)} kg
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
                      "SCRAP %",
                      "SCRAP KG",
                      "REWORK %",
                      "FIRST PASS YIELD %",
                      "SCRAP COST ($)",
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
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`kpi.total_scrap_modal.row.${idx + 1}`}
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
                          </div>
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: row.scrapPct > 2 ? "#dc2626" : ACCENT_COLOR,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.scrapPct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: "#1e293b",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.scrapKg.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.reworkPct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color:
                              row.firstPassYield > 97 ? "#16a34a" : "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.firstPassYield.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: "#dc2626",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          ${row.scrapCost.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#fff7ed",
                      borderTop: `2px solid ${ACCENT_COLOR}`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: ACCENT_COLOR }}
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
                      {avgScrapPct.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalScrapKg.toFixed(1)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgReworkPct.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgFPY.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      ${totalCost.toFixed(0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ScrollArea>

          {/* Timestamp */}
          <div className="flex items-center justify-end mt-3">
            <span
              className="text-[9px]"
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
