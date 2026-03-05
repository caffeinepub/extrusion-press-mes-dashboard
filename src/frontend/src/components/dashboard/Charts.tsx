import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PressData } from "../../mockData";

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

const chartBg = "#ffffff";
const gridColor = "#e2e8f0";
const textColor = "#64748b";
const axisStyle = {
  fontSize: 9,
  fill: textColor,
  fontFamily: '"JetBrains Mono", monospace',
};

const PanelHeader = ({ title }: { title: string }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 border-b border-[#e2e8f0]"
    style={{ background: "#f8fafc" }}
  >
    <div className="w-0.5 h-3 rounded-full" style={{ background: "#3b82f6" }} />
    <span
      className="text-[10px] font-bold uppercase tracking-widest"
      style={{ color: "#64748b", letterSpacing: "0.1em" }}
    >
      {title}
    </span>
  </div>
);

// Custom tooltip
const CustomTooltip = ({
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
      className="rounded border px-2 py-1.5 text-[10px]"
      style={{
        background: "#ffffff",
        borderColor: "#e2e8f0",
        color: "#1e293b",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div className="font-bold mb-1" style={{ color: "#64748b" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
          <span style={{ color: "#64748b" }}>{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ProductionVsPlanChart({ productionData }: ChartsProps) {
  return (
    <div
      className="flex flex-col rounded border border-[#e2e8f0]"
      style={{ background: chartBg, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <PanelHeader title="Production vs Plan (MT)" />
      <div className="flex-1 px-2 pt-2 pb-0" style={{ minHeight: 170 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={productionData}
            barCategoryGap="30%"
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke={gridColor}
              vertical={false}
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
              content={<CustomTooltip />}
              cursor={{ fill: "#00000008" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                paddingTop: 2,
                paddingBottom: 4,
                color: "#64748b",
              }}
              iconSize={7}
              iconType="square"
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
              fill="#22c55e"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OEEQualityChart({ presses }: PressChartsProps) {
  const data = presses.map((p) => ({
    press: `${p.id} (${p.name})`,
    oee: Number.parseFloat(p.oee.toFixed(1)),
    quality: Number.parseFloat((p.recovery * 1.02).toFixed(1)), // approx quality from recovery
  }));

  return (
    <div
      className="flex flex-col rounded border border-[#e2e8f0]"
      style={{ background: chartBg, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <PanelHeader title="OEE & Quality (%)" />
      <div className="flex-1 px-2 pt-2 pb-0" style={{ minHeight: 170 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={data}
            barCategoryGap="30%"
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke={gridColor}
              vertical={false}
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
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#00000008" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                paddingTop: 2,
                paddingBottom: 4,
                color: "#64748b",
              }}
              iconSize={7}
              iconType="square"
            />
            <Bar
              dataKey="oee"
              name="OEE %"
              fill="#ef4444"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="quality"
              name="Quality %"
              fill="#f97316"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OutputRatesChart({ presses }: PressChartsProps) {
  const data = presses.map((p) => ({
    press: `${p.id} (${p.name})`,
    dieTarget: p.dieTarget,
    pressActual: p.kgPerHour,
  }));

  return (
    <div
      className="flex flex-col rounded border border-[#e2e8f0]"
      style={{ background: chartBg, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <PanelHeader title="Output Rates (Kg/H)" />
      <div className="flex-1 px-2 pt-2 pb-0" style={{ minHeight: 170 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={data}
            barCategoryGap="30%"
            barGap={2}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke={gridColor}
              vertical={false}
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
              width={32}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#00000008" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                paddingTop: 2,
                paddingBottom: 4,
                color: "#64748b",
              }}
              iconSize={7}
              iconType="square"
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
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
