import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressOEERow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  oeePct: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  accentColor: string;
}

interface FleetOEEModalProps {
  open: boolean;
  onClose: () => void;
  fleetOEE: number;
}

const PRESS_ACCENT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
];

const ACCENT_COLOR = "#0891b2";

const OEE_VALUES = [88.9, 51.0, 80.9, 85.6, 94.2];
const AVAILABILITY = [95.2, 55.0, 92.8, 93.6, 96.1];
const PERFORMANCE = [90.3, 60.2, 88.4, 88.9, 94.8];
const QUALITY = [93.8, 72.4, 93.5, 95.1, 97.2];

function vsStandardBadge(oee: number): {
  bg: string;
  color: string;
  label: string;
} {
  if (oee >= 85) return { bg: "#dcfce7", color: "#16a34a", label: "▲ ABOVE" };
  if (oee >= 70) return { bg: "#fef3c7", color: "#d97706", label: "~ NEAR" };
  return { bg: "#fee2e2", color: "#dc2626", label: "▼ BELOW" };
}

function buildPressData(fleetOEE: number): PressOEERow[] {
  // Scale OEE values proportionally so fleet average matches fleetOEE
  const baseAvg = OEE_VALUES.reduce((a, b) => a + b, 0) / OEE_VALUES.length;
  const scale = fleetOEE / baseAvg;

  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressOEERow["status"];
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
    oeePct: Math.min(99, OEE_VALUES[i] * scale),
    availabilityPct: Math.min(99, AVAILABILITY[i] * scale),
    performancePct: Math.min(99, PERFORMANCE[i] * scale),
    qualityPct: Math.min(99, QUALITY[i] * scale),
    accentColor: PRESS_ACCENT_COLORS[i],
  }));
}

export function FleetOEEModal({ open, onClose, fleetOEE }: FleetOEEModalProps) {
  const pressRows = buildPressData(fleetOEE);
  const avgOEE =
    pressRows.reduce((acc, r) => acc + r.oeePct, 0) / pressRows.length;
  const avgAvail =
    pressRows.reduce((acc, r) => acc + r.availabilityPct, 0) / pressRows.length;
  const avgPerf =
    pressRows.reduce((acc, r) => acc + r.performancePct, 0) / pressRows.length;
  const avgQual =
    pressRows.reduce((acc, r) => acc + r.qualityPct, 0) / pressRows.length;

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
        data-ocid="kpi.fleet_oee.modal"
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
          data-ocid="kpi.fleet_oee.close_button"
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
                FLEET OEE — PRESS WISE BREAKDOWN
              </DialogTitle>
              <p
                className="text-[10px] mt-0.5"
                style={{
                  color: "#64748b",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {dateLabel} &nbsp;·&nbsp; SHIFT A &nbsp;·&nbsp; STANDARD TARGET:
                85%
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
                {fleetOEE.toFixed(1)}%
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#67e8f9" }}
              >
                FLEET OEE
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
              OEE % BY PRESS (STANDARD: 85%)
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
                      {row.pressId}
                    </span>
                    <div
                      className="flex-1 h-3 rounded-sm overflow-hidden"
                      style={{ background: "#e2e8f0" }}
                    >
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{
                          width: `${row.oeePct}%`,
                          background:
                            row.oeePct >= 85
                              ? "#16a34a"
                              : row.oeePct >= 70
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
                      {row.oeePct.toFixed(1)}%
                    </span>
                    <span
                      className="text-[10px] tabular-nums w-[52px] text-right shrink-0"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      A:{row.availabilityPct.toFixed(0)}%
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
                      "OEE %",
                      "AVAILABILITY %",
                      "PERFORMANCE %",
                      "QUALITY %",
                      "vs STANDARD (85%)",
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
                    const badge = vsStandardBadge(row.oeePct);
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`kpi.fleet_oee_modal.row.${idx + 1}`}
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
                          className="px-3 py-2.5 tabular-nums font-black text-right"
                          style={{
                            color:
                              row.oeePct >= 85
                                ? "#16a34a"
                                : row.oeePct >= 70
                                  ? "#d97706"
                                  : "#dc2626",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.oeePct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.availabilityPct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.performancePct.toFixed(1)}%
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.qualityPct.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.color}30`,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#f0f9ff",
                      borderTop: `2px solid ${ACCENT_COLOR}`,
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: ACCENT_COLOR }}
                    >
                      FLEET AVERAGE
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgOEE.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgAvail.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgPerf.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgQual.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5" />
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
