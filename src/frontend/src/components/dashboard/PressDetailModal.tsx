import {
  Activity,
  AlertTriangle,
  BarChart2,
  Clock,
  Cpu,
  Gauge,
  Layers,
  Settings,
  Thermometer,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";

// ─── Press-level mock data generators ─────────────────────────────────────────

function getPressTopDies(pressId: string) {
  const dieSets: Record<
    string,
    {
      dieNo: string;
      kg: number;
      shots: number;
      scrap: number;
      dieKgH: number;
    }[]
  > = {
    P3300: [
      { dieNo: "2003064", kg: 21840, shots: 104, scrap: 1.2, dieKgH: 156.8 },
      { dieNo: "2003078", kg: 19200, shots: 91, scrap: 1.5, dieKgH: 148.3 },
      { dieNo: "2003012", kg: 17640, shots: 84, scrap: 1.8, dieKgH: 142.5 },
      { dieNo: "2003091", kg: 15960, shots: 76, scrap: 2.1, dieKgH: 135.9 },
      { dieNo: "2003045", kg: 14280, shots: 68, scrap: 2.4, dieKgH: 128.4 },
    ],
    P2500: [
      { dieNo: "2001005", kg: 2800, shots: 14, scrap: 2.3, dieKgH: 98.6 },
      { dieNo: "2001023", kg: 1960, shots: 10, scrap: 2.8, dieKgH: 87.2 },
      { dieNo: "2001047", kg: 1400, shots: 7, scrap: 3.1, dieKgH: 79.5 },
      { dieNo: "2001089", kg: 980, shots: 5, scrap: 3.5, dieKgH: 71.3 },
      { dieNo: "2001112", kg: 560, shots: 3, scrap: 4.0, dieKgH: 62.8 },
    ],
    P1800: [
      { dieNo: "2002010", kg: 17480, shots: 92, scrap: 1.6, dieKgH: 138.7 },
      { dieNo: "2002034", kg: 15390, shots: 81, scrap: 1.9, dieKgH: 131.4 },
      { dieNo: "2002056", kg: 13300, shots: 70, scrap: 2.0, dieKgH: 125.6 },
      { dieNo: "2002078", kg: 11970, shots: 63, scrap: 2.2, dieKgH: 119.8 },
      { dieNo: "2002090", kg: 9880, shots: 52, scrap: 2.5, dieKgH: 112.3 },
    ],
    P1460: [
      { dieNo: "2004056", kg: 13440, shots: 84, scrap: 1.5, dieKgH: 144.2 },
      { dieNo: "2004078", kg: 11520, shots: 72, scrap: 1.7, dieKgH: 136.7 },
      { dieNo: "2004023", kg: 10080, shots: 63, scrap: 1.9, dieKgH: 129.5 },
      { dieNo: "2004101", kg: 8640, shots: 54, scrap: 2.1, dieKgH: 121.8 },
      { dieNo: "2004145", kg: 7200, shots: 45, scrap: 2.4, dieKgH: 114.0 },
    ],
    P1100: [
      { dieNo: "2000061", kg: 18900, shots: 126, scrap: 1.3, dieKgH: 162.4 },
      { dieNo: "2000045", kg: 16500, shots: 110, scrap: 1.5, dieKgH: 155.1 },
      { dieNo: "2000023", kg: 13800, shots: 92, scrap: 1.7, dieKgH: 147.6 },
      { dieNo: "2000089", kg: 11700, shots: 78, scrap: 1.9, dieKgH: 139.3 },
      { dieNo: "2000112", kg: 9300, shots: 62, scrap: 2.2, dieKgH: 131.9 },
    ],
  };
  return dieSets[pressId] ?? dieSets.P3300;
}

function getPressTopAlloys(pressId: string) {
  const alloySets: Record<
    string,
    { alloy: string; kg: number; pct: number; oee: number }[]
  > = {
    P3300: [
      { alloy: "6063", kg: 24360, pct: 38, oee: 91.2 },
      { alloy: "6082", kg: 16560, pct: 26, oee: 88.5 },
      { alloy: "7075", kg: 12720, pct: 20, oee: 85.3 },
      { alloy: "6061", kg: 7680, pct: 12, oee: 89.1 },
      { alloy: "2024", kg: 2560, pct: 4, oee: 82.6 },
    ],
    P2500: [
      { alloy: "6082", kg: 4200, pct: 45, oee: 53.2 },
      { alloy: "6063", kg: 2800, pct: 30, oee: 50.1 },
      { alloy: "7075", kg: 1400, pct: 15, oee: 48.7 },
      { alloy: "6061", kg: 700, pct: 7, oee: 51.9 },
      { alloy: "E91E", kg: 280, pct: 3, oee: 46.5 },
    ],
    P1800: [
      { alloy: "7075", kg: 16720, pct: 44, oee: 83.1 },
      { alloy: "6063", kg: 10260, pct: 27, oee: 80.5 },
      { alloy: "E91E", kg: 7600, pct: 20, oee: 78.2 },
      { alloy: "6082", kg: 2660, pct: 7, oee: 81.7 },
      { alloy: "6061", kg: 760, pct: 2, oee: 77.9 },
    ],
    P1460: [
      { alloy: "6061", kg: 13440, pct: 50, oee: 87.4 },
      { alloy: "6063", kg: 6720, pct: 25, oee: 85.9 },
      { alloy: "6082", kg: 4032, pct: 15, oee: 84.2 },
      { alloy: "7075", kg: 2688, pct: 10, oee: 83.1 },
    ],
    P1100: [
      { alloy: "6063", kg: 22680, pct: 54, oee: 96.1 },
      { alloy: "6082", kg: 8400, pct: 20, oee: 93.8 },
      { alloy: "6061", kg: 5880, pct: 14, oee: 94.5 },
      { alloy: "7075", kg: 3780, pct: 9, oee: 91.7 },
      { alloy: "E91E", kg: 1260, pct: 3, oee: 89.4 },
    ],
  };
  return alloySets[pressId] ?? alloySets.P3300;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 border-b"
      style={{ background: `${color}0d`, borderColor: `${color}33` }}
    >
      <div style={{ color }}>{icon}</div>
      <span
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ color }}
      >
        {title}
      </span>
    </div>
  );
}

