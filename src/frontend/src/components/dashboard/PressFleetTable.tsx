import type { PressData } from "../../mockData";
import { GrafanaPanel } from "../grafana/GrafanaPanel";

type FleetColumnVisibility = {
  status?: boolean;
  dieKgH?: boolean;
  pressKgH?: boolean;
  inputMt?: boolean;
  outputMt?: boolean;
  contactTime?: boolean;
  downtime?: boolean;
  ppPlan?: boolean;
  ppActual?: boolean;
  dieLoad?: boolean;
  dieUnload?: boolean;
  oee?: boolean;
  recovery?: boolean;
};

interface PressFleetTableProps {
  presses: PressData[];
  onPressClick?: (press: PressData) => void;
  visibleColumns?: FleetColumnVisibility;
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
    className={`px-2 py-1.5 text-[9px] font-semibold uppercase whitespace-nowrap ${right ? "text-right" : center ? "text-center" : "text-left"} ${className}`}
    style={{
      color: "#6e7783",
      background: "#f7f8fa",
      borderBottom: "1px solid #e4e7ed",
      borderRight: "1px solid #e4e7ed",
      letterSpacing: "0.06em",
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
    className={`px-2 py-1.5 text-[11px] border-b border-r ${right ? "text-right" : center ? "text-center" : ""}`}
    style={{
      color: "#333d47",
      background: highlight ? "#fffbeb" : undefined,
      borderColor: "#e4e7ed",
    }}
  >
    {children}
  </td>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function PressFleetTable({
  presses,
  onPressClick,
  visibleColumns,
}: PressFleetTableProps) {
  // Helper to check if a column is visible (default true)
  const show = (key: keyof FleetColumnVisibility) =>
    visibleColumns ? visibleColumns[key] !== false : true;
  const runningCount = presses.filter((p) => p.status === "Running").length;
  const totalCount = presses.length;

  const runningBadge = (
    <span
      className="px-1.5 py-0.5 rounded text-[8px] font-bold"
      style={{ background: "#dbeafe", color: "#1d4ed8" }}
    >
      {runningCount}/{totalCount} Running
    </span>
  );

  return (
    <GrafanaPanel
      title="Press Fleet Performance"
      accentColor="#464c54"
      badge={runningBadge}
    >
      <div className="-m-2" data-ocid="fleet.table">
        {/* ── Scrollable Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 1080 }}>
            <thead>
              <tr>
                {/* Press identity */}
                <TH className="border-r-2 border-[#d1d5db]">Press</TH>
                {/* Columns in exact sequence from spec */}
                {show("status") && <TH center>Status</TH>}
                {show("dieKgH") && <TH right>Die Kg/H</TH>}
                {show("pressKgH") && <TH right>Press Kg/H</TH>}
                {show("inputMt") && <TH right>Input (Mt)</TH>}
                {show("outputMt") && <TH right>Output (Mt)</TH>}
                {show("contactTime") && <TH right>Contact Time</TH>}
                {show("downtime") && <TH right>Downtime</TH>}
                {show("ppPlan") && <TH right>PP Planned</TH>}
                {show("ppActual") && <TH right>PP Actual</TH>}
                {show("dieLoad") && <TH right>Die Load</TH>}
                {show("dieUnload") && <TH right>Die Unload</TH>}
                {show("oee") && <TH right>OEE %</TH>}
                {show("recovery") && <TH right>Recovery %</TH>}
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
                            className="text-[8px] mt-0.5 leading-none"
                            style={{ color: "#cbd5e1" }}
                          >
                            {p.dieNumber} · {p.alloyGrade}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ── Status ── */}
                    {show("status") && (
                      <TD center>
                        <StatusBadge status={p.status} />
                      </TD>
                    )}

                    {/* ── Die Kg/H ── */}
                    {show("dieKgH") && (
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
                    )}

                    {/* ── Press Kg/H ── */}
                    {show("pressKgH") && (
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
                    )}

                    {/* ── Input (Mt) ── */}
                    {show("inputMt") && (
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
                    )}

                    {/* ── Output (Mt) ── */}
                    {show("outputMt") && (
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
                    )}

                    {/* ── Contact Time ── */}
                    {show("contactTime") && (
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
                    )}

                    {/* ── Downtime ── */}
                    {show("downtime") && (
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
                    )}

                    {/* ── PP Planned ── */}
                    {show("ppPlan") && (
                      <TD right highlight={!isDown}>
                        <span
                          className="text-[14px] font-black tabular-nums leading-none"
                          style={{
                            color: "#0369a1",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {p.ppPlanBillets}
                        </span>
                      </TD>
                    )}

                    {/* ── PP Actual ── */}
                    {show("ppActual") && (
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
                                  className="text-[14px] font-black tabular-nums leading-none"
                                  style={{
                                    color,
                                    fontFamily: '"JetBrains Mono", monospace',
                                  }}
                                >
                                  {p.ppActBillets}
                                </span>
                                <div
                                  className="w-full h-1.5 rounded-full overflow-hidden mt-0.5"
                                  style={{ background: bgTrack, minWidth: 40 }}
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
                                  className="text-[9px] font-black tabular-nums mt-0.5"
                                  style={{
                                    color,
                                    fontFamily: '"JetBrains Mono", monospace',
                                  }}
                                >
                                  {pct.toFixed(0)}% extruded
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </TD>
                    )}

                    {/* ── Die Load ── */}
                    {show("dieLoad") && (
                      <TD right>
                        <span
                          className="text-[13px] font-black tabular-nums leading-none"
                          style={{
                            color: "#1d4ed8",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {p.dieLoadCount}
                        </span>
                      </TD>
                    )}

                    {/* ── Die Unload ── */}
                    {show("dieUnload") && (
                      <TD right>
                        <span
                          className="text-[13px] font-black tabular-nums leading-none"
                          style={{
                            color: "#7c3aed",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {p.dieUnloadCount}
                        </span>
                      </TD>
                    )}

                    {/* ── OEE % ── */}
                    {show("oee") && (
                      <TD right>
                        <OEEBadge oee={p.oee} />
                      </TD>
                    )}

                    {/* ── Recovery % ── */}
                    {show("recovery") && (
                      <TD right>
                        <RecoveryBadge recovery={p.recovery} />
                      </TD>
                    )}
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
                {show("status") && (
                  <td className="px-2 py-1.5 text-center border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: "#64748b" }}
                    >
                      {presses.filter((p) => p.status === "Running").length}R ·{" "}
                      {presses.filter((p) => p.status === "Breakdown").length}D
                      · {presses.filter((p) => p.status === "Idle").length}I ·{" "}
                      {presses.filter((p) => p.status === "Setup").length}S
                    </span>
                  </td>
                )}
                {/* Die Kg/H avg */}
                {show("dieKgH") && (
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
                          Math.max(
                            1,
                            presses.filter((p) => p.dieKgH > 0).length,
                          ),
                      ).toLocaleString()}{" "}
                      avg
                    </span>
                  </td>
                )}
                {/* Press Kg/H avg */}
                {show("pressKgH") && (
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
                )}
                {/* Input (Mt) total */}
                {show("inputMt") && (
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
                )}
                {/* Output (Mt) total */}
                {show("outputMt") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-black tabular-nums"
                      style={{
                        color: "#0f766e",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {presses.reduce((s, p) => s + p.outputMt, 0).toFixed(2)}{" "}
                      MT
                    </span>
                  </td>
                )}
                {/* Contact Time avg */}
                {show("contactTime") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: "#64748b" }}
                    >
                      {(
                        presses
                          .filter((p) => p.contactTime > 0)
                          .reduce((s, p) => s + p.contactTime, 0) /
                        Math.max(
                          1,
                          presses.filter((p) => p.contactTime > 0).length,
                        )
                      ).toFixed(0)}
                      s avg
                    </span>
                  </td>
                )}
                {/* Downtime total */}
                {show("downtime") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-semibold tabular-nums"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {presses.reduce((s, p) => s + p.downtime, 0).toFixed(0)}{" "}
                      min
                    </span>
                  </td>
                )}
                {/* PP Planned total */}
                {show("ppPlan") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-semibold tabular-nums"
                      style={{
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {presses.reduce((s, p) => s + p.ppPlanBillets, 0)}
                    </span>
                  </td>
                )}
                {/* PP Actual total */}
                {show("ppActual") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-black tabular-nums"
                      style={{
                        color: "#0369a1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {presses.reduce((s, p) => s + p.ppActBillets, 0)}
                    </span>
                  </td>
                )}
                {/* Die Load total count */}
                {show("dieLoad") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-black tabular-nums"
                      style={{
                        color: "#1d4ed8",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {presses.reduce((s, p) => s + p.dieLoadCount, 0)}
                    </span>
                  </td>
                )}
                {/* Die Unload total count */}
                {show("dieUnload") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-black tabular-nums"
                      style={{
                        color: "#7c3aed",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {presses.reduce((s, p) => s + p.dieUnloadCount, 0)}
                    </span>
                  </td>
                )}
                {/* OEE avg */}
                {show("oee") && (
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
                )}
                {/* Recovery avg */}
                {show("recovery") && (
                  <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                    <span
                      className="text-[9px] font-semibold tabular-nums"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {(
                        presses.reduce((s, p) => s + p.recovery, 0) /
                        presses.length
                      ).toFixed(1)}
                      %
                    </span>
                  </td>
                )}
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
            · PP Plan = Number of production plans planned for press · PP Actual
            = Number of production plans extruded (with % achievement) · Contact
            Time = billet contact duration (sec)
          </span>
        </div>
      </div>
    </GrafanaPanel>
  );
}
