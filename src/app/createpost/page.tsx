"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "../sidebar/page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

const CreatePost = () => {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login first!");
      router.push("/login");
      return;
    }

    if (!content && !image) {
      toast.error("Please add content or an image!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image); // send file directly
      }

      await axios.post(
        "https://socialmediabackend-9hqc.onrender.com/api/posts/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Post created successfully!");
      setContent("");
      setImage(null);

      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      toast.error(error.response?.data?.detail || "Failed to create post");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Toaster position="top-right" />

      <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-700">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4 border-b border-gray-700">
          <Button
            variant="destructive"
            className="flex items-center gap-2 hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <div className="flex-1 p-6 flex justify-center items-start">
          <Card className="w-full max-w-2xl p-8 shadow-2xl rounded-2xl border border-gray-700 bg-gray-900">
            <h1 className="text-3xl font-bold mb-6 text-center">Create a New Post</h1>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <Textarea
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none border-2 border-gray-700 focus:border-purple-400 rounded-2xl p-3 bg-gray-800 text-white placeholder-gray-400"
              />

              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files ? e.target.files[0] : null)
                }
                className="border-2 border-gray-700 rounded-2xl p-2 bg-gray-800 text-white cursor-pointer"
              />

              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 rounded-2xl"
              >
                {loading ? "Posting..." : "Post Now"}
              </Button>
            </form>

            {image && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-2">Preview:</h3>
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  width={800}
                  height={500}
                  className="w-full max-h-80 object-cover rounded-2xl shadow-lg border border-purple-500"
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
