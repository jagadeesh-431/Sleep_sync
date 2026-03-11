import React, { useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="card-container">
      <div className="card">
        <div className="toggle-tabs">
          <button
            className={isLogin ? "tab active" : "tab"}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "tab active" : "tab"}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        {isLogin ? <AdminLogin /> : <AdminRegister />}
      </div>
    </div>
  );
}

export default App;