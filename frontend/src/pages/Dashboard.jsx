import { useEffect, useState } from "react";
import axios from "axios";
import TopArtistsChart from "../components/TopArtistsChart.jsx";
import TopGenresChart from "../components/TopGenresChart.jsx";
import DailyTrendChart from "../components/DailyTrendChart.jsx";
import TimeHeatmap from "../components/TimeHeatmap.jsx";
import SessionsTable from "../components/SessionsTable.jsx";

const weekdayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Dashboard() {
  const BACKEND = "http://127.0.0.1:8000";

  const [userId, setUserId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [timeDist, setTimeDist] = useState(null);
  const [sessions, setSessions] = useState(null);

  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);



  const fetchAnalytics = async (id) => {
    const [summaryRes, trendRes, timeRes, sessionsRes] = await Promise.all([
      axios.get(`${BACKEND}/analytics/summary?user_id=${id}`),
      axios.get(`${BACKEND}/analytics/daily-trend?user_id=${id}`),
      axios.get(`${BACKEND}/analytics/time-distribution?user_id=${id}`),
      axios.get(`${BACKEND}/analytics/sessions?user_id=${id}`),
    ]);

    return {
      summary: summaryRes.data,
      trend: trendRes.data.points,
      timeDist: timeRes.data.points,
      sessions: sessionsRes.data.sessions,
    };
  };

  const handleResync = async () => {
    if (!userId) return;

    try {
      setIsSyncing(true);
      // backend sync endpoint is GET /spotify/sync/{user_id}
      await axios.get(`${BACKEND}/spotify/sync/${userId}`);
      const data = await fetchAnalytics(userId);

      setSummary(data.summary);
      setTrend(data.trend);
      setTimeDist(data.timeDist);
      setSessions(data.sessions);


      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      console.error(err);
      alert("Failed to resync from Spotify. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("user_id");
    setUserId(id);

    if (!id) return;

    async function load() {
      try {
        const data = await fetchAnalytics(id);
        setSummary(data.summary);
        setTrend(data.trend);
        setTimeDist(data.timeDist);
        setSessions(data.sessions);


        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics");
      }
    }

    load();
  }, []);


  const mostListenedDay = (() => {
    if (!timeDist || timeDist.length === 0) return "N/A";
    const totals = new Array(7).fill(0);
    timeDist.forEach((p) => {
      if (p.weekday >= 0 && p.weekday < 7) {
        totals[p.weekday] += p.count;
      }
    });
    const maxIndex = totals.reduce(
      (bestIdx, value, idx) =>
        value > totals[bestIdx] ? idx : bestIdx,
      0
    );
    return weekdayNames[maxIndex] || "N/A";
  })();

  const longestSessionMinutes = (() => {
    if (!sessions || sessions.length === 0) return "N/A";
    return sessions[0].duration_minutes.toFixed(0);
  })();

  const topGenre = summary?.top_genres?.[0]?.genre || "N/A";

  const lastSyncedLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString()
    : "Unknown";



  if (!userId) {
    return (
      <div className="bg-gradient-to-b from-black via-slate-900 to-black min-h-screen text-white p-10">
        <h1 className="text-2xl font-bold mb-4">No user id found</h1>
        <p>Open this page via the Spotify login flow.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-black via-slate-900 to-black min-h-screen text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Error loading data</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!summary || !trend || !timeDist || !sessions) {
    return (
      <div className="bg-gradient-to-b from-black via-slate-900 to-black min-h-screen text-white p-10">
        <h1 className="text-2xl font-bold mb-4">Loading dashboard...</h1>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white">
      {/* Small navbar */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <span className="text-sm md:text-base font-semibold tracking-tight">
            Spotify Analytics made by Miru 💜
          </span>
          <span className="text-xs text-gray-400">User #{userId}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header + resync */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">
              Deep dive into your recent Spotify listening.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <span className="text-xs text-gray-400">
              Last synced: {lastSyncedLabel}
            </span>
            <button
              onClick={handleResync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSyncing ? "Syncing…" : "Resync from Spotify"}
            </button>
          </div>
        </div>

        {/* Small text insights */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-gray-800/80 rounded-xl p-4">
            <p className="text-xs text-gray-400">Most listened day</p>
            <p className="text-lg font-semibold">{mostListenedDay}</p>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-4">
            <p className="text-xs text-gray-400">Longest session</p>
            <p className="text-lg font-semibold">
              {longestSessionMinutes === "N/A"
                ? "N/A"
                : `${longestSessionMinutes} min`}
            </p>
          </div>
          <div className="bg-gray-800/80 rounded-xl p-4">
            <p className="text-xs text-gray-400">Top genre</p>
            <p className="text-lg font-semibold capitalize">{topGenre}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total tracks</p>
            <p className="text-3xl font-bold">{summary.total_tracks}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total plays</p>
            <p className="text-3xl font-bold">{summary.total_plays}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Top artist</p>
            <p className="text-xl font-semibold">
              {summary.top_artists?.[0]?.artist_name || "N/A"}
            </p>
          </div>
        </div>

        {/* Charts: artists + genres */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <TopArtistsChart data={summary.top_artists} />
          <TopGenresChart data={summary.top_genres} />
        </div>

        {/* Charts: daily trend + heatmap */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <DailyTrendChart points={trend} />
          <TimeHeatmap points={timeDist} />
        </div>

        {/* Sessions */}
        <div className="mb-8">
          <SessionsTable sessions={sessions} />
        </div>
      </main>
    </div>
  );
}
