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
import { GrafanaPanel } from "../grafana/GrafanaPanel";

interface ProductionData {
  press: string;
  plan: number;
  actual: number;
}

interface ChartsProps {
  productionData: ProductionData[];
}

interface PressChartsProps {
  presses: PressData[];
}

const gridColor = "#e4e7ed";
const axisStyle = {
  fontSize: 9,
  fill: "#9ea6b3",
  fontFamily: '"JetBrains Mono", monospace',
};

// Grafana-style dark tooltip
const GrafanaTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded px-2.5 py-2 text-[10px]"
      style={{
        background: "#1a1d23",
        border: "1px solid #2d3139",
        color: "#e0e4e8",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="font-semibold mb-1.5"
        style={{
          color: "#9ea6b3",
          fontSize: "9px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: p.color }}
          />
          <span style={{ color: "#9ea6b3" }}>{p.name}:</span>
          <span
            className="font-bold"
            style={{
              color: p.color,
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ProductionVsPlanChart({ productionData }: ChartsProps) {
  return (
    <GrafanaPanel title="Production vs Plan (MT)" accentColor="#3b82f6">
      <div style={{ minHeight: 168 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={productionData}
            barCategoryGap="30%"
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 5"
              stroke={gridColor}
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="press"
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tickFormatter={(v: string) => v.split(" ")[0]}
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={28}
            />
            <Tooltip
              content={<GrafanaTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="plan"
              name="Plan"
              fill="#86c98a"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GrafanaPanel>
  );
}

// Grouped bar chart for OEE & Quality (same style as Production vs Plan)
export function OEEQualityChart({ presses }: PressChartsProps) {
  const data = presses.map((p) => ({
    press: p.id,
    oee: Number.parseFloat(p.oee.toFixed(1)),
    quality: Number.parseFloat(Math.max(0, 100 - p.scrap * 10).toFixed(1)),
  }));

  return (
    <GrafanaPanel title="OEE & Quality (%)" accentColor="#ff6600">
      <div style={{ minHeight: 168 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={data}
            barCategoryGap="30%"
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 5"
              stroke={gridColor}
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="press"
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tickFormatter={(v: string) => v.split(" ")[0]}
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={28}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              content={<GrafanaTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="oee"
              name="OEE %"
              fill="#ff6600"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="quality"
              name="Quality %"
              fill="#10b981"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GrafanaPanel>
  );
}

export function OutputRatesChart({ presses }: PressChartsProps) {
  const data = presses.map((p) => ({
    press: `${p.id}`,
    dieTarget: p.dieTarget,
    pressActual: p.kgPerHour,
  }));

  return (
    <GrafanaPanel title="Output Rates (Kg/H)" accentColor="#9333ea">
      <div style={{ minHeight: 168 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={data}
            barCategoryGap="30%"
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 5"
              stroke={gridColor}
              vertical={false}
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="press"
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={32}
            />
            <Tooltip
              content={<GrafanaTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="dieTarget"
              name="Die Target"
              fill="#f97316"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="pressActual"
              name="Press Actual"
              fill="#9333ea"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GrafanaPanel>
  );
}
