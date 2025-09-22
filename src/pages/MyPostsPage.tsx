import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Chip,
  Slide,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

type Comment = {
  _id: string;
  author?: { fullName?: string; avatar?: string } | string;
  content: string;
  createdAt?: string;
};

type Post = {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
  likesCount?: number;
  commentsCount?: number;
  likes?: any[];
  comments?: any[];
  createdAt?: string;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MyPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [activePostTitle, setActivePostTitle] = useState("");
  const [activeComments, setActiveComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/posts/my-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data) ? res.data : res.data.posts || [];
        setPosts(list);
      } catch (err) {
        console.error("Failed to fetch my posts", err);
      }
    };
    fetchMyPosts();
  }, []);

  const openComments = async (post: Post) => {
    setCommentsOpen(true);
    setActivePostTitle(post.title);
    setActiveComments([]);
    setCommentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      // עדכני אם הנתיב שונה אצלך בשרת
      const res = await axios.get(`/posts/${post._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list: Comment[] = Array.isArray(res.data)
        ? res.data
        : res.data.comments || [];
      setActiveComments(list);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const closeComments = () => {
    setCommentsOpen(false);
    setActiveComments([]);
  };

  const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";

  return (
    <Box sx={{ minHeight: "100vh", background: "#e3eaf2", py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 900, color: "#243b55", mb: 4, letterSpacing: 0.3 }}
        >
          My Posts
        </Typography>

        {posts.length === 0 ? (
          <Typography align="center" color="text.secondary">
            You haven't posted anything yet.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {posts.map((post) => {
              const likes =
                post.likesCount ?? (post.likes ? post.likes.length : 0) ?? 0;
              const commentsCount =
                post.commentsCount ??
                (post.comments ? post.comments.length : 0) ??
                0;

              return (
                <Paper
                  key={post._id}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: 2,
                    bgcolor: "#fff",
                    alignItems: "center",
                  }}
                >
                  {post.image && (
                    <Box
                      component="img"
                      src={`${apiBase}${post.image}`}
                      alt={post.title}
                      sx={{
                        width: 110,
                        height: 140,
                        borderRadius: 2,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* תוכן הפוסט */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Description:</strong> {post.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Review:</strong> {post.review}
                    </Typography>
                  </Box>

                  {/* מונים בצד ימין */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.25,
                      alignItems: "center",
                      ml: "auto",
                      minWidth: 170,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Chip
                      icon={<FavoriteIcon fontSize="small" />}
                      label={likes}
                      variant="outlined"
                      sx={{ borderRadius: "999px", fontWeight: 600, px: 0.5 }}
                    />
                    <Chip
                      icon={<ChatBubbleOutlineIcon fontSize="small" />}
                      label={commentsCount}
                      variant="outlined"
                      onClick={() => openComments(post)}
                      sx={{
                        borderRadius: "999px",
                        fontWeight: 600,
                        px: 0.5,
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* חלונית תגובות – בלי אייקונים, כותרת נקייה, כפתור מותאם */}
      <Dialog
        open={commentsOpen}
        onClose={closeComments}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
            border: "1px solid rgba(0,0,0,0.06)",
          },
        }}
        BackdropProps={{
          sx: {
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(15,23,42,0.35)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 800,
            letterSpacing: 0.2,
            pb: 1.5,
          }}
        >
          Comments • {activePostTitle}
        </DialogTitle>

        <DialogContent dividers sx={{ px: 2.25 }}>
          {commentsLoading ? (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : activeComments.length === 0 ? (
            <Box
              sx={{
                py: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "text.secondary",
                gap: 0.75,
              }}
            >
              {/* ללא אייקון */}
              <Typography sx={{ fontWeight: 700 }}>
                No comments yet.
              </Typography>
              <Typography variant="caption">
                Be the first to share your thoughts.
              </Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ py: 0.5 }}>
              {activeComments.map((c, idx) => (
                <React.Fragment key={c._id || idx}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: 1,
                      py: 1.25,
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "grey.50" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          typeof c.author === "object" && c.author?.avatar
                            ? c.author.avatar
                            : undefined
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600 }}>
                          {typeof c.author === "object" && c.author?.fullName
                            ? c.author.fullName
                            : typeof c.author === "string"
                            ? c.author
                            : "Anonymous"}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {c.content}
                          </Typography>
                          {c.createdAt && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {new Date(c.createdAt).toLocaleString()}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {idx < activeComments.length - 1 && (
                    <Divider component="li" sx={{ my: 0.75 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.25, py: 1.75 }}>
          <Button
            onClick={closeComments}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 2.5,
              // צבע מותאם ללוק הכללי של האתר
              bgcolor: "#243b55",
              "&:hover": { bgcolor: "#1d304a" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPostsPage;
