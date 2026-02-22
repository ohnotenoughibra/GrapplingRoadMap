"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline } from "@/types";

interface ClassData {
  id: string;
  date: string;
  discipline: string;
  title: string | null;
  notes: string | null;
  techniques: { technique: { id: string; name: string; position: { name: string } } }[];
  attendees: { user: { id: string; name: string; beltRank: string } }[];
  coach: { name: string };
}

export default function ClassHistoryPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => setClasses(data.classes || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = discipline === "all"
    ? classes
    : classes.filter((c) => c.discipline === discipline);

  // Group by week
  const weeks = new Map<string, ClassData[]>();
  for (const cls of filtered) {
    const d = new Date(cls.date);
    const weekStart = new Date(d);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key)!.push(cls);
  }

  const beltColors: Record<string, string> = {
    white: "bg-mat-300", blue: "bg-blue-500", purple: "bg-purple-500",
    brown: "bg-amber-700", black: "bg-mat-100",
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-mat-800 rounded-lg" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-mat-800/30 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Class History</h1>
          <p className="text-mat-400 text-sm mt-0.5">{filtered.length} classes logged</p>
        </div>
        <Link href="/coach/log-class" className="btn-primary text-sm">+ Log Class</Link>
      </div>

      <div className="mb-5">
        <DisciplineToggle selected={discipline} onChange={setDiscipline} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-mat-300 font-medium">No classes logged yet</p>
          <p className="text-xs text-mat-500 mt-1">Start by logging your first class.</p>
          <Link href="/coach/log-class" className="inline-block mt-4 btn-primary text-sm">Log a Class</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(weeks.entries()).map(([weekKey, weekClasses]) => {
            const weekDate = new Date(weekKey);
            const weekEnd = new Date(weekDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const weekLabel = `${weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

            return (
              <div key={weekKey}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-xs font-semibold text-mat-500 uppercase tracking-wider">{weekLabel}</div>
                  <div className="flex-1 h-px bg-mat-800/50" />
                  <div className="text-[10px] text-mat-600">{weekClasses.length} classes</div>
                </div>

                <div className="space-y-2">
                  {weekClasses.map((cls) => {
                    const isExpanded = expandedId === cls.id;
                    const d = new Date(cls.date);
                    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                    const discColor = cls.discipline === "gi" ? "text-gi-400" : cls.discipline === "nogi" ? "text-nogi-400" : "text-wrestling-400";
                    const discBg = cls.discipline === "gi" ? "bg-gi-500/10" : cls.discipline === "nogi" ? "bg-nogi-500/10" : "bg-wrestling-500/10";

                    return (
                      <div key={cls.id} className="card overflow-hidden">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : cls.id)}
                          className="w-full text-left p-4 active:bg-mat-800/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-center flex-shrink-0 w-10">
                              <div className="text-[10px] text-mat-500 uppercase">{dayName}</div>
                              <div className="text-lg font-bold text-mat-200">{d.getDate()}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${discBg} ${discColor}`}>
                                  {cls.discipline}
                                </span>
                                <span className="text-sm font-medium text-mat-200 truncate">
                                  {cls.title || "Untitled Class"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-mat-500">{cls.techniques.length} techniques</span>
                                <span className="text-[10px] text-mat-500">{cls.attendees.length} students</span>
                              </div>
                            </div>
                            <svg className={`w-4 h-4 text-mat-500 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-mat-800/50 p-4 space-y-4">
                            {cls.notes && (
                              <p className="text-sm text-mat-400 italic">{cls.notes}</p>
                            )}

                            <div>
                              <div className="text-[10px] font-semibold text-mat-500 uppercase tracking-wider mb-2">Techniques</div>
                              <div className="flex flex-wrap gap-1.5">
                                {cls.techniques.map((ct) => (
                                  <span key={ct.technique.id} className="px-2 py-1 rounded-md text-xs bg-mat-800/50 text-mat-300 border border-mat-700/30">
                                    {ct.technique.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {cls.attendees.length > 0 && (
                              <div>
                                <div className="text-[10px] font-semibold text-mat-500 uppercase tracking-wider mb-2">Attendance ({cls.attendees.length})</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {cls.attendees.map((a) => (
                                    <span key={a.user.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-mat-800/50 text-mat-300 border border-mat-700/30">
                                      <span className={`w-1.5 h-1.5 rounded-full ${beltColors[a.user.beltRank] || "bg-mat-500"}`} />
                                      {a.user.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
