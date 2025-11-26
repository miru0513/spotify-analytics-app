import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TopArtistsChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-sm">No artist data.</p>;
  }

  // Recharts expects keys like { name, value }
  const chartData = data.map((item) => ({
    name: item.artist_name,
    value: item.play_count,
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-4 h-80">
      <h2 className="text-lg font-semibold mb-3">Top artists by plays</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
