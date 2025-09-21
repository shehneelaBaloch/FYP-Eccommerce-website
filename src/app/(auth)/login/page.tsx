'use client';

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/", // redirect after login
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        {/* Google login button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-4 w-full py-3 rounded-xl border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <img src="/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </motion.button>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-pink-600 font-medium">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
