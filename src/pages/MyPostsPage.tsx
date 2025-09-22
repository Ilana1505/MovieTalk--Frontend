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
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CommentsDialog from "../components/CommentsDialog"; // ← להשתמש במודאל שכבר יש לך

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
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [dialogPost, setDialogPost] = useState<{ id: string; title: string } | null>(null);

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

  // שליפת מוני תגובות לכל פוסט
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
    if (posts.length) fetchCounts();
  }, [posts]);

  // נקרא כשנוספה תגובה במודאל – מגדיל מיידית את המונה
  const handleCommentAdded = () => {
    if (!dialogPost) return;
    setCommentCounts((prev) => ({
      ...prev,
      [dialogPost.id]: (prev[dialogPost.id] || 0) + 1,
    }));
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
                }}
              >
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

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {post.description}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    <strong>Review:</strong> {post.review}
                  </Typography>

                  {/* פעולות בצד ימין: לייקים + תגובות */}
                  <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
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
                      onClick={() => setDialogPost({ id: post._id, title: post.title })}
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

      {/* מודאל תגובות — אותו קומפוננט שהשתמשת בו בפיד */}
      <CommentsDialog
        open={!!dialogPost}
        postId={dialogPost?.id || ""}
        title={dialogPost?.title || ""}
        onClose={() => setDialogPost(null)}
        onCommentAdded={handleCommentAdded}
      />
    </Box>
  );
};

export default MyPostsPage;
