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
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import CommentsDialog from "../components/CommentsDialog";

interface Post {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  sender: string;
  likes?: string[];
}

const toAbsolute = (url?: string | null) =>
  url
    ? url.startsWith("http")
      ? url
      : `http://localhost:3000${url}`
    : undefined;

const HomePage: React.FC = () => {
  const [aiQuery, setAiQuery] = useState("");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [review, setReview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [commentCounts, setCommentCounts] = useState<{
    [postId: string]: number;
  }>({});
  const [active, setActive] = useState<{ id: string; title: string } | null>(
    null
  );

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfileThenPosts = async () => {
      await fetchUserProfile();
      await fetchPosts();
    };
    loadProfileThenPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (posts.length > 0) fetchCommentCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/posts");

      const sorted = [...res.data].sort((a: any, b: any) =>
        (b._id || "").localeCompare(a._id || "")
      );

      setPosts(sorted);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🏠 HomePage fetchUserProfile token:", token);

      if (!token || token === "null" || token === "undefined") {
        console.log("🏠 No valid token -> redirect login");
        navigate("/login");
        return;
      }

      const res = await axios.get("/auth/check");
      console.log("🏠 /auth/check success:", res.data);

      setProfilePicture(res.data.profilePicture || null);
      setProfileImageError(false);
      setUserId(res.data._id);
    } catch (err: any) {
      console.error("Failed to fetch user profile", err);
      console.log("🏠 /auth/check status:", err?.response?.status);
      console.log("🏠 /auth/check data:", err?.response?.data);
    }
  };

  const fetchCommentCounts = async () => {
    const counts: { [key: string]: number } = {};
    for (const post of posts) {
      const res = await axios.get(`/comments/post/${post._id}`);
      counts[post._id] = res.data.length;
    }
    setCommentCounts(counts);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await axios.post(`/posts/${postId}/like`, {});

      const { message } = res.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes:
                  message === "Post liked"
                    ? [...(post.likes || []), userId]
                    : (post.likes || []).filter((id) => id !== userId),
              }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleCreatePost = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("review", review);
      if (imageFile) formData.append("image", imageFile);

      await axios.post("/posts", formData, {
        headers: {
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

  const openComments = (post: Post) =>
    setActive({ id: post._id, title: post.title });

  const closeComments = () => setActive(null);

  const bumpCommentsCount = () => {
    if (!active) return;
    setCommentCounts((prev) => ({
      ...prev,
      [active.id]: (prev[active.id] || 0) + 1,
    }));
  };

  const runAiSearch = async () => {
    try {
      setAiSearchLoading(true);

      console.log("=== AI SEARCH START ===");
      console.log("Query:", aiQuery);

      const res = await axios.post("/ai/free-search", { query: aiQuery });

      console.log("AI SEARCH RESPONSE status:", res.status);
      console.log("AI SEARCH RESPONSE data:", res.data);

      const results = Array.isArray(res.data) ? res.data : res.data?.results;

      if (!Array.isArray(results)) {
        console.warn("Unexpected response shape, expected results array.");
        alert("Search response format is invalid");
        return;
      }

      setPosts(results);

      if (results.length === 0) {
        alert("No results found for this query");
      }

      console.log("=== AI SEARCH END ===");
    } catch (e: any) {
      console.log("=== AI SEARCH ERROR ===");
      console.log("Status:", e?.response?.status);
      console.log("Data:", e?.response?.data);
      console.log("Full error:", e);
      alert(e?.response?.data?.message || "AI search failed");
    } finally {
      setAiSearchLoading(false);
    }
  };

  const resetSearch = async () => {
    setAiQuery("");
    await fetchPosts();
  };

  const generateDescriptionWithAI = async () => {
    try {
      setAiLoading(true);

      const res = await axios.post("/ai/generate-description", { title });

      setDescription(res.data.description);
    } catch (e: any) {
      alert(e?.response?.data?.message || "AI failed");
    } finally {
      setAiLoading(false);
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
        onClick={() => {
          console.log("🏠 going profile. token=", localStorage.getItem("token"));
          navigate("/profile");
        }}
        sx={{ position: "absolute", top: 20, left: 20 }}
      >
        {profilePicture && !profileImageError ? (
          <Box
            component="img"
            src={toAbsolute(profilePicture)}
            alt="Profile"
            onError={() => setProfileImageError(true)}
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
            mb: 3,
            letterSpacing: 1,
          }}
        >
          <span style={{ color: "#243b55" }}>MovieTalk</span> Community
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: "100%",
              maxWidth: 520,
            }}
          >
            <TextField
              fullWidth
              label="Smart search (AI)"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              size="small"
            />

            <Button
              variant="contained"
              onClick={runAiSearch}
              disabled={aiSearchLoading || aiQuery.trim().length < 2}
              sx={{
                bgcolor: "#243b55",
                whiteSpace: "nowrap",
                px: 2,
                minWidth: 110,
                height: 40,
              }}
            >
              {aiSearchLoading ? "Searching..." : "Search"}
            </Button>

            <Button
              variant="outlined"
              onClick={resetSearch}
              sx={{
                whiteSpace: "nowrap",
                px: 2,
                minWidth: 90,
                height: 40,
                borderColor: "#243b55",
                color: "#243b55",
              }}
            >
              Reset
            </Button>
          </Stack>
        </Box>

        <Stack spacing={2}>
          {posts.map((post) => {
            const hasLiked = post.likes?.includes(userId);
            return (
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
                      onClick={() => handleLike(post._id)}
                      variant="outlined"
                      size="small"
                      startIcon={
                        hasLiked ? (
                          <FavoriteIcon sx={{ color: "#e91e63" }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ color: "#e91e63" }} />
                        )
                      }
                      sx={{
                        borderColor: "#e91e63",
                        color: "#e91e63",
                        fontWeight: 600,
                        borderRadius: 999,
                        px: 2,
                        textTransform: "none",
                      }}
                    >
                      {post.likes?.length || 0}
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ChatBubbleOutlineIcon />}
                      onClick={() => openComments(post)}
                      sx={{
                        borderColor: "#607d8b",
                        color: "#607d8b",
                        fontWeight: 600,
                        borderRadius: 999,
                        px: 2,
                        textTransform: "none",
                      }}
                    >
                      ({commentCounts[post._id] || 0}) Comments
                    </Button>
                  </Box>
                </Box>
              </Paper>
            );
          })}
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
            width: 420,
            bgcolor: "#edf2f7",
            borderRadius: 4,
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.25)",
            p: 4,
            border: "2px solid #243b55",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 700,
              color: "#243b55",
              mb: 2,
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: 1,
            }}
          >
            Create New Post
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
            />

            <Button
              variant="outlined"
              onClick={generateDescriptionWithAI}
              disabled={aiLoading || title.trim().length < 2}
              sx={{
                borderColor: "#243b55",
                color: "#243b55",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#d9e4f5",
                  borderColor: "#243b55",
                },
              }}
            >
              {aiLoading ? "Generating..." : "Generate Description (AI)"}
            </Button>

            <TextField
              fullWidth
              label="Review"
              multiline
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              variant="outlined"
            />

            <Button
              variant="outlined"
              component="label"
              sx={{
                borderColor: "#243b55",
                color: "#243b55",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#d9e4f5",
                  borderColor: "#243b55",
                },
              }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                }}
              />
            </Button>

            {imageFile && (
              <Typography variant="caption" sx={{ color: "#444", pl: 1 }}>
                Selected: {imageFile.name}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              disabled={!title.trim() || !description.trim() || !review.trim()}
              onClick={handleCreatePost}
              sx={{
                mt: 1,
                bgcolor: "#243b55",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1,
                "&:hover": { bgcolor: "#1b2c3a" },
              }}
            >
              Publish
            </Button>
          </Stack>
        </Box>
      </Modal>

      {active && (
        <CommentsDialog
          open={!!active}
          postId={active.id}
          title={active.title}
          onClose={closeComments}
          onCommentAdded={bumpCommentsCount}
        />
      )}
    </Box>
  );
};

export default HomePage;