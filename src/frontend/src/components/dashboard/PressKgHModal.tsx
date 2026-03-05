import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressKgHRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  pressKgH: number;
  dieTarget: number;
  efficiency: number; // pressKgH / dieTarget * 100
  shift8HrKg: number; // projected 8hr production
  accentColor: string;
}

interface PressKgHModalProps {
  open: boolean;
  onClose: () => void;
  pressKgH: number;
}

const STATUS_STYLES: Record<
  PressKgHRow["status"],
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
  status: PressKgHRow["status"];
  pressKgH: number;
  dieTarget: number;
}> = [
  {
    pressId: "P3300",
    pressName: "P3300",
    status: "Running",
    pressKgH: 2100,
    dieTarget: 2400,
  },
  {
    pressId: "P2500",
    pressName: "P2500",
    status: "Breakdown",
    pressKgH: 800,
    dieTarget: 2000,
  },
  {
    pressId: "P1800",
    pressName: "P1800",
    status: "Running",
    pressKgH: 1900,
    dieTarget: 2200,
  },
  {
    pressId: "P1460",
    pressName: "P1460",
    status: "Running",
    pressKgH: 1600,
    dieTarget: 1800,
  },
  {
    pressId: "P1100",
    pressName: "P1100",
    status: "Running",
    pressKgH: 2500,
    dieTarget: 2600,
  },
];

function buildPressData(fleetAvgKgH: number): PressKgHRow[] {
  const baseAvg =
    BASE_PRESSES.reduce((s, p) => s + p.pressKgH, 0) / BASE_PRESSES.length;
  const scale = baseAvg > 0 ? fleetAvgKgH / baseAvg : 1;

  return BASE_PRESSES.map((p, i) => {
    const pressKgH = Math.round(p.pressKgH * scale);
    const efficiency = p.dieTarget > 0 ? (pressKgH / p.dieTarget) * 100 : 0;
    const shift8HrKg = pressKgH * 8;
    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      pressKgH,
      dieTarget: p.dieTarget,
      efficiency,
      shift8HrKg,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function PressKgHModal({ open, onClose, pressKgH }: PressKgHModalProps) {
  const pressRows = buildPressData(pressKgH);
  const fleetAvg =
    pressRows.reduce((s, r) => s + r.pressKgH, 0) / pressRows.length;
  const totalShift8Hr = pressRows.reduce((s, r) => s + r.shift8HrKg, 0);
  const fleetEfficiency =
    pressRows.reduce((s, r) => s + r.efficiency, 0) / pressRows.length;

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
          maxWidth: "880px",
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
          data-ocid="kpi.press_kgh.close_button"
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
              style={{ background: "#2563eb" }}
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
                PRESS KG/H — PRESS WISE BREAKDOWN
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
                  color: "#2563eb",
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {Math.round(fleetAvg).toLocaleString()}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#93c5fd" }}
              >
                AVG PRESS KG/H
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
              KG/H OUTPUT BY PRESS vs DIE TARGET
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const maxTarget = Math.max(
                  ...pressRows.map((r) => r.dieTarget),
                  1,
                );
                const targetPct = (row.dieTarget / maxTarget) * 100;
                const actualPct = (row.pressKgH / maxTarget) * 100;
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
                      className="flex-1 h-3 rounded-sm overflow-hidden relative"
                      style={{ background: "#e2e8f0" }}
                    >
                      {/* Target line */}
                      <div
                        className="absolute top-0 h-full"
                        style={{
                          left: `${targetPct}%`,
                          width: "2px",
                          background: "#94a3b8",
                          transform: "translateX(-1px)",
                          zIndex: 2,
                        }}
                      />
                      <div
                        className="h-full rounded-sm transition-all duration-500"
                        style={{
                          width: `${actualPct}%`,
                          background:
                            row.efficiency >= 90
                              ? "#22c55e"
                              : row.efficiency >= 75
                                ? "#f59e0b"
                                : "#ef4444",
                          opacity: row.status === "Breakdown" ? 0.4 : 0.85,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-bold w-[52px] text-right tabular-nums shrink-0"
                      style={{
                        color: row.accentColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.pressKgH.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] mt-2" style={{ color: "#94a3b8" }}>
              ▏ = Die target line &nbsp;·&nbsp; Bar = Actual press Kg/H
            </p>
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
                      "PRESS KG/H",
                      "DIE TARGET",
                      "EFFICIENCY %",
                      "8H PROJ (KG)",
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
                    const effColor =
                      row.efficiency >= 90
                        ? "#16a34a"
                        : row.efficiency >= 75
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
                          className="px-3 py-2.5 tabular-nums font-bold text-right"
                          style={{
                            color: "#2563eb",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.pressKgH.toLocaleString()}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#94a3b8",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.dieTarget.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-2 rounded-full overflow-hidden"
                              style={{
                                background: "#e2e8f0",
                                minWidth: "40px",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, row.efficiency)}%`,
                                  background: effColor,
                                  opacity:
                                    row.status === "Breakdown" ? 0.5 : 0.85,
                                }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                              style={{
                                color: effColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {row.efficiency.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.shift8HrKg.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#eff6ff",
                      borderTop: "2px solid #93c5fd",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: "#2563eb" }}
                      colSpan={2}
                    >
                      FLEET AVG / TOTAL
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#2563eb",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {Math.round(fleetAvg).toLocaleString()}
                    </td>
                    <td colSpan={1} />
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: fleetEfficiency >= 85 ? "#16a34a" : "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {fleetEfficiency.toFixed(1)}%
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#2563eb",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {totalShift8Hr.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ScrollArea>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {(
              ["Running", "Idle", "Breakdown", "Setup"] as Array<
                PressKgHRow["status"]
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
                { label: "75-90% WARN", color: "#f59e0b" },
                { label: "<75% POOR", color: "#ef4444" },
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
