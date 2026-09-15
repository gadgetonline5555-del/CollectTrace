import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const CHART_COLORS = ["#a78bfa", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#60a5fa", "#f87171", "#c084fc"];
const tooltipStyle = { background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#fff" };
const axisStroke = "#334155";
const tickStyle = { fill: "#94a3b8", fontSize: 12 };

// Lazy-loaded chart wrapper so recharts is only bundled into the Insights tab.
// Variants preserve the exact rendering of the previous inline charts.
export default function ChartComponents({ variant, data }) {
  if (variant === "plan") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: axisStroke }} />
          <YAxis tick={tickStyle} allowDecimals={false} axisLine={{ stroke: axisStroke }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="users" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  const fill = variant === "manga" ? "#a78bfa" : "#22d3ee";
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={tickStyle} allowDecimals={false} axisLine={{ stroke: axisStroke }} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={70} axisLine={{ stroke: axisStroke }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
}