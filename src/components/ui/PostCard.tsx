"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import UserCard from "./UserCard";

interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  image_url?: string;
  total_likes: number;
  liked: boolean;
  total_comments: number;
}

interface PostCardProps {
  post: Post;
  token: string | null;
  comments: Comment[];
  setCommentsMap: React.Dispatch<
    React.SetStateAction<Record<number, Comment[]>>
  >;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  token,
  comments,
  setCommentsMap,
  setPosts,
}) => {
  const [openComments, setOpenComments] = useState(false);

  // Toggle Like
  const toggleLike = async () => {
    if (!token) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              liked: !p.liked,
              total_likes: post.liked
                ? post.total_likes - 1
                : post.total_likes + 1,
            }
          : p
      )
    );

    try {
      await axios.post(
        `https://socialmediabackend-9hqc.onrender.com/api/posts/${post.id}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      const err = error as AxiosError;
      console.error("Toggle like failed:", err.response?.data || err.message);
    }
  };

  // Add Comment
  const addComment = async (text: string) => {
    if (!token || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: "You",
      content: text,
      created_at: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [post.id]: prev[post.id] ? [...prev[post.id], newComment] : [newComment],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, total_comments: p.total_comments + 1 } : p
      )
    );

    try {
      await axios.post(
        `https://socialmediabackend-9hqc.onrender.com/api/posts/${post.id}/comments/create/`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh comments
      const resComments = await axios.get<Comment[]>(
        `https://socialmediabackend-9hqc.onrender.com/api/posts/${post.id}/comments/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentsMap((prev) => ({ ...prev, [post.id]: resComments.data }));
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      console.error(
        "Add comment failed:",
        err.response?.data?.error || err.message
      );
    }
  };

  return (
    <Card key={post.id} className="p-4 shadow-lg bg-gray-900 mb-4">
      <UserCard username={post.author} />

      <p className="mb-2 text-white">{post.content}</p>

      {post.image_url && (
        <div className="w-full max-h-96 relative mb-2">
          <Image
            src={post.image_url}
            alt="Post"
            width={800}
            height={600}
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Likes & Comments */}
      <div className="flex items-center gap-6 mt-2">
        <button className="flex items-center gap-1" onClick={toggleLike}>
          <Heart
            className={`w-6 h-6 ${
              post.liked ? "text-red-500 fill-red-500" : "text-gray-400"
            }`}
          />
          <span className="ml-1 text-white">{post.total_likes}</span>
        </button>

        <button
          className="flex items-center gap-1"
          onClick={() => setOpenComments(!openComments)}
        >
          <MessageCircle className="w-6 h-6 text-gray-400" />
          <span className="ml-1 text-white">{post.total_comments}</span>
        </button>
      </div>

      {/* Comment Section */}
      {openComments && (
        <div className="mt-4 space-y-2">
          {comments?.map((c) => (
            <div key={c.id} className="text-sm text-gray-300">
              <span className="font-medium text-white">{c.author}:</span>{" "}
              {c.content}
            </div>
          ))}
          <form
            className="flex gap-2 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "comment"
              ) as HTMLInputElement;
              addComment(input.value);
              input.value = "";
            }}
          >
            <Input
              name="comment"
              placeholder="Add a comment..."
              className="bg-gray-800 text-white text-sm"
            />
            <Button type="submit" size="sm">
              Post
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
