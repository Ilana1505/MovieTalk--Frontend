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
import { toAbsoluteUrl } from "../utils/url";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
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
  const [errorMsg, setErrorMsg] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get(`/comments/post/${postId}`);
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
  }, [open, postId]);

  const handleAddComment = async () => {
    const body = newComment.trim();
    if (!body) return;

    setPosting(true);
    setErrorMsg("");

    try {
      const res = await axios.post("/comments", {
        comment: body,
        postId,
      });

      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      onCommentAdded?.();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || "Failed to add comment");
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
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        Comments • {title}
      </DialogTitle>

      <DialogContent dividers>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Typography align="center">No comments yet</Typography>
        ) : (
          <List>
            {comments.map((c, i) => (
              <React.Fragment key={c._id || i}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={toAbsoluteUrl(c.senderAvatar)} />{" "}
                    {/* ✅ תיקון */}
                  </ListItemAvatar>

                  <ListItemText
                    primary={c.sender || "Anonymous"}
                    secondary={c.comment}
                  />
                </ListItem>

                {i < comments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
      </Box>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || posting}
        >
          {posting ? "Posting..." : "Post"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentsDialog;
