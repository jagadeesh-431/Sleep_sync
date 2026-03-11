import { useEffect, useState } from "react";
import { getSleepAnalytics } from "../api";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1a1929", border: "1px solid #2a2847", borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ color: "#9896b8", fontSize: "0.78rem", marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#8b85ff", fontWeight: 700 }}>{payload[0].value} hrs</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const admin = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
    getSleepAnalytics()
      .then(({ data }) => setAnalytics(data))
      .catch(() => setError("Failed to load analytics data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loading-wrap">
        <div className="spinner" /> Loading dashboard…
      </div>
    );

  if (error) return <div className="alert alert-error">⚠️ {error}</div>;

  const { todaySleep, weekTotal, averageSleepDuration, weeklyTrend, totalRecords } = analytics;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.65rem", fontWeight: 800 }}>
          {getGreeting()}, {admin.name || "Admin"} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 5 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-card-icon">🌙</div>
          <div className="stat-label">Tonight's Sleep</div>
          <div className="stat-value">
            {todaySleep || "—"}
            {todaySleep > 0 && <span className="stat-unit">hrs</span>}
          </div>
          <div className="stat-sub">
            {todaySleep >= 7 ? "✅ Well rested" : todaySleep > 0 ? "⚠️ Below target" : "No record today"}
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon">📅</div>
          <div className="stat-label">This Week Total</div>
          <div className="stat-value">
            {weekTotal}
            <span className="stat-unit">hrs</span>
          </div>
          <div className="stat-sub">Target: 49–56 hrs/week</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-card-icon">📈</div>
          <div className="stat-label">Average Duration</div>
          <div className="stat-value">
            {averageSleepDuration}
            <span className="stat-unit">hrs</span>
          </div>
          <div className="stat-sub">Recommended: 7–9 hrs</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-card-icon">🗂️</div>
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-sub">All time entries</div>
        </div>
      </div>

      {/* Chart + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        {/* Trend chart */}
        <div className="card">
          <div className="card-title">📈 Sleep Trend — Last 7 Days</div>
          {weeklyTrend.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌙</div>
              <p>No sleep data yet. Start tracking!</p>
              <Link to="/add-sleep" className="btn btn-primary">Add First Record</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2847" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#9896b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#9896b8", fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 12]} unit="h" />
                <ReferenceLine y={8} stroke="#43d9ad" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "8h goal", fill: "#43d9ad", fontSize: 10, position: "right" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="duration" stroke="#6c63ff" strokeWidth={2.5}
                  fill="url(#sleepGrad)" dot={{ fill: "#6c63ff", r: 4, strokeWidth: 2, stroke: "#1a1929" }}
                  activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: "20px" }}>
            <div className="card-title" style={{ marginBottom: 14 }}>⚡ Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/add-sleep" className="btn btn-primary" style={{ justifyContent: "center" }}>🌙 Log Sleep</Link>
              <Link to="/history" className="btn btn-outline" style={{ justifyContent: "center" }}>📋 View History</Link>
              <Link to="/analytics" className="btn btn-outline" style={{ justifyContent: "center" }}>📊 Analytics</Link>
            </div>
          </div>

          <div className="card" style={{ padding: "20px" }}>
            <div className="card-title" style={{ marginBottom: 12 }}>💡 Sleep Tip</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
              Maintain a consistent sleep schedule — even on weekends — to improve sleep quality and energy levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
