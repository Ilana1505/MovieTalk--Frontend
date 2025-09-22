import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });
      localStorage.removeItem("token");
      localStorage.setItem("token", res.data.accessToken);
      navigate("/feed");
    } catch (err: any) {
      console.error("Login error:", err?.response?.data);
      alert(err?.response?.data || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(
        "/auth/login-with-google",
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      localStorage.removeItem("token");
      localStorage.setItem("token", res.data.accessToken);
      alert("Signed in successfully with Google!");
      navigate("/feed");
    } catch (err) {
      console.error("Google sign-in failed:", err);
      alert("Google sign-in failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {/* --- Sign up link --- */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <span style={{ color: "#cbd5e1" }}>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: "#00c2d1",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Sign up
          </button>
        </div>
      </form>

      {/* Google Sign-In Button */}
      <div style={{ marginTop: 20 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google Sign-In failed")}
          useOneTap
        />
      </div>
    </div>
  );
};

export default LoginPage;
