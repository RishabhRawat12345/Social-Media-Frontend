"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Camera,
  Info,
  MapPin,
  ArrowLeft,
  LogOut,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Post {
  id: number;
  image_url: string;
  caption?: string;
}

interface ProfileData {
  id: number;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  is_me?: boolean;
  followers_count?: number;
  following_count?: number;
  followers_ids?: number[];
}

const Profile = () => {
  const { id } = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ bio: "", location: "" });
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const myId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("user_id"))
      : null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profileUrl = id
          ? `https://socialmediabackend-9hqc.onrender.com/api/users/${id}/`
          : `https://socialmediabackend-9hqc.onrender.com/api/users/me/`;

        const profileRes = await axios.get<ProfileData>(profileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(profileRes.data);
        setForm({
          bio: profileRes.data.bio || "",
          location: profileRes.data.location || "",
        });

        if (!id || profileRes.data.is_me) setIsOwnProfile(true);

        const postsUrl = id
          ? `https://socialmediabackend-9hqc.onrender.com/api/posts/user/${id}/`
          : "https://socialmediabackend-9hqc.onrender.com/api/posts/myposts/";

        const postsRes = await axios.get<Post[]>(postsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(postsRes.data);

        const statsRes = await axios.get<{
          followers_count: number;
          following_count: number;
          followers_ids: number[];
        }>(
          `https://socialmediabackend-9hqc.onrender.com/api/followers/${profileRes.data.id}/stats/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers_count: statsRes.data.followers_count,
                following_count: statsRes.data.following_count,
                followers_ids: statsRes.data.followers_ids,
              }
            : prev
        );

        if (id && !profileRes.data.is_me && myId) {
          setIsFollowing(statsRes.data.followers_ids.includes(myId));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, myId]);

  const handleFollowToggle = async () => {
    if (!token || !profile?.id || !myId) return;

    try {
      await axios.post(
        `https://socialmediabackend-9hqc.onrender.com/api/followers/${profile.id}/follow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsFollowing(!isFollowing);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followers_count: prev.followers_count
                ? isFollowing
                  ? prev.followers_count - 1
                  : prev.followers_count + 1
                : 1,
            }
          : prev
      );
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
    }
  };

  const handleUpdate = async () => {
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("bio", form.bio);
      formData.append("location", form.location);
      if (newProfileImage) formData.append("avatar", newProfileImage);

      const res = await axios.put<ProfileData>(
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
    } catch (err) {
      console.error("Error updating profile:", err);
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <Loader2 className="animate-spin h-10 w-10 text-white" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white py-6 px-4 sm:px-6 md:px-12 lg:px-24 relative">
      {/* Back & Logout */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 text-white bg-black border-gray-500 hover:border-gray-500"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* Profile Header */}
      {profile && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6 bg-black/30 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          {/* Avatar */}
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <Image
              src={
                newProfileImage
                  ? URL.createObjectURL(newProfileImage)
                  : profile.avatar_url || "/default-avatar.png"
              }
              alt="Profile"
              width={160}
              height={160}
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover border-2 border-purple-600 shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-3 sm:gap-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                {profile.username}
              </h2>
              {isOwnProfile && !editMode && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded mt-2 sm:mt-0"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              )}
              {!isOwnProfile && (
                <Button
                  className={`px-4 py-1 rounded mt-2 sm:mt-0 ${
                    isFollowing
                      ? "bg-gray-700 hover:bg-gray-800"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 sm:gap-6 text-gray-300 mt-2">
              <div>
                <strong className="text-white">{posts.length}</strong> Posts
              </div>
              <div>
                <strong className="text-white">{profile.followers_count || 0}</strong>{" "}
                Followers
              </div>
              <div>
                <strong className="text-white">{profile.following_count || 0}</strong>{" "}
                Following
              </div>
            </div>

            {/* Bio + Location */}
            <div className="space-y-1 mt-2">
              {profile.bio && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-200">
                  <Info className="w-4 h-4 text-purple-400" /> {profile.bio}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-purple-400" /> {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-purple-700/50 transition transform hover:scale-105"
            >
              <Image
                src={post.image_url}
                alt={post.caption || "Post"}
                width={500}
                height={500}
                className="w-full aspect-square object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-4">No posts yet</div>
      )}

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 px-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md sm:max-w-lg relative backdrop-blur-md border border-purple-700 shadow-lg">
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
                  className="bg-gray-800 text-white placeholder-gray-400 border-0 focus:ring-0 flex-1"
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-2">
                <MapPin className="w-4 h-4 text-purple-400 mr-2" />
                <Input
                  placeholder="Location"
                  value={form.location}
                  className="bg-gray-800 text-white placeholder-gray-400 border-0 focus:ring-0 flex-1"
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
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  onClick={handleUpdate}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-gray-500 flex-1"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
