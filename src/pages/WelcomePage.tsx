import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1 className="title">🎬 Movie Talk</h1>
      <p className="subtitle">Join the conversation about your favorite movies</p>
      <div className="buttons">
        <button onClick={() => navigate("/login")} className="btn">Login</button>
        <button onClick={() => navigate("/register")} className="btn">Register</button>
      </div>
    </div>
  );
};

export default WelcomePage;
