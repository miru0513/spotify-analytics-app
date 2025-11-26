export default function SessionsTable({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return <p className="text-gray-400 text-sm">No sessions detected yet.</p>;
  }

  const formatDateTime = (str) =>
    new Date(str).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-3">Top listening sessions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="text-gray-300">
            <tr>
              <th className="text-left py-2 pr-4">Start</th>
              <th className="text-left py-2 pr-4">End</th>
              <th className="text-right py-2 pr-4">Duration (min)</th>
              <th className="text-right py-2">Plays</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="py-2 pr-4">{formatDateTime(s.start)}</td>
                <td className="py-2 pr-4">{formatDateTime(s.end)}</td>
                <td className="py-2 pr-4 text-right">
                  {s.duration_minutes.toFixed(1)}
                </td>
                <td className="py-2 text-right">{s.plays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
