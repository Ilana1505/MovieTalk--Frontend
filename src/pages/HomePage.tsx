import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Box,
  Button,
  Container,
  Fab,
  Modal,
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";

interface Post {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  sender: string;
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [review, setReview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    fetchUserProfile();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfilePicture(res.data.profilePicture);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("review", review);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setTitle("");
      setDescription("");
      setReview("");
      setImageFile(null);
      setOpen(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #cbd5e1, #a7bed3)",
        pt: 6,
        px: 2,
        color: "#222",
      }}
    >
      <IconButton
        onClick={() => navigate("/profile")}
        sx={{ position: "absolute", top: 20, left: 20 }}
      >
        {profilePicture ? (
          <Box
            component="img"
            src={profilePicture}
            alt="Profile"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "2px solid #555",
              objectFit: "cover",
            }}
          />
        ) : (
          <AccountCircleIcon sx={{ fontSize: 44, color: "#243b55" }} />
        )}
      </IconButton>

      <Container maxWidth="sm">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 900,
            fontSize: "2.8rem",
            fontFamily: "'Orbitron', sans-serif",
            color: "#fff",
            textShadow: "0 3px 6px rgba(0,0,0,0.3)",
            mb: 6,
            letterSpacing: 1,
          }}
        >
          <span style={{ color: "#243b55" }}>MovieTalk</span> Community
        </Typography>

        <Stack spacing={2}>
          {posts.map((post) => (
            <Paper
              key={post._id}
              elevation={4}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: "#f9f9f9",
                color: "#111",
                display: "flex",
                gap: 2,
                alignItems: "flex-start",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {post.image && (
                <Box
                  component="img"
                  src={`http://localhost:3000${post.image}`}
                  alt={post.title}
                  sx={{
                    width: 100,
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 2,
                    boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                    flexShrink: 0,
                  }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  <strong>Description:</strong> {post.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Review:</strong> {post.review}
                </Typography>

               <Box sx={{ mt: 4, display: "flex", gap: 1 }}>
  <Button
    variant="outlined"
    size="small"
    startIcon={<FavoriteBorderIcon />}
    sx={{
      borderColor: "#e91e63",
      color: "#e91e63",
      fontWeight: 600,
      borderRadius: 999,
      px: 2,
      textTransform: "none",
    }}
  >
    1
  </Button>
  <Button
    variant="outlined"
    size="small"
    startIcon={<ChatBubbleOutlineIcon />}
    sx={{
      borderColor: "#607d8b",
      color: "#607d8b",
      fontWeight: 600,
      borderRadius: 999,
      px: 2,
      textTransform: "none",
    }}
  >
    Comment
  </Button>
</Box>


              </Box>
            </Paper>
          ))}
        </Stack>
      </Container>

      <Fab
        aria-label="add"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          bgcolor: "#243b55",
          color: "#fff",
          "&:hover": { bgcolor: "#222" },
        }}
      >
        <AddIcon />
      </Fab>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            color: "#000",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create New Post
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Review"
            multiline
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            margin="normal"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) setImageFile(e.target.files[0]);
            }}
            style={{ marginTop: 16 }}
          />
          <Button
            variant="contained"
            onClick={handleCreatePost}
            fullWidth
            disabled={!title.trim() || !description.trim() || !review.trim()}
            sx={{
              mt: 2,
              bgcolor: "#243b55",
              color: "#fff",
              "&:hover": { bgcolor: "#0097a7" },
            }}
          >
            Publish
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;