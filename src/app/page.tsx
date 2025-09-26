"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import toast, { Toaster } from "react-hot-toast";

interface RegisterResponse {
  message?: string;
}

const Register = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post<RegisterResponse>(
        "https://socialmediabackend-9hqc.onrender.com/api/auth/register/",
        form
      );

      toast.success(res.data.message || "Registration successful!", {
        duration: 2500,
      });

      setForm({
        email: "",
        username: "",
        password: "",
        first_name: "",
        last_name: "",
      });

      // Navigate to login after toast
      setTimeout(() => router.push("/login"), 2500);
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>;
      toast.error(err.response?.data?.error || "Registration failed", {
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

      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 text-white">InstaClone</h1>
        <p className="text-gray-400">
          Sign up to see photos and videos from your friends.
        </p>
      </div>

      <Card className="w-full max-w-md p-6 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl">
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label className="text-white">First Name</Label>
              <Input
                name="first_name"
                onChange={handleChange}
                value={form.first_name}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <Label className="text-white">Last Name</Label>
              <Input
                name="last_name"
                onChange={handleChange}
                value={form.last_name}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <Label className="text-white">Username</Label>
              <Input
                name="username"
                onChange={handleChange}
                value={form.username}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <Label className="text-white">Email</Label>
              <Input
                name="email"
                type="email"
                onChange={handleChange}
                value={form.email}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <Label className="text-white">Password</Label>
              <Input
                name="password"
                type="password"
                onChange={handleChange}
                value={form.password}
                required
                className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r bg-black hover:bg-gray-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-300"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 text-center text-gray-400">
        <p>
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-purple-500 font-semibold cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
