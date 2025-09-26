"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Info, MapPin, ArrowLeft, LogOut, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast, { Toaster } from "react-hot-toast";

interface UserProfile {
  id: number;
  username: string;
  bio?: string;
  location?: string;
  avatar_url?: string | null;
  followers_count?: number;
  following_count?: number;
  is_me?: boolean;
}

const ProfilePage = () => {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ bio: "", location: "" });
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const myId =
    typeof window !== "undefined" ? Number(localStorage.getItem("user_id")) : null;

  useEffect(() => {
    if (!token || !username) return setLoading(false);

    const fetchProfile = async () => {
      try {
        // fetch user profile
        const profileRes = await axios.get(
          `https://socialmediabackend-9hqc.onrender.com/api/users/${username}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userData = profileRes.data;

        setProfile({
          id: userData.id,
          username: userData.username,
          bio: userData.bio || "",
          location: userData.location || "",
          avatar_url: userData.avatar_url || null,
          is_me: userData.is_me || false,
        });

        setForm({
          bio: userData.bio || "",
          location: userData.location || "",
        });

        // fetch stats
        const statsRes = await axios.get(
          `https://socialmediabackend-9hqc.onrender.com/api/followers/${userData.id}/stats/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers_count: statsRes.data.followers_count,
                following_count: statsRes.data.following_count,
              }
            : prev
        );

        if (!userData.is_me && myId) {
          setIsFollowing(statsRes.data.followers_ids?.includes(myId) || false);
        }
      } catch (err) {
        toast.error("Failed to fetch profile!");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, token, myId]);

  const handleFollowToggle = async () => {
    if (!token || !profile?.id || !myId) return;

    if (profile.is_me) {
      toast.error("You cannot follow your own account!");
      return;
    }

    if (isFollowing) return;

    try {
      await axios.post(
        `https://socialmediabackend-9hqc.onrender.com/api/followers/${profile.id}/follow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsFollowing(true);
      setProfile((prev) =>
        prev
          ? { ...prev, followers_count: (prev.followers_count || 0) + 1 }
          : prev
      );

      toast.success(`You are now following ${profile.username}!`);
    } catch {
      toast.error("Failed to follow user");
    }
  };

  const handleUpdate = async () => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("bio", form.bio);
      formData.append("location", form.location);
      if (newProfileImage) formData.append("avatar", newProfileImage);

      const res = await axios.put(
        "https://socialmediabackend-9hqc.onrender.com/api/users/me/update/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(res.data);
      setNewProfileImage(null);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setNewProfileImage(e.target.files[0]);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-6 px-4 sm:px-6 md:px-12 lg:px-24 relative">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f1f2e",
            color: "#fff",
            border: "1px solid #7f5af0",
          },
        }}
      />

      {/* Back & Logout */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 text-white bg-gray-800 hover:text-purple-400"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          variant="destructive"
          className="flex items-center gap-2 hover:bg-red-700"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* Profile Header */}
      {profile && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-gradient-to-tr from-purple-500 via-pink-500 to-red-500 overflow-hidden">
              <img
                src={
                  newProfileImage
                    ? URL.createObjectURL(newProfileImage)
                    : profile.avatar_url || "/default-avatar.png"
                }
                alt="Profile"
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 sm:gap-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <h2 className="text-3xl md:text-4xl font-bold">{profile.username}</h2>

              {profile.is_me && !editMode && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded mt-2 sm:mt-0 sm:ml-4"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}

              {!profile.is_me && (
                <Button
                  className={`px-4 py-1 rounded mt-2 sm:mt-0 sm:ml-4 ${
                    isFollowing
                      ? "bg-gray-700 hover:bg-gray-800"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                  onClick={handleFollowToggle}
                  disabled={isFollowing}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            <div className="flex gap-6 mt-2 text-gray-400 justify-center sm:justify-start">
              <div>
                <strong className="text-white">
                  {profile.followers_count || 0}
                </strong>{" "}
                Followers
              </div>
              <div>
                <strong className="text-white">
                  {profile.following_count || 0}
                </strong>{" "}
                Following
              </div>
            </div>

            <div className="space-y-1 mt-3 text-gray-300">
              {profile.bio && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Info className="w-4 h-4 text-purple-400" /> {profile.bio}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <MapPin className="w-4 h-4 text-purple-400" /> {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 px-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md sm:max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setEditMode(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
              Edit Profile
            </h3>
            <div className="space-y-3">
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-2">
                <Info className="w-4 h-4 text-purple-400 mr-2" />
                <Input
                  placeholder="Bio"
                  value={form.bio}
                  className="bg-gray-800 text-white placeholder-gray-400 border-0 flex-1"
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-2">
                <MapPin className="w-4 h-4 text-purple-400 mr-2" />
                <Input
                  placeholder="Location"
                  value={form.location}
                  className="bg-gray-800 text-white placeholder-gray-400 border-0 flex-1"
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="bg-gray-800 text-white rounded px-2 py-1 flex-1"
                  onChange={handleImageChange}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
                  onClick={handleUpdate}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
