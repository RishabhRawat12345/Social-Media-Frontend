"use client";

import { useState, ChangeEvent } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserType {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
}

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setUsers([]);
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `https://socialmediabackend-9hqc.onrender.com/api/users/search-users/?q=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white py-6 px-4 sm:px-6 md:px-12 lg:px-24">
      {/* Back & Logout */}
      <div className="flex justify-between items-center mb-6">
        <Button
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Button
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        Search Users
      </h2>
      <div className="flex items-center gap-2 mb-6">
        <Input
          placeholder="Search by username, first or last name..."
          value={query}
          className="bg-gray-800 text-white placeholder-gray-400 border-0 focus:ring-0 flex-1 rounded-lg shadow-inner"
          onChange={handleSearch}
        />
      </div>
      {loading ? (
        <div className="flex justify-center mt-6">
          <Loader2 className="animate-spin h-10 w-10 text-white" />
        </div>
      ) : users.length > 0 ? (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-black/30 backdrop-blur-md p-4 rounded-xl hover:shadow-lg hover:shadow-gray-700 transition cursor-pointer border border-gray-700"
              onClick={() => handleViewProfile(user.username)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <span className="text-white font-semibold">{user.username}</span>
                  <div className="text-gray-400 text-sm">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
              </div>
              <Button className="bg-black  text-white px-4 py-1 rounded-lg shadow-md transition">
                View
              </Button>
            </div>
          ))}
        </div>
      ) : query ? (
        <div className="text-gray-400 mt-6 text-center text-lg">
          No users found
        </div>
      ) : null}
    </div>
  );
};

export default SearchUsers;
