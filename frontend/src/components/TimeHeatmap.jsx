// frontend/src/components/TimeHeatmap.jsx
const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TimeHeatmap({ points }) {
  if (!points || points.length === 0) {
    return <p className="text-gray-400 text-sm">No time distribution data.</p>;
  }

  const grid = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );
  let max = 0;

  points.forEach((p) => {
    if (p.weekday >= 0 && p.weekday < 7 && p.hour >= 0 && p.hour < 24) {
      grid[p.weekday][p.hour] = p.count;
      if (p.count > max) max = p.count;
    }
  });

  const intensity = (value) => {
    if (max === 0) return "bg-gray-900";
    const ratio = value / max;
    if (ratio === 0) return "bg-gray-900";
    if (ratio < 0.25) return "bg-emerald-900";
    if (ratio < 0.5) return "bg-emerald-700";
    if (ratio < 0.75) return "bg-emerald-500";
    return "bg-emerald-400";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-3">
        Listening heatmap (weekday × hour)
      </h2>
      <div className="overflow-x-auto">
        <table className="border-collapse text-[10px]">
          <thead>
            <tr>
              <th className="text-left pr-2 text-gray-400">Day / Hour</th>
              {Array.from({ length: 24 }).map((_, hour) => (
                <th key={hour} className="px-1 text-gray-400">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, weekday) => (
              <tr key={weekday}>
                <td className="pr-2 text-gray-300">{weekdayNames[weekday]}</td>
                {row.map((count, hour) => (
                  <td
                    key={hour}
                    className={`${intensity(
                      count
                    )} w-4 h-4 border border-gray-900`}
                    title={`Day: ${weekdayNames[weekday]}, Hour: ${hour}, Plays: ${count}`}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
