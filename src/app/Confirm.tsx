"use client";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    // Supabase sends tokens in the hash fragment (#), not search params
    const params = new URLSearchParams(window.location.hash.substring(1));
    const access_token = params.get("access_token");

    if (!access_token) {
      setStatus("Invalid verification link");
      return;
    }

    // Call Django backend with token
    fetch(`http://127.0.0.1:8000/api/auth/verify/?access_token=${access_token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message === "User verified successfully") {
          setStatus("✅ Email verified! You can now log in.");
        } else {
          setStatus("⚠️ " + data.message);
        }
      })
      .catch(() => setStatus("❌ Verification failed. Try again."));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="p-6 bg-black shadow rounded-xl text-center">
        <h1 className="text-xl font-bold mb-2">Email Verification</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}
