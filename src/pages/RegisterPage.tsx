import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./AuthPages.css";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!fullName.trim().includes(" ")) {
      alert("Please enter your full name (first and last name)");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    try {
      await axios.post("/auth/register", { fullName, email, password });
      alert("Registration successful!");
      navigate("/feed");
    } catch (err: any) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(
        "/auth/login-with-google",
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      alert("Signed in successfully with Google!");
      navigate("/feed");
    } catch (err) {
      console.error("Google sign-in failed:", err);
      alert("Google sign-in failed");
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

        <div style={{ marginTop: "20px" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Sign-In failed")}
            useOneTap
          />
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
