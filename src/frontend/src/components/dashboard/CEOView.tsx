import type { strategicKPIs } from "../../mockData";

type StrategicKPI = (typeof strategicKPIs)[number];

interface CEOViewProps {
  kpis: StrategicKPI[];
  fleetOEE: number;
  totalOutput: number;
  fleetUtil: number;
  showExecutiveSummary?: boolean;
  showStrategicKPITable?: boolean;
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
              ? "#16a34a"
              : status === "yellow"
                ? "#d97706"
                : "#dc2626",
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
  showExecutiveSummary = true,
  showStrategicKPITable = true,
}: CEOViewProps) {
  const nothingVisible = !showExecutiveSummary && !showStrategicKPITable;

  if (nothingVisible) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-ocid="ceo.empty_state"
      >
        <div className="text-center">
          <div
            className="text-[13px] font-bold mb-1"
            style={{ color: "#64748b" }}
          >
            All sections hidden
          </div>
          <div className="text-[11px]" style={{ color: "#94a3b8" }}>
            Enable sections in Settings → CEO View Sections
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {/* CEO Summary header */}
      {showExecutiveSummary && (
        <div
          className="rounded border px-4 py-3"
          style={{ background: "#f0f9ff", borderColor: "#bae6fd" }}
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
                      ? "#16a34a"
                      : fleetOEE >= 70
                        ? "#d97706"
                        : "#dc2626",
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
                style={{ color: fleetUtil >= 85 ? "#16a34a" : "#d97706" }}
              >
                {fleetUtil.toFixed(1)}%
              </div>
              <div className="text-[9px]" style={{ color: "#475569" }}>
                Target: 90%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic KPI Table */}
      {showStrategicKPITable && (
        <div
          className="rounded border overflow-hidden"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div
            className="px-3 py-2 border-b border-[#e2e8f0]"
            style={{ background: "#f8fafc" }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "#64748b" }}
            >
              Strategic KPI Dashboard
            </span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th
                  className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  KPI
                </th>
                <th
                  className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Target
                </th>
                <th
                  className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Actual
                </th>
                <th
                  className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi, i) => (
                <tr
                  key={kpi.kpi}
                  style={{ background: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}
                >
                  <td
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-bold text-[12px]"
                      style={{ color: "#1e293b" }}
                    >
                      {kpi.kpi}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
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
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-black font-mono text-[13px]"
                      style={{
                        color:
                          kpi.status === "green"
                            ? "#16a34a"
                            : kpi.status === "yellow"
                              ? "#d97706"
                              : "#dc2626",
                      }}
                    >
                      {kpi.actual}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <StatusIcon status={kpi.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
