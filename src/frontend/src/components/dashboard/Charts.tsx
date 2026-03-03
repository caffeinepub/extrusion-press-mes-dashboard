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
import { oeeQualityData, outputRatesData } from "../../mockData";

interface ProductionData {
  press: string;
  plan: number;
  actual: number;
}

interface ChartsProps {
  productionData: ProductionData[];
}

const chartBg = "#0f1729";
const gridColor = "#1e2d45";
const textColor = "#64748b";
const axisStyle = {
  fontSize: 9,
  fill: textColor,
  fontFamily: '"JetBrains Mono", monospace',
};

const PanelHeader = ({ title }: { title: string }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1a2d45]"
    style={{ background: "#0a111e" }}
  >
    <div className="w-0.5 h-3 rounded-full" style={{ background: "#3b82f6" }} />
    <span
      className="text-[10px] font-bold uppercase tracking-widest"
      style={{ color: "#7090b0", letterSpacing: "0.1em" }}
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
        background: "#0d1526",
        borderColor: "#1e2d45",
        color: "#e2e8f0",
      }}
    >
      <div className="font-bold mb-1" style={{ color: "#94a3b8" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
          <span style={{ color: "#94a3b8" }}>{p.name}:</span>
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
      className="flex flex-col rounded border border-[#1a2d45]"
      style={{ background: chartBg }}
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
              cursor={{ fill: "#ffffff08" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                paddingTop: 2,
                paddingBottom: 4,
                color: "#5a7090",
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

export function OEEQualityChart() {
  return (
    <div
      className="flex flex-col rounded border border-[#1a2d45]"
      style={{ background: chartBg }}
    >
      <PanelHeader title="OEE & Quality (%)" />
      <div className="flex-1 px-2 pt-2 pb-0" style={{ minHeight: 170 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={oeeQualityData}
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
              cursor={{ fill: "#ffffff08" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                paddingTop: 2,
                paddingBottom: 4,
                color: "#5a7090",
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

export function OutputRatesChart() {
  return (
    <div
      className="flex flex-col rounded border border-[#1a2d45]"
      style={{ background: chartBg }}
    >
      <PanelHeader title="Output Rates (Kg/H)" />
      <div className="flex-1 px-2 pt-2 pb-0" style={{ minHeight: 170 }}>
        <ResponsiveContainer width="100%" height={168}>
          <BarChart
            data={outputRatesData}
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
              cursor={{ fill: "#ffffff08" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                paddingTop: 2,
                paddingBottom: 4,
                color: "#5a7090",
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
