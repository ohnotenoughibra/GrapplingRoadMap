"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import SessionTimeline from "@/components/shared/SessionTimeline";
import type { Discipline } from "@/types";

/* ── Types ────────────────────────────────────────────────────────────── */

interface CalendarTechnique {
  id: string;
  name: string;
  slug: string;
  category: string;
  notes: string | null;
}

interface CalendarSession {
  id: string;
  date: string;
  scheduledDate: string | null;
  discipline: string;
  title: string | null;
  notes: string | null;
  weekNumber: number | null;
  dayNumber?: number | null;
  duration: number | null;
  cycle: { id: string; name: string } | null;
  techniques: CalendarTechnique[];
}

interface CycleInfo {
  id: string;
  name: string;
  weeks: number;
  classesPerWeek: number;
  startDate: string;
  endDate: string;
  status: string;
  sessionCount: number;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

const DISC_DOT: Record<string, string> = {
  gi: "bg-gi-500",
  nogi: "bg-nogi-500",
  wrestling: "bg-wrestling-500",
};

const DISC_BADGE: Record<string, string> = {
  gi: "text-gi-400 bg-gi-500/10 border-gi-500/20",
  nogi: "text-nogi-400 bg-nogi-500/10 border-nogi-500/20",
  wrestling: "text-wrestling-400 bg-wrestling-500/10 border-wrestling-500/20",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns 0=Mon,1=Tue,...,6=Sun for the first day of the month */
function getFirstDayOffset(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Convert Sunday=0 to Monday-based
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [tab, setTab] = useState<"calendar" | "list">("calendar");
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [scheduled, setScheduled] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [activeCycles, setActiveCycles] = useState<CycleInfo[]>([]);

  // Fetch calendar data
  useEffect(() => {
    setLoading(true);
    const param = getMonthParam(year, month);
    fetch(`/api/coach/calendar?month=${param}`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setScheduled(data.scheduled || []);
      })
      .catch(() => {
        setSessions([]);
        setScheduled([]);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  // Fetch active cycles
  useEffect(() => {
    fetch("/api/coach/cycles")
      .then((r) => r.json())
      .then((data) => {
        const cycles = (data.cycles || []) as CycleInfo[];
        setActiveCycles(cycles.filter((c) => c.status === "active"));
      })
      .catch(() => setActiveCycles([]));
  }, []);

  // Build date -> sessions map
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const s of sessions) {
      const key = toDateKey(new Date(s.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sessions]);

  // Build date -> scheduled map
  const scheduledByDate = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const s of scheduled) {
      if (s.scheduledDate) {
        const key = toDateKey(new Date(s.scheduledDate));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
      }
    }
    return map;
  }, [scheduled]);

  // Stats
  const stats = useMemo(() => {
    const positions = new Set<string>();
    for (const s of sessions) {
      for (const t of s.techniques) {
        // Use category as a proxy for position grouping
        positions.add(t.category);
      }
    }
    return { totalClasses: sessions.length, positionsCovered: positions.size };
  }, [sessions]);

  // Filtered sessions for list view
  const filteredSessions = useMemo(() => {
    if (discipline === "all") return sessions;
    return sessions.filter((s) => s.discipline === discipline);
  }, [sessions, discipline]);

  // Calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOffset(year, month);
  const todayKey = toDateKey(today);

  const navigateMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null);
  };

