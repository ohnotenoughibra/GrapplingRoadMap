"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mat-900 via-mat-950 to-black -z-10" />

      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-mat-100">Reset your password</h1>
          <p className="text-sm text-mat-500 mt-1">
            {sent
              ? "Check your email for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="px-4 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-sm text-green-400 font-medium">Reset link sent</p>
              <p className="text-xs text-mat-400 mt-1">
                If <span className="text-mat-300">{email}</span> is registered, you&apos;ll receive an email with instructions. Check your spam folder too.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-300 font-medium text-sm transition-all hover:bg-mat-800 active:scale-[0.98]"
              >
                Try a different email
              </button>
              <Link
                href="/login"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm text-center transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-mat-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/20 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-mat-500">
            Remember your password?{" "}
            <Link href="/login" className="text-gi-400 hover:text-gi-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
