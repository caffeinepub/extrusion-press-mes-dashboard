import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PressContactRow {
  pressId: string;
  pressName: string;
  status: "Running" | "Idle" | "Breakdown" | "Setup";
  contactTime: number; // seconds
  billetCount: number;
  avgExtSpeed: number; // mm/s
  cycleTime: number; // seconds total billet cycle
  contactPct: number; // contact time as % of cycle
  accentColor: string;
}

interface ContactTimeModalProps {
  open: boolean;
  onClose: () => void;
  contactTime: number;
}

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
  status: PressContactRow["status"];
  contactTime: number;
  billetCount: number;
  avgExtSpeed: number;
  cycleTime: number;
}> = [
  {
    pressId: "P3300",
    pressName: "P3300",
    status: "Running",
    contactTime: 42,
    billetCount: 42,
    avgExtSpeed: 8.2,
    cycleTime: 68,
  },
  {
    pressId: "P2500",
    pressName: "P2500",
    status: "Breakdown",
    contactTime: 0,
    billetCount: 8,
    avgExtSpeed: 0,
    cycleTime: 0,
  },
  {
    pressId: "P1800",
    pressName: "P1800",
    status: "Running",
    contactTime: 38,
    billetCount: 38,
    avgExtSpeed: 7.8,
    cycleTime: 62,
  },
  {
    pressId: "P1460",
    pressName: "P1460",
    status: "Running",
    contactTime: 35,
    billetCount: 36,
    avgExtSpeed: 7.1,
    cycleTime: 58,
  },
  {
    pressId: "P1100",
    pressName: "P1100",
    status: "Running",
    contactTime: 30,
    billetCount: 37,
    avgExtSpeed: 9.5,
    cycleTime: 50,
  },
];

function buildPressData(avgContactTime: number): PressContactRow[] {
  const runningPresses = BASE_PRESSES.filter((p) => p.status === "Running");
  const baseAvg =
    runningPresses.reduce((s, p) => s + p.contactTime, 0) /
    runningPresses.length;
  const scale = baseAvg > 0 ? avgContactTime / baseAvg : 1;

  return BASE_PRESSES.map((p, i) => {
    const contactTime = p.status === "Breakdown" ? 0 : p.contactTime * scale;
    const cycleTime = p.status === "Breakdown" ? 0 : p.cycleTime * scale;
    const contactPct = cycleTime > 0 ? (contactTime / cycleTime) * 100 : 0;
    return {
      pressId: p.pressId,
      pressName: p.pressName,
      status: p.status,
      contactTime,
      billetCount: p.billetCount,
      avgExtSpeed: p.status === "Breakdown" ? 0 : p.avgExtSpeed,
      cycleTime,
      contactPct,
      accentColor: PRESS_ACCENT_COLORS[i],
    };
  });
}

export function ContactTimeModal({
  open,
  onClose,
  contactTime,
}: ContactTimeModalProps) {
  const pressRows = buildPressData(contactTime);
  const runningRows = pressRows.filter((r) => r.status === "Running");
  const fleetAvgContact =
    runningRows.length > 0
      ? runningRows.reduce((s, r) => s + r.contactTime, 0) / runningRows.length
      : 0;
  const fleetAvgCycle =
    runningRows.length > 0
      ? runningRows.reduce((s, r) => s + r.cycleTime, 0) / runningRows.length
      : 0;

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
          data-ocid="kpi.contact_time.close_button"
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
              style={{ background: "#0891b2" }}
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
                CONTACT TIME — PRESS WISE BREAKDOWN
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
                  color: "#0891b2",
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: 1,
                }}
              >
                {fleetAvgContact.toFixed(1)}s
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color: "#67e8f9" }}
              >
                AVG CONTACT TIME
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
              CONTACT TIME (SECONDS) BY PRESS
            </p>
            <div className="flex flex-col gap-1.5">
              {pressRows.map((row) => {
                const maxContact = Math.max(
                  ...pressRows.map((r) => r.contactTime),
                  1,
                );
                const pct = (row.contactTime / maxContact) * 100;
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
                          background: "#0891b2",
                          opacity: row.status === "Breakdown" ? 0.3 : 0.85,
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
                      {row.status === "Breakdown"
                        ? "—"
                        : `${row.contactTime.toFixed(1)}s`}
                    </span>
                  </div>
                );
              })}
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
                      "CONTACT TIME (S)",
                      "CYCLE TIME (S)",
                      "EXT SPEED (MM/S)",
                      "BILLET COUNT",
                      "CONTACT %",
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
                            color:
                              row.status === "Breakdown"
                                ? "#94a3b8"
                                : "#0891b2",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.status === "Breakdown"
                            ? "—"
                            : row.contactTime.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.status === "Breakdown"
                            ? "—"
                            : row.cycleTime.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-right"
                          style={{
                            color: "#334155",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.status === "Breakdown"
                            ? "—"
                            : row.avgExtSpeed.toFixed(1)}
                        </td>
                        <td
                          className="px-3 py-2.5 tabular-nums text-center"
                          style={{
                            color: "#475569",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.billetCount}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.status === "Breakdown" ? (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          ) : (
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
                                    width: `${row.contactPct}%`,
                                    background: "#0891b2",
                                    opacity: 0.85,
                                  }}
                                />
                              </div>
                              <span
                                className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                                style={{
                                  color: "#0891b2",
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                {row.contactPct.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#ecfeff",
                      borderTop: "2px solid #67e8f9",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                      style={{ color: "#0891b2" }}
                    >
                      FLEET AVG
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-black text-right"
                      style={{
                        color: "#0891b2",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {fleetAvgContact.toFixed(1)}s
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: "#0891b2",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {fleetAvgCycle.toFixed(1)}s
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </ScrollArea>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
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
