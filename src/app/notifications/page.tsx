"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Heart, MessageCircle, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Notification {
  id: number;
  sender_username: string;
  message: string;
  notification_type: "like" | "comment" | "follow";
  post?: number;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "https://socialmediabackend-9hqc.onrender.com/api/posts/notifications/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications", err);
        toast.error("Failed to load notifications");
      }
    };

    fetchNotifications();
  }, [token]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-6 h-6 text-pink-500 animate-pulse" />;
      case "comment":
        return <MessageCircle className="w-6 h-6 text-blue-400 animate-pulse" />;
      case "follow":
        return <User className="w-6 h-6 text-green-400 animate-pulse" />;
      default:
        return <User className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col">
      <Toaster position="top-right" toastOptions={{ style: { background: "#1f1f2e", color: "#fff", border: "1px solid #7f5af0" } }} />

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 sticky top-0 bg-black z-20 flex items-center justify-between">
        <h1 className="font-bold text-4xl tracking-tight">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center mt-6 text-lg">
            No notifications yet
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-white cursor-pointer backdrop-blur-md bg-black/30 ${
                n.read ? "opacity-80" : "border-l-4 border-white"
              }`}
            >
              {/* Unread Dot */}
              {!n.read && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                {getIcon(n.notification_type)}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <p className="text-sm leading-snug text-white">
                  <span className="font-semibold">{n.sender_username}</span>{" "}
                  <span>{n.message}</span>
                </p>
                <span className="text-xs text-gray-400 mt-1 px-2 py-1 rounded-full bg-gray-700/50 w-fit">
                  {getRelativeTime(n.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