  // Active cycle progress
  const activeCycleBanner = useMemo(() => {
    if (activeCycles.length === 0) return null;
    const cycle = activeCycles[0];
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);
    const now = new Date();
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(cycle.weeks, Math.ceil(elapsedDays / 7));
    const progressPct = Math.min(100, (elapsedDays / totalDays) * 100);

    // Count sessions logged this week
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekSessions = sessions.filter((s) => {
      if (s.cycle?.id !== cycle.id) return false;
      return new Date(s.date) >= weekStart;
    }).length;

    return { cycle, currentWeek, progressPct, thisWeekSessions };
  }, [activeCycles, sessions]);

  // Day detail
  const selectedSessions = selectedDay ? sessionsByDate.get(selectedDay) || [] : [];
  const selectedScheduled = selectedDay ? scheduledByDate.get(selectedDay) || [] : [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Active cycle banner */}
      {activeCycleBanner && (
        <Link
          href="/coach/cycles"
          className="block card p-3 mb-4 hover:border-mat-600/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gi-500 animate-pulse-dot" />
              <span className="text-sm font-medium text-mat-200">
                {activeCycleBanner.cycle.name}
              </span>
            </div>
            <span className="text-[10px] text-mat-500">
              Week {activeCycleBanner.currentWeek}/{activeCycleBanner.cycle.weeks}
              {" \u00b7 "}
              {activeCycleBanner.thisWeekSessions} of {activeCycleBanner.cycle.classesPerWeek} classes this week
            </span>
          </div>
          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{ width: `${activeCycleBanner.progressPct}%` }}
            />
          </div>
        </Link>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Calendar</h1>
        <Link href="/coach/log-class" className="btn-primary text-sm">
          + Log Class
        </Link>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-mat-400">
        <span>{stats.totalClasses} classes this month</span>
        <span className="text-mat-700">&middot;</span>
        <span>{stats.positionsCovered} areas covered</span>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 mb-4 bg-mat-900/50 border border-mat-800/50 rounded-xl p-1">
        <button
          onClick={() => setTab("calendar")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "calendar"
              ? "bg-mat-800 text-mat-100"
              : "text-mat-500 hover:text-mat-300"
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setTab("list")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "list"
              ? "bg-mat-800 text-mat-100"
              : "text-mat-500 hover:text-mat-300"
          }`}
        >
          List
        </button>
      </div>

      {/* ── Calendar Tab ──────────────────────────────────────────────── */}
      {tab === "calendar" && (
        <div className="animate-in">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-mat-800/50 text-mat-400 hover:text-mat-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-mat-200">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-mat-800/50 text-mat-400 hover:text-mat-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-mat-500 uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-px">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="aspect-square bg-mat-800/20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px">
              {/* Empty cells before first day */}
              {[...Array(firstDayOffset)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const daySessions = sessionsByDate.get(dateKey) || [];
                const dayScheduled = scheduledByDate.get(dateKey) || [];
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDay;
                const hasSession = daySessions.length > 0;
                const hasScheduled = dayScheduled.length > 0;

                // Get primary discipline for coloring
                const primaryDisc = daySessions[0]?.discipline;

                // Get first position name
                const firstPosition =
                  daySessions[0]?.techniques[0]?.name || null;

                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDay(isSelected ? null : dateKey)
                    }
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start gap-0.5 transition-all text-left relative ${
                      isSelected
                        ? "bg-gi-500/15 border border-gi-500/30"
                        : isToday
                          ? "bg-mat-800/40 ring-1 ring-gi-500/40"
                          : "hover:bg-mat-800/30"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? "text-gi-400"
                          : hasSession
                            ? "text-mat-200"
                            : "text-mat-500"
                      }`}
                    >
                      {day}
                    </span>

                    {/* Session dots */}
                    {hasSession && (
                      <div className="flex gap-0.5">
                        {daySessions.slice(0, 3).map((s, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              DISC_DOT[s.discipline] || "bg-mat-500"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Scheduled (unlogged) indicator */}
                    {!hasSession && hasScheduled && (
                      <div className="flex gap-0.5">
                        {dayScheduled.slice(0, 3).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full border border-dashed border-mat-500"
                          />
                        ))}
                      </div>
                    )}

                    {/* Truncated position name on larger screens */}
                    {firstPosition && (
                      <span className="hidden sm:block text-[8px] text-mat-500 truncate w-full text-center leading-tight">
                        {firstPosition.length > 8
                          ? firstPosition.slice(0, 8) + "..."
                          : firstPosition}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Day detail panel */}
          {selectedDay && (
            <div className="mt-4 card p-4 animate-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-mat-200">
                  {new Date(selectedDay + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )}
                </h3>
                <Link
                  href={`/coach/log-class?date=${selectedDay}`}
                  className="text-xs text-gi-400 hover:text-gi-300 font-medium"
                >
                  + Log Class
                </Link>
              </div>

              {selectedSessions.length === 0 && selectedScheduled.length === 0 ? (
                <p className="text-sm text-mat-500">No sessions on this day.</p>
              ) : (
                <div className="space-y-3">
                  {selectedSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg bg-mat-800/30 border border-mat-700/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                            DISC_BADGE[s.discipline] ||
                            "text-mat-400 bg-mat-800 border-mat-700"
                          }`}
                        >
                          {s.discipline === "nogi" ? "No-Gi" : s.discipline}
                        </span>
                        <span className="text-sm font-medium text-mat-200">
                          {s.title || "Untitled"}
                        </span>
                        {s.duration && (
                          <span className="text-[10px] text-mat-500 ml-auto">
                            {s.duration}min
                          </span>
                        )}
                      </div>
                      {s.cycle && (
                        <div className="text-[10px] text-mat-500 mb-1.5">
                          Cycle: {s.cycle.name}
                          {s.weekNumber && ` \u00b7 Week ${s.weekNumber}`}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {s.techniques.map((t) => (
                          <span
                            key={t.id}
                            className={`px-2 py-0.5 rounded text-[11px] border ${
                              t.notes
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-mat-800/50 border-mat-700/30 text-mat-400"
                            }`}
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                      {s.notes && (
                        <p className="mt-2 text-xs text-mat-500 italic">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {selectedScheduled.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg border border-dashed border-mat-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-dashed border-mat-500" />
                        <span className="text-sm text-mat-500">
                          Scheduled: {s.title || s.cycle?.name || "Untitled"}
                        </span>
                      </div>
                      <Link
                        href={`/coach/log-class?date=${selectedDay}${s.cycle ? `&cycleId=${s.cycle.id}` : ""}`}
                        className="inline-block mt-2 text-xs text-gi-400 hover:text-gi-300 font-medium"
                      >
                        Log this class
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── List Tab ──────────────────────────────────────────────────── */}
      {tab === "list" && (
        <div className="animate-in">
          <div className="mb-4">
            <DisciplineToggle selected={discipline} onChange={setDiscipline} />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-mat-800/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <SessionTimeline
              sessions={filteredSessions.map((s) => ({
                id: s.id,
                date: s.date,
                discipline: s.discipline,
                title: s.title,
                notes: s.notes,
                duration: s.duration,
                techniques: s.techniques.map((t) => ({
                  id: t.id,
                  name: t.name,
                  notes: t.notes,
                })),
              }))}
              emptyMessage="No classes logged this month"
            />
          )}
        </div>
      )}
    </div>
  );
}
