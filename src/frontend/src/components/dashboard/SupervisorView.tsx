import {
  Activity,
  CheckCircle2,
  Layers,
  ListChecks,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { DieMaintenance, Order } from "../../backend.d";
import { OrderStatus } from "../../backend.d";
import type { PressData } from "../../mockData";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SupervisorViewProps {
  presses: PressData[];
  orders: Order[];
  overdueDies: DieMaintenance[];
  onPressClick?: (press: PressData) => void;
  filterBadge?: string;
}

type SubTab = "Press Wise" | "Die Wise" | "PP Wise";

// ─── Utility helpers ───────────────────────────────────────────────────────────
function nanosToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

function daysAgo(date: Date): string {
  const diff = Math.round((Date.now() - date.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  if (diff < 0) return `in ${Math.abs(diff)} days`;
  return `${diff} days ago`;
}

function daysUntil(date: Date): string {
  const diff = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff === 1) return "in 1 day";
  return `in ${diff} days`;
}

// ─── Shared small components ────────────────────────────────────────────────────
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
  rowBg,
}: {
  children: React.ReactNode;
  right?: boolean;
  center?: boolean;
  highlight?: boolean;
  rowBg?: string;
}) => (
  <td
    className={`px-2 py-2 text-[11px] border-b border-r border-[#f1f5f9] ${right ? "text-right" : center ? "text-center" : ""}`}
    style={{
      color: "#1e293b",
      background: highlight ? "#fffbeb" : (rowBg ?? undefined),
    }}
  >
    {children}
  </td>
);

