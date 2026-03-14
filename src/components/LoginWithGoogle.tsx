import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const LoginWithGoogle = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
  try {
    const res = await axios.post(
      "/auth/login-with-google",
      { token: credentialResponse.credential },
      { withCredentials: true }
    );

    localStorage.setItem("token", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: res.data._id,
        email: res.data.email,
        fullName: res.data.fullName,
      })
    );

    alert("Successfully logged in with Google!");
    navigate("/feed");
  } catch (err) {
    console.error("Error logging in with Google:", err);
    alert("An error occurred while logging in with Google.");
  }
};
  return (
    <div style={{ marginTop: "20px" }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert("Google Sign-In failed")}
        useOneTap
      />
    </div>
  );
};

export default LoginWithGoogle;
