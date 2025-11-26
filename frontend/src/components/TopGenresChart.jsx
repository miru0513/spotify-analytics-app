import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#e11d48", "#a855f7", "#f97316"];

export default function TopGenresChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-sm">No genre data.</p>;
  }

  const chartData = data.map((item) => ({
    name: item.genre,
    value: item.count,
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-4 h-80">
      <h2 className="text-lg font-semibold mb-3">Top genres</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
