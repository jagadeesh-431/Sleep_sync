import { useState } from "react";
import { addSleepRecord } from "../api";
import { useNavigate } from "react-router-dom";

const calcDuration = (sleepTime, wakeTime) => {
  if (!sleepTime || !wakeTime) return null;
  const [sH, sM] = sleepTime.split(":").map(Number);
  const [wH, wM] = wakeTime.split(":").map(Number);
  let s = sH * 60 + sM;
  let w = wH * 60 + wM;
  if (w <= s) w += 24 * 60;
  return ((w - s) / 60).toFixed(2);
};

const todayStr = () => new Date().toISOString().split("T")[0];

const qualityOpts = [
  { value: "Poor",      label: "😞 Poor",      color: "#ff6584" },
  { value: "Fair",      label: "😐 Fair",      color: "#ffcc02" },
  { value: "Good",      label: "😊 Good",      color: "#8b85ff" },
  { value: "Excellent", label: "😄 Excellent", color: "#43d9ad" },
];

export default function AddSleep() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sleepTime: "", wakeTime: "", date: todayStr(), quality: "Good", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const duration = calcDuration(form.sleepTime, form.wakeTime);

  const getDurationColor = (d) => {
    if (!d) return "var(--primary-light)";
    const n = parseFloat(d);
    if (n >= 7 && n <= 9) return "var(--success)";
    if (n >= 6)           return "var(--warning)";
    return "var(--danger)";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sleepTime || !form.wakeTime || !form.date) {
      setError("Sleep time, wake time and date are required."); return;
    }
    setLoading(true);
    try {
      await addSleepRecord(form);
      setSuccess("✅ Sleep record saved successfully!");
      setForm({ sleepTime: "", wakeTime: "", date: todayStr(), quality: "Good", notes: "" });
      setTimeout(() => navigate("/history"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🌙 Log Sleep</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.88rem" }}>
            Record tonight's sleep data
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        {/* Form */}
        <div className="card">
          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Sleep Time</label>
                <input type="time" name="sleepTime" className="form-control"
                  value={form.sleepTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Wake Time</label>
                <input type="time" name="wakeTime" className="form-control"
                  value={form.wakeTime} onChange={handleChange} required />
              </div>
            </div>

            {duration && (
              <div className="duration-hint">
                <span style={{ fontSize: "1.1rem" }}>⏱</span>
                <span>
                  Calculated duration:{" "}
                  <strong style={{ color: getDurationColor(duration) }}>
                    {duration} hours
                  </strong>
                  {parseFloat(duration) >= 7 && parseFloat(duration) <= 9 &&
                    <span style={{ color: "var(--success)", marginLeft: 8 }}>✓ Optimal</span>}
                  {parseFloat(duration) < 6 &&
                    <span style={{ color: "var(--danger)", marginLeft: 8 }}>⚠ Short</span>}
                </span>
              </div>
            )}

            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" className="form-control"
                value={form.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Sleep Quality</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {qualityOpts.map((q) => (
                  <label key={q.value}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 5, padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${form.quality === q.value ? q.color : "var(--border)"}`,
                      background: form.quality === q.value ? `${q.color}18` : "var(--bg-card2)",
                      transition: "all 0.15s", fontSize: "0.78rem", fontWeight: 600,
                      color: form.quality === q.value ? q.color : "var(--text-muted)",
                    }}>
                    <input type="radio" name="quality" value={q.value}
                      checked={form.quality === q.value} onChange={handleChange}
                      style={{ display: "none" }} />
                    <span style={{ fontSize: "1.3rem" }}>{q.label.split(" ")[0]}</span>
                    <span>{q.value}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea name="notes" className="form-control"
                style={{ resize: "vertical", minHeight: 82 }}
                placeholder="How did you feel? Any disturbances?"
                value={form.notes} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving…" : "💾 Save Record"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate("/history")}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "20px" }}>
            <div className="card-title" style={{ marginBottom: 12 }}>😴 Sleep Goals</div>
            {[
              { label: "Optimal sleep", value: "7 – 9 hrs", color: "var(--success)" },
              { label: "Minimum", value: "6 hrs", color: "var(--warning)" },
              { label: "Under-slept", value: "< 6 hrs", color: "var(--danger)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "0.84rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "20px" }}>
            <div className="card-title" style={{ marginBottom: 10 }}>💡 Tip</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.65 }}>
              Avoid screens 30 minutes before bed. Blue light suppresses melatonin and makes it harder to fall asleep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