// ─── KPI Summary Cards ─────────────────────────────────────────────────────────
function KPISummary({ presses }: { presses: PressData[] }) {
  const activePresses = presses.filter((p) => p.status === "Running").length;
  const fleetOEE = presses.reduce((s, p) => s + p.oee, 0) / presses.length;
  const totalInput = presses.reduce((s, p) => s + p.inputMt, 0);
  const totalOutput = presses.reduce((s, p) => s + p.outputMt, 0);
  const fleetRecovery =
    presses.reduce((s, p) => s + p.recovery, 0) / presses.length;
  const totalPPPlan = presses.reduce((s, p) => s + p.ppPlanBillets, 0);
  const totalPPAct = presses.reduce((s, p) => s + p.ppActBillets, 0);
  const ppAchievement = totalPPPlan > 0 ? (totalPPAct / totalPPPlan) * 100 : 0;

  const cards = [
    {
      label: "Active Presses",
      value: `${activePresses}/${presses.length}`,
      sub: "Running",
      color: "#16a34a",
      bg: "#dcfce7",
      border: "#22c55e",
    },
    {
      label: "Fleet OEE",
      value: `${fleetOEE.toFixed(1)}%`,
      sub: fleetOEE >= 85 ? "On Target" : "Below Target",
      color:
        fleetOEE >= 85 ? "#16a34a" : fleetOEE >= 70 ? "#d97706" : "#dc2626",
      bg: fleetOEE >= 85 ? "#dcfce7" : fleetOEE >= 70 ? "#fef3c7" : "#fee2e2",
      border:
        fleetOEE >= 85 ? "#22c55e" : fleetOEE >= 70 ? "#f59e0b" : "#ef4444",
    },
    {
      label: "Total Input MT",
      value: `${totalInput.toFixed(2)}`,
      sub: "Metric Tonnes",
      color: "#0369a1",
      bg: "#e0f2fe",
      border: "#38bdf8",
    },
    {
      label: "Total Output MT",
      value: `${totalOutput.toFixed(2)}`,
      sub: "Metric Tonnes",
      color: "#0f766e",
      bg: "#ccfbf1",
      border: "#2dd4bf",
    },
    {
      label: "Fleet Recovery",
      value: `${fleetRecovery.toFixed(1)}%`,
      sub: fleetRecovery >= 90 ? "On Target" : "Monitor",
      color:
        fleetRecovery >= 90
          ? "#16a34a"
          : fleetRecovery >= 80
            ? "#d97706"
            : "#dc2626",
      bg:
        fleetRecovery >= 90
          ? "#dcfce7"
          : fleetRecovery >= 80
            ? "#fef3c7"
            : "#fee2e2",
      border:
        fleetRecovery >= 90
          ? "#22c55e"
          : fleetRecovery >= 80
            ? "#f59e0b"
            : "#ef4444",
    },
    {
      label: "PP Achievement",
      value: `${ppAchievement.toFixed(1)}%`,
      sub: `${totalPPAct}/${totalPPPlan} shots`,
      color:
        ppAchievement >= 90
          ? "#16a34a"
          : ppAchievement >= 70
            ? "#d97706"
            : "#dc2626",
      bg:
        ppAchievement >= 90
          ? "#dcfce7"
          : ppAchievement >= 70
            ? "#fef3c7"
            : "#fee2e2",
      border:
        ppAchievement >= 90
          ? "#22c55e"
          : ppAchievement >= 70
            ? "#f59e0b"
            : "#ef4444",
    },
  ];

  return (
    <div
      className="grid grid-cols-6 gap-2 px-3 pt-3 pb-2"
      data-ocid="supervisor.kpi.panel"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border p-2.5 flex flex-col gap-0.5"
          style={{
            background: "#ffffff",
            borderColor: "#e2e8f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <span
            className="text-[9px] font-semibold uppercase tracking-widest"
            style={{ color: "#94a3b8" }}
          >
            {card.label}
          </span>
          <span
            className="text-[18px] font-black tabular-nums leading-none"
            style={{
              color: card.color,
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {card.value}
          </span>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-1 self-start"
            style={{
              background: card.bg,
              color: card.color,
              border: `1px solid ${card.border}`,
            }}
          >
            {card.sub}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Press Wise Table ──────────────────────────────────────────────────────────
function PressWiseTable({
  presses,
  onPressClick,
}: {
  presses: PressData[];
  onPressClick?: (press: PressData) => void;
}) {
  return (
    <div
      className="rounded-lg border border-[#e2e8f0] overflow-hidden mx-3 mb-3"
      style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      data-ocid="supervisor.press_wise.table"
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b border-[#e2e8f0]"
        style={{ borderLeft: "4px solid #3b82f6", background: "#f8fafc" }}
      >
        <Activity size={13} style={{ color: "#3b82f6" }} />
        <span
          className="text-[11px] font-black uppercase tracking-widest"
          style={{ color: "#1e293b" }}
        >
          Press Wise Performance
        </span>
        <span
          className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#dbeafe", color: "#1d4ed8" }}
        >
          {presses.filter((p) => p.status === "Running").length}/
          {presses.length} Running
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 1200 }}>
          <thead>
            <tr>
              <TH className="border-r-2 border-[#d1d5db]">Press</TH>
              <TH center>Status</TH>
              <TH>Operator</TH>
              <TH>Work Order</TH>
              <TH center>Die No</TH>
              <TH right>Input MT</TH>
              <TH right>Output MT</TH>
              <TH right>Recovery %</TH>
              <TH right>OEE %</TH>
              <TH right>Press Kg/H</TH>
              <TH right>Die Kg/H</TH>
              <TH right>PP Planned</TH>
              <TH right>PP Actual</TH>
              <TH right>Die Load</TH>
              <TH right>Die Unload</TH>
              <TH right>Contact Time</TH>
              <TH right>Downtime</TH>
            </tr>
          </thead>
          <tbody>
            {presses.map((p, i) => {
              const isDown = p.status === "Breakdown" || p.status === "Idle";
              const ppPct =
                p.ppPlanBillets > 0
                  ? Math.min((p.ppActBillets / p.ppPlanBillets) * 100, 100)
                  : 0;
              const ppColor =
                ppPct >= 90 ? "#16a34a" : ppPct >= 70 ? "#d97706" : "#dc2626";
              const ppBg =
                ppPct >= 90 ? "#dcfce7" : ppPct >= 70 ? "#fef3c7" : "#fee2e2";

              return (
                <tr
                  key={p.id}
                  data-ocid={`supervisor.press_wise.row.${i + 1}`}
                  className="hover:bg-blue-50 transition-colors"
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}
                >
                  {/* Press Identity */}
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
                          data-ocid={`supervisor.press_wise.press.button.${i + 1}`}
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

                  {/* Status */}
                  <TD center>
                    <StatusBadge status={p.status} />
                  </TD>

                  {/* Operator */}
                  <TD>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "#1e293b" }}
                      >
                        {p.operator}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full self-start"
                        style={{ background: "#eff6ff", color: "#1d4ed8" }}
                      >
                        Shift {p.shift}
                      </span>
                    </div>
                  </TD>

                  {/* Work Order */}
                  <TD>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          fontFamily: '"JetBrains Mono", monospace',
                          color: "#334155",
                        }}
                      >
                        {p.workOrder}
                      </span>
                      <span className="text-[9px]" style={{ color: "#94a3b8" }}>
                        {p.alloyGrade}
                      </span>
                    </div>
                  </TD>

                  {/* Die No */}
                  <TD center>
                    <span
                      className="text-[11px] font-bold"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#7c3aed",
                      }}
                    >
                      {p.dieNumber}
                    </span>
                  </TD>

                  {/* Input MT */}
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

                  {/* Output MT */}
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

                  {/* Recovery % */}
                  <TD right>
                    <RecoveryBadge recovery={p.recovery} />
                  </TD>

                  {/* OEE % */}
                  <TD right>
                    <OEEBadge oee={p.oee} />
                  </TD>

                  {/* Press Kg/H */}
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

                  {/* Die Kg/H */}
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

                  {/* PP Planned */}
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

                  {/* PP Actual */}
                  <TD right highlight={!isDown}>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="text-[14px] font-black tabular-nums leading-none"
                        style={{
                          color: ppColor,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {p.ppActBillets}
                      </span>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden mt-0.5"
                        style={{ background: ppBg, minWidth: 40 }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${ppPct.toFixed(0)}%`,
                            background: ppColor,
                          }}
                        />
                      </div>
                      <span
                        className="text-[9px] font-black tabular-nums mt-0.5"
                        style={{
                          color: ppColor,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {ppPct.toFixed(0)}% extruded
                      </span>
                    </div>
                  </TD>

                  {/* Die Load */}
                  <TD right>
                    <span
                      className="text-[13px] font-black tabular-nums"
                      style={{
                        color: "#1d4ed8",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.dieLoadCount}
                    </span>
                  </TD>

                  {/* Die Unload */}
                  <TD right>
                    <span
                      className="text-[13px] font-black tabular-nums"
                      style={{
                        color: "#7c3aed",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.dieUnloadCount}
                    </span>
                  </TD>

                  {/* Contact Time */}
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

                  {/* Downtime */}
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
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f5f9" }}>
              <td
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border-t-2 border-[#e2e8f0]"
                style={{ color: "#475569" }}
              >
                Fleet Total / Avg
              </td>
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
              <td className="px-2 py-1.5 border-t-2 border-[#e2e8f0]" />
              <td className="px-2 py-1.5 border-t-2 border-[#e2e8f0]" />
              <td className="px-2 py-1.5 border-t-2 border-[#e2e8f0]" />
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
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#16a34a",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {(
                    presses.reduce((s, p) => s + p.recovery, 0) / presses.length
                  ).toFixed(1)}
                  % avg
                </span>
              </td>
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
                  % avg
                </span>
              </td>
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
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Die Wise Table ────────────────────────────────────────────────────────────
function DieWiseTable({
  presses,
  overdueDies,
}: {
  presses: PressData[];
  overdueDies: DieMaintenance[];
}) {
  // Merge overdueDies + press dies into unified die list
  interface DieRow {
    dieNo: string;
    press: string;
    alloy: string;
    shotsCompleted: number | "N/A";
    shotLife: number;
    dieKgH: number;
    totalKg: number;
    scrap: number;
    lifeUsedPct: number | null;
    maintenanceStatus: "Overdue" | "Due Soon" | "OK";
    lastMaintenance: string;
    nextDue: string;
  }

  const rows: DieRow[] = [];
  const processedDies = new Set<string>();

  // Process known overdue dies
  for (const dm of overdueDies) {
    const matchingPress = presses.find((p) => p.dieNumber === dm.dieNo);
    const shots = Number(dm.shotsCompleted);
    const shotLife = Number(dm.shotLife);
    const lifeUsedPct = shotLife > 0 ? (shots / shotLife) * 100 : 0;
    const maintenanceDueDate = nanosToDate(dm.maintenanceDue);

    let maintenanceStatus: "Overdue" | "Due Soon" | "OK" = "OK";
    if (lifeUsedPct > 90) maintenanceStatus = "Overdue";
    else if (lifeUsedPct > 70) maintenanceStatus = "Due Soon";

    rows.push({
      dieNo: dm.dieNo,
      press: matchingPress?.id ?? "—",
      alloy: matchingPress?.alloyGrade ?? "—",
      shotsCompleted: shots,
      shotLife,
      dieKgH: matchingPress?.dieKgH ?? 0,
      totalKg: matchingPress ? matchingPress.dieKgH * 8 : 0,
      scrap: matchingPress?.scrap ?? 0,
      lifeUsedPct,
      maintenanceStatus,
      lastMaintenance: daysAgo(nanosToDate(dm.lastMaintenanceDate)),
      nextDue: daysUntil(maintenanceDueDate),
    });
    processedDies.add(dm.dieNo);
  }

  // Add presses with dies not in overdueDies
  for (const p of presses) {
    if (!processedDies.has(p.dieNumber)) {
      rows.push({
        dieNo: p.dieNumber,
        press: p.id,
        alloy: p.alloyGrade,
        shotsCompleted: "N/A",
        shotLife: 5000,
        dieKgH: p.dieKgH,
        totalKg: p.dieKgH * 8,
        scrap: p.scrap,
        lifeUsedPct: null,
        maintenanceStatus: "OK",
        lastMaintenance: "N/A",
        nextDue: "N/A",
      });
      processedDies.add(p.dieNumber);
    }
  }

  const getRowBg = (status: DieRow["maintenanceStatus"], i: number) => {
    if (status === "Overdue") return "#fff1f2";
    if (status === "Due Soon") return "#fffbeb";
    return i % 2 === 0 ? "#ffffff" : "#f9fafb";
  };

  const statusBadge = (status: DieRow["maintenanceStatus"]) => {
    const cfg = {
      Overdue: { bg: "#fee2e2", border: "#ef4444", text: "#dc2626" },
      "Due Soon": { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
      OK: { bg: "#dcfce7", border: "#22c55e", text: "#16a34a" },
    }[status];
    return (
      <span
        className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className="rounded-lg border border-[#e2e8f0] overflow-hidden mx-3 mb-3"
      style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      data-ocid="supervisor.die_wise.table"
    >
      <div
        className="flex items-center gap-2 px-4 py-2 border-b border-[#e2e8f0]"
        style={{ borderLeft: "4px solid #7c3aed", background: "#f8fafc" }}
      >
        <Layers size={13} style={{ color: "#7c3aed" }} />
        <span
          className="text-[11px] font-black uppercase tracking-widest"
          style={{ color: "#1e293b" }}
        >
          Die Wise Status
        </span>
        <span
          className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#ede9fe", color: "#7c3aed" }}
        >
          {rows.length} Dies
        </span>
        <span
          className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#fee2e2", color: "#dc2626" }}
        >
          {rows.filter((r) => r.maintenanceStatus === "Overdue").length} Overdue
        </span>
        <span
          className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#fef3c7", color: "#d97706" }}
        >
          {rows.filter((r) => r.maintenanceStatus === "Due Soon").length} Due
          Soon
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <TH>Die No</TH>
              <TH>Press</TH>
              <TH>Alloy</TH>
              <TH right>Shots Done</TH>
              <TH right>Shot Life</TH>
              <TH>Die Life %</TH>
              <TH right>Die Kg/H</TH>
              <TH right>Total KG (8h)</TH>
              <TH right>Scrap %</TH>
              <TH center>Maint. Status</TH>
              <TH>Last Maintenance</TH>
              <TH>Next Due</TH>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const lifeColor =
                row.lifeUsedPct === null
                  ? "#94a3b8"
                  : row.lifeUsedPct > 90
                    ? "#dc2626"
                    : row.lifeUsedPct > 70
                      ? "#d97706"
                      : "#16a34a";
              const rowBg = getRowBg(row.maintenanceStatus, i);

              return (
                <tr
                  key={row.dieNo}
                  data-ocid={`supervisor.die_wise.row.${i + 1}`}
                  style={{ background: rowBg }}
                >
                  <TD rowBg={rowBg}>
                    <span
                      className="font-bold text-[12px]"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#7c3aed",
                      }}
                    >
                      {row.dieNo}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="font-black text-[12px]"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: row.press === "—" ? "#cbd5e1" : "#1d4ed8",
                      }}
                    >
                      {row.press}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}
                    >
                      {row.alloy}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color:
                          row.shotsCompleted === "N/A" ? "#cbd5e1" : "#334155",
                      }}
                    >
                      {row.shotsCompleted === "N/A"
                        ? "N/A"
                        : row.shotsCompleted.toLocaleString()}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px]"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#64748b",
                      }}
                    >
                      {row.shotLife.toLocaleString()}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    {row.lifeUsedPct !== null ? (
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: "#f1f5f9" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(row.lifeUsedPct, 100).toFixed(0)}%`,
                              background: lifeColor,
                            }}
                          />
                        </div>
                        <span
                          className="text-[10px] font-black tabular-nums shrink-0"
                          style={{
                            color: lifeColor,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.lifeUsedPct.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-[10px]"
                        style={{ color: "#cbd5e1" }}
                      >
                        N/A
                      </span>
                    )}
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        color: row.dieKgH > 0 ? "#1e3a5f" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.dieKgH > 0 ? row.dieKgH.toLocaleString() : "—"}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px]"
                      style={{
                        color: row.totalKg > 0 ? "#334155" : "#cbd5e1",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.totalKg > 0 ? row.totalKg.toLocaleString() : "—"}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        color:
                          row.scrap > 2
                            ? "#dc2626"
                            : row.scrap > 1.5
                              ? "#d97706"
                              : "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.scrap.toFixed(1)}%
                    </span>
                  </TD>
                  <TD center rowBg={rowBg}>
                    {statusBadge(row.maintenanceStatus)}
                  </TD>
                  <TD rowBg={rowBg}>
                    <span className="text-[10px]" style={{ color: "#64748b" }}>
                      {row.lastMaintenance}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="text-[10px] font-semibold"
                      style={{
                        color:
                          row.maintenanceStatus === "Overdue"
                            ? "#dc2626"
                            : row.maintenanceStatus === "Due Soon"
                              ? "#d97706"
                              : "#64748b",
                      }}
                    >
                      {row.nextDue}
                    </span>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
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
          {
            color: "#fee2e2",
            border: "#ef4444",
            text: "#dc2626",
            label: "Overdue (>90% life used)",
          },
          {
            color: "#fffbeb",
            border: "#f59e0b",
            text: "#d97706",
            label: "Due Soon (70–90% life)",
          },
          {
            color: "#f0fdf4",
            border: "#22c55e",
            text: "#16a34a",
            label: "OK (<70% life)",
          },
        ].map(({ color, border, text, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded border"
              style={{ background: color, borderColor: border }}
            />
            <span className="text-[8px] font-semibold" style={{ color: text }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PP Wise Table ─────────────────────────────────────────────────────────────
function PPWiseTable({
  orders,
  presses,
}: {
  orders: Order[];
  presses: PressData[];
}) {
  const statusOrder: Record<string, number> = {
    delayed: 0,
    inProgress: 1,
    open: 2,
    completed: 3,
  };

  const sortedOrders = [...orders].sort(
    (a, b) => (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4),
  );

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.status === OrderStatus.completed,
  ).length;
  const delayedOrders = orders.filter(
    (o) => o.status === OrderStatus.delayed,
  ).length;
  const totalRemaining = orders.reduce(
    (s, o) => s + (o.totalMT - o.completedMT),
    0,
  );

  const statusBadge = (status: OrderStatus) => {
    const cfg = {
      [OrderStatus.completed]: {
        bg: "#dcfce7",
        border: "#22c55e",
        text: "#16a34a",
        label: "Completed",
      },
      [OrderStatus.inProgress]: {
        bg: "#dbeafe",
        border: "#3b82f6",
        text: "#1d4ed8",
        label: "In Progress",
      },
      [OrderStatus.delayed]: {
        bg: "#fee2e2",
        border: "#ef4444",
        text: "#dc2626",
        label: "Delayed",
      },
      [OrderStatus.open]: {
        bg: "#f1f5f9",
        border: "#94a3b8",
        text: "#64748b",
        label: "Open",
      },
    }[status];
    return (
      <span
        className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
      >
        {cfg.label}
      </span>
    );
  };

  return (
    <div
      className="rounded-lg border border-[#e2e8f0] overflow-hidden mx-3 mb-3"
      style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      data-ocid="supervisor.pp_wise.table"
    >
      <div
        className="flex items-center gap-2 px-4 py-2 border-b border-[#e2e8f0]"
        style={{ borderLeft: "4px solid #0d9488", background: "#f8fafc" }}
      >
        <ListChecks size={13} style={{ color: "#0d9488" }} />
        <span
          className="text-[11px] font-black uppercase tracking-widest"
          style={{ color: "#1e293b" }}
        >
          Production Plan Wise
        </span>
        <span
          className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#ccfbf1", color: "#0d9488" }}
        >
          {totalOrders} Orders
        </span>
        <span
          className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#fee2e2", color: "#dc2626" }}
        >
          {delayedOrders} Delayed
        </span>
        <span
          className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: "#dcfce7", color: "#16a34a" }}
        >
          {completedOrders} Completed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <TH>Work Order</TH>
              <TH>Press</TH>
              <TH>Customer</TH>
              <TH>Alloy</TH>
              <TH center>Die No</TH>
              <TH right>Total MT</TH>
              <TH right>Completed MT</TH>
              <TH right>Remaining MT</TH>
              <TH>% Complete</TH>
              <TH>Due Date</TH>
              <TH center>Status</TH>
              <TH center>On-Time</TH>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, i) => {
              const press = presses[i % presses.length];
              const pctComplete =
                order.totalMT > 0
                  ? (order.completedMT / order.totalMT) * 100
                  : 0;
              const remaining = order.totalMT - order.completedMT;
              const dueDate = nanosToDate(order.dueDate);
              const isOverdue =
                dueDate < new Date() && order.status !== OrderStatus.completed;
              const isOnTime =
                !isOverdue && order.status !== OrderStatus.delayed;

              const pctColor =
                pctComplete >= 90
                  ? "#16a34a"
                  : pctComplete >= 50
                    ? "#d97706"
                    : "#dc2626";
              const pctBg =
                pctComplete >= 90
                  ? "#dcfce7"
                  : pctComplete >= 50
                    ? "#fef3c7"
                    : "#fee2e2";

              const rowBg =
                order.status === OrderStatus.delayed
                  ? i % 2 === 0
                    ? "#fff1f2"
                    : "#ffe4e6"
                  : i % 2 === 0
                    ? "#ffffff"
                    : "#f9fafb";

              return (
                <tr
                  key={order.id}
                  data-ocid={`supervisor.pp_wise.row.${i + 1}`}
                  className="hover:brightness-95 transition-all"
                  style={{ background: rowBg }}
                >
                  <TD rowBg={rowBg}>
                    <span
                      className="font-bold text-[11px]"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#334155",
                      }}
                    >
                      {order.workOrderNo}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="font-black text-[12px]"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#1d4ed8",
                      }}
                    >
                      {press.id}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "#1e293b" }}
                    >
                      {order.customerName}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}
                    >
                      {order.alloyGrade}
                    </span>
                  </TD>
                  <TD center rowBg={rowBg}>
                    <span
                      className="font-mono text-[10px] font-semibold"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#7c3aed",
                      }}
                    >
                      {order.dieNo}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px]"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#334155",
                      }}
                    >
                      {order.totalMT.toFixed(1)}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: "#0f766e",
                      }}
                    >
                      {order.completedMT.toFixed(1)}
                    </span>
                  </TD>
                  <TD right rowBg={rowBg}>
                    <span
                      className="font-mono tabular-nums text-[11px] font-semibold"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: remaining > 0 ? "#d97706" : "#16a34a",
                      }}
                    >
                      {remaining.toFixed(1)}
                    </span>
                  </TD>
                  <TD rowBg={rowBg}>
                    <div className="flex items-center gap-2 min-w-[110px]">
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: "#f1f5f9" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(pctComplete, 100).toFixed(0)}%`,
                            background: pctColor,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-black tabular-nums shrink-0"
                        style={{
                          color: pctColor,
                          fontFamily: '"JetBrains Mono", monospace',
                          background: pctBg,
                          padding: "1px 4px",
                          borderRadius: 3,
                        }}
                      >
                        {pctComplete.toFixed(0)}%
                      </span>
                    </div>
                  </TD>
                  <TD rowBg={rowBg}>
                    <span
                      className="text-[10px] font-mono"
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: isOverdue ? "#dc2626" : "#334155",
                        fontWeight: isOverdue ? 700 : 400,
                      }}
                    >
                      {dueDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </span>
                  </TD>
                  <TD center rowBg={rowBg}>
                    {statusBadge(order.status)}
                  </TD>
                  <TD center rowBg={rowBg}>
                    {isOnTime ? (
                      <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
                    ) : (
                      <XCircle size={14} style={{ color: "#dc2626" }} />
                    )}
                  </TD>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f5f9" }}>
              <td
                colSpan={5}
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border-t-2 border-[#e2e8f0]"
                style={{ color: "#475569" }}
              >
                Summary: {totalOrders} Orders Total · {completedOrders}{" "}
                Completed · {delayedOrders} Delayed
              </td>
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#334155",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {orders.reduce((s, o) => s + o.totalMT, 0).toFixed(1)} MT
                </span>
              </td>
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#0f766e",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {orders.reduce((s, o) => s + o.completedMT, 0).toFixed(1)} MT
                </span>
              </td>
              <td className="px-2 py-1.5 text-right border-t-2 border-[#e2e8f0]">
                <span
                  className="text-[9px] font-black tabular-nums"
                  style={{
                    color: "#d97706",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {totalRemaining.toFixed(1)} MT remaining
                </span>
              </td>
              <td
                colSpan={4}
                className="px-2 py-1.5 border-t-2 border-[#e2e8f0]"
              >
                <span className="text-[9px]" style={{ color: "#64748b" }}>
                  Overall:{" "}
                  {(
                    (orders.reduce((s, o) => s + o.completedMT, 0) /
                      Math.max(
                        1,
                        orders.reduce((s, o) => s + o.totalMT, 0),
                      )) *
                    100
                  ).toFixed(1)}
                  % achieved
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Main SupervisorView component ─────────────────────────────────────────────
export function SupervisorView({
  presses,
  orders,
  overdueDies,
  onPressClick,
  filterBadge,
}: SupervisorViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("Press Wise");

  const subTabs: { id: SubTab; icon: React.ReactNode; accentColor: string }[] =
    [
      {
        id: "Press Wise",
        icon: <Activity size={12} />,
        accentColor: "#3b82f6",
      },
      { id: "Die Wise", icon: <Layers size={12} />, accentColor: "#7c3aed" },
      { id: "PP Wise", icon: <ListChecks size={12} />, accentColor: "#0d9488" },
    ];

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "#f8fafc" }}
      data-ocid="supervisor.page"
    >
      {/* Header */}
      <div
        className="px-3 pt-2.5 pb-0 flex items-center justify-between"
        style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-5 rounded-full"
            style={{ background: "#3b82f6" }}
          />
          <span
            className="text-[12px] font-black uppercase tracking-widest"
            style={{ color: "#1e293b", letterSpacing: "0.1em" }}
          >
            Supervisor View
          </span>
          {filterBadge && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: "#eff6ff", color: "#1d4ed8" }}
            >
              {filterBadge}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <KPISummary presses={presses} />

      {/* Sub-tab selector */}
      <div
        className="flex items-end gap-0 px-3 border-b border-[#e2e8f0] shrink-0"
        style={{ background: "#ffffff" }}
        data-ocid="supervisor.subtab.panel"
      >
        {subTabs.map(({ id, icon, accentColor }) => {
          const isActive = activeSubTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSubTab(id)}
              className="relative flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0"
              data-ocid={`supervisor.${id.toLowerCase().replace(/\s+/g, "_")}.tab`}
              style={{
                color: isActive ? accentColor : "#64748b",
                background: isActive ? `${accentColor}0d` : "transparent",
                borderBottom: isActive
                  ? `2px solid ${accentColor}`
                  : "2px solid transparent",
                letterSpacing: "0.03em",
              }}
            >
              <span style={{ color: isActive ? accentColor : "#94a3b8" }}>
                {icon}
              </span>
              {id.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 pt-3" style={{ background: "#f8fafc" }}>
        {activeSubTab === "Press Wise" && (
          <PressWiseTable presses={presses} onPressClick={onPressClick} />
        )}
        {activeSubTab === "Die Wise" && (
          <DieWiseTable presses={presses} overdueDies={overdueDies} />
        )}
        {activeSubTab === "PP Wise" && (
          <PPWiseTable orders={orders} presses={presses} />
        )}
      </div>
    </div>
  );
}
