import { Flame } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { topAlloys, topDies, wipAgingData } from "../../mockData";

type TopDie = (typeof topDies)[number];
type TopAlloy = (typeof topAlloys)[number];
type WIPAging = (typeof wipAgingData)[number];

interface TopDiesTableProps {
  dies: TopDie[];
}
interface TopAlloysTableProps {
  alloys: TopAlloy[];
}
interface WIPAgingDonutProps {
  data: WIPAging[];
}

const maxDieKg = 1096;
const maxAlloyKg = 50168;

function RankBadge({ rank }: { rank: number }) {
  const colors = ["#f59e0b", "#94a3b8", "#f97316"];
  const color = colors[rank - 1] ?? "#475569";
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-black"
      style={{ background: `${color}20`, color }}
    >
      #{rank}
    </span>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      className="w-full h-1.5 rounded overflow-hidden"
      style={{ background: "#1e2d45" }}
    >
      <div
        className="h-full rounded"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function TopDiesTable({ dies }: TopDiesTableProps) {
  return (
    <div
      className="flex flex-col rounded border border-[#1a2d45] overflow-hidden"
      style={{ background: "#0f1729" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2d45]"
        style={{ background: "#0a111e" }}
      >
        <div
          className="w-0.5 h-3 rounded-full"
          style={{ background: "#3b82f6" }}
        />
        <Flame size={11} style={{ color: "#3b82f6" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#7090b0", letterSpacing: "0.1em" }}
        >
          Top 10 Dies — Volume
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#0a111e" }}>
              <th
                className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#475569",
                  borderBottom: "1px solid #1e2d45",
                  width: 36,
                }}
              >
                Rank
              </th>
              <th
                className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Die No.
              </th>
              <th
                className="px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Total KG
              </th>
              <th
                className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#475569",
                  borderBottom: "1px solid #1e2d45",
                  width: 70,
                }}
              >
                Volume
              </th>
              <th
                className="px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {dies.map((d, i) => {
              const pct = (d.totalKg / maxDieKg) * 100;
              return (
                <tr
                  key={d.dieNo}
                  style={{ background: i % 2 === 0 ? "#0c1425" : "#0f1729" }}
                >
                  <td
                    className="px-2 py-1"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <RankBadge rank={d.rank} />
                  </td>
                  <td
                    className="px-2 py-1"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: "#e2e8f0" }}
                    >
                      {d.dieNo}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1 text-right"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: "#94a3b8" }}
                    >
                      {d.totalKg.toLocaleString()}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <MiniBar pct={pct} color="#3b82f6" />
                  </td>
                  <td
                    className="px-2 py-1 text-right"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: "#475569" }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TopAlloysTable({ alloys }: TopAlloysTableProps) {
  return (
    <div
      className="flex flex-col rounded border border-[#1a2d45] overflow-hidden"
      style={{ background: "#0f1729" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2d45]"
        style={{ background: "#0a111e" }}
      >
        <div
          className="w-0.5 h-3 rounded-full"
          style={{ background: "#f97316" }}
        />
        <Flame size={11} style={{ color: "#f97316" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#7090b0", letterSpacing: "0.1em" }}
        >
          Top 10 Alloys — Volume
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#0a111e" }}>
              <th
                className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#475569",
                  borderBottom: "1px solid #1e2d45",
                  width: 36,
                }}
              >
                Rank
              </th>
              <th
                className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Alloy
              </th>
              <th
                className="px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                Total KG
              </th>
              <th
                className="px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#475569",
                  borderBottom: "1px solid #1e2d45",
                  width: 70,
                }}
              >
                Volume
              </th>
              <th
                className="px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#475569", borderBottom: "1px solid #1e2d45" }}
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {alloys.map((a, i) => {
              const pct = (a.totalKg / maxAlloyKg) * 100;
              return (
                <tr
                  key={a.alloy}
                  style={{ background: i % 2 === 0 ? "#0c1425" : "#0f1729" }}
                >
                  <td
                    className="px-2 py-1"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <RankBadge rank={a.rank} />
                  </td>
                  <td
                    className="px-2 py-1"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: "#e2e8f0" }}
                    >
                      {a.alloy}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1 text-right"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: "#94a3b8" }}
                    >
                      {a.totalKg.toLocaleString()}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <MiniBar pct={pct} color="#f97316" />
                  </td>
                  <td
                    className="px-2 py-1 text-right"
                    style={{ borderBottom: "1px solid #111e33" }}
                  >
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: "#475569" }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CustomWIPTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: WIPAging }[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      className="rounded border px-2 py-1.5 text-[10px]"
      style={{
        background: "#0d1526",
        borderColor: "#1e2d45",
        color: "#e2e8f0",
      }}
    >
      <div className="font-bold" style={{ color: d.payload.color }}>
        {d.name}
      </div>
      <div
        className="font-mono font-black text-sm"
        style={{ color: d.payload.color }}
      >
        {d.value} MT
      </div>
    </div>
  );
};

export function WIPAgingDonut({ data }: WIPAgingDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div
      className="flex flex-col rounded border border-[#1e2d45] overflow-hidden"
      style={{ background: "#0f1729" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2d45]"
        style={{ background: "#0a111e" }}
      >
        <div
          className="w-0.5 h-3 rounded-full"
          style={{ background: "#06b6d4" }}
        />
        <span className="text-[12px] leading-none">🕐</span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#7090b0", letterSpacing: "0.1em" }}
        >
          WIP Aging Analysis
        </span>
      </div>
      <div className="flex items-center px-3 py-2 gap-3">
        {/* Donut */}
        <div style={{ width: 130, height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
              >
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomWIPTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + values */}
        <div className="flex flex-col gap-2 flex-1">
          {data.map((d) => {
            const pct = ((d.value / total) * 100).toFixed(1);
            return (
              <div
                key={d.label}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: d.color }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "#94a3b8" }}
                  >
                    {d.label}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className="font-black text-[12px] font-mono"
                    style={{ color: d.color }}
                  >
                    {d.value}
                  </span>
                  <span
                    className="text-[9px] ml-0.5"
                    style={{ color: "#475569" }}
                  >
                    MT
                  </span>
                  <div
                    className="text-[9px] font-mono"
                    style={{ color: "#334155" }}
                  >
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-[#1e2d45] pt-1.5 flex items-center justify-between">
            <span
              className="text-[9px] font-bold uppercase"
              style={{ color: "#475569" }}
            >
              Total WIP
            </span>
            <span
              className="font-black text-[13px] font-mono"
              style={{ color: "#94a3b8" }}
            >
              {total.toFixed(1)} MT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
