import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = (session.user as any).role;
    redirect(role === "coach" ? "/coach/dashboard" : "/student/dashboard");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      {/* Background texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mat-900 via-mat-950 to-black -z-10" />

      {/* Hero */}
      <div className="text-center w-full max-w-sm mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mat-800/50 border border-mat-700/30 text-mat-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Roots Collective
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          <span className="text-mat-100">The </span>
          <span className="bg-gradient-to-r from-gi-400 via-nogi-400 to-wrestling-400 bg-clip-text text-transparent">
            Mat
          </span>
        </h1>

        <p className="text-base text-mat-400 mb-1">
          Your grappling journey, mapped.
        </p>
        <p className="text-sm text-mat-500 mb-10">
          Track what you learn. See what you&apos;ve missed.<br />
          Build skills, not just belts.
        </p>

        {/* Auth entry points */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/login"
            className="group relative w-full px-6 py-5 rounded-2xl bg-gradient-to-br from-mat-800 to-mat-900 border border-mat-700/50 transition-all duration-200 active:scale-[0.98] active:border-gi-500/30"
          >
            <div className="text-left">
              <div className="font-semibold text-mat-100 mb-1 text-base">
                Sign in
              </div>
              <div className="text-sm text-mat-500">
                Continue your journey
              </div>
            </div>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-mat-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/signup"
            className="group relative w-full px-6 py-5 rounded-2xl bg-gradient-to-br from-mat-800 to-mat-900 border border-mat-700/50 transition-all duration-200 active:scale-[0.98] active:border-nogi-500/30"
          >
            <div className="text-left">
              <div className="font-semibold text-mat-100 mb-1 text-base">
                Join the gym
              </div>
              <div className="text-sm text-mat-500">
                Create your account — student or coach
              </div>
            </div>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-mat-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Discipline indicators */}
      <div className="mt-10 flex gap-6 text-xs text-mat-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gi-500" />
          Gi
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-nogi-500" />
          No-Gi
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-wrestling-500" />
          Wrestling
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 pb-8 text-xs text-mat-600">
        The journey is the destination.
      </div>
    </div>
  );
}
