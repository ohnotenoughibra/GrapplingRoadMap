"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Mission {
  id: string;
  title: string;
  description: string;
  reason: string;
  status: string;
  technique?: {
    name: string;
    slug: string;
    position: { name: string };
  } | null;
}

interface DashboardData {
  user: {
    name: string;
    xp: number;
    currentStreak: number;
    longestStreak: number;
    beltRank?: string;
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

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionLoading, setMissionLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then(setData);
    fetch("/api/student/mission")
      .then((r) => r.json())
      .then((d) => setMission(d.mission))
      .catch(() => {})
      .finally(() => setMissionLoading(false));
  }, []);

  const handleMissionFeedback = async (status: string) => {
    if (!mission?.id || mission.id === "fallback" || mission.id === "generated") return;
    setFeedbackSent(true);
    try {
      await fetch("/api/student/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission.id, status }),
      });
      setMission((prev) => (prev ? { ...prev, status } : null));
    } catch { /* ignore */ }
  };

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-1">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-56 bg-mat-800 rounded-lg" />
          <div className="h-64 bg-mat-800/50 rounded-2xl" />
          <div className="h-20 bg-mat-800/30 rounded-xl" />
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

  const missionCompleted = mission?.status === "completed" || mission?.status === "partial";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Greeting — minimal */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-mat-100">
          {getGreeting()}, {data.user.name.split(" ")[0]}
        </h1>
        {data.user.currentStreak > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-nogi-400 text-sm font-semibold">
              {data.user.currentStreak} day streak
            </span>
            <span className="text-mat-600 text-xs">
              &middot; best: {data.user.longestStreak}
            </span>
          </div>
        )}
      </div>

      {/* ═══ TODAY'S MISSION — the hero card ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mat-900 via-mat-900 to-gi-500/10 border border-mat-800/80 mb-6">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gi-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-nogi-500/5 rounded-full blur-2xl" />

        <div className="relative p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gi-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gi-400">
              Today&apos;s Mission
            </span>
          </div>

          {missionLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-3/4 bg-mat-800 rounded" />
              <div className="h-4 w-full bg-mat-800/60 rounded" />
              <div className="h-4 w-2/3 bg-mat-800/40 rounded" />
            </div>
          ) : mission ? (
            <>
              <h2 className="text-lg lg:text-xl font-bold text-mat-100 mb-2">
                {mission.title}
              </h2>
              <p className="text-sm text-mat-300 leading-relaxed mb-3">
                {mission.description}
              </p>
              <p className="text-xs text-mat-500 italic mb-5">
                {mission.reason}
              </p>

              {/* Action buttons */}
              {mission.technique && (
                <Link
                  href={`/student/techniques/${mission.technique.slug}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/30 text-sm text-gi-400 hover:bg-mat-800 transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Technique
                </Link>
              )}

              {/* Post-training feedback */}
              {!missionCompleted && !feedbackSent ? (
                <div className="border-t border-mat-800/50 pt-4 mt-2">
                  <p className="text-xs text-mat-500 mb-3">After training — did you work on it?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMissionFeedback("completed")}
                      className="flex-1 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all active:scale-[0.98]"
                    >
                      Yes, nailed it
                    </button>
                    <button
                      onClick={() => handleMissionFeedback("partial")}
                      className="flex-1 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium hover:bg-yellow-500/20 transition-all active:scale-[0.98]"
                    >
                      Partially
                    </button>
                    <button
                      onClick={() => handleMissionFeedback("skipped")}
                      className="flex-1 py-2.5 rounded-xl bg-mat-800/50 border border-mat-700/30 text-mat-400 text-sm font-medium hover:bg-mat-800 transition-all active:scale-[0.98]"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : missionCompleted || feedbackSent ? (
                <div className="border-t border-mat-800/50 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400 font-medium">
                      {mission.status === "completed" ? "Mission complete" : mission.status === "partial" ? "Partially done" : "Logged"}
                    </span>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-mat-400 text-sm">
              Couldn&apos;t generate a mission. Get on the mat and train!
            </p>
          )}
        </div>
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          href="/student/timer"
          className="card p-3 flex flex-col items-center gap-1.5 hover:border-mat-700/50 transition-colors"
        >
          <svg className="w-5 h-5 text-gi-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] text-mat-400 font-medium">Timer</span>
        </Link>
        <Link
          href="/student/sparring"
          className="card p-3 flex flex-col items-center gap-1.5 hover:border-mat-700/50 transition-colors"
        >
          <svg className="w-5 h-5 text-nogi-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] text-mat-400 font-medium">Log Roll</span>
        </Link>
        <Link
          href="/student/journey"
          className="card p-3 flex flex-col items-center gap-1.5 hover:border-mat-700/50 transition-colors"
        >
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] text-mat-400 font-medium">Journey</span>
        </Link>
      </div>

      {/* Milestone progress — compact */}
      <Link href="/student/journey" className="block card p-4 mb-4 hover:border-mat-700/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-mat-400">
            {data.currentMilestone.name}
          </span>
          <span className="text-xs font-mono text-mat-500">
            {milestonePercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-mat-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gi-500 to-nogi-500 transition-all duration-700"
            style={{ width: `${milestonePercent}%` }}
          />
        </div>
        <div className="flex gap-3 mt-2">
          <span className="text-[10px] text-mat-500">
            <span className="text-green-400 font-medium">{data.skillStats.proficient}</span> proficient
          </span>
          <span className="text-[10px] text-mat-500">
            <span className="text-gi-400 font-medium">{data.skillStats.sparring}</span> sparring
          </span>
          <span className="text-[10px] text-mat-500">
            <span className="text-yellow-400 font-medium">{data.skillStats.drilling}</span> drilling
          </span>
          <span className="text-[10px] text-mat-500">
            <span className="text-mat-400 font-medium">{data.skillStats.exposed}</span> exposed
          </span>
        </div>
      </Link>

      {/* Collapsible stats section */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-mat-900/30 border border-mat-800/30 mb-4 transition-colors hover:bg-mat-900/50"
      >
        <span className="text-xs font-medium text-mat-500">
          {showStats ? "Hide details" : "Stats & recent classes"}
        </span>
        <svg
          className={`w-4 h-4 text-mat-600 transition-transform ${showStats ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showStats && (
        <div className="space-y-4 mb-6 animate-in fade-in duration-200">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="card p-3 text-center">
              <div className="text-xl font-bold text-mat-100">{data.totalClasses}</div>
              <div className="text-[10px] text-mat-500">Classes</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xl font-bold text-nogi-400">{data.user.currentStreak}</div>
              <div className="text-[10px] text-mat-500">Streak</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xl font-bold text-mat-100">{data.user.xp}</div>
              <div className="text-[10px] text-mat-500">XP</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xl font-bold text-green-400">{data.skillStats.proficient}</div>
              <div className="text-[10px] text-mat-500">Proficient</div>
            </div>
          </div>

          {/* Badges */}
          {data.badges.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-mat-500">Badges</span>
                <Link href="/student/badges" className="text-[10px] text-gi-400">View all</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.badges.slice(0, 6).map((ub) => (
                  <div
                    key={ub.badge.name}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-mat-800/30"
                  >
                    <span className="text-base">{ub.badge.icon}</span>
                    <span className="text-[10px] text-mat-400">{ub.badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent classes */}
          {data.recentClasses.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-mat-500">Recent Classes</span>
                <Link href="/student/classes" className="text-[10px] text-gi-400">View all</Link>
              </div>
              <div className="space-y-2">
                {data.recentClasses.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="flex items-center gap-3 p-2 rounded-lg bg-mat-800/20">
                    <div
                      className={`w-1 h-6 rounded-full ${
                        cls.discipline === "gi"
                          ? "bg-gi-500"
                          : cls.discipline === "nogi"
                            ? "bg-nogi-500"
                            : "bg-wrestling-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-mat-200 truncate">
                        {cls.title || `${cls.discipline === "nogi" ? "No-Gi" : cls.discipline.charAt(0).toUpperCase() + cls.discipline.slice(1)} Class`}
                      </div>
                      <div className="text-[10px] text-mat-500">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
