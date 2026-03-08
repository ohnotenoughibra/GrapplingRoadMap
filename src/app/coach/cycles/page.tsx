"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────────────────── */

interface Cycle {
  id: string;
  name: string;
  weeks: number;
  classesPerWeek: number;
  classDuration: number;
  focus: string;
  source: string | null;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  sessionCount: number;
  createdAt: string;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

const FOCUS_LABELS: Record<string, { label: string; color: string }> = {
  competition: { label: "Competition Prep", color: "text-wrestling-400 bg-wrestling-500/10 border-wrestling-500/20" },
  curriculum: { label: "Curriculum", color: "text-gi-400 bg-gi-500/10 border-gi-500/20" },
  fundamentals: { label: "Fundamentals", color: "text-nogi-400 bg-nogi-500/10 border-nogi-500/20" },
  custom: { label: "Custom", color: "text-mat-400 bg-mat-800 border-mat-700" },
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    fetch("/api/coach/cycles")
      .then((r) => r.json())
      .then((data) => setCycles(data.cycles || []))
      .catch(() => setCycles([]))
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => cycles.filter((c) => c.status === "active"), [cycles]);
  const past = useMemo(() => cycles.filter((c) => c.status !== "active"), [cycles]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-mat-800 rounded-lg" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-mat-800/30 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-mat-100">
            Training Cycles
          </h1>
          <p className="text-mat-400 text-sm mt-0.5">
            Plan and track multi-week focus areas
          </p>
        </div>
        <Link href="/coach/cycles/new" className="btn-primary text-sm">
          + New Cycle
        </Link>
      </div>

      {/* Active cycles */}
      {active.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] font-semibold text-mat-500 uppercase tracking-wider mb-3">
            Active
          </div>
          <div className="space-y-3">
            {active.map((cycle) => {
              const now = new Date();
              const start = new Date(cycle.startDate);
              const end = new Date(cycle.endDate);
              const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              const progressPct = Math.min(100, (elapsed / totalDays) * 100);
              const currentWeek = Math.min(cycle.weeks, Math.ceil(elapsed / 7));
              const totalPlanned = cycle.weeks * cycle.classesPerWeek;
              const focusInfo = FOCUS_LABELS[cycle.focus] || FOCUS_LABELS.custom;

              return (
                <div key={cycle.id} className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-gi-500 animate-pulse-dot" />
                        <h3 className="text-base font-semibold text-mat-100">
                          {cycle.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${focusInfo.color}`}
                        >
                          {focusInfo.label}
                        </span>
                        <span className="text-xs text-mat-500">
                          {formatDateRange(cycle.startDate, cycle.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-mat-200">
                        Week {currentWeek}/{cycle.weeks}
                      </div>
                      <div className="text-[10px] text-mat-500">
                        {cycle.sessionCount}/{totalPlanned} classes
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="xp-bar">
                      <div
                        className="xp-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-mat-600">
                        {Math.round(progressPct)}% complete
                      </span>
                      <span className="text-[10px] text-mat-600">
                        {cycle.classDuration}min classes
                        {" \u00b7 "}
                        {cycle.classesPerWeek}x/week
                      </span>
                    </div>
                  </div>

                  {cycle.notes && (
                    <p className="mt-2 text-xs text-mat-500 italic">
                      {cycle.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {active.length === 0 && past.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-3xl mb-3">
            <svg className="w-12 h-12 mx-auto text-mat-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.182-3.182" />
            </svg>
          </div>
          <p className="text-mat-300 font-medium">No training cycles yet</p>
          <p className="text-xs text-mat-500 mt-1">
            Create a cycle to plan your curriculum over multiple weeks.
          </p>
          <Link
            href="/coach/cycles/new"
            className="inline-block mt-4 btn-primary text-sm"
          >
            Create Your First Cycle
          </Link>
        </div>
      )}

      {/* Past cycles */}
      {past.length > 0 && (
        <div>
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-2 text-sm text-mat-400 hover:text-mat-200 transition-colors mb-3"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showPast ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Past Cycles ({past.length})
          </button>

          {showPast && (
            <div className="space-y-2 animate-in">
              {past.map((cycle) => {
                const totalPlanned = cycle.weeks * cycle.classesPerWeek;
                const focusInfo = FOCUS_LABELS[cycle.focus] || FOCUS_LABELS.custom;

                return (
                  <div
                    key={cycle.id}
                    className="card p-3 opacity-70"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-mat-300">
                          {cycle.name}
                        </h3>
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${focusInfo.color}`}
                        >
                          {focusInfo.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-mat-500">
                          {cycle.sessionCount}/{totalPlanned} classes
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-mat-600 mt-1">
                      {formatDateRange(cycle.startDate, cycle.endDate)}
                      {" \u00b7 "}
                      {cycle.weeks} weeks
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
