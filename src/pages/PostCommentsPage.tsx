import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

type Post = {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  sender: string;
  likes?: string[];
};

type Comment = {
  _id: string;
  comment: string;
  sender: string;
  createdAt?: string;
};

const API_BASE_URL = "http://localhost:3000";

const toAbsolute = (url?: string | null) =>
  url
    ? url.startsWith("http")
      ? url
      : `${API_BASE_URL}${url}`
    : undefined;

const PostCommentsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (!postId) return;

    fetchPost();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoadingPost(true);
      const res = await axios.get(`/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.error("Failed to fetch post", err);
    } finally {
      setLoadingPost(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await axios.get(`/comments/post/${postId}`);
      setComments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    try {
      if (!newComment.trim() || !postId) return;

      setSendingComment(true);

      await axios.post("/comments", {
        postId,
        comment: newComment,
      });

      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #cbd5e1, #a7bed3)",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Button
  variant="outlined"
  onClick={() => navigate(-1)}
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
    "&:hover": {
      bgcolor: "#ffffff",
    },
  }}
>
  Back
</Button>

        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 800,
            color: "#243b55",
            mb: 3,
          }}
        >
          Post Comments
        </Typography>

        {loadingPost ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : post ? (
          <Paper
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
              mb: 3,
            }}
          >
            {post.image && (
              <Box
                component="img"
                src={toAbsolute(post.image)}
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
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography align="center">Post not found</Typography>
          </Paper>
        )}

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#243b55", mb: 2 }}
          >
            Comments
          </Typography>

          <Stack spacing={2}>
            {loadingComments ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : comments.length > 0 ? (
              comments.map((item) => (
                <Paper
                  key={item._id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ color: "#243b55", mb: 0.5 }}
                  >
                    {item.sender}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", whiteSpace: "pre-line" }}
                  >
                    {item.comment}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">No comments yet</Typography>
            )}

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Write a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={sendingComment || !newComment.trim()}
              sx={{
                bgcolor: "#243b55",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#1b2c3a",
                },
              }}
            >
              {sendingComment ? "Adding..." : "Add Comment"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PostCommentsPage;