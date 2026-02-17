import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background texture */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mat-900 via-mat-950 to-black -z-10" />

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mat-800/50 border border-mat-700/30 text-mat-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Roots Collective
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          <span className="text-mat-100">The </span>
          <span className="bg-gradient-to-r from-gi-400 via-nogi-400 to-wrestling-400 bg-clip-text text-transparent">
            Mat
          </span>
        </h1>

        <p className="text-lg text-mat-400 mb-2">
          Your grappling journey, mapped.
        </p>
        <p className="text-sm text-mat-500 mb-12 max-w-md mx-auto">
          Track what you learn. See what you&apos;ve missed. Build skills, not
          just belts. Gi. No-Gi. Wrestling.
        </p>

        {/* Entry points */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/student/dashboard"
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-br from-mat-800 to-mat-900 border border-mat-700/50 transition-all duration-300 hover:border-gi-500/30 hover:shadow-lg hover:shadow-gi-500/5"
          >
            <div className="text-left">
              <div className="font-semibold text-mat-100 mb-1 group-hover:text-gi-400 transition-colors">
                I train here
              </div>
              <div className="text-sm text-mat-500">
                View your journey, track progress, connect with the team
              </div>
            </div>
          </Link>

          <Link
            href="/coach/dashboard"
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-br from-mat-800 to-mat-900 border border-mat-700/50 transition-all duration-300 hover:border-nogi-500/30 hover:shadow-lg hover:shadow-nogi-500/5"
          >
            <div className="text-left">
              <div className="font-semibold text-mat-100 mb-1 group-hover:text-nogi-400 transition-colors">
                I coach here
              </div>
              <div className="text-sm text-mat-500">
                Log classes, build curriculum, guide your students
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Discipline indicators */}
      <div className="mt-16 flex gap-6 text-xs text-mat-500">
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
      <div className="absolute bottom-6 text-xs text-mat-600">
        The journey is the destination.
      </div>
    </div>
  );
}
