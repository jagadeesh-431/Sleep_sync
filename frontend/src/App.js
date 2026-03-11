import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AddSleep from "./pages/AddSleep";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import "./styles/global.css";
import "./App.css";

// Protected layout — renders sidebar + page content
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// Guard: redirect to / if not logged in
function Protected({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/" replace />;
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  // Already logged in → go to dashboard
  if (localStorage.getItem("adminToken")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="card-container">
      <div className="card">
        <div className="toggle-tabs">
          <button className={isLogin ? "tab active" : "tab"} onClick={() => setIsLogin(true)}>
            Login
          </button>
          <button className={!isLogin ? "tab active" : "tab"} onClick={() => setIsLogin(false)}>
            Register
          </button>
        </div>
        {isLogin ? <AdminLogin /> : <AdminRegister />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={<Protected><AppLayout><Dashboard /></AppLayout></Protected>}
        />
        <Route
          path="/add-sleep"
          element={<Protected><AppLayout><AddSleep /></AppLayout></Protected>}
        />
        <Route
          path="/history"
          element={<Protected><AppLayout><History /></AppLayout></Protected>}
        />
        <Route
          path="/analytics"
          element={<Protected><AppLayout><Analytics /></AppLayout></Protected>}
        />
        <Route
          path="/profile"
          element={<Protected><AppLayout><Profile /></AppLayout></Protected>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}