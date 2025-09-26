"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from "react-hot-toast";

interface LoginResponse {
  django_access: string;
  django_refresh: string;
  supabase_access_token: string;
  user_id: number;
}

const Login = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post<LoginResponse>(
        "https://socialmediabackend-9hqc.onrender.com/api/auth/login/",
        form
      );

      // Save tokens in localStorage
      localStorage.setItem("access_token", res.data.django_access);
      localStorage.setItem("refresh_token", res.data.django_refresh);
      localStorage.setItem("supabase_token", res.data.supabase_access_token);
      localStorage.setItem("user_id", res.data.user_id.toString());

      toast.success("Login successful! Redirecting...", { duration: 2000 });

      // Navigate to dashboard after toast
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      toast.error(err.response?.data?.error || "Login failed", { duration: 3000 });
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

      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 text-white">InstaClone</h1>
        <p className="text-gray-400">
          Login to see photos and videos from your friends
        </p>
      </div>

      <Card className="w-full max-w-md p-6 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl">
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <Label className="text-white">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r bg-black text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-300"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p
              className="text-white cursor-pointer hover:underline"
              onClick={() => router.push("/reset-request")}
            >
              Forgot password?
            </p>
          </div>

          <div className="mt-4 text-center text-gray-400">
            Don&apos;t have an account?{" "}
            <span
              className="text-white cursor-pointer font-semibold hover:underline"
              onClick={() => router.push("/register")}
            >
              Sign Up
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
