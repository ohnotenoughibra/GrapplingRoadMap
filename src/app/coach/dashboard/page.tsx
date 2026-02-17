import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

async function getStats() {
  const [totalClasses, totalStudents, totalTechniques, recentClasses] =
    await Promise.all([
      prisma.classSession.count(),
      prisma.user.count({ where: { role: "student" } }),
      prisma.technique.count(),
      prisma.classSession.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: {
          techniques: { include: { technique: true } },
          attendees: true,
          coach: true,
        },
      }),
    ]);

  // Coverage: how many unique techniques have been taught
  const taughtTechniques = await prisma.classTechnique.findMany({
    select: { techniqueId: true },
    distinct: ["techniqueId"],
  });

  return {
    totalClasses,
    totalStudents,
    totalTechniques,
    taughtCount: taughtTechniques.length,
    recentClasses,
  };
}

export default async function CoachDashboard() {
  const stats = await getStats();
  const coveragePercent =
    stats.totalTechniques > 0
      ? Math.round((stats.taughtCount / stats.totalTechniques) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mat-100">Coach Dashboard</h1>
        <p className="text-mat-400 text-sm mt-1">
          Overview of your gym&apos;s grappling program
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Classes Logged
          </div>
          <div className="text-3xl font-bold text-mat-100">
            {stats.totalClasses}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Active Students
          </div>
          <div className="text-3xl font-bold text-mat-100">
            {stats.totalStudents}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Curriculum Coverage
          </div>
          <div className="text-3xl font-bold text-mat-100">
            {coveragePercent}%
          </div>
          <div className="mt-2 xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Techniques in System
          </div>
          <div className="text-3xl font-bold text-mat-100">
            {stats.totalTechniques}
          </div>
        </div>
      </div>

      {/* Quick actions + Recent classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/coach/log-class"
              className="flex items-center gap-3 p-3 rounded-lg bg-gi-500/5 border border-gi-500/10 text-gi-400 hover:bg-gi-500/10 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm font-medium">Log a Class</span>
            </Link>
            <Link
              href="/coach/heatmap"
              className="flex items-center gap-3 p-3 rounded-lg bg-nogi-500/5 border border-nogi-500/10 text-nogi-400 hover:bg-nogi-500/10 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
              </svg>
              <span className="text-sm font-medium">View Heatmap</span>
            </Link>
            <Link
              href="/coach/curriculum"
              className="flex items-center gap-3 p-3 rounded-lg bg-wrestling-500/5 border border-wrestling-500/10 text-wrestling-400 hover:bg-wrestling-500/10 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <span className="text-sm font-medium">Curriculum Map</span>
            </Link>
          </div>
        </div>

        {/* Recent classes */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
              Recent Classes
            </h2>
            <Link href="/coach/log-class" className="text-xs text-gi-400 hover:text-gi-300">
              Log new +
            </Link>
          </div>

          {stats.recentClasses.length === 0 ? (
            <div className="text-center py-12 text-mat-500">
              <p className="mb-2">No classes logged yet.</p>
              <Link href="/coach/log-class" className="text-gi-400 text-sm hover:underline">
                Log your first class
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-mat-800/30 border border-mat-800/30"
                >
                  <div
                    className={`w-2 h-8 rounded-full ${
                      cls.discipline === "gi"
                        ? "bg-gi-500"
                        : cls.discipline === "nogi"
                          ? "bg-nogi-500"
                          : "bg-wrestling-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-mat-200">
                      {cls.title || `${cls.discipline.charAt(0).toUpperCase() + cls.discipline.slice(1)} Class`}
                    </div>
                    <div className="text-xs text-mat-500 flex items-center gap-3 mt-0.5">
                      <span>
                        {new Date(cls.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>{cls.techniques.length} techniques</span>
                      <span>{cls.attendees.length} attended</span>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      cls.discipline === "gi"
                        ? "badge-gi"
                        : cls.discipline === "nogi"
                          ? "badge-nogi"
                          : "badge-wrestling"
                    }`}
                  >
                    {cls.discipline === "nogi" ? "No-Gi" : cls.discipline.charAt(0).toUpperCase() + cls.discipline.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
