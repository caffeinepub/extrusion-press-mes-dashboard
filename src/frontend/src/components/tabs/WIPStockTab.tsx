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

interface WIPStockTabProps {
  presses: PressData[];
  filterBadge?: string;
  totalWIP: number;
}

const SUB_TABS = ["Overview", "By Press", "Aging"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#f59e0b";

const BASE_WIP = [38, 12, 32, 28, 15];
const BASE_WIP_SUM = BASE_WIP.reduce((a, b) => a + b, 0);
const OPEN_ORDERS = [12, 4, 9, 8, 5];
const OLDEST_ORDERS = [
  "WO-2026-0215",
  "WO-2026-0218",
  "WO-2026-0220",
  "WO-2026-0222",
  "WO-2026-0225",
];
const AVG_AGING = [8.2, 12.4, 7.5, 6.8, 5.1];

const AGING_BUCKETS = [
  { bucket: "0–7 Days", mtPct: 0.42, color: "#22c55e" },
  { bucket: "8–15 Days", mtPct: 0.28, color: "#f59e0b" },
  { bucket: "16–30 Days", mtPct: 0.2, color: "#f97316" },
  { bucket: ">30 Days", mtPct: 0.1, color: "#ef4444" },
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
              {typeof p.value === "number" ? p.value.toFixed(2) : p.value} MT
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WIPStockTab({
  presses,
  filterBadge,
  totalWIP,
}: WIPStockTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressWIPData = presses.map((p, i) => {
    const wipMT = Number.parseFloat(
      ((BASE_WIP[i] / BASE_WIP_SUM) * totalWIP).toFixed(2),
    );
    const avgAgingVal = AVG_AGING[i];
    const critical = avgAgingVal > 10;
    return {
      pressId: p.id,
      pressName: p.name,
      wipMT,
      openOrders: OPEN_ORDERS[i],
      oldestOrder: OLDEST_ORDERS[i],
      avgAging: avgAgingVal,
      critical,
      color: PRESS_COLORS[i],
    };
  });

  const totalOpenOrders = pressWIPData.reduce((a, b) => a + b.openOrders, 0);
  const avgAging = Number.parseFloat(
    (
      pressWIPData.reduce((a, b) => a + b.avgAging, 0) /
      Math.max(1, pressWIPData.length)
    ).toFixed(1),
  );
  const criticalWIP = pressWIPData.filter((p) => p.critical).length;

  const chartData = pressWIPData.map((p) => ({
    press: p.pressId,
    "WIP (MT)": p.wipMT,
    color: p.color,
  }));

  const agingData = AGING_BUCKETS.map((b) => ({
    ...b,
    mt: Number.parseFloat((totalWIP * b.mtPct).toFixed(2)),
    share: (b.mtPct * 100).toFixed(1),
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
              background: "#fffbeb",
              color: "#b45309",
              borderColor: "#fde68a",
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
                  label: "Total WIP MT",
                  value: `${totalWIP.toFixed(2)} MT`,
                  color: ACCENT,
                  bg: "#fffbeb",
                },
                {
                  label: "Open Orders",
                  value: totalOpenOrders.toString(),
                  color: "#0891b2",
                  bg: "#ecfeff",
                },
                {
                  label: "Avg Age (days)",
                  value: `${avgAging}d`,
                  color: "#7c3aed",
                  bg: "#faf5ff",
                },
                {
                  label: "Critical WIP",
                  value: `${criticalWIP} Presses`,
                  color: "#dc2626",
                  bg: "#fef2f2",
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
                WIP Stock by Press (MT)
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
                    dataKey="WIP (MT)"
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
                    "WIP MT",
                    "OPEN ORDERS",
                    "OLDEST ORDER",
                    "AVG AGING (DAYS)",
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
                {pressWIPData.map((row, idx) => (
                  <tr
                    key={row.pressId}
                    data-ocid={`wip_stock.press.row.${idx + 1}`}
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
                      {row.wipMT.toFixed(2)}
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums text-right"
                      style={{
                        color: "#475569",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.openOrders}
                    </td>
                    <td
                      className="px-3 py-2.5 font-mono text-[10px]"
                      style={{ color: "#64748b" }}
                    >
                      {row.oldestOrder}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: row.critical ? "#fef2f2" : "#f0fdf4",
                          color: row.critical ? "#dc2626" : "#16a34a",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.avgAging}d {row.critical ? "⚠" : "✓"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#fffbeb",
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
                    {totalWIP.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: "#475569",
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalOpenOrders}
                  </td>
                  <td />
                  <td className="px-3 py-2.5">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "#fffbeb",
                        color: "#d97706",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {avgAging}d avg
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {subTab === "Aging" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["AGING BUCKET", "WIP MT", "% SHARE", "STATUS"].map((h) => (
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
                {agingData.map((row, idx) => (
                  <tr
                    key={row.bucket}
                    data-ocid={`wip_stock.aging.row.${idx + 1}`}
                    style={{
                      background: idx % 2 === 0 ? "#f8fafc" : "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ background: row.color }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: "#334155" }}
                        >
                          {row.bucket}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-3 py-2.5 tabular-nums font-bold text-right"
                      style={{
                        color: row.color,
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {row.mt.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ background: "#e2e8f0", minWidth: "80px" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.share}%`,
                              background: row.color,
                              opacity: 0.75,
                            }}
                          />
                        </div>
                        <span
                          className="text-[10px] font-bold tabular-nums w-[36px] text-right shrink-0"
                          style={{
                            color: row.color,
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.share}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `${row.color}20`,
                          color: row.color,
                        }}
                      >
                        {idx === 0
                          ? "HEALTHY"
                          : idx === 1
                            ? "WATCH"
                            : idx === 2
                              ? "DELAYED"
                              : "CRITICAL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#fffbeb",
                    borderTop: `2px solid ${ACCENT}`,
                  }}
                >
                  <td
                    className="px-3 py-2.5 font-bold uppercase tracking-wider text-[10px]"
                    style={{ color: ACCENT }}
                  >
                    TOTAL WIP
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-black text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {totalWIP.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2.5 tabular-nums font-bold text-right"
                    style={{
                      color: ACCENT,
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    100%
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
