import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router-dom";

type UserProfile = {
  fullName: string;
  email: string;
  phone?: string;
  profilePicture?: string | null;
};

const toAbsolute = (url?: string | null) =>
  url
    ? url.startsWith("http")
      ? url
      : `http://localhost:3000${url}`
    : undefined;

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [editing, setEditing] = useState<{ field: string | null }>({
    field: null,
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [cacheBuster, setCacheBuster] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hardLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("👤 ProfilePage token:", token);

      if (!token || token === "null" || token === "undefined") {
        console.log("👤 No valid token -> redirect login");
        hardLogout();
        return;
      }

      const res = await axios.get("/auth/check");

      console.log("👤 /auth/check response:", res.data);

      setUser({
        fullName: res.data?.fullName || "",
        email: res.data?.email || "",
        phone: res.data?.phone || "",
        profilePicture: res.data?.profilePicture || "",
      });

      setProfilePicture(res.data?.profilePicture || null);

      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: res.data?._id,
          email: res.data?.email,
          fullName: res.data?.fullName,
          profilePicture: res.data?.profilePicture,
        }),
      );
    } catch (e: any) {
      console.error("Failed to load profile", e);
      console.log("👤 /auth/check status:", e?.response?.status);
      console.log("👤 /auth/check data:", e?.response?.data);

      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        hardLogout();
      }
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing.field) return;
    setUser({ ...user, [editing.field]: e.target.value } as UserProfile);
  };

  const saveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        return hardLogout();
      }

      await axios.put("/auth/update-profile", {
        fullName: user.fullName,
        email: user.email,
      });

      setEditing({ field: null });
      fetchProfile();
    } catch (e: any) {
      console.error("Failed to save profile", e);
      console.log("✏️ update-profile status:", e?.response?.status);
      console.log("✏️ update-profile data:", e?.response?.data);

      const status = e?.response?.status;
      if (status === 401 || status === 403) hardLogout();
    }
  };

  const handlePictureUpload = async () => {
    if (!newPicture) return;

    try {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        return hardLogout();
      }

      const formData = new FormData();
      formData.append("image", newPicture);

      await axios.post("/users/upload-profile-pic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewPicture(null);
      await fetchProfile();
      setCacheBuster(Date.now());
    } catch (e: any) {
      console.error("Failed to upload picture", e);
      console.log("🖼️ upload-profile-pic status:", e?.response?.status);
      console.log("🖼️ upload-profile-pic data:", e?.response?.data);

      const status = e?.response?.status;
      if (status === 401 || status === 403) hardLogout();
    }
  };

  const logout = () => {
    hardLogout();
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        return hardLogout();
      }

      await axios.delete("/users/delete");
      hardLogout();
    } catch (e: any) {
      console.error("Failed to delete account", e);
      console.log("🗑️ delete account status:", e?.response?.status);
      console.log("🗑️ delete account data:", e?.response?.data);

      const status = e?.response?.status;
      if (status === 401 || status === 403) hardLogout();
    }
  };

  const avatarSrc = (() => {
    const abs = toAbsolute(profilePicture || user.profilePicture || null);
    return abs ? `${abs}?v=${cacheBuster}` : undefined;
  })();

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom right, #cbd5e1, #a7bed3)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          background: "#fff",
          p: 4,
          borderRadius: 4,
          boxShadow: 3,
          minWidth: 320,
          textAlign: "center",
        }}
      >
        <Box position="relative">
          <Avatar
            src={avatarSrc}
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto",
              objectFit: "cover",
              border: "2px solid #e5e7eb",
            }}
          >
            {(user.fullName?.[0] || "?").toUpperCase()}
          </Avatar>

          <IconButton
            size="small"
            component="label"
            sx={{ position: "absolute", top: 60, right: 120 }}
          >
            <ImageIcon />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setNewPicture(e.target.files?.[0] || null)}
            />
          </IconButton>
        </Box>

        <Box mt={2}>
          {editing.field === "fullName" ? (
            <TextField
              value={user.fullName}
              onChange={handleFieldChange}
              onBlur={saveChanges}
              autoFocus
              variant="standard"
            />
          ) : (
            <Typography fontWeight="bold">
              {user.fullName || "No Name"}
              <IconButton
                size="small"
                onClick={() => setEditing({ field: "fullName" })}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Typography>
          )}

          {editing.field === "email" ? (
            <TextField
              value={user.email}
              onChange={handleFieldChange}
              onBlur={saveChanges}
              autoFocus
              variant="standard"
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography color="text.secondary">
              {user.email}
              <IconButton
                size="small"
                onClick={() => setEditing({ field: "email" })}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Typography>
          )}

          {editing.field === "password" ? (
            <TextField
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={async () => {
                try {
                  const token = localStorage.getItem("token");
                  if (!token || token === "null" || token === "undefined") {
                    return hardLogout();
                  }

                  await axios.put("/auth/change-password", {
                    password: newPassword,
                  });

                  setEditing({ field: null });
                  setNewPassword("");
                } catch (e: any) {
                  console.error("Failed to change password", e);
                  console.log(
                    "🔒 change-password status:",
                    e?.response?.status,
                  );
                  console.log("🔒 change-password data:", e?.response?.data);

                  const status = e?.response?.status;
                  if (status === 401 || status === 403) hardLogout();
                }
              }}
              autoFocus
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography color="text.secondary">
              ********
              <IconButton
                size="small"
                onClick={() => setEditing({ field: "password" })}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Typography>
          )}
        </Box>

        <Box mt={3}>
          <Button
            variant="outlined"
            onClick={() => navigate("/my-posts")}
            sx={{
              color: "#3b3f58",
              borderColor: "#3b3f58",
              fontSize: "0.85rem",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "20px",
              px: 3,
              py: 1,
              "&:hover": {
                bgcolor: "#f1f1f1",
                borderColor: "#3b3f58",
              },
            }}
          >
            View My Posts
          </Button>
        </Box>

        <Box mt={2}>
          <Button
            startIcon={<LogoutIcon />}
            onClick={logout}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Logout
          </Button>
        </Box>

        <Box mt={1}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={deleteAccount}
            sx={{ textTransform: "none" }}
            fullWidth
          >
            Remove Account
          </Button>
        </Box>

        {newPicture && (
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={handlePictureUpload}
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "0.8rem",
                color: "#555",
                borderColor: "#aaa",
              }}
            >
              Save Picture
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfilePage;
