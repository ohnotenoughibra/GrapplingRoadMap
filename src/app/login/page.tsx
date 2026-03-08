"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    console.log("[login] signIn result:", JSON.stringify(result));

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    if (!result?.ok) {
      setError("Sign in failed — please try again");
      setLoading(false);
      return;
    }

    // Fetch session to determine role
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    router.push(role === "coach" ? "/coach/dashboard" : "/student/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mat-900 via-mat-950 to-mat-950 -z-10" />

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-mat-100">Welcome back</h1>
          <p className="text-sm text-mat-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-mat-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/20 transition-colors"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-mat-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-gi-400 hover:text-gi-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/20 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-mat-500">
            New to the gym?{" "}
            <Link href="/signup" className="text-gi-400 hover:text-gi-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