function KVRow({
  label,
  value,
  valueColor,
  unit,
}: {
  label: string;
  value: string | number;
  valueColor?: string;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9] last:border-0">
      <span className="text-[10px] font-medium" style={{ color: "#64748b" }}>
        {label}
      </span>
      <span
        className="text-[11px] font-black tabular-nums"
        style={{
          color: valueColor ?? "#0f172a",
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {value}
        {unit && (
          <span
            className="text-[9px] font-semibold ml-0.5"
            style={{ color: "#94a3b8" }}
          >
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function ColorBar({ pct, color }: { pct: number; color: string }) {
  const bg = `${color}22`;
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: bg }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

interface PressDetailModalProps {
  press: PressData | null;
  open: boolean;
  onClose: () => void;
}

export function PressDetailModal({
  press,
  open,
  onClose,
}: PressDetailModalProps) {
  if (!open || !press) return null;

  const topDies = getPressTopDies(press.id);
  const topAlloys = getPressTopAlloys(press.id);

  const maxDieKg = Math.max(...topDies.map((d) => d.kg));
  const maxAlloyKg = Math.max(...topAlloys.map((a) => a.kg));

  const ppPct =
    press.ppPlanBillets > 0
      ? Math.min(100, (press.ppActBillets / press.ppPlanBillets) * 100)
      : 0;
  const ppColor = ppPct >= 90 ? "#22c55e" : ppPct >= 70 ? "#f59e0b" : "#ef4444";
  const oeeColor =
    press.oee >= 85 ? "#16a34a" : press.oee >= 70 ? "#d97706" : "#dc2626";
  const recovColor =
    press.recovery >= 90
      ? "#16a34a"
      : press.recovery >= 80
        ? "#d97706"
        : "#dc2626";
  const scrapColor =
    press.scrap > 2 ? "#dc2626" : press.scrap >= 1.5 ? "#d97706" : "#16a34a";

  const alloyChartData = topAlloys.map((a) => ({
    name: a.alloy,
    kg: a.kg,
    oee: a.oee,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
      data-ocid="press_detail.modal"
    >
      {/* biome: use semantic <dialog> instead of role="dialog" */}
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <dialog
        open
        className="relative flex flex-col w-full max-h-[92vh] rounded-xl border border-[#e2e8f0] overflow-hidden p-0 m-0"
        style={{
          background: "#ffffff",
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          maxWidth: 1100,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-[#e2e8f0] shrink-0"
          style={{ background: "#0f172a" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-10 rounded-full shrink-0"
              style={{
                background:
                  press.status === "Running"
                    ? "#22c55e"
                    : press.status === "Breakdown"
                      ? "#ef4444"
                      : press.status === "Setup"
                        ? "#f59e0b"
                        : "#94a3b8",
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[20px] font-black tracking-tighter"
                  style={{
                    color: "#f8fafc",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {press.id}
                </span>
              </div>
              <div
                className="text-[10px] font-semibold mt-0.5"
                style={{ color: "#64748b" }}
              >
                {press.tonnage}T · Die {press.dieNumber} · Alloy{" "}
                {press.alloyGrade} · {press.workOrder}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "#94a3b8" }}
            data-ocid="press_detail.close_button"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div
          className="overflow-y-auto flex-1 p-4"
          style={{ background: "#f8fafc" }}
        >
          {/* Row 1: Identity + Production + OEE + Quality — 4 columns */}
          <div
            className="grid gap-3 mb-3"
            style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
          >
            {/* Identity Card */}
            <div
              className="rounded-lg border border-[#e2e8f0] overflow-hidden"
              style={{ background: "#ffffff" }}
            >
              <SectionHeader
                icon={<User size={11} />}
                title="Identity & Assignment"
                color="#3b82f6"
              />
              <div className="px-3 py-2">
                <KVRow label="Operator" value={press.operator} />
                <KVRow label="Shift" value={press.shift} />
                <KVRow label="Work Order" value={press.workOrder} />
                <KVRow label="Die Number" value={press.dieNumber} />
                <KVRow label="Alloy Grade" value={press.alloyGrade} />
                <KVRow label="Tonnage" value={press.tonnage} unit="T" />
              </div>
            </div>

            {/* Production Card */}
            <div
              className="rounded-lg border border-[#e2e8f0] overflow-hidden"
              style={{ background: "#ffffff" }}
            >
              <SectionHeader
                icon={<BarChart2 size={11} />}
                title="Production Metrics"
                color="#0369a1"
              />
              <div className="px-3 py-2">
                <KVRow
                  label="Actual Output"
                  value={`${press.actual} MT`}
                  valueColor="#0369a1"
                />
                <KVRow label="Plan Target" value={`${press.plan} MT`} />
                <KVRow
                  label="Billets (Act/Plan)"
                  value={`${press.ppActBillets} / ${press.ppPlanBillets}`}
                  valueColor={ppColor}
                />
                <div className="py-1 border-b border-[#f1f5f9]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-[#64748b]">
                      Plan Achievement
                    </span>
                    <span
                      className="text-[10px] font-black"
                      style={{
                        color: ppColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {ppPct.toFixed(0)}%
                    </span>
                  </div>
                  <ColorBar pct={ppPct} color={ppColor} />
                </div>
                <KVRow
                  label="Press Kg/H"
                  value={
                    press.kgPerHour > 0 ? press.kgPerHour.toLocaleString() : "—"
                  }
                  unit={press.kgPerHour > 0 ? "kg/h" : ""}
                  valueColor="#1d4ed8"
                />
                <KVRow
                  label="Die Kg/H"
                  value={press.dieKgH > 0 ? press.dieKgH.toLocaleString() : "—"}
                  unit={press.dieKgH > 0 ? "kg/h" : ""}
                />
              </div>
            </div>

            {/* OEE + Performance Card */}
            <div
              className="rounded-lg border border-[#e2e8f0] overflow-hidden"
              style={{ background: "#ffffff" }}
            >
              <SectionHeader
                icon={<TrendingUp size={11} />}
                title="OEE & Performance"
                color="#0f766e"
              />
              <div className="px-3 py-2">
                <div className="py-1 border-b border-[#f1f5f9]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-[#64748b]">OEE</span>
                    <span
                      className="text-[12px] font-black"
                      style={{
                        color: oeeColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {press.oee.toFixed(1)}%
                    </span>
                  </div>
                  <ColorBar pct={press.oee} color={oeeColor} />
                </div>
                <div className="py-1 border-b border-[#f1f5f9]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-[#64748b]">Recovery</span>
                    <span
                      className="text-[12px] font-black"
                      style={{
                        color: recovColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {press.recovery.toFixed(1)}%
                    </span>
                  </div>
                  <ColorBar pct={press.recovery} color={recovColor} />
                </div>
                <KVRow
                  label="Contact Time"
                  value={press.contactTime > 0 ? `${press.contactTime}s` : "—"}
                  valueColor="#0f766e"
                />
                <KVRow
                  label="Extrusion Speed"
                  value={
                    press.extrusionSpeed > 0
                      ? press.extrusionSpeed.toFixed(1)
                      : "—"
                  }
                  unit={press.extrusionSpeed > 0 ? "m/min" : ""}
                />
                <KVRow
                  label="Downtime"
                  value={press.downtime > 0 ? `${press.downtime} min` : "—"}
                  valueColor={
                    press.downtime > 60
                      ? "#dc2626"
                      : press.downtime > 10
                        ? "#d97706"
                        : "#64748b"
                  }
                />
              </div>
            </div>

            {/* Quality + Process Card */}
            <div
              className="rounded-lg border border-[#e2e8f0] overflow-hidden"
              style={{ background: "#ffffff" }}
            >
              <SectionHeader
                icon={<AlertTriangle size={11} />}
                title="Quality & Process"
                color="#b91c1c"
              />
              <div className="px-3 py-2">
                <div className="py-1 border-b border-[#f1f5f9]">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-[#64748b]">Scrap %</span>
                    <span
                      className="text-[12px] font-black"
                      style={{
                        color: scrapColor,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {press.scrap.toFixed(1)}%
                    </span>
                  </div>
                  <ColorBar pct={press.scrap * 20} color={scrapColor} />
                </div>
                <KVRow
                  label="Die Load Time"
                  value={press.dieLoad > 0 ? `${press.dieLoad} min` : "—"}
                  valueColor="#3b82f6"
                />
                <KVRow
                  label="Die Unload Time"
                  value={press.dieUnload > 0 ? `${press.dieUnload} min` : "—"}
                  valueColor="#8b5cf6"
                />
                <KVRow
                  label="Billet Temp"
                  value={press.billetTemp > 0 ? press.billetTemp : "—"}
                  unit={press.billetTemp > 0 ? "°C" : ""}
                  valueColor={press.billetTemp > 0 ? "#f97316" : undefined}
                />
                <KVRow
                  label="Ram Pressure"
                  value={press.ramPressure > 0 ? press.ramPressure : "—"}
                  unit={press.ramPressure > 0 ? "bar" : ""}
                  valueColor={press.ramPressure > 0 ? "#dc2626" : undefined}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Machine Parameters (full width banner) */}
          <div
            className="grid gap-3 mb-3 rounded-lg border border-[#e2e8f0] p-3"
            style={{
              background: "#ffffff",
              gridTemplateColumns: "repeat(5, 1fr)",
            }}
          >
            {[
              {
                icon: <Thermometer size={14} />,
                label: "Billet Temp",
                value: press.billetTemp > 0 ? `${press.billetTemp}°C` : "—",
                color: "#f97316",
              },
              {
                icon: <Gauge size={14} />,
                label: "Ram Pressure",
                value: press.ramPressure > 0 ? `${press.ramPressure} bar` : "—",
                color: "#dc2626",
              },
              {
                icon: <Activity size={14} />,
                label: "Extrusion Speed",
                value:
                  press.extrusionSpeed > 0
                    ? `${press.extrusionSpeed.toFixed(1)} m/min`
                    : "—",
                color: "#8b5cf6",
              },
              {
                icon: <Clock size={14} />,
                label: "Contact Time",
                value: press.contactTime > 0 ? `${press.contactTime}s` : "—",
                color: "#0f766e",
              },
              {
                icon: <Cpu size={14} />,
                label: "Die Load / Unload",
                value:
                  press.dieLoad > 0
                    ? `${press.dieLoad}m / ${press.dieUnload}m`
                    : "—",
                color: "#3b82f6",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 py-2 px-1"
              >
                <div style={{ color: item.color }}>{item.icon}</div>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wider text-center"
                  style={{ color: "#94a3b8" }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[12px] font-black tabular-nums text-center"
                  style={{
                    color: item.color,
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Row 3: Top 5 Dies (left) + Top 5 Alloys (right) */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Top 5 Dies */}
            <div
              className="rounded-lg border border-[#e2e8f0] overflow-hidden"
              style={{ background: "#ffffff" }}
            >
              <SectionHeader
                icon={<Settings size={11} />}
                title={`Top 5 Dies — ${press.id}`}
                color="#1e3a5f"
              />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      {[
                        "#",
                        "Die No",
                        "Total KG",
                        "Volume",
                        "Shots",
                        "Die Kg/H",
                        "Scrap %",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-1.5 text-[8px] font-bold uppercase tracking-wider text-center"
                          style={{
                            color: "#64748b",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topDies.map((d, i) => {
                      const pct = (d.kg / maxDieKg) * 100;
                      const rankColors = [
                        "#f59e0b",
                        "#94a3b8",
                        "#f97316",
                        "#64748b",
                        "#64748b",
                      ];
                      return (
                        <tr
                          key={d.dieNo}
                          style={{
                            background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                          }}
                          data-ocid={`press_detail.die.item.${i + 1}`}
                        >
                          <td className="px-2 py-2 text-center border-b border-[#f1f5f9]">
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-black"
                              style={{
                                background: `${rankColors[i]}22`,
                                color: rankColors[i],
                              }}
                            >
                              #{i + 1}
                            </span>
                          </td>
                          <td className="px-2 py-2 border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[11px]"
                              style={{ color: "#1e293b" }}
                            >
                              {d.dieNo}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[11px]"
                              style={{ color: "#1e3a5f" }}
                            >
                              {d.kg.toLocaleString()}
                            </span>
                          </td>
                          <td
                            className="px-2 py-2 border-b border-[#f1f5f9]"
                            style={{ minWidth: 80 }}
                          >
                            <div
                              className="w-full rounded overflow-hidden"
                              style={{ background: "#e8edf3", height: 8 }}
                            >
                              <div
                                className="h-full rounded"
                                style={{
                                  width: `${pct}%`,
                                  background: "#1e3a5f",
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center border-b border-[#f1f5f9]">
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: "#475569" }}
                            >
                              {d.shots}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[11px]"
                              style={{ color: "#0369a1" }}
                            >
                              {d.dieKgH.toFixed(1)}
                            </span>
                            <span
                              className="text-[8px] font-semibold ml-0.5"
                              style={{ color: "#94a3b8" }}
                            >
                              kg/h
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                color:
                                  d.scrap > 2
                                    ? "#dc2626"
                                    : d.scrap >= 1.5
                                      ? "#d97706"
                                      : "#16a34a",
                                background:
                                  d.scrap > 2
                                    ? "#fee2e2"
                                    : d.scrap >= 1.5
                                      ? "#fef3c7"
                                      : "#dcfce7",
                              }}
                            >
                              {d.scrap.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 Alloys */}
            <div
              className="rounded-lg border border-[#e2e8f0] overflow-hidden"
              style={{ background: "#ffffff" }}
            >
              <SectionHeader
                icon={<Layers size={11} />}
                title={`Top 5 Alloys — ${press.id}`}
                color="#f97316"
              />
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      {[
                        "#",
                        "Alloy",
                        "Total KG",
                        "Volume",
                        "Share %",
                        "OEE %",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-1.5 text-[8px] font-bold uppercase tracking-wider text-center"
                          style={{
                            color: "#64748b",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topAlloys.map((a, i) => {
                      const pct = (a.kg / maxAlloyKg) * 100;
                      const rankColors = [
                        "#f59e0b",
                        "#94a3b8",
                        "#f97316",
                        "#64748b",
                        "#64748b",
                      ];
                      const oeeC =
                        a.oee >= 85
                          ? "#16a34a"
                          : a.oee >= 70
                            ? "#d97706"
                            : "#dc2626";
                      return (
                        <tr
                          key={a.alloy}
                          style={{
                            background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                          }}
                          data-ocid={`press_detail.alloy.item.${i + 1}`}
                        >
                          <td className="px-2 py-2 text-center border-b border-[#f1f5f9]">
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-black"
                              style={{
                                background: `${rankColors[i]}22`,
                                color: rankColors[i],
                              }}
                            >
                              #{i + 1}
                            </span>
                          </td>
                          <td className="px-2 py-2 border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[11px]"
                              style={{ color: "#1e293b" }}
                            >
                              {a.alloy}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[11px]"
                              style={{ color: "#c2410c" }}
                            >
                              {a.kg.toLocaleString()}
                            </span>
                          </td>
                          <td
                            className="px-2 py-2 border-b border-[#f1f5f9]"
                            style={{ minWidth: 80 }}
                          >
                            <div
                              className="w-full rounded overflow-hidden"
                              style={{ background: "#fef3e9", height: 8 }}
                            >
                              <div
                                className="h-full rounded"
                                style={{
                                  width: `${pct}%`,
                                  background: "#f97316",
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[10px]"
                              style={{ color: "#475569" }}
                            >
                              {a.pct}%
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right border-b border-[#f1f5f9]">
                            <span
                              className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded"
                              style={{
                                color: oeeC,
                                background:
                                  a.oee >= 85
                                    ? "#dcfce7"
                                    : a.oee >= 70
                                      ? "#fef3c7"
                                      : "#fee2e2",
                              }}
                            >
                              {a.oee.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Alloy KG bar chart */}
              <div className="px-3 pb-3 pt-2 border-t border-[#f1f5f9]">
                <div
                  className="text-[8px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#94a3b8" }}
                >
                  Alloy Volume Distribution
                </div>
                <div style={{ height: 80 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alloyChartData} barSize={22}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 8, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        formatter={(v) => [
                          `${Number(v).toLocaleString()} kg`,
                          "Volume",
                        ]}
                        contentStyle={{
                          fontSize: 10,
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Bar dataKey="kg" radius={[3, 3, 0, 0]}>
                        {alloyChartData.map((entry, idx) => (
                          <Cell
                            key={entry.name}
                            fill={
                              idx === 0
                                ? "#f97316"
                                : idx === 1
                                  ? "#fb923c"
                                  : idx === 2
                                    ? "#fdba74"
                                    : idx === 3
                                      ? "#fed7aa"
                                      : "#ffedd5"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
