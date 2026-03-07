import { Layers } from "lucide-react";
import { useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import type { topAlloys, topDies, wipAgingData } from "../../mockData";
import { GrafanaPanel } from "../grafana/GrafanaPanel";

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
  onSegmentClick?: (segment: WIPAging) => void;
}

function RankBadge({ rank }: { rank: number }) {
  const colors = ["#f59e0b", "#94a3b8", "#f97316"];
  const color = colors[rank - 1] ?? "#475569";
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-black"
      style={{ background: `${color}22`, color }}
    >
      #{rank}
    </span>
  );
}

function MiniBar({
  pct,
  color,
}: {
  pct: number;
  color: string;
}) {
  return (
    <div
      className="w-full rounded overflow-hidden"
      style={{ background: "#e8edf3", height: "10px" }}
    >
      <div
        className="h-full rounded transition-all"
        style={{
          width: `${Math.max(pct, 2)}%`,
          background: color,
        }}
      />
    </div>
  );
}

export function TopDiesTable({ dies }: TopDiesTableProps) {
  const top5 = dies.slice(0, 5);
  const maxKg = Math.max(...top5.map((d) => d.totalKg));

  return (
    <div
      className="flex flex-col rounded border border-[#e2e8f0] overflow-hidden"
      style={{ background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
      data-ocid="dashboard.top-dies.panel"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[#e2e8f0]"
        style={{ background: "#f8fafc" }}
        data-ocid="dashboard.top-dies.section"
      >
        <div
          className="w-0.5 h-3.5 rounded-full shrink-0"
          style={{ background: "#1e3a5f" }}
        />
        <Layers size={12} style={{ color: "#1e3a5f" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#1e3a5f", letterSpacing: "0.08em" }}
        >
          Top 5 Performing Dies (by Volume)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th
                className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#64748b",
                  borderBottom: "1px solid #e2e8f0",
                  width: 40,
                }}
              >
                Rank
              </th>
              <th
                className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}
              >
                Section (Die No)
              </th>
              <th
                className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}
              >
                Total KG
              </th>
              <th
                className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#64748b",
                  borderBottom: "1px solid #e2e8f0",
                  width: 100,
                }}
              >
                Volume
              </th>
              <th
                className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {top5.map((d, i) => {
              const pct = (d.totalKg / maxKg) * 100;
              const sharePct = ((d.totalKg / maxKg) * 100).toFixed(1);
              return (
                <tr
                  key={d.dieNo}
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}
                  data-ocid={`dashboard.top-dies.item.${i + 1}`}
                >
                  <td
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <RankBadge rank={d.rank} />
                  </td>
                  <td
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-bold text-[12px]"
                      style={{ color: "#1e293b" }}
                    >
                      {d.dieNo}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 text-right"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-mono font-bold text-[12px]"
                      style={{ color: "#1e3a5f" }}
                    >
                      {d.totalKg.toLocaleString()}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <MiniBar pct={pct} color="#1e3a5f" />
                  </td>
                  <td
                    className="px-3 py-2.5 text-right"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-mono font-bold text-[10px]"
                      style={{ color: "#475569" }}
                    >
                      {sharePct}%
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
  const top5 = alloys.slice(0, 5);
  const maxKg = Math.max(...top5.map((a) => a.totalKg));

  return (
    <div
      className="flex flex-col rounded border border-[#e2e8f0] overflow-hidden"
      style={{ background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
      data-ocid="dashboard.top-alloys.panel"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[#e2e8f0]"
        style={{ background: "#f8fafc" }}
        data-ocid="dashboard.top-alloys.section"
      >
        <div
          className="w-0.5 h-3.5 rounded-full shrink-0"
          style={{ background: "#f97316" }}
        />
        <Layers size={12} style={{ color: "#f97316" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#f97316", letterSpacing: "0.08em" }}
        >
          Top 5 Performing Alloys (by Volume)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th
                className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#64748b",
                  borderBottom: "1px solid #e2e8f0",
                  width: 40,
                }}
              >
                Rank
              </th>
              <th
                className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}
              >
                Alloy
              </th>
              <th
                className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}
              >
                Total KG
              </th>
              <th
                className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{
                  color: "#64748b",
                  borderBottom: "1px solid #e2e8f0",
                  width: 100,
                }}
              >
                Volume
              </th>
              <th
                className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {top5.map((a, i) => {
              const pct = (a.totalKg / maxKg) * 100;
              const sharePct = ((a.totalKg / maxKg) * 100).toFixed(1);
              return (
                <tr
                  key={a.alloy}
                  style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}
                  data-ocid={`dashboard.top-alloys.item.${i + 1}`}
                >
                  <td
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <RankBadge rank={a.rank} />
                  </td>
                  <td
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-bold text-[12px]"
                      style={{ color: "#1e293b" }}
                    >
                      {a.alloy}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 text-right"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-mono font-bold text-[12px]"
                      style={{ color: "#c2410c" }}
                    >
                      {a.totalKg.toLocaleString()}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <MiniBar pct={pct} color="#f97316" />
                  </td>
                  <td
                    className="px-3 py-2.5 text-right"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <span
                      className="font-mono font-bold text-[10px]"
                      style={{ color: "#475569" }}
                    >
                      {sharePct}%
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
        background: "#ffffff",
        borderColor: "#e2e8f0",
        color: "#1e293b",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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

// Active shape for interactive pie sector
const renderActiveShape = (props: PieSectorDataItem) => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#000",
  } = props;
  return (
    <Sector
      cx={cx as number}
      cy={cy as number}
      innerRadius={(innerRadius as number) - 4}
      outerRadius={(outerRadius as number) + 6}
      startAngle={startAngle as number}
      endAngle={endAngle as number}
      fill={fill as string}
    />
  );
};

export function WIPAgingDonut({ data, onSegmentClick }: WIPAgingDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);

  return (
    <GrafanaPanel
      title="WIP Aging Analysis"
      accentColor="#0891b2"
      className="h-full"
    >
      <div
        className="text-right mb-1"
        style={{ fontSize: "8px", color: "#9ea6b3", fontStyle: "italic" }}
      >
        Click segment for press detail
      </div>
      {/* Body: donut left, legend right */}
      <div
        className="flex items-center justify-center px-2 py-1 gap-4 flex-1"
        data-ocid="dashboard.wip-aging.panel"
      >
        {/* Donut */}
        <div style={{ width: 160, height: 160, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                nameKey="label"
                activeIndex={activeIdx}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIdx(index)}
                onMouseLeave={() => setActiveIdx(undefined)}
                onClick={(_, index) => {
                  onSegmentClick?.(data[index]);
                }}
                style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={entry.color}
                    stroke="none"
                    data-ocid={`dashboard.wip_aging.segment.${index + 1}`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomWIPTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {data.map((d, idx) => (
            <button
              key={d.label}
              type="button"
              className="flex flex-col gap-0.5 rounded px-2 py-1 transition-colors group text-left w-full"
              style={{
                background: activeIdx === idx ? `${d.color}11` : "transparent",
                cursor: onSegmentClick ? "pointer" : "default",
                border:
                  activeIdx === idx
                    ? `1px solid ${d.color}33`
                    : "1px solid transparent",
              }}
              onClick={() => onSegmentClick?.(d)}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(undefined)}
              data-ocid={`dashboard.wip_aging.legend.${idx + 1}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide group-hover:underline"
                  style={{ color: "#64748b" }}
                >
                  {d.label}
                </span>
              </div>
              <div className="pl-5">
                <span
                  className="font-black font-mono text-[18px] leading-tight"
                  style={{ color: d.color }}
                >
                  {d.value}
                  <span
                    className="text-[11px] font-bold ml-1"
                    style={{ color: "#94a3b8" }}
                  >
                    MT
                  </span>
                </span>
              </div>
            </button>
          ))}

          {/* Total */}
          <div
            className="border-t pt-2 flex items-center justify-between"
            style={{ borderColor: "#e4e7ed" }}
          >
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: "#6e7783" }}
            >
              Total WIP
            </span>
            <span
              className="font-black text-[14px] font-mono"
              style={{ color: "#0891b2" }}
            >
              {total.toFixed(1)} MT
            </span>
          </div>
        </div>
      </div>
    </GrafanaPanel>
  );
}
