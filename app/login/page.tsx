"use client";

import { login } from "@/services/auth.service";
import Link from "next/link";
import router from "next/router";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      if (response.status === 200) {
        if (response.data.user.role == "SuperAdmin") {
          router.push("/admin");
        }
      }

      // router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
            F
          </div>
          FundConnect
        </div>

        <div className="flex gap-6 text-sm text-textSecondary">
          <Link href="#">Contact Support</Link>
          <Link href="#">Help Center</Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-card rounded-xl shadow-card p-8">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-textSecondary mb-6">
            Log in to manage your fund collections and reports.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium">Username or Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>

              <Link href="#" className="text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryDark disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-textSecondary mt-6">
            Not authorized to access this system?{" "}
            <Link href="#" className="text-accent font-medium">
              Request access
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-textSecondary py-4">
        © 2024 FundConnect Financial Services. All rights reserved.
        <div className="flex justify-center gap-4 mt-2">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Use</Link>
          <Link href="#">Security</Link>
        </div>
      </footer>
    </div>
  );
}
