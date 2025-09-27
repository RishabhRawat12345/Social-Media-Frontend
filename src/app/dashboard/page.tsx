"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../sidebar/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Post {
  id: number;
  author: string;
  content: string;
  is_active: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  first_name?: string;
  last_name?: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const getAuthToken = (): string | null => {
    return localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("authToken");
  };

  const apiClient = axios.create({
    baseURL: "https://socialmediabackend-9hqc.onrender.com/api/",
    headers: { "Content-Type": "application/json" },
  });

  apiClient.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get<Post[]>("auth/admin/posts/");
      setPosts(res.data);
      setError("");
    } catch (err: any) {
      setError(`Failed to fetch posts: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get<User[]>("auth/admin/users/");
      setUsers(res.data);
      setError("");
    } catch (err: any) {
      setError(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      const res = await apiClient.get<User>(`auth/admin/users/${userId}/`);
      setSelectedUser(res.data);
      setError("");
    } catch (err: any) {
      setError(`Failed to fetch user detail: ${err.response?.data?.message || err.message}`);
    }
  };

  const togglePostActive = async (postId: number, currentStatus: boolean) => {
    try {
      await apiClient.put(`auth/admin/posts/${postId}/`, { is_active: !currentStatus });
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, is_active: !currentStatus } : post))
      );
    } catch (err: any) {
      setError(`Failed to update post: ${err.response?.data?.message || err.message}`);
    }
  };

  const updateUserField = async (userId: number, field: "is_active" | "is_staff", value: boolean) => {
    try {
      await apiClient.put(`auth/admin/users/${userId}/`, { [field]: value });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, [field]: value } : user
        )
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, [field]: value });
      }
      setError("");
    } catch (err: any) {
      setError(`Failed to update user: ${err.response?.data?.message || err.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }
      await fetchPosts();
      await fetchUsers();
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 h-screen border-r border-gray-700 bg-gray-900 fixed top-0 left-0 z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h1 className="text-2xl font-bold">{activeTab === "posts" ? "Posts" : "Users"}</h1>
        </div>

        <ScrollArea className="flex-1 p-6">
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {activeTab === "posts" &&
            posts.map((post) => (
              <Card
                key={post.id}
                className="p-4 mb-4 bg-gray-800 rounded-xl shadow-md hover:shadow-gray-600 transition"
              >
                <p className="font-semibold text-white mb-1">Post ID: {post.id}</p>
                <p className="text-gray-300 mb-2">Author: {post.author}</p>
                <p className="text-gray-200 mb-2">{post.content}</p>
                <p className="text-sm mb-2">
                  Status: {post.is_active ? "Active" : "Inactive"}
                </p>
                <Button
                  className={`mt-2 ${post.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                  onClick={() => togglePostActive(post.id, post.is_active)}
                >
                  {post.is_active ? "Deactivate" : "Activate"}
                </Button>
              </Card>
            ))}

          {activeTab === "users" &&
            users.map((user) => (
              <Card
                key={user.id}
                className="p-4 mb-4 bg-gray-800 rounded-xl shadow-md hover:shadow-gray-600 transition cursor-pointer"
                onClick={() => fetchUserDetail(user.id)}
              >
                <p className="font-semibold text-white mb-1">User ID: {user.id}</p>
                <p className="text-gray-300 mb-1">Username: {user.username}</p>
                <p className="text-gray-300 mb-1">Email: {user.email}</p>
                <p className="text-sm mb-1">Status: {user.is_active ? "Active" : "Inactive"}</p>
                <p className="text-sm mb-1">Staff: {user.is_staff ? "Yes" : "No"}</p>
              </Card>
            ))}

          {selectedUser && (
            <Card className="bg-gray-700 p-4 rounded-xl shadow-md mt-4">
              <p className="font-semibold mb-1">User Detail - ID: {selectedUser.id}</p>
              <p className="mb-1">Username: {selectedUser.username}</p>
              <p className="mb-1">Email: {selectedUser.email}</p>
              {selectedUser.first_name && <p className="mb-1">First Name: {selectedUser.first_name}</p>}
              {selectedUser.last_name && <p className="mb-1">Last Name: {selectedUser.last_name}</p>}
              <p className="mb-1">Status: {selectedUser.is_active ? "Active" : "Inactive"}</p>
              <p className="mb-2">Staff: {selectedUser.is_staff ? "Yes" : "No"}</p>

              <div className="flex gap-2">
                <Button
                  className={`${
                    selectedUser.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                  onClick={() => updateUserField(selectedUser.id, "is_active", !selectedUser.is_active)}
                >
                  {selectedUser.is_active ? "Deactivate" : "Activate"}
                </Button>

                <Button
                  className={`${
                    selectedUser.is_staff ? "bg-red-700 hover:bg-red-800" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => updateUserField(selectedUser.id, "is_staff", !selectedUser.is_staff)}
                >
                  {selectedUser.is_staff ? "Remove Staff" : "Make Staff"}
                </Button>
              </div>
            </Card>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminPanel;
