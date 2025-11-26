import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DailyTrendChart({ points }) {
  if (!points || points.length === 0) {
    return <p className="text-gray-400 text-sm">No daily data.</p>;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 h-80">
      <h2 className="text-lg font-semibold mb-3">Daily listening trend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="plays" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
