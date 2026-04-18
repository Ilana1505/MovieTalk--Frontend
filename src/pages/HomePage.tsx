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
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "../utils/url";

interface Post {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  sender: string;
  likes?: string[];
}

interface PostsResponse {
  posts: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 5;
const toAbsolute = (url?: string | null) => toAbsoluteUrl(url);

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
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfileThenPosts = async () => {
      await fetchUserProfile();
      await fetchPosts(1, false);
    };

    loadProfileThenPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchCommentCounts();
    } else {
      setCommentCounts({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const fetchPosts = async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingPosts(true);
      }

      const res = await axios.get<PostsResponse>("/posts", {
        params: {
          page: pageToLoad,
          limit: PAGE_SIZE,
        },
      });

      const newPosts = res.data.posts || [];

      setPosts((prev) => {
        if (!append) return newPosts;

        const existingIds = new Set(prev.map((post) => post._id));
        const uniqueNewPosts = newPosts.filter((post) => !existingIds.has(post._id));
        return [...prev, ...uniqueNewPosts];
      });

      setPage(res.data.page);
      setHasMore(res.data.hasMore);
      setIsSearchMode(false);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || isSearchMode) return;
    await fetchPosts(page + 1, true);
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token || token === "null" || token === "undefined") {
        navigate("/login");
        return;
      }

      const res = await axios.get("/auth/check");
      setProfilePicture(res.data.profilePicture || null);
      setProfileImageError(false);
      setUserId(res.data._id);
    } catch (err: any) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const fetchCommentCounts = async () => {
    try {
      const counts: { [key: string]: number } = {};

      await Promise.all(
        posts.map(async (post) => {
          const res = await axios.get(`/comments/post/${post._id}`);
          counts[post._id] = res.data.length;
        })
      );

      setCommentCounts(counts);
    } catch (err) {
      console.error("Failed to fetch comment counts", err);
    }
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

      if (imageFile) {
        formData.append("image", imageFile);
      }

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

      await fetchPosts(1, false);
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  const runAiSearch = async () => {
    try {
      setAiSearchLoading(true);

      const res = await axios.post("/ai/free-search", { query: aiQuery });
      const results = Array.isArray(res.data) ? res.data : res.data?.results;

      if (!Array.isArray(results)) {
        alert("Search response format is invalid");
        return;
      }

      setPosts(results);
      setHasMore(false);
      setIsSearchMode(true);

      if (results.length === 0) {
        alert("No results found for this query");
      }
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
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setIsSearchMode(false);
    await fetchPosts(1, false);
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
        onClick={() => navigate("/profile")}
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
              label="Smart search"
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

        {loadingPosts && posts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                        onClick={() => navigate(`/posts/${post._id}/comments`)}
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
        )}

        {!loadingPosts && posts.length === 0 && (
          <Typography align="center" sx={{ mt: 4, color: "#243b55" }}>
            No posts found
          </Typography>
        )}

        {!isSearchMode && hasMore && posts.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="contained"
              onClick={loadMorePosts}
              disabled={loadingMore}
              sx={{
                bgcolor: "#243b55",
                px: 4,
                py: 1,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#1b2c3a" },
              }}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </Box>
        )}
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
              {aiLoading ? "Generating..." : "Generate Description"}
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
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                  }
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
    </Box>
  );
};

export default HomePage;