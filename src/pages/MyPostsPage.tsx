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
import CommentsDialog from "../components/CommentsDialog";

type Post = {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  likes?: string[];
};

const MyPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [dialogPost, setDialogPost] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editReview, setEditReview] = useState("");

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
        } catch (e) {
          next[p._id] = 0;
        }
      }
      setCommentCounts(next);
    };

    if (posts.length) {
      fetchCounts();
    }
  }, [posts]);

  const handleCommentAdded = () => {
    if (!dialogPost) return;
    setCommentCounts((prev) => ({
      ...prev,
      [dialogPost.id]: (prev[dialogPost.id] || 0) + 1,
    }));
  };

  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description);
    setEditReview(post.review);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingPost(null);
    setEditTitle("");
    setEditDescription("");
    setEditReview("");
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

      const res = await axios.put(
        `/posts/${editingPost._id}`,
        {
          title: editTitle,
          description: editDescription,
          review: editReview,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
    <Box sx={{ minHeight: "100vh", background: "#e3eaf2", py: 4 }}>
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
            You haven&apos;t posted anything yet.
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
                    src={`http://localhost:3000${post.image}`}
                    alt={post.title}
                    sx={{
                      width: 100,
                      height: 130,
                      borderRadius: 2,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}

                <Box sx={{ flex: 1, pr: 8 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {post.title}
                  </Typography>

                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    <strong style={{ color: "#000" }}>Description:</strong>{" "}
                    <span style={{ color: "#6b7280" }}>{post.description}</span>
                  </Typography>

                  <Typography
                    variant="body2"
                    mt={1}
                    sx={{ whiteSpace: "pre-line" }}
                  >
                    <strong style={{ color: "#000" }}>Review:</strong>{" "}
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
                      onClick={() =>
                        setDialogPost({ id: post._id, title: post.title })
                      }
                      sx={{
                        borderColor: "#607d8b",
                        color: "#607d8b",
                        borderRadius: 999,
                        textTransform: "none",
                        px: 1.5,
                        minWidth: 88,
                      }}
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

      <CommentsDialog
        open={!!dialogPost}
        postId={dialogPost?.id || ""}
        title={dialogPost?.title || ""}
        onClose={() => setDialogPost(null)}
        onCommentAdded={handleCommentAdded}
      />

      <Modal open={editOpen} onClose={handleCloseEdit}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
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
          />

          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <TextField
            label="Review"
            value={editReview}
            onChange={(e) => setEditReview(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={handleCloseEdit} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} variant="contained">
              Save Changes
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MyPostsPage;
