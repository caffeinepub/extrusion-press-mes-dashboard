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
import { SubTabBar } from "../ui/SubTabBar";

interface TotalScrapTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalScrap: number;
}

const SUB_TABS = ["Overview", "By Press", "By Alloy"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#ef4444";

const SCRAP_COST_PER_KG = 18;
const TOP_SCRAP_REASONS = [
  "Surface Defect",
  "Dimensional",
  "Die Mark",
  "Twist",
  "Porosity",
];

const ALLOY_SCRAP = [
  { alloy: "6063", scrapPct: 1.8, rejectionCount: 38, topDie: "2003064" },
  { alloy: "6082", scrapPct: 2.3, rejectionCount: 24, topDie: "2001005" },
  { alloy: "7075", scrapPct: 1.6, rejectionCount: 31, topDie: "2002010" },
  { alloy: "6061", scrapPct: 1.5, rejectionCount: 19, topDie: "2004056" },
  { alloy: "6060", scrapPct: 1.2, rejectionCount: 14, topDie: "2000061" },
];

const STATUS_STYLES: Record<
  PressData["status"],
  { bg: string; color: string }
> = {
  Running: { bg: "#dcfce7", color: "#16a34a" },
  Idle: { bg: "#fef3c7", color: "#d97706" },
  Breakdown: { bg: "#fee2e2", color: "#dc2626" },
  Setup: { bg: "#dbeafe", color: "#2563eb" },
};

function scrapColor(pct: number): string {
  if (pct < 1.5) return "#16a34a";
  if (pct < 2.5) return "#d97706";
  return "#dc2626";
}
function scrapBg(pct: number): string {
  if (pct < 1.5) return "#f0fdf4";
  if (pct < 2.5) return "#fffbeb";
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
            style={{ color: p.fill || p.stroke, fontSize: "11px" }}
          >
            {p.name}:{" "}
            <strong>
              {typeof p.value === "number" ? p.value.toFixed(2) : p.value}%
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TotalScrapTab({
  presses,
  filterBadge,
  totalScrap,
}: TotalScrapTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressScrapData = presses.map((p, i) => {
    const scrapPct = p.scrap;
    const scrapMT = Number.parseFloat(((p.actual * scrapPct) / 100).toFixed(3));
    const cost = Math.round(scrapMT * 1000 * SCRAP_COST_PER_KG);
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      scrapPct,
      scrapMT,
      topReason: TOP_SCRAP_REASONS[i] ?? "Surface Defect",
      cost,
      color: PRESS_COLORS[i],
    };
  });

  const totalScrapMT = pressScrapData.reduce((a, b) => a + b.scrapMT, 0);
  const fleetScrapPct = Number.parseFloat(totalScrap.toFixed(2));
  const totalCost = pressScrapData.reduce((a, b) => a + b.cost, 0);
  const rejectionCount = pressScrapData.reduce(
    (a, b) => a + Math.round(b.scrapMT * 100),
    0,
  );

  const chartData = pressScrapData.map((p) => ({
    press: p.pressId,
    "Scrap %": p.scrapPct,
    color: p.color,
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
              background: "#fef2f2",
              color: "#b91c1c",
              borderColor: "#fecaca",
            }}
          >
            {filterBadge}
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {subTab === "Overview" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Fleet Scrap %",
                  value: `${fleetScrapPct}%`,
                  color: scrapColor(fleetScrapPct),
                  bg: scrapBg(fleetScrapPct),
                },
                {
                  label: "Total Scrap MT",
                  value: `${totalScrapMT.toFixed(3)} MT`,
                  color: ACCENT,
                  bg: "#fef2f2",
                },
                {
                  label: "Scrap Cost ₹",
                  value: `₹${totalCost.toLocaleString()}`,
                  color: "#d97706",
                  bg: "#fffbeb",
                },
                {
                  label: "Rejection Count",
                  value: rejectionCount.toLocaleString(),
                  color: "#7c3aed",
                  bg: "#faf5ff",
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
                Scrap % by Press
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="press"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Scrap %"
                    fill={ACCENT}
                    radius={[3, 3, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {subTab === "By Press" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "PRESS",
                    "STATUS",
                    "SCRAP %",
                    "SCRAP MT",
                    "TOP SCRAP REASON",
                    "COST (₹)",
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
                {pressScrapData.map((row, idx) => {
                  const st = STATUS_STYLES[row.status];
                  return (
                    <tr
                      key={row.pressId}
                      data-ocid={`total_scrap.press.row.${idx + 1}`}
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
                          <span style={{ color: "#475569" }}>
                            {row.pressName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {row.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: scrapBg(row.scrapPct),
                            color: scrapColor(row.scrapPct),
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.scrapPct.toFixed(2)}%
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: ACCENT,
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.scrapMT.toFixed(3)}
                      </td>
                      <td
                        className="px-3 py-2.5 text-[10px]"
                        style={{ color: "#475569" }}
                      >
                        {row.topReason}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#d97706",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        ₹{row.cost.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#fef2f2",
                    borderTop: `2px solid ${ACCENT}`,
                  }}
                >
                  <td
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                    style={{ color: ACCENT }}
                    colSpan={2}
                  >
                    TOTAL / FLEET
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: scrapBg(fleetScrapPct),
                        color: scrapColor(fleetScrapPct),
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {fleetScrapPct}%
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-black text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalScrapMT.toFixed(3)}
                  </td>
                  <td />
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#d97706",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    ₹{totalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {subTab === "By Alloy" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ALLOY", "SCRAP %", "REJECTION COUNT", "TOP DIE"].map(
                    (h) => (
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {ALLOY_SCRAP.map((row, idx) => (
                  <tr
                    key={row.alloy}
                    data-ocid={`total_scrap.alloy.row.${idx + 1}`}
                    style={{
                      background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td
                      className="px-3 py-2.5 font-bold font-mono"
                      style={{ color: "#334155" }}
                    >
                      {row.alloy}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: scrapBg(row.scrapPct),
                          color: scrapColor(row.scrapPct),
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.scrapPct}%
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.rejectionCount}
                    </td>
                    <td
                      className="px-3 py-2.5 font-mono text-[10px]"
                      style={{ color: "#64748b" }}
                    >
                      {row.topDie}
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
