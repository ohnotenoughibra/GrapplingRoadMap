"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/* ── Types ────────────────────────────────────────────────────────────── */

interface GapEntry {
  positionSlug: string;
  categories: string[];
  notes?: string;
}

interface CompGap {
  id: string;
  date: string;
  name: string | null;
  gaps: GapEntry[];
}

interface HeatmapPosition {
  slug: string;
  name: string;
  sortOrder: number;
}

interface HeatmapCell {
  count: number;
  techniques: string[];
}

/* ── Constants ────────────────────────────────────────────────────────── */

const WEEK_OPTIONS = [4, 6, 8, 12];
const CLASSES_PER_WEEK_OPTIONS = [2, 3, 4, 5];
const DURATION_OPTIONS = [60, 75, 90, 120];
const FOCUS_OPTIONS = [
  {
    value: "competition",
    label: "Competition Prep",
    desc: "Sharpen comp-specific positions and game plans",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.45 0m5.45 0a6 6 0 01-2.72 0" />
      </svg>
    ),
  },
  {
    value: "curriculum",
    label: "Curriculum",
    desc: "Systematic position-by-position coverage",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    value: "fundamentals",
    label: "Fundamentals",
    desc: "Core concepts and high-percentage techniques",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    value: "custom",
    label: "Custom",
    desc: "Build your own focus from scratch",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function NewCyclePage() {
  const router = useRouter();

  // Section 1: Configuration
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState<number | null>(null);
  const [classesPerWeek, setClassesPerWeek] = useState<number | null>(null);
  const [classDuration, setClassDuration] = useState<number | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Section 2: Topics
  const [topicSource, setTopicSource] = useState<"gaps" | "heatmap" | "custom" | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Data sources
  const [compGaps, setCompGaps] = useState<CompGap[]>([]);
  const [heatmapPositions, setHeatmapPositions] = useState<HeatmapPosition[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, Record<string, HeatmapCell>>>({});
  const [allPositions, setAllPositions] = useState<HeatmapPosition[]>([]);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  // Section 3 state
  const [saving, setSaving] = useState(false);

  // Auto-suggest name
  useEffect(() => {
    if (!name && startDate) {
      const d = new Date(startDate + "T12:00:00");
      const suggestion = `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      setName(suggestion);
    }
  }, [startDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Section 1 complete?
  const section1Complete = !!(name && weeks && classesPerWeek && classDuration && focus && startDate);

  // Load comp gaps when topic source changes
  useEffect(() => {
    if (topicSource === "gaps" && compGaps.length === 0) {
      setLoadingGaps(true);
      fetch("/api/coach/comp-gaps")
        .then((r) => r.json())
        .then((data) => setCompGaps(data.gaps || []))
        .catch(() => {})
        .finally(() => setLoadingGaps(false));
    }
  }, [topicSource]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load heatmap when topic source changes
  useEffect(() => {
    if (topicSource === "heatmap" && allPositions.length === 0) {
      setLoadingHeatmap(true);
      fetch("/api/heatmap?days=90")
        .then((r) => r.json())
        .then((data) => {
          setAllPositions(data.positions || []);
          setHeatmapData(data.heatmap || {});
          // Find low-coverage positions
          const positions = (data.positions || []) as HeatmapPosition[];
          const heatmap = (data.heatmap || {}) as Record<string, Record<string, HeatmapCell>>;
          const lowCoverage = positions.filter((p) => {
            const cells = heatmap[p.slug];
            if (!cells) return true;
            const total = Object.values(cells).reduce((sum, c) => sum + c.count, 0);
            return total < 3; // Less than 3 technique touches in 90 days
          });
          setHeatmapPositions(lowCoverage);
        })
        .catch(() => {})
        .finally(() => setLoadingHeatmap(false));
    }
  }, [topicSource]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all positions for custom source
  useEffect(() => {
    if (topicSource === "custom" && allPositions.length === 0) {
      fetch("/api/heatmap?days=90")
        .then((r) => r.json())
        .then((data) => {
          setAllPositions(data.positions || []);
          setHeatmapData(data.heatmap || {});
        })
        .catch(() => {});
    }
  }, [topicSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTopic = (slug: string) => {
    setSelectedTopics((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    );
  };

  // Gap-derived positions
  const gapPositions = useMemo(() => {
    const positions = new Map<string, string[]>();
    for (const gap of compGaps) {
      for (const entry of gap.gaps) {
        if (!positions.has(entry.positionSlug)) {
          positions.set(entry.positionSlug, []);
        }
        for (const cat of entry.categories) {
          if (!positions.get(entry.positionSlug)!.includes(cat)) {
            positions.get(entry.positionSlug)!.push(cat);
          }
        }
      }
    }
    return positions;
  }, [compGaps]);

  // Section 2 complete?
  const section2Complete = selectedTopics.length > 0;

  // Preview calculations
  const totalClasses = (weeks || 0) * (classesPerWeek || 0);

  // Handle create
  const handleCreate = async () => {
    if (!section1Complete || !section2Complete) return;
    setSaving(true);

    try {
      const res = await fetch("/api/coach/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          weeks,
          classesPerWeek,
          classDuration,
          focus,
          source: topicSource,
          sourceData: { topics: selectedTopics },
          startDate,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        router.push("/coach/cycles");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-mat-500 hover:text-mat-300 mb-2 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">
          New Training Cycle
        </h1>
        <p className="text-mat-400 text-sm mt-1">
          Plan a multi-week focus to level up your team
        </p>
      </div>

      {/* ── Section 1: Configuration ──────────────────────────────────── */}
      <div className="card p-4 lg:p-6 mb-4">
        <div className="text-[10px] font-semibold text-mat-500 uppercase tracking-wider mb-4">
          1. Configuration
        </div>

        {/* Name + Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-mat-400 mb-1.5">
              Cycle Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Guard Recovery Block"
              className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mat-400 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-3 lg:py-2 rounded-xl lg:rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-mat-400 mb-2">
            Duration (weeks)
          </label>
          <div className="flex gap-2">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  weeks === w
                    ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                    : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50 hover:text-mat-200"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Classes per week */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-mat-400 mb-2">
            Classes per Week
          </label>
          <div className="flex gap-2">
            {CLASSES_PER_WEEK_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setClassesPerWeek(c)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  classesPerWeek === c
                    ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                    : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50 hover:text-mat-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Class duration */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-mat-400 mb-2">
            Class Duration (min)
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setClassDuration(d)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  classDuration === d
                    ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                    : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50 hover:text-mat-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div>
          <label className="block text-xs font-medium text-mat-400 mb-2">
            Focus
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FOCUS_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFocus(f.value)}
                className={`text-left p-3 rounded-xl transition-all ${
                  focus === f.value
                    ? "bg-gi-500/10 border border-gi-500/30"
                    : "bg-mat-800/20 border border-mat-800/30 hover:bg-mat-800/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={
                      focus === f.value ? "text-gi-400" : "text-mat-500"
                    }
                  >
                    {f.icon}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      focus === f.value ? "text-gi-400" : "text-mat-300"
                    }`}
                  >
                    {f.label}
                  </span>
                </div>
                <p className="text-[11px] text-mat-500 ml-7">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-mat-400 mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Goals, context, athlete-specific notes..."
            className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50 resize-none"
          />
        </div>
      </div>

      {/* ── Section 2: Topics ─────────────────────────────────────────── */}
      {section1Complete && (
        <div className="card p-4 lg:p-6 mb-4 animate-in">
          <div className="text-[10px] font-semibold text-mat-500 uppercase tracking-wider mb-4">
            2. Topics &mdash; What to Focus On
          </div>

          {/* Source selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTopicSource("gaps")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                topicSource === "gaps"
                  ? "bg-wrestling-500/15 text-wrestling-400 border border-wrestling-500/30"
                  : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50"
              }`}
            >
              From Comp Gaps
            </button>
            <button
              onClick={() => setTopicSource("heatmap")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                topicSource === "heatmap"
                  ? "bg-nogi-500/15 text-nogi-400 border border-nogi-500/30"
                  : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50"
              }`}
            >
              From Heatmap
            </button>
            <button
              onClick={() => setTopicSource("custom")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                topicSource === "custom"
                  ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                  : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Comp gaps chips */}
          {topicSource === "gaps" && (
            <div className="animate-in">
              {loadingGaps ? (
                <div className="flex gap-2 flex-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-mat-800/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : compGaps.length === 0 ? (
                <p className="text-sm text-mat-500">
                  No competition gaps recorded yet. Log a comp analysis first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from(gapPositions.entries()).map(([slug, categories]) => {
                    const isSelected = selectedTopics.includes(slug);
                    return (
                      <button
                        key={slug}
                        onClick={() => toggleTopic(slug)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          isSelected
                            ? "bg-wrestling-500/15 text-wrestling-400 border border-wrestling-500/30"
                            : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50 hover:text-mat-200"
                        }`}
                      >
                        <span className="font-medium">{slug.replace(/-/g, " ")}</span>
                        <span className="text-[10px] ml-1 opacity-70">
                          ({categories.length})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Heatmap low-coverage chips */}
          {topicSource === "heatmap" && (
            <div className="animate-in">
              {loadingHeatmap ? (
                <div className="flex gap-2 flex-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-mat-800/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : heatmapPositions.length === 0 ? (
                <p className="text-sm text-mat-500">
                  All positions have good coverage in the last 90 days.
                </p>
              ) : (
                <>
                  <p className="text-xs text-mat-500 mb-3">
                    Positions with low coverage in the last 90 days:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {heatmapPositions.map((p) => {
                      const isSelected = selectedTopics.includes(p.slug);
                      return (
                        <button
                          key={p.slug}
                          onClick={() => toggleTopic(p.slug)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            isSelected
                              ? "bg-nogi-500/15 text-nogi-400 border border-nogi-500/30"
                              : "bg-mat-800/30 text-mat-400 border border-mat-800/30 hover:bg-mat-800/50 hover:text-mat-200"
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Custom position picker */}
          {topicSource === "custom" && (
            <div className="animate-in">
              {allPositions.length === 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-mat-800/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allPositions.map((p) => {
                    const isSelected = selectedTopics.includes(p.slug);
                    const cells = heatmapData[p.slug];
                    const coverage = cells
                      ? Object.values(cells).reduce((s, c) => s + c.count, 0)
                      : 0;
                    return (
                      <button
                        key={p.slug}
                        onClick={() => toggleTopic(p.slug)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          isSelected
                            ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                            : "bg-mat-800/20 text-mat-400 border border-mat-800/30 hover:bg-mat-800/40 hover:text-mat-200"
                        }`}
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[10px] opacity-60">
                          {coverage} touches (90d)
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selected topics summary */}
          {selectedTopics.length > 0 && (
            <div className="mt-4 pt-3 border-t border-mat-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-mat-500">
                  {selectedTopics.length} topics selected
                </span>
                <button
                  onClick={() => setSelectedTopics([])}
                  className="text-xs text-mat-500 hover:text-mat-300"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedTopics.map((slug) => {
                  const pos = allPositions.find((p) => p.slug === slug);
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-gi-500/10 text-gi-400 border border-gi-500/20"
                    >
                      {pos?.name || slug.replace(/-/g, " ")}
                      <button
                        onClick={() => toggleTopic(slug)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 3: Preview ────────────────────────────────────────── */}
      {section1Complete && section2Complete && (
        <div className="card p-4 lg:p-6 mb-4 animate-in">
          <div className="text-[10px] font-semibold text-mat-500 uppercase tracking-wider mb-4">
            3. Preview
          </div>

          {/* Mini calendar grid */}
          <div className="space-y-2 mb-4">
            {[...Array(weeks || 0)].map((_, weekIdx) => (
              <div key={weekIdx} className="flex items-center gap-2">
                <span className="text-[10px] text-mat-600 w-10 flex-shrink-0">
                  W{weekIdx + 1}
                </span>
                <div className="flex gap-1 flex-1">
                  {[...Array(classesPerWeek || 0)].map((_, dayIdx) => {
                    const topicIdx =
                      (weekIdx * (classesPerWeek || 0) + dayIdx) %
                      selectedTopics.length;
                    const topicSlug = selectedTopics[topicIdx];
                    const pos = allPositions.find(
                      (p) => p.slug === topicSlug
                    );
                    return (
                      <div
                        key={dayIdx}
                        className="flex-1 px-2 py-1.5 rounded bg-mat-800/30 border border-mat-700/20 text-center"
                      >
                        <div className="text-[10px] text-mat-400 truncate">
                          {pos?.name || topicSlug?.replace(/-/g, " ") || "TBD"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-3 rounded-lg bg-mat-800/20 border border-mat-700/20">
            <div className="text-sm text-mat-300">
              <span className="font-medium text-mat-200">{totalClasses} classes</span>
              {" over "}
              <span className="font-medium text-mat-200">{weeks} weeks</span>
              {" covering "}
              <span className="font-medium text-mat-200">
                {selectedTopics.length} positions
              </span>
            </div>
            <div className="text-xs text-mat-500 mt-1">
              {classesPerWeek}x/week &middot; {classDuration}min each
              {" \u00b7 "}
              Starts{" "}
              {new Date(startDate + "T12:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Button ─────────────────────────────────────────────── */}
      {section1Complete && section2Complete && (
        <div className="sticky bottom-20 lg:static mb-4">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-mat-950/80 lg:shadow-none"
          >
            {saving ? "Creating..." : "Create Training Cycle"}
          </button>
        </div>
      )}
    </div>
  );
}
