"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { LogOut } from "lucide-react";

const RequestReset = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post<{ message?: string }>(
        "https://socialmediabackend-9hqc.onrender.com/api/auth/password-reset/",
        { email }
      );
      toast.success(res.data.message || "Reset email sent!", { duration: 2500 });
      setEmail("");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      toast.error(err.response?.data?.error || "Failed to send reset email", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
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

      {token && (
        <div className="w-full max-w-md flex justify-end mb-6">
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      )}

      <Card className="w-full max-w-md p-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r bg-black text-white font-semibold py-3 rounded-2xl shadow-lg hover:scale-[1.01] transition-all duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RequestReset;