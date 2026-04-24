import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

type Post = {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  likes?: string[];
};

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const toAbsoluteUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

const MyPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReview, setEditReview] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [removeEditImage, setRemoveEditImage] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/posts/my-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch my posts", err);
      }
    };

    fetchMyPosts();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const next: Record<string, number> = {};

      for (const p of posts) {
        try {
          const res = await axios.get(`/comments/post/${p._id}`);
          next[p._id] = Array.isArray(res.data) ? res.data.length : 0;
        } catch {
          next[p._id] = 0;
        }
      }

      setCommentCounts(next);
    };

    if (posts.length) {
      fetchCounts();
    }
  }, [posts]);

  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditReview(post.review);
    setEditImage(null);
    setRemoveEditImage(false);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingPost(null);
    setEditTitle("");
    setEditDescription("");
    setEditReview("");
    setEditImage(null);
    setRemoveEditImage(false);
  };

  const handleDeletePost = async (postId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDescription);
      formData.append("review", editReview);
      formData.append("removeImage", String(removeEditImage));

      if (editImage) {
        formData.append("image", editImage);
      }

      const res = await axios.put(`/posts/${editingPost._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts((prev) =>
        prev.map((post) => (post._id === editingPost._id ? res.data : post)),
      );

      handleCloseEdit();
    } catch (err) {
      console.error("Failed to update post", err);
      alert("Failed to update post");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#e3eaf2",
        py: 4,
        position: "relative",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        variant="outlined"
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          borderColor: "#243b55",
          color: "#243b55",
          textTransform: "none",
          fontWeight: 600,
          bgcolor: "#ffffffcc",
          backdropFilter: "blur(6px)",
          zIndex: 10,
          "&:hover": {
            bgcolor: "#ffffff",
            borderColor: "#243b55",
          },
        }}
      >
        Back
      </Button>

      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#243b55", mb: 4 }}
        >
          My Posts
        </Typography>

        {posts.length === 0 ? (
          <Typography align="center" color="text.secondary">
            You haven't posted anything yet.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {posts.map((post) => (
              <Paper
                key={post._id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  gap: 2,
                  bgcolor: "#fff",
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <IconButton
                    onClick={() => handleOpenEdit(post)}
                    sx={{ color: "#243b55" }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    onClick={() => handleDeletePost(post._id)}
                    sx={{ color: "#d32f2f" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {post.image && (
                  <Box
                    component="img"
                    src={toAbsoluteUrl(post.image)}
                    alt={post.title}
                    sx={{
                      width: 100,
                      height: 130,
                      borderRadius: 2,
                      objectFit: "cover",
                    }}
                  />
                )}

                <Box sx={{ flex: 1, pr: 8 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {post.title}
                  </Typography>

                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    <strong>Description:</strong>{" "}
                    <span style={{ color: "#6b7280" }}>{post.description}</span>
                  </Typography>

                  <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
                    <strong>Review:</strong>{" "}
                    <span style={{ color: "#6b7280" }}>{post.review}</span>
                  </Typography>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        (post.likes?.length || 0) > 0 ? (
                          <FavoriteIcon sx={{ color: "#e91e63" }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ color: "#e91e63" }} />
                        )
                      }
                      sx={{
                        borderColor: "#e91e63",
                        color: "#e91e63",
                        borderRadius: 999,
                        textTransform: "none",
                        px: 1.5,
                        minWidth: 64,
                      }}
                      disabled
                    >
                      {post.likes?.length || 0}
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ChatBubbleOutlineIcon />}
                      onClick={() => navigate(`/posts/${post._id}/comments`)}
                    >
                      {commentCounts[post._id] ?? 0}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      <Modal open={editOpen} onClose={handleCloseEdit}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 520,
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Edit Post
          </Typography>

          <TextField
            label="Movie Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            size="small"
          />

          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            multiline
            minRows={2}
            size="small"
          />

          <TextField
            label="Review"
            value={editReview}
            onChange={(e) => setEditReview(e.target.value)}
            multiline
            minRows={2}
            size="small"
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {editingPost?.image && !removeEditImage && !editImage && (
              <Box
                component="img"
                src={toAbsoluteUrl(editingPost.image)}
                alt="Current post"
                sx={{
                  width: 140,
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            )}

            {editImage && (
              <Box
                component="img"
                src={URL.createObjectURL(editImage)}
                alt="Preview"
                sx={{
                  width: 110,
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            )}

            <Button
              variant="outlined"
              component="label"
              size="small"
              sx={{ width: 160 }}
            >
              Replace Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setEditImage(file);
                  if (file) setRemoveEditImage(false);
                }}
              />
            </Button>

            {(editingPost?.image || editImage) && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ width: 160 }}
                onClick={() => {
                  setEditImage(null);
                  setRemoveEditImage(true);
                }}
              >
                Remove Image
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <Button onClick={handleCloseEdit} variant="outlined">
              Cancel
            </Button>

            <Button variant="contained" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MyPostsPage;