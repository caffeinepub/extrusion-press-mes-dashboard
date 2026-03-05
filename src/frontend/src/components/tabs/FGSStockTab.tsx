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

interface FGSStockTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalFGS: number;
}

const SUB_TABS = ["Overview", "By Press", "By Alloy"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#0891b2";

const BASE_FGS = [180, 20, 140, 80, 30];
const BASE_FGS_SUM = BASE_FGS.reduce((a, b) => a + b, 0);
const ORDERS_FULFILLED = [42, 3, 35, 18, 8];
const AVG_AGES = [2.1, 0.8, 1.8, 1.4, 1.1];

const ALLOY_FGS = [
  { alloy: "6063", fgsMT: 0, qty: 0, age: 1.8, location: "Bay A-1" },
  { alloy: "6082", fgsMT: 0, qty: 0, age: 2.4, location: "Bay B-2" },
  { alloy: "7075", fgsMT: 0, qty: 0, age: 1.5, location: "Bay A-3" },
  { alloy: "6061", fgsMT: 0, qty: 0, age: 1.2, location: "Bay C-1" },
  { alloy: "6060", fgsMT: 0, qty: 0, age: 0.9, location: "Bay B-1" },
];

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
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value} MT
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function FGSStockTab({
  presses,
  filterBadge,
  totalFGS,
}: FGSStockTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressFGSData = presses.map((p, i) => {
    const fgsMT = Number.parseFloat(
      ((BASE_FGS[i] / BASE_FGS_SUM) * totalFGS).toFixed(2),
    );
    const share = ((fgsMT / Math.max(0.01, totalFGS)) * 100).toFixed(1);
    return {
      pressId: p.id,
      pressName: p.name,
      fgsMT,
      ordersFulfilled: ORDERS_FULFILLED[i],
      avgAge: AVG_AGES[i],
      share,
      color: PRESS_COLORS[i],
    };
  });

  const pressCount = pressFGSData.filter((p) => p.fgsMT > 0).length;
  const avgFGS = totalFGS / Math.max(1, pressFGSData.length);
  const daysCoverage = Number.parseFloat(
    (totalFGS / Math.max(0.01, 10.4)).toFixed(1),
  );

  const chartData = pressFGSData.map((p) => ({
    press: p.pressId,
    "FGS (MT)": p.fgsMT,
    color: p.color,
  }));

  // Distribute totalFGS across alloys
  const alloySplit = [0.35, 0.2, 0.28, 0.1, 0.07];
  const alloyFGSData = ALLOY_FGS.map((a, i) => ({
    ...a,
    fgsMT: Number.parseFloat((totalFGS * alloySplit[i]).toFixed(2)),
    qty: Math.round(totalFGS * alloySplit[i] * 12),
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
              background: "#ecfeff",
              color: "#0e7490",
              borderColor: "#a5f3fc",
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
                  label: "Total FGS MT",
                  value: `${totalFGS.toFixed(2)} MT`,
                  color: ACCENT,
                  bg: "#ecfeff",
                },
                {
                  label: "Presses with Stock",
                  value: pressCount.toString(),
                  color: "#7c3aed",
                  bg: "#faf5ff",
                },
                {
                  label: "Avg FGS/Press",
                  value: `${avgFGS.toFixed(2)} MT`,
                  color: "#059669",
                  bg: "#ecfdf5",
                },
                {
                  label: "Days Coverage",
                  value: `${daysCoverage}d`,
                  color: "#d97706",
                  bg: "#fffbeb",
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
                FGS Stock by Press (MT)
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
                    dataKey="FGS (MT)"
                    fill={ACCENT}
                    radius={[3, 3, 0, 0]}
                    opacity={0.85}
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
                    "FGS MT",
                    "ORDERS FULFILLED",
                    "AVG AGE (DAYS)",
                    "% SHARE",
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
                {pressFGSData.map((row, idx) => (
                  <tr
                    key={row.pressId}
                    data-ocid={`fgs_stock.press.row.${idx + 1}`}
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
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.fgsMT.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.ordersFulfilled}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.avgAge}d
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: "#e2e8f0", minWidth: "50px" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.share}%`,
                              background: ACCENT,
                              opacity: 0.75,
                            }}
                          />
                        </div>
                        <span
                          className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                          style={{
                            color: ACCENT,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#ecfeff",
                    borderTop: `2px solid ${ACCENT}`,
                  }}
                >
                  <td
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                    style={{ color: ACCENT }}
                  >
                    TOTAL
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-black text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalFGS.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#475569",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {pressFGSData.reduce((a, b) => a + b.ordersFulfilled, 0)}
                  </td>
                  <td />
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    100%
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
                  {[
                    "ALLOY",
                    "FGS MT",
                    "QTY (NOS)",
                    "AGE (DAYS)",
                    "LOCATION",
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
                {alloyFGSData.map((row, idx) => (
                  <tr
                    key={row.alloy}
                    data-ocid={`fgs_stock.alloy.row.${idx + 1}`}
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
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: ACCENT,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.fgsMT.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.qty.toLocaleString()}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.age}d
                    </td>
                    <td
                      className="px-3 py-2.5 text-[10px]"
                      style={{ color: "#64748b" }}
                    >
                      {row.location}
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
