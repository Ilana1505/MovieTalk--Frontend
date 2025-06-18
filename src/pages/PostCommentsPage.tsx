import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Stack } from "@mui/material";

interface Comment {
  _id: string;
  comment: string;
  sender: string;
}

const PostCommentsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const res = await axios.get(`/comments/post/${postId}`);
      setComments(res.data);
    };
    fetchComments();
  }, [postId]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Comments</Typography>
      <Stack spacing={2}>
        {comments.map((comment) => (
          <Paper key={comment._id} sx={{ p: 2 }}>
            <Typography>{comment.comment}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default PostCommentsPage;
