"use client";

import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const getAuthToken = (): string | null =>
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("authToken");

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

  const handleAxiosError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || err.message;
    }
    return (err as Error).message || "An unknown error occurred";
  };

  const fetchPosts = useCallback(async () => {
    try {
      const res = await apiClient.get<Post[]>("auth/admin/posts/");
      setPosts(res.data);
      setError("");
    } catch (err: unknown) {
      console.error(err);
      setError(`Failed to fetch posts: ${handleAxiosError(err)}`);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get<User[]>("auth/admin/users/");
      setUsers(res.data);
      setError("");
    } catch (err: unknown) {
      console.error(err);
      setError(`Failed to fetch users: ${handleAxiosError(err)}`);
    }
  }, []);

  const fetchUserDetail = async (userId: number) => {
    try {
      const res = await apiClient.get<User>(`auth/admin/users/${userId}/`);
      setSelectedUser(res.data);
      setError("");
    } catch (err: unknown) {
      console.error(err);
      setError(`Failed to fetch user detail: ${handleAxiosError(err)}`);
    }
  };

  const togglePostActive = async (postId: number, currentStatus: boolean) => {
    try {
      await apiClient.put(`auth/admin/posts/${postId}/`, { is_active: !currentStatus });
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, is_active: !currentStatus } : post))
      );
    } catch (err: unknown) {
      console.error(err);
      setError(`Failed to update post: ${handleAxiosError(err)}`);
    }
  };

  const updateUserField = async (
    userId: number,
    field: "is_active" | "is_staff",
    value: boolean
  ) => {
    try {
      await apiClient.put(`auth/admin/users/${userId}/`, { [field]: value });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, [field]: value } : user))
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, [field]: value });
      }
      setError("");
    } catch (err: unknown) {
      console.error(err);
      setError(`Failed to update user: ${handleAxiosError(err)}`);
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
  }, [fetchPosts, fetchUsers]);

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Admin Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 h-screen border-r border-gray-700 bg-gray-900 fixed top-0 left-0 z-20 p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
        <Button
          className={activeTab === "posts" ? "bg-purple-600" : "bg-gray-700"}
          onClick={() => setActiveTab("posts")}
        >
          Manage Posts
        </Button>
        <Button
          className={activeTab === "users" ? "bg-purple-600" : "bg-gray-700"}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-10">
          <h1 className="text-2xl font-bold">{activeTab === "posts" ? "Posts" : "Users"}</h1>
        </div>

        <ScrollArea className="flex-1 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-800 bg-opacity-80 p-4 rounded-xl shadow-lg hover:shadow-gray-600 transition flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">Post ID: {post.id}</p>
                    <p>Author: {post.author}</p>
                    <p>Content: {post.content}</p>
                    <p>Status: {post.is_active ? "Active" : "Inactive"}</p>
                  </div>
                  <Button
                    className={post.is_active ? "bg-red-500" : "bg-green-500"}
                    onClick={() => togglePostActive(post.id, post.is_active)}
                  >
                    {post.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-800 bg-opacity-80 p-4 rounded-xl shadow-lg cursor-pointer hover:shadow-gray-600 transition"
                  onClick={() => fetchUserDetail(user.id)}
                >
                  <p className="font-semibold">User ID: {user.id}</p>
                  <p>Username: {user.username}</p>
                  <p>Email: {user.email}</p>
                  <p>Status: {user.is_active ? "Active" : "Inactive"}</p>
                  <p>Staff: {user.is_staff ? "Yes" : "No"}</p>
                </div>
              ))}

              {selectedUser && (
                <div className="from-gray-900 via-gray-800 to-black bg-opacity-10 border border-blue-400 p-4 rounded-xl mt-6">
                  <h3 className="text-xl font-bold mb-2">User Detail</h3>
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>Username:</strong> {selectedUser.username}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  {selectedUser.first_name && <p><strong>First Name:</strong> {selectedUser.first_name}</p>}
                  {selectedUser.last_name && <p><strong>Last Name:</strong> {selectedUser.last_name}</p>}
                  <p><strong>Status:</strong> {selectedUser.is_active ? "Active" : "Inactive"}</p>
                  <p><strong>Staff:</strong> {selectedUser.is_staff ? "Yes" : "No"}</p>

                  <div className="mt-4 flex gap-2">
                    <Button
                      className={selectedUser.is_active ? "bg-red-500" : "bg-green-500"}
                      onClick={() => updateUserField(selectedUser.id, "is_active", !selectedUser.is_active)}
                    >
                      {selectedUser.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      className={selectedUser.is_staff ? "bg-red-700" : "bg-blue-500"}
                      onClick={() => updateUserField(selectedUser.id, "is_staff", !selectedUser.is_staff)}
                    >
                      {selectedUser.is_staff ? "Remove Staff" : "Make Staff"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminPanel;
