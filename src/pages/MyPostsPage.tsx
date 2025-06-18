import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

type Post = {
  _id: string;
  title: string;
  description: string;
  review: string;
  image?: string;
};

const MyPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);

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

  return (
    <Box sx={{ minHeight: "100vh", background: "#e3eaf2", py: 4 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#243b55", mb: 4 }}
        >
          My Movie Posts
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
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {post.description}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    <strong>Review:</strong> {post.review}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default MyPostsPage;
