import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Slide,
  Alert,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Comment = {
  _id?: string;
  sender?: string;        
  senderAvatar?: string;   
  comment?: string;        
  createdAt?: string;
};

interface Props {
  open: boolean;
  postId: string;
  title: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

function extractComments(data: any): Comment[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const toAbsolute = (url?: string) =>
  url
    ? url.startsWith("http")
      ? url
      : `http://localhost:3000${url}`
    : undefined;

const CommentsDialog: React.FC<Props> = ({
  open,
  postId,
  title,
  onClose,
  onCommentAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchComments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`/comments/post/${postId}`, {
        headers: { ...authHeaders() },
        withCredentials: true,
      });
      setComments(extractComments(res.data));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && postId) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId]);

  const handleAddComment = async () => {
    const body = newComment.trim();
    if (!body) return;

    setPosting(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/comments",
        { comment: body, postId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const created: Comment = res.data;

      setComments((prev) => [...prev, created]);
      setNewComment("");
      onCommentAdded?.();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Failed to add comment"
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        sx={{ textAlign: "center", fontWeight: 800, letterSpacing: 0.2, pb: 1.5 }}
      >
        Comments • {title}
      </DialogTitle>

      <DialogContent dividers sx={{ px: 2.25 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
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
            <Typography sx={{ fontWeight: 700 }}>No comments yet.</Typography>
            <Typography variant="caption">
              Be the first to share your thoughts.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ py: 0.5 }}>
            {comments.map((c, idx) => (
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
                    <Avatar src={toAbsolute(c.senderAvatar)}>
                      {(c.sender?.[0] || "?").toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600 }}>
                        {c.sender || "Anonymous"}
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
                          {c.comment}
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
                {idx < comments.length - 1 && (
                  <Divider component="li" sx={{ my: 0.75 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <Box sx={{ px: 2.25, pt: 1.5 }}>
        <TextField
          fullWidth
          placeholder="Write a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          multiline
          minRows={2}
        />
      </Box>

      <DialogActions sx={{ px: 2.25, py: 1.75 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, px: 2.5, color: "#243b55" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAddComment}
          disabled={posting || !newComment.trim()}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 2.5,
            bgcolor: "#243b55",
            "&:hover": { bgcolor: "#1d304a" },
          }}
        >
          {posting ? "Posting…" : "Post Comment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentsDialog;
