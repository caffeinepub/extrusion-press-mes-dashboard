import { Activity } from "lucide-react";
import type { PressData } from "../../mockData";

interface PressFleetTableProps {
  presses: PressData[];
  onPressClick?: (press: PressData) => void;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PressData["status"] }) {
  const cfg = {
    Running: { bg: "#dcfce7", border: "#22c55e", text: "#16a34a" },
    Breakdown: { bg: "#fee2e2", border: "#ef4444", text: "#dc2626" },
    Idle: { bg: "#f1f5f9", border: "#94a3b8", text: "#64748b" },
    Setup: { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
      data-ocid="fleet.status_badge"
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
        style={{
          background: cfg.text,
          animation: status === "Running" ? "pulse-dot 2s infinite" : "none",
        }}
      />
      {status}
    </span>
  );
}

// ─── OEE Badge ────────────────────────────────────────────────────────────────
function OEEBadge({ oee }: { oee: number }) {
  const color = oee >= 85 ? "#16a34a" : oee >= 70 ? "#d97706" : "#dc2626";
  const bg = oee >= 85 ? "#dcfce7" : oee >= 70 ? "#fef3c7" : "#fee2e2";
  const border = oee >= 85 ? "#22c55e" : oee >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded font-black tabular-nums text-[11px] border"
      style={{
        color,
        background: bg,
        borderColor: border,
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {oee.toFixed(1)}%
    </span>
  );
}

// ─── Recovery Badge ───────────────────────────────────────────────────────────
function RecoveryBadge({ recovery }: { recovery: number }) {
  const color =
    recovery >= 90 ? "#16a34a" : recovery >= 80 ? "#d97706" : "#dc2626";
  const bg =
    recovery >= 90 ? "#dcfce7" : recovery >= 80 ? "#fef3c7" : "#fee2e2";
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded font-semibold tabular-nums text-[11px]"
      style={{
        color,
        background: bg,
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {recovery.toFixed(1)}%
    </span>
  );
}

// ─── Table primitives ─────────────────────────────────────────────────────────
const TH = ({
  children,
  right,
  center,
  className = "",
}: {
  children?: React.ReactNode;
  right?: boolean;
  center?: boolean;
  className?: string;
}) => (
  <th
    className={`px-2 py-2 text-[9px] font-bold uppercase whitespace-nowrap ${right ? "text-right" : center ? "text-center" : "text-left"} ${className}`}
    style={{
      color: "#475569",
      background: "#f1f5f9",
      borderBottom: "2px solid #e2e8f0",
      borderRight: "1px solid #e2e8f0",
      letterSpacing: "0.07em",
    }}
  >
    {children}
  </th>
);

const TD = ({
  children,
  right,
  center,
  highlight,
}: {
  children: React.ReactNode;
  right?: boolean;
  center?: boolean;
  highlight?: boolean;
}) => (
  <td
    className={`px-2 py-2 text-[11px] border-b border-r border-[#f1f5f9] ${right ? "text-right" : center ? "text-center" : ""}`}
    style={{
      color: "#1e293b",
      background: highlight ? "#fffbeb" : undefined,
    }}
  >
    {children}
  </td>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function PressFleetTable({
  presses,
  onPressClick,
}: PressFleetTableProps) {
  const runningCount = presses.filter((p) => p.status === "Running").length;
  const totalCount = presses.length;

  return (
    <div
      className="flex flex-col rounded-lg border border-[#e2e8f0] overflow-hidden"
      style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      data-ocid="fleet.table"
    >
      {/* ── Header Bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-[#e2e8f0]"
        style={{ background: "#f8fafc" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: "#3b82f6" }}
          />
          <Activity size={13} style={{ color: "#3b82f6" }} />
          <span
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: "#1e293b", letterSpacing: "0.12em" }}
          >
            Press Fleet Performance
          </span>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
            }}
          >
            {runningCount}/{totalCount} Running
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#22c55e",
                animation: "pulse-dot 2s infinite",
              }}
            />
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "#22c55e" }}
            >
              Live
            </span>
          </div>
        </div>
      </div>

      {/* ── Scrollable Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 1080 }}>
          <thead>
            <tr>
              {/* Press identity */}
              <TH className="border-r-2 border-[#d1d5db]">Press</TH>
              {/* Columns in exact sequence from spec */}
              <TH center>Status</TH>
              <TH right>Die Kg/H</TH>
              <TH right>Press Kg/H</TH>
              <TH right>Input (Mt)</TH>
              <TH right>Output (Mt)</TH>
              <TH right>Contact Time</TH>
              <TH right>Downtime</TH>
              <TH right>PP Planned</TH>
              <TH right>PP Actual</TH>
              <TH right>Die Load</TH>
              <TH right>Die Unload</TH>
              <TH right>OEE %</TH>
              <TH right>Recovery %</TH>
            </tr>
          </thead>
          <tbody>
            {presses.map((p, i) => {
              const isDown = p.status === "Breakdown" || p.status === "Idle";
              return (
                <tr
                  key={p.id}
                  data-ocid={`fleet.row.${i + 1}`}
                  className="hover:bg-blue-50 transition-colors"
                  style={{
                    background: i % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                >
                  {/* ── Press Identity ── */}
                  <td
                    className="px-3 py-2 border-b border-r-2 border-[#e2e8f0] whitespace-nowrap"
                    style={{ borderRightColor: "#d1d5db" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1 h-8 rounded-full shrink-0"
                        style={{
                          background:
                            p.status === "Running"
                              ? "#22c55e"
                              : p.status === "Breakdown"
                                ? "#ef4444"
                                : p.status === "Setup"
                                  ? "#f59e0b"
                                  : "#94a3b8",
                        }}
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => onPressClick?.(p)}
                          className="font-black text-[13px] tracking-tight leading-none hover:underline transition-colors"
                          style={{
                            color: onPressClick ? "#1d4ed8" : "#0f172a",
                            fontFamily: '"JetBrains Mono", monospace',
                            cursor: onPressClick ? "pointer" : "default",
                            background: "none",
                            border: "none",
                            padding: 0,
                          }}
                          data-ocid={`fleet.press_number.button.${i + 1}`}
                        >
                          {p.id}
                        </button>
                        <div
                          className="text-[9px] font-semibold mt-0.5 leading-none"
                          style={{ color: "#94a3b8" }}
                        >
                          {p.name} · {p.tonnage}T
                        </div>
                        <div
                          className="text-[8px] mt-0.5 leading-none"
                          style={{ color: "#cbd5e1" }}
                        >
                          {p.dieNumber} · {p.alloyGrade}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ── Status ── */}
                  <TD center>
                    <StatusBadge status={p.status} />
                  </TD>

                  {/* ── Die Kg/H ── */}
                  <TD right>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        color: p.dieKgH > 0 ? "#1e3a5f" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.dieKgH > 0 ? p.dieKgH.toLocaleString() : "—"}
                    </span>
                  </TD>

                  {/* ── Press Kg/H ── */}
                  <TD right>
                    <span
                      className="font-mono tabular-nums text-[11px] font-bold"
                      style={{
                        color: p.kgPerHour > 0 ? "#1d4ed8" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.kgPerHour > 0 ? p.kgPerHour.toLocaleString() : "—"}
                    </span>
                  </TD>

                  {/* ── Input (Mt) ── */}
                  <TD right>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        color: p.inputMt > 0 ? "#0369a1" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.inputMt > 0 ? p.inputMt.toFixed(2) : "—"}
                    </span>
                  </TD>

                  {/* ── Output (Mt) ── */}
                  <TD right>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        color: p.outputMt > 0 ? "#0f766e" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.outputMt > 0 ? p.outputMt.toFixed(2) : "—"}
                    </span>
                  </TD>

                  {/* ── Contact Time ── */}
                  <TD right>
                    <span
                      className="font-mono tabular-nums text-[11px]"
                      style={{
                        color: p.contactTime > 0 ? "#0f766e" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.contactTime > 0 ? `${p.contactTime}s` : "—"}
                    </span>
                  </TD>

                  {/* ── Downtime ── */}
                  <TD right>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        color:
                          p.downtime > 60
                            ? "#dc2626"
                            : p.downtime > 10
                              ? "#d97706"
                              : "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.downtime > 0 ? `${p.downtime} min` : "—"}
                    </span>
                  </TD>

                  {/* ── PP Planned ── */}
                  <TD right highlight={!isDown}>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="text-[11px] font-semibold tabular-nums"
                        style={{
                          color: "#64748b",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {p.ppPlanBillets}
                      </span>
                      <span
                        className="text-[8px] font-medium"
                        style={{ color: "#94a3b8" }}
                      >
                        shots
                      </span>
                    </div>
                  </TD>

                  {/* ── PP Actual ── */}
                  <TD right highlight={!isDown}>
                    <div className="flex flex-col items-end gap-0.5">
                      {(() => {
                        const pct =
                          p.ppPlanBillets > 0
                            ? Math.min(
                                (p.ppActBillets / p.ppPlanBillets) * 100,
                                100,
                              )
                            : 0;
                        const color =
                          pct >= 90
                            ? "#16a34a"
                            : pct >= 70
                              ? "#d97706"
                              : "#dc2626";
                        const bgTrack =
                          pct >= 90
                            ? "#dcfce7"
                            : pct >= 70
                              ? "#fef3c7"
                              : "#fee2e2";
                        return (
                          <>
                            <span
                              className="text-[11px] font-black tabular-nums"
                              style={{
                                color,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {p.ppActBillets}
                            </span>
                            <div
                              className="w-full h-1 rounded-full overflow-hidden"
                              style={{ background: bgTrack, minWidth: 36 }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct.toFixed(0)}%`,
                                  background: color,
                                }}
                              />
                            </div>
                            <span
                              className="text-[8px] font-bold tabular-nums"
                              style={{
                                color,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {pct.toFixed(0)}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </TD>

                  {/* ── Die Load ── */}
                  <TD right>
                    {(() => {
                      const loadColor =
                        p.dieLoad > 20
                          ? "#ef4444"
                          : p.dieLoad > 15
                            ? "#f59e0b"
                            : "#22c55e";
                      return (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-0.5">
                            <span
                              className="text-[8px] font-bold uppercase px-0.5 rounded"
                              style={{
                                color: "#ffffff",
                                background: "#3b82f6",
                              }}
                            >
                              L
                            </span>
                            <span
                              className="text-[10px] font-mono tabular-nums font-semibold"
                              style={{
                                color: loadColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {p.dieLoad > 0 ? `${p.dieLoad}m` : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </TD>

                  {/* ── Die Unload ── */}
                  <TD right>
                    {(() => {
                      const unloadColor =
                        p.dieUnload > 15
                          ? "#ef4444"
                          : p.dieUnload > 10
                            ? "#f59e0b"
                            : "#22c55e";
                      return (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-0.5">
                            <span
                              className="text-[8px] font-bold uppercase px-0.5 rounded"
                              style={{
                                color: "#ffffff",
                                background: "#8b5cf6",
                              }}
                            >
                              U
                            </span>
                            <span
                              className="text-[10px] font-mono tabular-nums font-semibold"
                              style={{
                                color: unloadColor,
                                fontFamily: '"JetBrains Mono", monospace',
                              }}
                            >
                              {p.dieUnload > 0 ? `${p.dieUnload}m` : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </TD>

                  {/* ── OEE % ── */}
                  <TD right>
                    <OEEBadge oee={p.oee} />
                  </TD>

                  {/* ── Recovery % ── */}
                  <TD right>
                    <RecoveryBadge recovery={p.recovery} />
                  </TD>
                </tr>
              );
            })}
          </tbody>

          {/* ── Summary Footer ── */}
          <tfoot>
            <tr style={{ background: "#f1f5f9" }}>
              <td
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border-t-2 border-[#e2e8f0]"
                style={{ color: "#475569" }}
              >
                Fleet Total / Avg
              </td>
              {/* Status summary */}
              <td className="px-2 py-1.5 text-center border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "#64748b" }}
                >
                  {presses.filter((p) => p.status === "Running").length}R ·{" "}
                  {presses.filter((p) => p.status === "Breakdown").length}D ·{" "}
                  {presses.filter((p) => p.status === "Idle").length}I ·{" "}
                  {presses.filter((p) => p.status === "Setup").length}S
                </span>
              </td>
              {/* Die Kg/H avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{
                    color: "#1e3a5f",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {Math.round(
                    presses
                      .filter((p) => p.dieKgH > 0)
                      .reduce((s, p) => s + p.dieKgH, 0) /
                      Math.max(1, presses.filter((p) => p.dieKgH > 0).length),
                  ).toLocaleString()}{" "}
                  avg
                </span>
              </td>
              {/* Press Kg/H avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#1d4ed8",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {Math.round(
                    presses.reduce((s, p) => s + p.kgPerHour, 0) /
                      presses.length,
                  ).toLocaleString()}{" "}
                  avg
                </span>
              </td>
              {/* Input (Mt) total */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#0369a1",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {presses.reduce((s, p) => s + p.inputMt, 0).toFixed(2)} MT
                </span>
              </td>
              {/* Output (Mt) total */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#0f766e",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {presses.reduce((s, p) => s + p.outputMt, 0).toFixed(2)} MT
                </span>
              </td>
              {/* Contact Time avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "#64748b" }}
                >
                  {(
                    presses
                      .filter((p) => p.contactTime > 0)
                      .reduce((s, p) => s + p.contactTime, 0) /
                    Math.max(1, presses.filter((p) => p.contactTime > 0).length)
                  ).toFixed(0)}
                  s avg
                </span>
              </td>
              {/* Downtime total */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{
                    color: "#d97706",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {presses.reduce((s, p) => s + p.downtime, 0).toFixed(0)} min
                </span>
              </td>
              {/* PP Planned total */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{
                    color: "#64748b",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {presses.reduce((s, p) => s + p.ppPlanBillets, 0)} shots
                </span>
              </td>
              {/* PP Actual total */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#0369a1",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {presses.reduce((s, p) => s + p.ppActBillets, 0)} shots
                </span>
              </td>
              {/* Die Load avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{
                    color: "#3b82f6",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {(
                    presses
                      .filter((p) => p.dieLoad > 0)
                      .reduce((s, p) => s + p.dieLoad, 0) /
                    Math.max(1, presses.filter((p) => p.dieLoad > 0).length)
                  ).toFixed(0)}
                  m avg
                </span>
              </td>
              {/* Die Unload avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{
                    color: "#8b5cf6",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {(
                    presses
                      .filter((p) => p.dieUnload > 0)
                      .reduce((s, p) => s + p.dieUnload, 0) /
                    Math.max(1, presses.filter((p) => p.dieUnload > 0).length)
                  ).toFixed(0)}
                  m avg
                </span>
              </td>
              {/* OEE avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#0f766e",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {(
                    presses.reduce((s, p) => s + p.oee, 0) / presses.length
                  ).toFixed(1)}
                  %
                </span>
              </td>
              {/* Recovery avg */}
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{
                    color: "#16a34a",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {(
                    presses.reduce((s, p) => s + p.recovery, 0) / presses.length
                  ).toFixed(1)}
                  %
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Legend Bar ── */}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 border-t border-[#e2e8f0]"
        style={{ background: "#f8fafc" }}
      >
        <span
          className="text-[8px] font-black uppercase tracking-widest"
          style={{ color: "#94a3b8" }}
        >
          Legend:
        </span>
        {[
          { color: "#22c55e", label: "Good (≥90%)" },
          { color: "#f59e0b", label: "Warning (70–89%)" },
          { color: "#ef4444", label: "Critical (<70%)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            <span
              className="text-[8px] font-semibold"
              style={{ color: "#94a3b8" }}
            >
              {label}
            </span>
          </div>
        ))}
        <span className="text-[8px]" style={{ color: "#94a3b8" }}>
          · PP Planned = Target billet/shot count · PP Actual = Achieved
          billet/shot count · L = Die Load time (min) · U = Die Unload time
          (min) · Contact Time = billet contact duration (sec)
        </span>
      </div>
    </div>
  );
}
