"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate that we have the required params
  const missingParams = !token || !email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Password strength indicator
  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2
    : 3;

  const strengthLabels = ["", "Weak", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-mat-100">
          {success ? "Password reset" : "Set new password"}
        </h1>
        <p className="text-sm text-mat-500 mt-1">
          {success
            ? "You're all set"
            : missingParams
              ? "This link appears to be invalid"
              : "Choose a strong password for your account"}
        </p>
      </div>

      {missingParams ? (
        <div className="space-y-6">
          <div className="px-4 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-400 font-medium">Invalid reset link</p>
            <p className="text-xs text-mat-400 mt-1">
              This link is missing required information. Please request a new reset link.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm text-center transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Request new reset link
          </Link>
        </div>
      ) : success ? (
        <div className="space-y-6">
          <div className="px-4 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-2xl mb-2">👊</div>
            <p className="text-sm text-green-400 font-medium">Password updated</p>
            <p className="text-xs text-mat-400 mt-1">
              Your password has been changed. Sign in with your new password.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm text-center transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Sign in
          </Link>
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
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/20 transition-colors"
              placeholder="At least 8 characters"
            />
            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength >= level ? strengthColors[strength] : "bg-mat-800"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-mat-500">{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-mat-300 mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className={`w-full px-4 py-3 rounded-xl bg-mat-800/50 border text-mat-100 placeholder-mat-500 focus:outline-none focus:ring-1 transition-colors ${
                confirmPassword && confirmPassword !== password
                  ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                  : "border-mat-700/50 focus:border-gi-500/50 focus:ring-gi-500/20"
              }`}
              placeholder="Type it again"
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-400 mt-1">Passwords don&apos;t match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirmPassword}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset password"}
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
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mat-900 via-mat-950 to-black -z-10" />
      <div className="w-full max-w-sm mx-auto">
        <Suspense fallback={
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-6">
              M
            </div>
            <p className="text-sm text-mat-500">Loading...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
