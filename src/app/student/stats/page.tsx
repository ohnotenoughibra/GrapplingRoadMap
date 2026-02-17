"use client";

import { useState, useEffect } from "react";

interface ClassData {
  id: string;
  date: string;
  discipline: string;
  title: string | null;
}

interface WeekData {
  weekStart: string;
  count: number;
  days: { date: string; trained: boolean; discipline?: string }[];
}

export default function StatsPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/classes")
      .then((r) => r.json())
      .then((data) => {
        setClasses(data.classes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build activity data for last 16 weeks
  const weeks: WeekData[] = [];
  const today = new Date();
  const classDates = new Map<string, string>(); // date string -> discipline
  classes.forEach((c) => {
    const d = new Date(c.date).toISOString().split("T")[0];
    classDates.set(d, c.discipline);
  });

  for (let w = 15; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - w * 7);
    const days: WeekData["days"] = [];
    let count = 0;

    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      const dateStr = day.toISOString().split("T")[0];
      const trained = classDates.has(dateStr);
      if (trained) count++;
      days.push({ date: dateStr, trained, discipline: classDates.get(dateStr) });
    }

    weeks.push({
      weekStart: weekStart.toISOString().split("T")[0],
      count,
      days,
    });
  }

  // Totals
  const totalClasses = classes.length;
  const last30 = classes.filter((c) => {
    const d = new Date(c.date);
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }).length;
  const last7 = classes.filter((c) => {
    const d = new Date(c.date);
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // Discipline breakdown
  const disciplineCounts = classes.reduce(
    (acc, c) => {
      acc[c.discipline] = (acc[c.discipline] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Day of week distribution
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayDistribution = new Array(7).fill(0);
  classes.forEach((c) => {
    const day = new Date(c.date).getDay();
    dayDistribution[day]++;
  });
  const maxDay = Math.max(...dayDistribution, 1);

  // Monthly trend (last 6 months)
  const monthlyTrend: { label: string; count: number }[] = [];
  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const monthStr = monthDate.toLocaleString("en-US", { month: "short" });
    const count = classes.filter((c) => {
      const d = new Date(c.date);
      return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
    }).length;
    monthlyTrend.push({ label: monthStr, count });
  }
  const maxMonth = Math.max(...monthlyTrend.map((m) => m.count), 1);

  const disciplineColor = (d: string) =>
    d === "gi" ? "bg-gi-500" : d === "nogi" ? "bg-nogi-500" : "bg-wrestling-500";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-mat-800 rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-mat-800 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Training Stats</h1>
        <p className="text-mat-400 text-sm mt-1">Your training frequency and patterns</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-mat-100">{totalClasses}</div>
          <div className="text-xs text-mat-500">All Time</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gi-400">{last30}</div>
          <div className="text-xs text-mat-500">Last 30 Days</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-nogi-400">{last7}</div>
          <div className="text-xs text-mat-500">This Week</div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="card p-4 lg:p-6 mb-6">
        <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
          Activity — Last 16 Weeks
        </h2>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week) => (
            <div key={week.weekStart} className="flex flex-col gap-1">
              {week.days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}${day.trained ? ` — ${day.discipline}` : ""}`}
                  className={`w-3.5 h-3.5 rounded-sm ${
                    day.trained
                      ? disciplineColor(day.discipline || "gi")
                      : new Date(day.date) > today
                        ? "bg-mat-900"
                        : "bg-mat-800/50"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-mat-500">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-mat-800/50" />
          <div className="w-3 h-3 rounded-sm bg-gi-500/40" />
          <div className="w-3 h-3 rounded-sm bg-gi-500" />
          <span>More</span>
          <span className="ml-4 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gi-500" /> Gi</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-nogi-500" /> No-Gi</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-wrestling-500" /> Wrestling</span>
        </div>
      </div>

      {/* Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-4 lg:p-6">
          <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
            Favorite Training Days
          </h2>
          <div className="space-y-2">
            {dayNames.map((name, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-mat-400 w-8">{name}</span>
                <div className="flex-1 h-5 bg-mat-800/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gi-500 to-nogi-500 rounded-full transition-all"
                    style={{ width: `${(dayDistribution[i] / maxDay) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-mat-500 w-6 text-right">{dayDistribution[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card p-4 lg:p-6">
          <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
            Monthly Trend
          </h2>
          <div className="flex items-end gap-2 h-32">
            {monthlyTrend.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-mat-400">{m.count}</span>
                <div className="w-full bg-mat-800/30 rounded-t-md overflow-hidden" style={{ height: "100%" }}>
                  <div
                    className="w-full bg-gradient-to-t from-gi-500 to-nogi-500 rounded-t-md mt-auto"
                    style={{
                      height: `${(m.count / maxMonth) * 100}%`,
                      marginTop: `${100 - (m.count / maxMonth) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-mat-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discipline Breakdown */}
      <div className="card p-4 lg:p-6">
        <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
          Discipline Breakdown
        </h2>
        <div className="flex gap-4">
          {Object.entries(disciplineCounts).map(([disc, count]) => {
            const pct = totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0;
            const color = disc === "gi" ? "text-gi-400" : disc === "nogi" ? "text-nogi-400" : "text-wrestling-400";
            return (
              <div key={disc} className="flex-1 text-center">
                <div className={`text-2xl font-bold ${color}`}>{pct}%</div>
                <div className="text-xs text-mat-500 capitalize">{disc === "nogi" ? "No-Gi" : disc}</div>
                <div className="text-xs text-mat-600">{count} classes</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
