import type { strategicKPIs } from "../../mockData";

type StrategicKPI = (typeof strategicKPIs)[number];

interface CEOViewProps {
  kpis: StrategicKPI[];
  fleetOEE: number;
  totalOutput: number;
  fleetUtil: number;
}

function StatusIcon({ status }: { status: "red" | "yellow" | "green" }) {
  const map = {
    red: { icon: "🔴", label: "Below Target" },
    yellow: { icon: "🟡", label: "Near Target" },
    green: { icon: "🟢", label: "On Target" },
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{map[status].icon}</span>
      <span
        className="text-[9px] font-semibold"
        style={{
          color:
            status === "green"
              ? "#22c55e"
              : status === "yellow"
                ? "#f59e0b"
                : "#ef4444",
        }}
      >
        {map[status].label}
      </span>
    </div>
  );
}

export function CEOView({
  kpis,
  fleetOEE,
  totalOutput,
  fleetUtil,
}: CEOViewProps) {
  return (
    <div className="p-3 space-y-4">
      {/* CEO Summary header */}
      <div
        className="rounded border px-4 py-3"
        style={{ background: "#0c1425", borderColor: "#1e3a6e" }}
      >
        <div
          className="text-[11px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "#475569" }}
        >
          Executive Summary — Today's Performance
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div
              className="text-[9px] uppercase tracking-wider mb-1"
              style={{ color: "#64748b" }}
            >
              Fleet OEE
            </div>
            <div
              className="font-black text-3xl font-mono"
              style={{
                color:
                  fleetOEE >= 85
                    ? "#22c55e"
                    : fleetOEE >= 70
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            >
              {fleetOEE.toFixed(1)}%
            </div>
            <div className="text-[9px]" style={{ color: "#475569" }}>
              Target: 85%
            </div>
          </div>
          <div>
            <div
              className="text-[9px] uppercase tracking-wider mb-1"
              style={{ color: "#64748b" }}
            >
              Today Output
            </div>
            <div
              className="font-black text-3xl font-mono"
              style={{ color: "#3b82f6" }}
            >
              {totalOutput.toFixed(1)} <span className="text-lg">MT</span>
            </div>
            <div className="text-[9px]" style={{ color: "#475569" }}>
              Target: 120 MT
            </div>
          </div>
          <div>
            <div
              className="text-[9px] uppercase tracking-wider mb-1"
              style={{ color: "#64748b" }}
            >
              Fleet Utilization
            </div>
            <div
              className="font-black text-3xl font-mono"
              style={{ color: fleetUtil >= 85 ? "#22c55e" : "#f59e0b" }}
            >
              {fleetUtil.toFixed(1)}%
            </div>
            <div className="text-[9px]" style={{ color: "#475569" }}>
              Target: 90%
            </div>
          </div>
        </div>
      </div>

      {/* Strategic KPI Table */}
      <div
        className="rounded border overflow-hidden"
        style={{ borderColor: "#1e2d45" }}
      >
        <div
          className="px-3 py-2 border-b border-[#1e2d45]"
          style={{ background: "#0d1526" }}
        >
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "#94a3b8" }}
          >
            Strategic KPI Dashboard
          </span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#0a111e" }}>
              <th
                className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                KPI
              </th>
              <th
                className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Target
              </th>
              <th
                className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Actual
              </th>
              <th
                className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, i) => (
              <tr
                key={kpi.kpi}
                style={{ background: i % 2 === 0 ? "#0c1425" : "#0f1729" }}
              >
                <td
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid #111e33" }}
                >
                  <span
                    className="font-bold text-[12px]"
                    style={{ color: "#e2e8f0" }}
                  >
                    {kpi.kpi}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ borderBottom: "1px solid #111e33" }}
                >
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: "#64748b" }}
                  >
                    {kpi.target}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ borderBottom: "1px solid #111e33" }}
                >
                  <span
                    className="font-black font-mono text-[13px]"
                    style={{
                      color:
                        kpi.status === "green"
                          ? "#22c55e"
                          : kpi.status === "yellow"
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  >
                    {kpi.actual}
                  </span>
                </td>
                <td
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid #111e33" }}
                >
                  <StatusIcon status={kpi.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
