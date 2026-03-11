import { useEffect, useState } from "react";
import { getAdminProfile, updateAdminProfile } from "../api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [nameForm, setNameForm] = useState({ name: "" });
  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [nameMsg, setNameMsg]   = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg]       = useState({ type: "", text: "" });
  const [saving, setSaving]     = useState(false);
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    getAdminProfile()
      .then(({ data }) => { setAdmin(data.admin); setNameForm({ name: data.admin.name }); })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) { setNameMsg({ type: "error", text: "Name cannot be empty" }); return; }
    setSaving(true);
    try {
      const { data } = await updateAdminProfile({ name: nameForm.name });
      setAdmin(data.admin);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      setNameMsg({ type: "success", text: "✅ Name updated successfully!" });
    } catch (err) {
      setNameMsg({ type: "error", text: err.response?.data?.message || "Failed to update name" });
    } finally {
      setSaving(false);
    }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "Passwords do not match" }); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" }); return;
    }
    setSaving(true);
    try {
      await updateAdminProfile({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: "success", text: "✅ Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/");
  };

  if (loading)
    return <div className="loading-wrap"><div className="spinner" /> Loading profile…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👤 Profile</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: "0.88rem" }}>Manage your account settings</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

        {/* Account Info Card */}
        <div className="card" style={{ textAlign: "center" }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", fontWeight: 800, margin: "0 auto 16px",
            boxShadow: "0 0 0 4px rgba(108,99,255,0.18)",
          }}>
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>

          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>{admin?.name}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>{admin?.email}</div>
          <span className="badge badge-good" style={{ marginBottom: 20 }}>{admin?.role}</span>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4 }}>
            {[
              { label: "Name", value: admin?.name },
              { label: "Email", value: admin?.email },
              { label: "Role", value: admin?.role },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "0.83rem" }}>
                <span style={{ color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.8px" }}>{label}</span>
                <span style={{ color: "var(--text)", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-danger" style={{ width: "100%", marginTop: 20 }} onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Update Name */}
          <div className="card">
            <div className="card-title">✏️ Update Name</div>
            {nameMsg.text && (
              <div className={`alert ${nameMsg.type === "error" ? "alert-error" : "alert-success"}`}>
                {nameMsg.text}
              </div>
            )}
            <form onSubmit={handleNameSave}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={nameForm.name}
                  onChange={(e) => { setNameForm({ name: e.target.value }); setNameMsg({ type: "", text: "" }); }}
                  placeholder="Your display name" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "💾 Update Name"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-title">🔐 Change Password</div>
            {pwMsg.text && (
              <div className={`alert ${pwMsg.type === "error" ? "alert-error" : "alert-success"}`}>
                {pwMsg.text}
              </div>
            )}
            <form onSubmit={handlePwSave}>
              {[
                { key: "currentPassword", label: "Current Password", placeholder: "Enter current password", showKey: "current" },
                { key: "newPassword",     label: "New Password",     placeholder: "Min. 6 characters",      showKey: "new" },
                { key: "confirm",         label: "Confirm Password", placeholder: "Repeat new password",    showKey: "confirm" },
              ].map(({ key, label, placeholder, showKey }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[showKey] ? "text" : "password"}
                      className="form-control"
                      placeholder={placeholder}
                      style={{ paddingRight: 44 }}
                      value={pwForm[key]}
                      onChange={(e) => { setPwForm({ ...pwForm, [key]: e.target.value }); setPwMsg({ type: "", text: "" }); }}
                    />
                    <button type="button"
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.9rem" }}
                      onClick={() => setShowPw((s) => ({ ...s, [showKey]: !s[showKey] }))}>
                      {showPw[showKey] ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
              ))}
              {pwForm.newPassword && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 4, height: 4, borderRadius: 4, overflow: "hidden", background: "var(--border)" }}>
                    {[...Array(4)].map((_, i) => {
                      const strength = [pwForm.newPassword.length >= 6, pwForm.newPassword.length >= 8, /[A-Z]/.test(pwForm.newPassword), /[0-9!@#$%]/.test(pwForm.newPassword)].filter(Boolean).length;
                      const colors = ["#ff6584", "#ffcc02", "#ffcc02", "#43d9ad"];
                      return <div key={i} style={{ flex: 1, background: i < strength ? colors[strength - 1] : "transparent", borderRadius: 4, transition: "background 0.3s" }} />;
                    })}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 4 }}>
                    {[pwForm.newPassword.length >= 6, pwForm.newPassword.length >= 8, /[A-Z]/.test(pwForm.newPassword), /[0-9!@#$%]/.test(pwForm.newPassword)].filter(Boolean).length <= 1 ? "Weak" :
                     [pwForm.newPassword.length >= 6, pwForm.newPassword.length >= 8, /[A-Z]/.test(pwForm.newPassword), /[0-9!@#$%]/.test(pwForm.newPassword)].filter(Boolean).length === 2 ? "Fair" :
                     [pwForm.newPassword.length >= 6, pwForm.newPassword.length >= 8, /[A-Z]/.test(pwForm.newPassword), /[0-9!@#$%]/.test(pwForm.newPassword)].filter(Boolean).length === 3 ? "Good" : "Strong"} password
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "🔐 Change Password"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
