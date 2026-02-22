"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Alert {
  type: string;
  priority: "high" | "medium" | "low";
  student: { id: string; name: string; beltRank: string };
  title: string;
  detail: string;
  action?: string;
}

interface ClassSuggestion {
  title: string;
  discipline: string;
  reason: string;
  techniques: { id: string; name: string; position: string }[];
  coverage: number;
}

interface TeamStats {
  totalStudents: number;
  activeStudents: number;
  classesThisWeek: number;
  avgStreak: number;
}

interface IntelligenceData {
  alerts: Alert[];
  classSuggestion: ClassSuggestion | null;
  teamStats: TeamStats;
}

const PRIORITY_STYLES = {
  high: "border-l-red-500 bg-red-500/5",
  medium: "border-l-yellow-500 bg-yellow-500/5",
  low: "border-l-gi-500 bg-gi-500/5",
};

const ALERT_ICONS: Record<string, string> = {
  streak_dying: "🔥",
  inactive: "👻",
  stuck_skill: "🧱",
  imbalance: "⚖️",
  promotion_ready: "🥋",
  new_milestone: "🎯",
};

export default function CoachDashboard() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/coach/intelligence")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dismissAlert = (index: number) => {
    setDismissedAlerts((prev) => new Set([...prev, String(index)]));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-mat-800 rounded-lg" />
          <div className="h-32 bg-mat-800/30 rounded-xl" />
          <div className="h-24 bg-mat-800/30 rounded-xl" />
          <div className="h-24 bg-mat-800/30 rounded-xl" />
        </div>
      </div>
    );
  }

  const visibleAlerts =
    data?.alerts.filter((_, i) => !dismissedAlerts.has(String(i))) || [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Coach HQ</h1>
          <p className="text-mat-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link href="/coach/log-class" className="btn-primary text-sm">
          + Log Class
        </Link>
      </div>

      {/* Team pulse — compact stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-xl font-bold text-mat-100">
            {data?.teamStats.activeStudents ?? 0}
          </div>
          <div className="text-[10px] text-mat-500">Active</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-bold text-gi-400">
            {data?.teamStats.classesThisWeek ?? 0}
          </div>
          <div className="text-[10px] text-mat-500">This Week</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-bold text-nogi-400">
            {data?.teamStats.avgStreak ?? 0}
          </div>
          <div className="text-[10px] text-mat-500">Avg Streak</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-bold text-mat-100">
            {data?.teamStats.totalStudents ?? 0}
          </div>
          <div className="text-[10px] text-mat-500">Total</div>
        </div>
      </div>

      {/* ═══ ATTENTION FEED ═══ */}
      {visibleAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-mat-400">
              Needs Attention
            </h2>
            <span className="text-[10px] text-mat-600 bg-mat-800 px-1.5 py-0.5 rounded-full">
              {visibleAlerts.length}
            </span>
          </div>

          <div className="space-y-2">
            {visibleAlerts.map((alert, i) => (
              <div
                key={i}
                className={`relative border-l-2 rounded-r-xl ${PRIORITY_STYLES[alert.priority]} p-4`}
              >
                <button
                  onClick={() => dismissAlert(i)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-mat-800/50 text-mat-500 hover:text-mat-300 flex items-center justify-center text-xs transition-colors"
                >
                  &times;
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <span className="text-lg flex-shrink-0">
                    {ALERT_ICONS[alert.type] || "⚠️"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-mat-200">
                      {alert.title}
                    </div>
                    <p className="text-xs text-mat-400 mt-0.5">
                      {alert.detail}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {alert.action && (
                        <span className="text-[10px] text-gi-400 font-medium">
                          {alert.action}
                        </span>
                      )}
                      <Link
                        href={`/coach/students/${alert.student.id}`}
                        className="text-[10px] text-mat-500 hover:text-mat-300 transition-colors"
                      >
                        View student →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleAlerts.length === 0 && (
        <div className="card p-6 mb-6 text-center">
          <div className="text-2xl mb-2">👊</div>
          <p className="text-sm text-mat-300 font-medium">All clear, Coach</p>
          <p className="text-xs text-mat-500 mt-1">
            No students need immediate attention. Nice work.
          </p>
        </div>
      )}

      {/* ═══ SMART CLASS SUGGESTION ═══ */}
      {data?.classSuggestion && (
        <div className="card p-5 mb-6 border-gi-500/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gi-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gi-400">
              Suggested Next Class
            </h2>
          </div>

          <h3 className="text-base font-semibold text-mat-100 mb-1">
            {data.classSuggestion.title}
          </h3>
          <p className="text-xs text-mat-400 mb-3">
            {data.classSuggestion.reason}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {data.classSuggestion.techniques.map((tech) => (
              <span
                key={tech.id}
                className="px-2 py-1 rounded-md text-[10px] bg-gi-500/10 text-gi-400 border border-gi-500/20"
              >
                {tech.name}
              </span>
            ))}
          </div>

          <Link
            href={`/coach/log-class?${new URLSearchParams({
              discipline: data.classSuggestion.discipline,
              title: data.classSuggestion.title,
              techniques: data.classSuggestion.techniques.map((t) => t.id).join(","),
            }).toString()}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gi-500/10 border border-gi-500/20 text-sm text-gi-400 font-medium hover:bg-gi-500/20 transition-colors"
          >
            Use This Plan
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          href="/coach/students"
          className="card p-4 hover:border-mat-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mat-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-mat-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-mat-200">Students</div>
              <div className="text-[10px] text-mat-500">Roster & progress</div>
            </div>
          </div>
        </Link>

        <Link
          href="/coach/heatmap"
          className="card p-4 hover:border-mat-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mat-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-nogi-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-mat-200">Heatmap</div>
              <div className="text-[10px] text-mat-500">Coverage gaps</div>
            </div>
          </div>
        </Link>

        <Link
          href="/coach/curriculum"
          className="card p-4 hover:border-mat-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mat-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-wrestling-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-mat-200">Curriculum</div>
              <div className="text-[10px] text-mat-500">Technique map</div>
            </div>
          </div>
        </Link>

        <Link
          href="/coach/challenges"
          className="card p-4 hover:border-mat-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mat-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-mat-200">Challenges</div>
              <div className="text-[10px] text-mat-500">Team goals</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
