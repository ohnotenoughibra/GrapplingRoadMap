"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  user: {
    name: string;
    xp: number;
    currentStreak: number;
    longestStreak: number;
    joinedAt: string;
  };
  totalClasses: number;
  skillStats: {
    exposed: number;
    drilling: number;
    sparring: number;
    proficient: number;
    total: number;
  };
  recentClasses: {
    id: string;
    date: string;
    discipline: string;
    title: string | null;
    techniques: { technique: { name: string } }[];
  }[];
  currentMilestone: {
    name: string;
    slug: string;
    progress: number;
    total: number;
  };
  badges: { badge: { name: string; icon: string } }[];
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  techniques?: Array<{ name: string; position: string }>;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then(setData);
    fetch("/api/ai/recommendations")
      .then((r) => r.json())
      .then((d) => setRecs((d.recommendations || []).slice(0, 2)))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-mat-800 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-mat-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const milestonePercent =
    data.currentMilestone.total > 0
      ? Math.round(
          (data.currentMilestone.progress / data.currentMilestone.total) * 100
        )
      : 0;

  const typeIcon = (t: string) => {
    switch (t) {
      case "milestone_close": return "🎯";
      case "milestone_new": return "🧭";
      case "weak_position": return "💡";
      case "review": return "📖";
      case "streak": return "🔥";
      default: return "⚡";
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mat-100">
          Welcome back, {data.user.name}
        </h1>
        <p className="text-mat-400 text-sm mt-1">
          Your journey continues. Every class is a step forward.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Mat Time
          </div>
          <div className="text-3xl font-bold text-mat-100">
            {data.totalClasses}
          </div>
          <div className="text-xs text-mat-500 mt-1">classes</div>
        </div>

        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Streak
          </div>
          <div className="text-3xl font-bold text-nogi-400">
            {data.user.currentStreak > 0 && (
              <span className="streak-flame mr-1">
                {data.user.currentStreak}
              </span>
            )}
            {data.user.currentStreak === 0 && "0"}
          </div>
          <div className="text-xs text-mat-500 mt-1">
            day{data.user.currentStreak !== 1 ? "s" : ""} &middot; best:{" "}
            {data.user.longestStreak}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            XP
          </div>
          <div className="text-3xl font-bold text-mat-100">{data.user.xp}</div>
          <div className="mt-2 xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${Math.min(100, (data.user.xp % 1000) / 10)}%` }}
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="text-mat-500 text-xs font-medium uppercase tracking-wider mb-2">
            Skills
          </div>
          <div className="text-3xl font-bold text-mat-100">
            {data.skillStats.proficient}
          </div>
          <div className="text-xs text-mat-500 mt-1">
            proficient of {data.skillStats.total} tracked
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current milestone */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
              Current Stage: {data.currentMilestone.name}
            </h2>
            <Link
              href="/student/journey"
              className="text-xs text-gi-400 hover:text-gi-300"
            >
              View Journey Map
            </Link>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-mat-400">
                {data.currentMilestone.progress} of{" "}
                {data.currentMilestone.total} skills proficient
              </span>
              <span className="font-mono text-mat-300">{milestonePercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-mat-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gi-500 to-nogi-500 transition-all duration-700"
                style={{ width: `${milestonePercent}%` }}
              />
            </div>
          </div>

          {/* Skill breakdown */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {(
              [
                { key: "exposed", label: "Exposed", color: "bg-mat-500" },
                { key: "drilling", label: "Drilling", color: "bg-yellow-500" },
                { key: "sparring", label: "Sparring", color: "bg-gi-500" },
                { key: "proficient", label: "Proficient", color: "bg-green-500" },
              ] as const
            ).map(({ key, label, color }) => (
              <div
                key={key}
                className="text-center p-3 rounded-lg bg-mat-800/30"
              >
                <div className="text-lg font-bold text-mat-100">
                  {data.skillStats[key]}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-mat-500 uppercase">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Badges + AI recs */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
                Badges
              </h2>
              <Link
                href="/student/badges"
                className="text-xs text-gi-400 hover:text-gi-300"
              >
                View all
              </Link>
            </div>

            {data.badges.length === 0 ? (
              <div className="text-center py-8 text-mat-500 text-sm">
                <p className="mb-1">No badges yet.</p>
                <p className="text-mat-600 text-xs">
                  Keep training — they&apos;ll come.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {data.badges.map((ub) => (
                  <div
                    key={ub.badge.name}
                    className="flex flex-col items-center p-3 rounded-lg bg-mat-800/30"
                  >
                    <span className="text-2xl mb-1">{ub.badge.icon}</span>
                    <span className="text-[10px] text-mat-400 text-center leading-tight">
                      {ub.badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendations preview */}
          {recs.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
                  Focus This Week
                </h2>
                <Link href="/student/recommendations" className="text-xs text-gi-400 hover:text-gi-300">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recs.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-lg">{typeIcon(rec.type)}</span>
                    <div>
                      <div className="text-sm font-medium text-mat-200">{rec.title}</div>
                      <p className="text-xs text-mat-500 mt-0.5 line-clamp-2">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent classes */}
      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
            Recent Classes
          </h2>
          <Link
            href="/student/classes"
            className="text-xs text-gi-400 hover:text-gi-300"
          >
            View all
          </Link>
        </div>

        {data.recentClasses.length === 0 ? (
          <p className="text-mat-500 text-sm text-center py-8">
            No classes attended yet. Get on the mat!
          </p>
        ) : (
          <div className="space-y-3">
            {data.recentClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-mat-800/30"
              >
                <div
                  className={`w-1.5 h-8 rounded-full ${
                    cls.discipline === "gi"
                      ? "bg-gi-500"
                      : cls.discipline === "nogi"
                        ? "bg-nogi-500"
                        : "bg-wrestling-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm text-mat-200">
                    {cls.title ||
                      `${cls.discipline === "nogi" ? "No-Gi" : cls.discipline.charAt(0).toUpperCase() + cls.discipline.slice(1)} Class`}
                  </div>
                  <div className="text-xs text-mat-500 mt-0.5">
                    {new Date(cls.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    &middot; {cls.techniques.length} techniques
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
