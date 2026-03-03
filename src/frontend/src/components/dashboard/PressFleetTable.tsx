import { Activity } from "lucide-react";
import type { PressData } from "../../mockData";

interface PressFleetTableProps {
  presses: PressData[];
}

function StatusBadge({ status }: { status: PressData["status"] }) {
  const cfg = {
    Running: { bg: "#22c55e15", border: "#22c55e", text: "#22c55e" },
    Breakdown: { bg: "#ef444420", border: "#ef4444", text: "#ef4444" },
    Idle: { bg: "#64748b15", border: "#64748b", text: "#94a3b8" },
    Setup: { bg: "#f59e0b15", border: "#f59e0b", text: "#f59e0b" },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
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
  const color = oee >= 85 ? "#22c55e" : oee >= 70 ? "#f59e0b" : "#ef4444";
  const bg = oee >= 85 ? "#22c55e14" : oee >= 70 ? "#f59e0b14" : "#ef444414";
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded font-black tabular-nums text-[12px]"
      style={{
        color,
        background: bg,
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {oee.toFixed(1)}%
    </span>
  );
}

function ScrapBadge({ scrap }: { scrap: number }) {
  const color = scrap > 2 ? "#ef4444" : scrap >= 1.5 ? "#f59e0b" : "#22c55e";
  return (
    <span
      className="font-semibold tabular-nums text-[11px]"
      style={{ color, fontFamily: '"JetBrains Mono", monospace' }}
    >
      {scrap.toFixed(1)}%
    </span>
  );
}

function ProgressBar({ plan, actual }: { plan: number; actual: number }) {
  const pct = Math.min((actual / plan) * 100, 100);
  const color = pct >= 80 ? "#f59e0b" : pct >= 50 ? "#3b82f6" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "#1e2d45", minWidth: 50 }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="text-[9px] font-mono tabular-nums shrink-0"
        style={{ color: "#64748b" }}
      >
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

const TH = ({
  children,
  right,
}: { children: React.ReactNode; right?: boolean }) => (
  <th
    className={`px-2 py-1.5 text-[9px] font-bold uppercase whitespace-nowrap ${right ? "text-right" : "text-left"}`}
    style={{
      color: "#3d5575",
      background: "#080f1a",
      borderBottom: "1px solid #162030",
      letterSpacing: "0.07em",
    }}
  >
    {children}
  </th>
);

const TD = ({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) => (
  <td
    className={`px-2 py-1.5 text-[11px] border-b border-[#111e33] ${right ? "text-right" : ""}`}
    style={{ color: "#e2e8f0" }}
  >
    {children}
  </td>
);

export function PressFleetTable({ presses }: PressFleetTableProps) {
  return (
    <div
      className="flex flex-col rounded border border-[#1e2d45] overflow-hidden"
      style={{ background: "#0f1729" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a2d45]"
        style={{ background: "#0a111e" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-0.5 h-3 rounded-full"
            style={{ background: "#3b82f6" }}
          />
          <Activity size={12} style={{ color: "#3b82f6" }} />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#7090b0", letterSpacing: "0.1em" }}
          >
            Press Fleet Performance
          </span>
        </div>
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
            Real-time Data
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <TH>Press</TH>
              <TH>Status</TH>
              <TH right>Plan (MT)</TH>
              <TH right>Actual (MT)</TH>
              <TH>Progress</TH>
              <TH right>OEE %</TH>
              <TH right>Downtime</TH>
              <TH right>Scrap %</TH>
            </tr>
          </thead>
          <tbody>
            {presses.map((p, i) => (
              <tr
                key={p.id}
                style={{
                  background: i % 2 === 0 ? "#0c1425" : "#0f1729",
                }}
              >
                <TD>
                  <div>
                    <div
                      className="font-black text-[12px] tracking-tight"
                      style={{
                        color: "#c8dff0",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {p.id}
                    </div>
                    <div
                      className="text-[9px] font-medium mt-0.5"
                      style={{ color: "#344d66" }}
                    >
                      {p.name} · {p.tonnage}T
                    </div>
                  </div>
                </TD>
                <TD>
                  <StatusBadge status={p.status} />
                </TD>
                <TD right>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "#64748b" }}
                  >
                    {p.plan.toFixed(1)}
                  </span>
                </TD>
                <TD right>
                  <span
                    className="font-mono tabular-nums font-bold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {p.actual.toFixed(1)}
                  </span>
                </TD>
                <TD>
                  <ProgressBar plan={p.plan} actual={p.actual} />
                </TD>
                <TD right>
                  <OEEBadge oee={p.oee} />
                </TD>
                <TD right>
                  <span
                    className="font-mono tabular-nums text-[11px]"
                    style={{
                      color:
                        p.downtime > 60
                          ? "#ef4444"
                          : p.downtime > 10
                            ? "#f59e0b"
                            : "#64748b",
                    }}
                  >
                    {p.downtime} min
                  </span>
                </TD>
                <TD right>
                  <ScrapBadge scrap={p.scrap} />
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
