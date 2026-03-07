import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";
import { GrafanaSubTabBar as SubTabBar } from "../grafana/GrafanaSubTabBar";

interface ContactTimeTabProps {
  presses: PressData[];
  filterBadge?: string;
  contactTime: number;
}

const SUB_TABS = ["Overview", "Press Wise", "Trend"];
const PRESS_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#a855f7"];
const ACCENT = "#06b6d4";
const TARGET_SEC = 38;

const CYCLE_TIMES = [85, 0, 78, 72, 65];
const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TREND_BASE = [40.2, 38.8, 42.1, 39.4, 37.6, 38.5, 39.0];

function ctColor(sec: number): string {
  if (sec === 0) return "#94a3b8";
  if (sec <= TARGET_SEC) return "#16a34a";
  if (sec <= TARGET_SEC * 1.15) return "#d97706";
  return "#dc2626";
}
function ctBg(sec: number): string {
  if (sec === 0) return "#f8fafc";
  if (sec <= TARGET_SEC) return "#f0fdf4";
  if (sec <= TARGET_SEC * 1.15) return "#fffbeb";
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
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value} sec
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ContactTimeTab({
  presses,
  filterBadge,
  contactTime,
}: ContactTimeTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);

  const pressCtData = presses.map((p, i) => {
    const ct = p.contactTime;
    const cycleTime = CYCLE_TIMES[i] ?? 0;
    const vsTarget = Number.parseFloat((ct - TARGET_SEC).toFixed(1));
    const trend = ct < contactTime ? "↓" : "↑";
    return {
      pressId: p.id,
      pressName: p.name,
      status: p.status,
      contactTime: ct,
      vsTarget,
      cycleTime,
      trend,
      color: PRESS_COLORS[i],
    };
  });

  const runningPresses = pressCtData.filter((p) => p.contactTime > 0);
  const best =
    runningPresses.length > 0
      ? runningPresses.reduce(
          (b, p) => (p.contactTime < b.contactTime ? p : b),
          runningPresses[0],
        )
      : null;
  const worst =
    runningPresses.length > 0
      ? runningPresses.reduce(
          (w, p) => (p.contactTime > w.contactTime ? p : w),
          runningPresses[0],
        )
      : null;
  const vsStandard = Number.parseFloat((contactTime - TARGET_SEC).toFixed(1));

  const chartData = pressCtData.map((p) => ({
    press: p.pressId,
    "Contact Time (sec)": p.contactTime,
    color: p.color,
  }));

  const trendData = TREND_DAYS.map((day, di) => ({
    day,
    "Contact Time": TREND_BASE[di],
    Target: TARGET_SEC,
  }));
  const bestDay = TREND_DAYS[TREND_BASE.indexOf(Math.min(...TREND_BASE))];
  const worstDay = TREND_DAYS[TREND_BASE.indexOf(Math.max(...TREND_BASE))];
  const avgTrend = (
    TREND_BASE.reduce((a, b) => a + b, 0) / TREND_BASE.length
  ).toFixed(1);

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
                  label: "Avg Contact Time",
                  value: `${contactTime.toFixed(1)} sec`,
                  color: ACCENT,
                  bg: "#ecfeff",
                },
                {
                  label: "Best Press",
                  value: best?.pressId ?? "—",
                  color: "#16a34a",
                  bg: "#f0fdf4",
                },
                {
                  label: "Worst Press",
                  value: worst?.pressId ?? "—",
                  color: "#dc2626",
                  bg: "#fef2f2",
                },
                {
                  label: "vs Standard",
                  value: `${vsStandard >= 0 ? "+" : ""}${vsStandard} sec`,
                  color: ctColor(contactTime),
                  bg: ctBg(contactTime),
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
                Contact Time by Press (sec) — Target: {TARGET_SEC}s
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
                  <ReferenceLine
                    y={TARGET_SEC}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                    label={{
                      value: `Target ${TARGET_SEC}s`,
                      position: "right",
                      fontSize: 9,
                      fill: "#d97706",
                    }}
                  />
                  <Bar
                    dataKey="Contact Time (sec)"
                    fill={ACCENT}
                    radius={[3, 3, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {subTab === "Press Wise" && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #e2e8f0", background: "#ffffff" }}
          >
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "PRESS",
                    "CONTACT TIME (SEC)",
                    "VS TARGET",
                    "CYCLE TIME (SEC)",
                    "TREND",
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
                {pressCtData.map((row, idx) => {
                  return (
                    <tr
                      key={row.pressId}
                      data-ocid={`contact_time.press.row.${idx + 1}`}
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
                      <td className="px-3 py-2.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: ctBg(row.contactTime),
                            color: ctColor(row.contactTime),
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {row.contactTime > 0 ? `${row.contactTime}s` : "—"}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums font-bold text-right"
                        style={{
                          color:
                            row.contactTime === 0
                              ? "#94a3b8"
                              : row.vsTarget <= 0
                                ? "#16a34a"
                                : "#dc2626",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.contactTime === 0
                          ? "—"
                          : row.vsTarget >= 0
                            ? `+${row.vsTarget}s`
                            : `${row.vsTarget}s`}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums text-right"
                        style={{
                          color: "#475569",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {row.cycleTime > 0 ? `${row.cycleTime}s` : "—"}
                      </td>
                      <td
                        className="px-3 py-2.5 tabular-nums font-bold text-center"
                        style={{
                          color: row.trend === "↓" ? "#16a34a" : "#dc2626",
                          fontSize: "14px",
                        }}
                      >
                        {row.contactTime === 0 ? "—" : row.trend}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {subTab === "Trend" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Best Day",
                  value: bestDay,
                  color: "#16a34a",
                  bg: "#f0fdf4",
                },
                {
                  label: "Worst Day",
                  value: worstDay,
                  color: "#dc2626",
                  bg: "#fef2f2",
                },
                {
                  label: "7-Day Avg",
                  value: `${avgTrend}s`,
                  color: ACCENT,
                  bg: "#ecfeff",
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
                7-Day Contact Time Trend (seconds)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={trendData}
                  margin={{ top: 4, right: 12, left: -10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[30, 50]}
                    tick={{ fontSize: 9, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={TARGET_SEC}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="Contact Time"
                    stroke={ACCENT}
                    strokeWidth={2}
                    dot={{ r: 3, fill: ACCENT }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
