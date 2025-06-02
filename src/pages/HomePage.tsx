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
import { useNavigate } from "react-router-dom";

interface Post {
  _id: string;
  title: string;
  content: string;
  sender: string;
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
      await axios.post(
        "/posts",
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTitle("");
      setContent("");
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
    background: "linear-gradient(to bottom right, #cbd5e1, #a7bed3)"
,
    pt: 6,
    px: 2,
    color: "#222",
  }}
>


      {/* Profile Icon */}
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
    animation: "fadeIn 1.2s ease-in-out",
    "@keyframes fadeIn": {
      from: { opacity: 0, transform: "translateY(-20px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
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
                borderRadius: 2,
                backgroundColor: "#ffffffee",
                color: "#111",
                minHeight: "60px",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.015)",
                  boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {post.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post.content}
              </Typography>
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
    "&:hover": { bgcolor: "#222" }, // כהה יותר בעת ריחוף
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
            label="Content"
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            onClick={handleCreatePost}
            fullWidth
            disabled={!title.trim() || !content.trim()}
            sx={{
              mt: 2,
              bgcolor: "#00bcd4",
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
