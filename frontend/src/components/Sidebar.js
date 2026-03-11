import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/add-sleep",  icon: "🌙", label: "Add Sleep" },
  { to: "/history",    icon: "📋", label: "History" },
  { to: "/analytics",  icon: "📊", label: "Analytics" },
  { to: "/profile",    icon: "👤", label: "Profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Sleep<span>Sync</span>
      </div>

      <nav>
        <div className="nav-section-label">Menu</div>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {admin?.name && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              marginBottom: 6,
              borderRadius: 11,
              background: "rgba(108,99,255,0.08)",
              border: "1px solid rgba(108,99,255,0.12)",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6c63ff, #ff6584)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {admin.name[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fffffe", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {admin.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#9896b8" }}>{admin.role}</div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

