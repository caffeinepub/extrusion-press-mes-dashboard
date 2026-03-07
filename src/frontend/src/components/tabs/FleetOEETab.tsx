import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";
import { GrafanaSubTabBar as SubTabBar } from "../grafana/GrafanaSubTabBar";

interface FleetOEETabProps {
  presses: PressData[];
  filterBadge?: string;
  fleetOEE: number;
}

const SUB_TABS = ["Summary", "Availability", "Performance", "Quality"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#3b82f6";

// Availability component data per press (base %)
const BASE_AVAILABILITY = [94.2, 28.5, 92.8, 95.1, 96.4];
const BASE_PERFORMANCE = [95.5, 62.1, 89.2, 91.8, 97.8];
const BASE_QUALITY = [98.6, 97.9, 97.5, 98.2, 99.1];
const PLANNED_HRS = [8, 8, 8, 8, 8];

function oeeColor(pct: number): string {
  if (pct >= 85) return "#16a34a";
  if (pct >= 70) return "#d97706";
  return "#dc2626";
}
function oeeBg(pct: number): string {
  if (pct >= 85) return "#f0fdf4";
  if (pct >= 70) return "#fffbeb";
  return "#fef2f2";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "6px",
          padding: "8px 12px",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>
          {label}
        </p>
        {payload.map((p: any) => (
          <div
            key={p.name}
            style={{ color: p.fill || p.stroke || p.color, fontSize: "11px" }}
          >
            {p.name}:{" "}
            <strong>
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}%
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function FleetOEETab({
  presses,
  filterBadge,
  fleetOEE,
}: FleetOEETabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressOEEData = presses.map((p, i) => {
    const avail = BASE_AVAILABILITY[i];
    const perf = BASE_PERFORMANCE[i];
    const qual = BASE_QUALITY[i];
    const oee = Number.parseFloat(((avail * perf * qual) / 10000).toFixed(1));
    const plannedHrs = PLANNED_HRS[i];
    const runHrs = Number.parseFloat(((plannedHrs * avail) / 100).toFixed(1));
    const downHrs = Number.parseFloat((plannedHrs - runHrs).toFixed(1));
    const ratedSpeed = p.dieTarget;
    const actualSpeed = Math.round((ratedSpeed * perf) / 100);
    const totalOutput = Math.round(p.actual * 1000);
    const rejected = Math.round((totalOutput * (100 - qual)) / 100);
    const fpyPct = Number.parseFloat(qual.toFixed(1));
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      oee,
      availability: avail,
      performance: perf,
      quality: qual,
      plannedHrs,
      runHrs,
      downHrs,
      ratedSpeed,
      actualSpeed,
      totalOutput,
      rejected,
      fpyPct,
      color: PRESS_COLORS[i],
    };
  });

  const fleetAvail = Number.parseFloat(
    (
      pressOEEData.reduce((a, b) => a + b.availability, 0) /
      Math.max(1, pressOEEData.length)
    ).toFixed(1),
  );
  const fleetPerf = Number.parseFloat(
    (
      pressOEEData.reduce((a, b) => a + b.performance, 0) /
      Math.max(1, pressOEEData.length)
    ).toFixed(1),
  );
  const fleetQual = Number.parseFloat(
    (
      pressOEEData.reduce((a, b) => a + b.quality, 0) /
      Math.max(1, pressOEEData.length)
    ).toFixed(1),
  );

  const summaryChartData = pressOEEData.map((p) => ({
    press: p.pressId,
    "Availability %": p.availability,
    "Performance %": p.performance,
    "Quality %": p.quality,
  }));

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />
      {filterBadge && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b"
          style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
        >
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "#64748b" }}
          >
            Filter:
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              borderColor: "#bfdbfe",
            }}
          >
            {filterBadge}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {subTab === "Summary" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Fleet OEE %",
                  value: `${fleetOEE.toFixed(1)}%`,
                  color: oeeColor(fleetOEE),
                  bg: oeeBg(fleetOEE),
                },
                {
                  label: "Availability %",
                  value: `${fleetAvail}%`,
                  color: "#3b82f6",
                  bg: "#eff6ff",
                },
                {
                  label: "Performance %",
                  value: `${fleetPerf}%`,
                  color: "#8b5cf6",
                  bg: "#faf5ff",
                },
                {
                  label: "Quality %",
                  value: `${fleetQual}%`,
                  color: "#059669",
                  bg: "#ecfdf5",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: k.bg, border: `1px solid ${k.color}30` }}
                >
                  <div
                    className="font-black text-xl tabular-nums"
                    style={{
                      color: k.color,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {k.value}
                  </div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mt-1"
                    style={{ color: "#64748b" }}
                  >
                    {k.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-4"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h3
                className="text-[11px] font-bold uppercase tracking-wider mb-3"
                style={{ color: "#1e3a5f" }}
              >
                OEE Components by Press (%)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={summaryChartData}
                  margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="press"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Availability %"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                    opacity={0.85}
                  />
                  <Bar
                    dataKey="Performance %"
                    fill="#8b5cf6"
                    radius={[2, 2, 0, 0]}
                    opacity={0.85}
                  />
                  <Bar
                    dataKey="Quality %"
                    fill="#059669"
                    radius={[2, 2, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2">
                {[
                  { label: "Availability", color: "#3b82f6" },
                  { label: "Performance", color: "#8b5cf6" },
                  { label: "Quality", color: "#059669" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-2 rounded-sm"
                      style={{ background: l.color }}
                    />
                    <span className="text-[9px]" style={{ color: "#64748b" }}>
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {subTab === "Availability" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "PRESS",
                    "PLANNED (HRS)",
                    "RUN TIME (HRS)",
                    "DOWNTIME (HRS)",
                    "AVAILABILITY %",
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
                {pressOEEData.map((row, idx) => (
                  <tr
                    key={row.pressId}
                    data-ocid={`fleet_oee.avail.row.${idx + 1}`}
                    style={{
                      background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: row.color }}
                        />
                        <span
                          className="font-bold"
                          style={{
                            color: row.color,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.pressId}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.plannedHrs}h
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#16a34a",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.runHrs}h
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#dc2626",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.downHrs}h
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: oeeBg(row.availability),
                          color: oeeColor(row.availability),
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.availability.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === "Performance" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "PRESS",
                    "RATED SPEED (KG/H)",
                    "ACTUAL SPEED (KG/H)",
                    "PERFORMANCE %",
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
                {pressOEEData.map((row, idx) => (
                  <tr
                    key={row.pressId}
                    data-ocid={`fleet_oee.perf.row.${idx + 1}`}
                    style={{
                      background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: row.color }}
                        />
                        <span
                          className="font-bold"
                          style={{
                            color: row.color,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.pressId}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.ratedSpeed.toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.actualSpeed.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: "#e2e8f0", minWidth: "60px" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.performance}%`,
                              background: oeeColor(row.performance),
                              opacity: 0.75,
                            }}
                          />
                        </div>
                        <span
                          className="text-[9px] font-bold tabular-nums w-[40px] text-right shrink-0"
                          style={{
                            color: oeeColor(row.performance),
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.performance.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {subTab === "Quality" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "PRESS",
                    "TOTAL OUTPUT (KG)",
                    "REJECTED (KG)",
                    "FIRST PASS YIELD %",
                    "QUALITY %",
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
                {pressOEEData.map((row, idx) => (
                  <tr
                    key={row.pressId}
                    data-ocid={`fleet_oee.quality.row.${idx + 1}`}
                    style={{
                      background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: row.color }}
                        />
                        <span
                          className="font-bold"
                          style={{
                            color: row.color,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.pressId}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.totalOutput.toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#ef4444",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.rejected.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.fpyPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: oeeBg(row.quality),
                          color: oeeColor(row.quality),
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.quality.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
