import React, { useState } from "react";
import "./AdminRegister.css";

function AdminRegister() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if(name && email && password){
      alert("Admin Registered Successfully");
    }else{
      alert("Please fill all fields");
    }
  };

  return (
    <div className="register-container">

      <h2>Sleepin Sync Admin Register</h2>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type="submit">Register</button>

      </form>

    </div>
  );
}

export default AdminRegister;