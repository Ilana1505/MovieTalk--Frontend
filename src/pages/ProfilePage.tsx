import React from "react";
import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>
      {/* אפשר להוסיף כאן עוד פרטי משתמש בעתיד */}
      <Button variant="outlined" color="error" onClick={handleLogout}>
        Logout
      </Button>
    </Container>
  );
};

export default ProfilePage;
