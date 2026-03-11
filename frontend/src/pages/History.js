import { useEffect, useState } from "react";
import { getSleepHistory, deleteSleepRecord, updateSleepRecord } from "../api";
import { Link } from "react-router-dom";

const qualityClass = {
  Excellent: "badge-excellent",
  Good:      "badge-good",
  Fair:      "badge-fair",
  Poor:      "badge-poor",
};

const qualityIcon = { Poor: "😞", Fair: "😐", Good: "😊", Excellent: "😄" };

const calcDuration = (sleepTime, wakeTime) => {
  const [sH, sM] = sleepTime.split(":").map(Number);
  const [wH, wM] = wakeTime.split(":").map(Number);
  let s = sH * 60 + sM;
  let w = wH * 60 + wM;
  if (w <= s) w += 24 * 60;
  return ((w - s) / 60).toFixed(2);
};

const durColor = (d) => {
  const n = parseFloat(d);
  if (n >= 7 && n <= 9) return "var(--success)";
  if (n >= 6)           return "var(--warning)";
  return "var(--danger)";
};

export default function History() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchRecords = () => {
    setLoading(true);
    getSleepHistory()
      .then(({ data }) => setRecords(data.records))
      .catch(() => setError("Failed to load records"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSleepRecord(deleteId);
      setRecords((prev) => prev.filter((r) => r._id !== deleteId));
    } catch {
      setError("Failed to delete record.");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setEditForm({
      sleepTime: record.sleepTime,
      wakeTime: record.wakeTime,
      date: new Date(record.date).toISOString().split("T")[0],
      quality: record.quality,
      notes: record.notes || "",
    });
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateSleepRecord(editRecord._id, editForm);
      setRecords((prev) =>
        prev.map((r) => (r._id === editRecord._id ? data.record : r))
      );
      setEditRecord(null);
    } catch {
      alert("Failed to update record.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="loading-wrap">
        <div className="spinner" /> Loading records…
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>📋 Sleep History</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.88rem" }}>
            {records.length} record{records.length !== 1 ? "s" : ""} logged
          </p>
        </div>
        <Link to="/add-sleep" className="btn btn-primary">➕ Add New</Link>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌙</div>
            <p>No sleep records yet.</p>
            <Link to="/add-sleep" className="btn btn-primary">Log Your First Sleep</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sleep</th>
                  <th>Wake</th>
                  <th>Duration</th>
                  <th>Quality</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                      {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>{r.sleepTime}</td>
                    <td style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>{r.wakeTime}</td>
                    <td>
                      <strong style={{ color: durColor(r.sleepDuration) }}>{r.sleepDuration}</strong>
                      <span style={{ color: "var(--text-dim)", fontSize: "0.78rem" }}> hrs</span>
                    </td>
                    <td>
                      <span className={`badge ${qualityClass[r.quality] || "badge-good"}`}>
                        {qualityIcon[r.quality]} {r.quality}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.notes || <span style={{ color: "var(--text-dim)" }}>—</span>}
                    </td>
                    <td>
                      <div className="action-strip">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(r._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditRecord(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>✏️ Edit Record</h2>
              <button className="modal-close" onClick={() => setEditRecord(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Sleep Time</label>
                  <input type="time" name="sleepTime" className="form-control"
                    value={editForm.sleepTime} onChange={handleEditChange} required />
                </div>
                <div className="form-group">
                  <label>Wake Time</label>
                  <input type="time" name="wakeTime" className="form-control"
                    value={editForm.wakeTime} onChange={handleEditChange} required />
                </div>
              </div>
              {editForm.sleepTime && editForm.wakeTime && (
                <div className="duration-hint">
                  <span>⏱</span>
                  <span>Duration: <strong style={{ color: durColor(calcDuration(editForm.sleepTime, editForm.wakeTime)) }}>
                    {calcDuration(editForm.sleepTime, editForm.wakeTime)} hrs
                  </strong></span>
                </div>
              )}
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" className="form-control"
                  value={editForm.date} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Quality</label>
                <select name="quality" className="form-control"
                  value={editForm.quality} onChange={handleEditChange}>
                  <option value="Poor">😞 Poor</option>
                  <option value="Fair">😐 Fair</option>
                  <option value="Good">😊 Good</option>
                  <option value="Excellent">😄 Excellent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" className="form-control"
                  style={{ resize: "vertical", minHeight: 70 }}
                  value={editForm.notes} onChange={handleEditChange} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "💾 Save Changes"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditRecord(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>
              Are you sure you want to delete this sleep record? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-danger" onClick={handleDelete}>🗑 Delete</button>
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
