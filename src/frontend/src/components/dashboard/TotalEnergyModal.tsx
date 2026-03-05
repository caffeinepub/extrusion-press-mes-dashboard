import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressEnergyRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  kwhConsumed: number;
  kwhPerMT: number;
  powerDrawKW: number;
  peakDemandKW: number;
  accentColor: string;
}

interface TotalEnergyModalProps {
  open: boolean;
  onClose: () => void;
  totalEnergy: number;
}

const STATUS_STYLES: Record<
  PressEnergyRow["status"],
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

const ACCENT_COLOR = "#d97706";

const WEIGHTS = [0.28, 0.1, 0.24, 0.2, 0.18];
// Output MT reference values (same as output weights)
const OUTPUT_MT_WEIGHTS = [0.26, 0.04, 0.24, 0.22, 0.24];
const BASE_OUTPUT_MT = 108;

function buildPressData(totalEnergy: number): PressEnergyRow[] {
  const presses: Array<{
    pressId: string;
    pressName: string;
    status: PressEnergyRow["status"];
  }> = [
    { pressId: "P3300", pressName: "Titan", status: "Running" },
    { pressId: "P2500", pressName: "Atlas", status: "Breakdown" },
    { pressId: "P1800", pressName: "Vulcan", status: "Running" },
    { pressId: "P1460", pressName: "Hermes", status: "Running" },
    { pressId: "P1100", pressName: "Swift", status: "Running" },
  ];

  return presses.map((p, i) => {
    const kwhConsumed = totalEnergy * WEIGHTS[i];
    const outputMT = BASE_OUTPUT_MT * OUTPUT_MT_WEIGHTS[i];
    const kwhPerMT = outputMT > 0 ? kwhConsumed / outputMT : 0;
    const hoursElapsed = p.status === "Breakdown" ? 8 : 4.5;
    const powerDrawKW = kwhConsumed / hoursElapsed;
    const peakDemandKW = powerDrawKW * 1.15;

    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      kwhConsumed,
      kwhPerMT,
      powerDrawKW,
      peakDemandKW,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function TotalEnergyModal({
  open,
  onClose,
  totalEnergy,
}: TotalEnergyModalProps) {
  const pressRows = buildPressData(totalEnergy);
  const totalKwh = pressRows.reduce((acc, r) => acc + r.kwhConsumed, 0);
  const avgKwhPerMT =
    pressRows.reduce((acc, r) => acc + r.kwhPerMT, 0) / pressRows.length;
  const totalPowerDraw = pressRows.reduce((acc, r) => acc + r.powerDrawKW, 0);
  const avgPeakDemand =
    pressRows.reduce((acc, r) => acc + r.peakDemandKW, 0) / pressRows.length;

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
        data-ocid="kpi.total_energy.modal"
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
          data-ocid="kpi.total_energy.close_button"
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
                TOTAL ENERGY — PRESS WISE BREAKDOWN
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
                {totalEnergy.toFixed(2)}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#fde68a" }}
              >
                kWh TOTAL ENERGY
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
              ENERGY CONSUMPTION BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const pct =
                  totalKwh > 0 ? (row.kwhConsumed / totalKwh) * 100 : 0;
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
                          opacity: row.status === "Breakdown" ? 0.45 : 0.85,
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
                      className="text-[10px] tabular-nums w-[56px] text-right shrink-0"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.kwhConsumed.toFixed(2)} kWh
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
                      "kWh CONSUMED",
                      "kWh/MT",
                      "POWER DRAW (kW)",
                      "PEAK DEMAND (kW)",
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
                      totalKwh > 0 ? (row.kwhConsumed / totalKwh) * 100 : 0;
                    const st = STATUS_STYLES[row.status];
                    return (
                      <tr
                        key={row.pressId}
                        data-ocid={`kpi.total_energy_modal.row.${idx + 1}`}
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
                          {row.kwhConsumed.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.kwhPerMT.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums font-semibold text-right"
                          style={{
                            color: ACCENT_COLOR,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.powerDrawKW.toFixed(2)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.peakDemandKW.toFixed(2)}
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
                                  background: ACCENT_COLOR,
                                  opacity:
                                    row.status === "Breakdown" ? 0.5 : 0.85,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                              style={{
                                color: row.accentColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {pct.toFixed(2)}%
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
                      background: "#fef3c7",
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
                      {totalKwh.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgKwhPerMT.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalPowerDraw.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgPeakDemand.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT_COLOR,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      100.00%
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
                PressEnergyRow["status"]
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
