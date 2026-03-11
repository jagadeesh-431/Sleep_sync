import { useEffect, useState } from "react";
import { getSleepAnalytics } from "../api";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const QUALITY_COLORS = ["#ff6584", "#ffcc02", "#6c63ff", "#43d9ad"];
const QUALITY_KEYS   = ["Poor", "Fair", "Good", "Excellent"];

const tooltipStyle = {
  contentStyle: { background: "#1a1929", border: "1px solid #2a2847", borderRadius: 10, fontSize: "0.84rem" },
  labelStyle:   { color: "#fffffe", fontWeight: 600, marginBottom: 4 },
  cursor:       { fill: "rgba(108,99,255,0.07)" },
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const hrs = payload[0].value;
  const color = hrs >= 7 && hrs <= 9 ? "#43d9ad" : hrs >= 6 ? "#ffcc02" : "#ff6584";
  return (
    <div style={{ background: "#1a1929", border: "1px solid #2a2847", borderRadius: 10, padding: "10px 14px", fontSize: "0.83rem" }}>
      <div style={{ color: "#9896b8", marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontWeight: 700, fontSize: "1.1rem" }}>{hrs} hrs</div>
      <div style={{ color: "#5e5d7a", marginTop: 2, fontSize: "0.75rem" }}>
        {hrs >= 7 && hrs <= 9 ? "✓ On target" : hrs < 6 ? "⚠ Under-slept" : "≈ Below optimal"}
      </div>
    </div>
  );
};

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    getSleepAnalytics()
      .then(({ data }) => setData(data))
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="loading-wrap"><div className="spinner" /> Loading analytics…</div>;

  if (error) return <div className="alert alert-error">⚠️ {error}</div>;

  const { weeklyTrend, qualityBreakdown, averageSleepDuration, totalRecords, weekTotal } = data;

  const pieData = QUALITY_KEYS.map((k, i) => ({
    name: k, value: qualityBreakdown[k] || 0, color: QUALITY_COLORS[i],
  })).filter((d) => d.value > 0);

  const consistency =
    weeklyTrend.length > 0
      ? Math.round(
          (weeklyTrend.filter((d) => d.duration >= 7 && d.duration <= 9).length / weeklyTrend.length) * 100
        )
      : 0;

  const avgNum = parseFloat(averageSleepDuration);
  const avgColor = avgNum >= 7 && avgNum <= 9 ? "var(--success)" : avgNum >= 6 ? "var(--warning)" : "var(--danger)";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📊 Analytics</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.88rem" }}>
            Visual insights into your sleep patterns
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card purple">
          <div className="stat-card-icon">⏱</div>
          <div className="stat-label">Avg Duration</div>
          <div className="stat-value" style={{ color: avgColor }}>
            {averageSleepDuration}<span className="stat-unit">hrs</span>
          </div>
          <div className="stat-sub">
            {avgNum >= 7 && avgNum <= 9 ? "✓ Optimal range" : avgNum >= 6 ? "↑ Almost there" : "⚠ Sleep more"}
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon">📅</div>
          <div className="stat-label">Week Total</div>
          <div className="stat-value">{weekTotal}<span className="stat-unit">hrs</span></div>
          <div className="stat-sub">Goal: 49–63 hrs / week</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-label">Consistency</div>
          <div className="stat-value">{consistency}<span className="stat-unit">%</span></div>
          <div className="stat-sub">Days hitting 7–9 hr goal</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-card-icon">📝</div>
          <div className="stat-label">Total Records</div>
          <div className="stat-value">{totalRecords}</div>
          <div className="stat-sub">All time logs</div>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">📅 Weekly Sleep Duration</div>
        {weeklyTrend.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📅</div><p>No data yet</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8b85ff" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6c63ff" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2847" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#9896b8", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#2a2847" }} />
              <YAxis tick={{ fill: "#9896b8", fontSize: 11 }} tickLine={false} axisLine={false} unit="h" domain={[0, 12]} />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine y={8} stroke="#43d9ad" strokeDasharray="4 3" strokeWidth={1.5}
                label={{ value: "8h goal", position: "right", fill: "#43d9ad", fontSize: 10 }} />
              <Bar dataKey="duration" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Trend + Quality row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card">
          <div className="card-title">📈 Sleep Trend (7 days)</div>
          {weeklyTrend.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}><p>No data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff6584" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#ff6584" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2847" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#9896b8", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#2a2847" }} />
                <YAxis tick={{ fill: "#9896b8", fontSize: 10 }} tickLine={false} axisLine={false} unit="h" domain={[0, 12]} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v} hrs`, "Sleep"]} />
                <ReferenceLine y={8} stroke="#43d9ad" strokeDasharray="3 3" strokeWidth={1} />
                <Area type="monotone" dataKey="duration" stroke="#ff6584" strokeWidth={2}
                  fill="url(#trendGrad)" dot={{ fill: "#ff6584", r: 4, strokeWidth: 2, stroke: "#1a1929" }}
                  activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title">😴 Quality Breakdown</div>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}><p>No data</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a1929", border: "1px solid #2a2847", borderRadius: 10, fontSize: "0.83rem" }}
                    formatter={(v, n) => [`${v} nights`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center", marginTop: 8 }}>
                {pieData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ color: "var(--text-muted)" }}>{d.name}</span>
                    <span style={{ color: d.color, fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
