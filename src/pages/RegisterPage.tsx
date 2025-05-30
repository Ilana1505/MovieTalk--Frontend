import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import React from "react";
import "./AuthPages.css";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // בדיקות ולידציה בסיסיות
    if (!fullName.trim().includes(" ")) {
      alert("אנא הזן שם מלא (שם פרטי ושם משפחה)");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("אנא הזן כתובת אימייל תקינה");
      return;
    }

    if (password.length < 8) {
      alert("הסיסמה צריכה להכיל לפחות 8 תווים");
      return;
    }

    try {
      const res = await axios.post(
        "/auth/register",
        { fullName, email, password },
        { withCredentials: true } 
      );
      alert("נרשמת בהצלחה! כעת התחבר/י");
      navigate("/login"); // מעבר למסך התחברות
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
