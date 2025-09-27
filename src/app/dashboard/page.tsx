"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Sidebar from "../sidebar/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, LogOut, Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

// Helper function to sanitize image URLs
const sanitizeImageUrl = (url: string) => {
  if (!url) return "";
  const cleanUrl = url.split("?")[0]; // Remove query parameters
  return cleanUrl.replace(/[\(\)\s]/g, "_"); // Replace unsafe characters
};

// Determine if the URL should bypass Next.js optimization
const needsUnoptimized = (url: string) => {
  if (!url) return true;
  return /[\(\)]/.test(url);
};

const Dashboard = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [view, setView] = useState<"feed" | "notifications">("feed");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        // Fetch posts
        const resPosts = await axios.get<Post[]>(
          "https://socialmediabackend-9hqc.onrender.com/api/posts/",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mappedPosts: Post[] = resPosts.data.map((p) => ({
          ...p,
          total_likes: p.total_likes ?? 0,
          liked: p.liked ?? false,
          total_comments: p.total_comments ?? 0,
        }));
        setPosts(mappedPosts);

        // Fetch comments
        const commentsMapTemp: Record<number, Comment[]> = {};
        await Promise.all(
          mappedPosts.map(async (post) => {
            const resComments = await axios.get<Comment[]>(
              `https://socialmediabackend-9hqc.onrender.com/api/posts/${post.id}/comments/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            commentsMapTemp[post.id] = resComments.data;
          })
        );
        setCommentsMap(commentsMapTemp);
      } catch (err) {
        const error = err as AxiosError;
        console.error(error);
      }
    };

    fetchAll();
  }, [token]);

  const toggleLike = async (postId: number) => {
    if (!token) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              total_likes: p.liked ? p.total_likes - 1 : p.total_likes + 1,
            }
          : p
      )
    );

    try {
      await axios.post(
        `https://socialmediabackend-9hqc.onrender.com/api/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (postId: number, text: string) => {
    if (!token || !text.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: "You",
      content: text,
      created_at: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: prev[postId] ? [...prev[postId], newComment] : [newComment],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, total_comments: p.total_comments + 1 } : p
      )
    );

    try {
      await axios.post(
        `https://socialmediabackend-9hqc.onrender.com/api/posts/${postId}/comments/create/`,
        { content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const viewUserProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 h-screen border-r border-gray-700 bg-gray-900 fixed top-0 left-0 z-20">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-black z-10">
          <div></div>
          <Button
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 md:p-6">
          {view === "feed" &&
            posts.map((post) => (
              <Card
                key={post.id}
                className="p-4 shadow-lg bg-gray-900 mb-4 rounded-xl hover:shadow-gray-700 transition"
              >
                <div
                  className="flex items-center mb-2 cursor-pointer"
                  onClick={() => viewUserProfile(post.author)}
                >
                  <User className="w-6 h-6 mr-2 text-gray-300" />
                  <span className="font-medium text-white">{post.author}</span>
                </div>

                <p className="mb-2 text-white">{post.content}</p>

                {post.image_url && (
                  <Image
                    src={sanitizeImageUrl(post.image_url)}
                    alt="Post"
                    width={800}
                    height={500}
                    className="w-full max-h-96 object-cover rounded-lg mb-2"
                    unoptimized={needsUnoptimized(post.image_url)}
                  />
                )}

                <div className="flex items-center gap-6 mt-2">
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        post.liked ? "text-red-500 fill-red-500" : "text-gray-400"
                      }`}
                    />
                    <span className="ml-1 text-white">{post.total_likes}</span>
                  </button>

                  <button
                    className="flex items-center gap-1"
                    onClick={() =>
                      setOpenComments(openComments === post.id ? null : post.id)
                    }
                  >
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                    <span className="ml-1 text-white">{post.total_comments}</span>
                  </button>
                </div>

                {openComments === post.id && (
                  <div className="mt-4 space-y-2">
                    {commentsMap[post.id]?.map((c) => (
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
                        addComment(post.id, input.value);
                        input.value = "";
                      }}
                    >
                      <Input
                        name="comment"
                        placeholder="Add a comment..."
                        className="bg-gray-800 text-white text-sm rounded-lg"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                      >
                        Post
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default Dashboard;
