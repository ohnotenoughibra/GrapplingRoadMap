"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "coach">("student");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign in failed. Please log in.");
        setLoading(false);
        return;
      }

      router.push(role === "coach" ? "/coach/dashboard" : "/student/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mat-900 via-mat-950 to-black -z-10" />

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-mat-100">Join the gym</h1>
          <p className="text-sm text-mat-500 mt-1">Create your account to start tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div className="flex rounded-xl overflow-hidden border border-mat-700/50">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                role === "student"
                  ? "bg-gi-500/20 text-gi-400 border-r border-mat-700/50"
                  : "bg-mat-800/30 text-mat-500 border-r border-mat-700/50"
              }`}
            >
              I train here
            </button>
            <button
              type="button"
              onClick={() => setRole("coach")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                role === "coach"
                  ? "bg-nogi-500/20 text-nogi-400"
                  : "bg-mat-800/30 text-mat-500"
              }`}
            >
              I coach here
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-mat-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/20 transition-colors"
              placeholder="Your full name"
            />
          </div>

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
            <label className="block text-sm font-medium text-mat-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/20 transition-colors"
              placeholder="Min 6 characters"
            />
          </div>

          {role === "coach" && (
            <div>
              <label className="block text-sm font-medium text-mat-300 mb-1.5">Coach Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-nogi-500/50 focus:ring-1 focus:ring-nogi-500/20 transition-colors"
                placeholder="Enter gym invite code"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-mat-500">
            Already have an account?{" "}
            <Link href="/login" className="text-gi-400 hover:text-gi-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
