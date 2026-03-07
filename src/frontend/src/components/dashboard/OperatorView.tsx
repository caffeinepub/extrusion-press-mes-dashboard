import { AlertCircle, Gauge, Thermometer, Zap } from "lucide-react";
import type { PressData } from "../../mockData";

interface OperatorViewProps {
  presses: PressData[];
}

function MachineCard({ press }: { press: PressData }) {
  return (
    <div
      className="rounded border p-3 flex flex-col gap-2"
      style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-black text-sm" style={{ color: "#1e293b" }}>
            {press.id}
          </div>
          <div className="text-[9px]" style={{ color: "#475569" }}>
            {press.tonnage} UST · Die {press.dieNumber}
          </div>
        </div>
      </div>

      {/* Params grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <div
          className="rounded px-2 py-1.5 flex items-center gap-2"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
        >
          <Thermometer size={12} style={{ color: "#ea580c" }} />
          <div>
            <div className="text-[8px]" style={{ color: "#64748b" }}>
              Billet Temp
            </div>
            <div
              className="font-mono font-bold text-[12px]"
              style={{ color: "#ea580c" }}
            >
              {press.billetTemp > 0 ? `${press.billetTemp}°C` : "--"}
            </div>
          </div>
        </div>
        <div
          className="rounded px-2 py-1.5 flex items-center gap-2"
          style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
        >
          <Gauge size={12} style={{ color: "#2563eb" }} />
          <div>
            <div className="text-[8px]" style={{ color: "#64748b" }}>
              Ram Pressure
            </div>
            <div
              className="font-mono font-bold text-[12px]"
              style={{ color: "#2563eb" }}
            >
              {press.ramPressure > 0 ? `${press.ramPressure} bar` : "--"}
            </div>
          </div>
        </div>
        <div
          className="rounded px-2 py-1.5 flex items-center gap-2"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <Zap size={12} style={{ color: "#d97706" }} />
          <div>
            <div className="text-[8px]" style={{ color: "#64748b" }}>
              Ext. Speed
            </div>
            <div
              className="font-mono font-bold text-[12px]"
              style={{ color: "#d97706" }}
            >
              {press.extrusionSpeed > 0
                ? `${press.extrusionSpeed} m/min`
                : "--"}
            </div>
          </div>
        </div>
        <div
          className="rounded px-2 py-1.5 flex items-center gap-2"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <div className="text-[11px]" style={{ color: "#16a34a" }}>
            ⚡
          </div>
          <div>
            <div className="text-[8px]" style={{ color: "#64748b" }}>
              Kg / Hour
            </div>
            <div
              className="font-mono font-bold text-[12px]"
              style={{ color: "#16a34a" }}
            >
              {press.kgPerHour > 0 ? press.kgPerHour.toLocaleString() : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* OEE + Scrap */}
      <div className="flex gap-2">
        <div
          className="flex-1 rounded px-2 py-1"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div className="text-[8px] mb-0.5" style={{ color: "#64748b" }}>
            OEE
          </div>
          <div
            className="font-black text-base font-mono"
            style={{
              color:
                press.oee >= 85
                  ? "#16a34a"
                  : press.oee >= 70
                    ? "#d97706"
                    : "#dc2626",
            }}
          >
            {press.oee.toFixed(1)}%
          </div>
        </div>
        <div
          className="flex-1 rounded px-2 py-1"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div className="text-[8px] mb-0.5" style={{ color: "#64748b" }}>
            Scrap
          </div>
          <div
            className="font-black text-base font-mono"
            style={{
              color:
                press.scrap > 2
                  ? "#dc2626"
                  : press.scrap >= 1.5
                    ? "#d97706"
                    : "#16a34a",
            }}
          >
            {press.scrap.toFixed(1)}%
          </div>
        </div>
        <div
          className="flex-1 rounded px-2 py-1"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div className="text-[8px] mb-0.5" style={{ color: "#64748b" }}>
            Operator
          </div>
          <div
            className="text-[10px] font-semibold truncate"
            style={{ color: "#475569" }}
          >
            {press.operator}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OperatorView({ presses }: OperatorViewProps) {
  const breakdownPresses = presses.filter((p) => p.status === "Breakdown");

  return (
    <div className="p-3 space-y-3">
      {/* Alarms */}
      {breakdownPresses.length > 0 && (
        <div
          className="rounded border px-3 py-2 flex items-center gap-2"
          style={{ background: "#ef444415", borderColor: "#ef4444" }}
        >
          <AlertCircle size={14} style={{ color: "#ef4444" }} />
          <span className="text-[11px] font-bold" style={{ color: "#ef4444" }}>
            ACTIVE BREAKDOWN:{" "}
            {breakdownPresses.map((p) => `${p.id} (${p.name})`).join(", ")} —
            Downtime:{" "}
            {breakdownPresses.map((p) => `${p.downtime} min`).join(", ")}
          </span>
        </div>
      )}

      {/* Machine grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {presses.map((press) => (
          <MachineCard key={press.id} press={press} />
        ))}
      </div>
    </div>
  );
}
