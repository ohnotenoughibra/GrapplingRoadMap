"use client";

import { Suspense, useMemo, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { POSITIONS, TECHNIQUES } from "@/lib/data/taxonomy";
import type { PositionSeed, TechniqueSeed } from "@/lib/data/taxonomy";
import {
  CATEGORY_CONFIG,
  DISCIPLINE_CONFIG,
  type TechniqueCategory,
  type Discipline,
  type Difficulty,
} from "@/types";

// ─── Constants ───────────────────────────────────────────────────────

const DIFFICULTIES: Difficulty[] = ["fundamental", "intermediate", "advanced"];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  fundamental: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  fundamental: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  intermediate: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  advanced: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as TechniqueCategory[];
const ALL_DISCIPLINES: (Discipline | "all")[] = ["all", "nogi", "gi", "wrestling"];

// Group techniques by position for quick lookup
const TECHNIQUES_BY_POSITION = TECHNIQUES.reduce<Record<string, TechniqueSeed[]>>(
  (acc, t) => {
    if (!acc[t.positionSlug]) acc[t.positionSlug] = [];
    acc[t.positionSlug].push(t);
    return acc;
  },
  {}
);

// ─── Technique Card (expandable tips & mistakes) ─────────────────────

function TechniqueCard({
  technique: t,
  getPositionName,
  onTransition,
}: {
  technique: TechniqueSeed;
  getPositionName: (slug: string) => string;
  onTransition: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasTipsOrMistakes = (t.tips?.length ?? 0) > 0 || (t.commonMistakes?.length ?? 0) > 0;

  return (
    <div className="rounded-lg bg-mat-800/30 border border-mat-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h5 className="text-sm font-medium text-mat-100">{t.name}</h5>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[t.difficulty].bg} ${DIFFICULTY_COLORS[t.difficulty].text} border ${DIFFICULTY_COLORS[t.difficulty].border}`}
            >
              {DIFFICULTY_LABELS[t.difficulty]}
            </span>
            {t.discipline !== "all" ? (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${DISCIPLINE_CONFIG[t.discipline].bg} ${DISCIPLINE_CONFIG[t.discipline].text} border ${DISCIPLINE_CONFIG[t.discipline].border}`}
              >
                {DISCIPLINE_CONFIG[t.discipline].label}
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-mat-700/50 text-mat-400 border border-mat-600/30">
                All
              </span>
            )}
          </div>
        </div>
        {t.description && (
          <p className="text-xs text-mat-400 mb-1.5">{t.description}</p>
        )}
        <div className="flex items-center gap-3">
          {t.transitionTarget && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTransition(t.transitionTarget!);
              }}
              className="inline-flex items-center gap-1 text-xs text-gi-400 hover:text-gi-300 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {getPositionName(t.transitionTarget)}
            </button>
          )}
          {hasTipsOrMistakes && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs text-mat-400 hover:text-mat-200 transition-colors ml-auto"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Tips &amp; Details
            </button>
          )}
        </div>
      </div>

      {/* Expanded section */}
      {expanded && hasTipsOrMistakes && (
        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-mat-700/30">
          {/* Tips */}
          {t.tips && t.tips.length > 0 && (
            <div className="pt-2.5">
              <h6 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Tips
              </h6>
              <div className="space-y-1 ml-0.5">
                {t.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-mat-300 leading-snug">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {t.commonMistakes && t.commonMistakes.length > 0 && (
            <div className={t.tips?.length ? "" : "pt-2.5"}>
              <h6 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Common Mistakes
              </h6>
              <div className="space-y-1 ml-0.5">
                {t.commonMistakes.map((mistake, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-mat-300 leading-snug">{mistake}</span>
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

// ─── Add Technique Form ──────────────────────────────────────────────

function AddTechniqueForm({
  positionSlug,
  positionName,
  onClose,
  onAdded,
}: {
  positionSlug: string;
  positionName: string;
  onClose: () => void;
  onAdded: (t: TechniqueSeed) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TechniqueCategory>("submission");
  const [discipline, setDiscipline] = useState<Discipline | "all">("nogi");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [summary, setSummary] = useState("");
  const [tips, setTips] = useState<string[]>([""]);
  const [mistakes, setMistakes] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/techniques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          positionSlug,
          category,
          discipline,
          difficulty,
          summary: summary.trim() || undefined,
          tips: tips.filter((t) => t.trim()),
          commonMistakes: mistakes.filter((m) => m.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add technique");
        setSaving(false);
        return;
      }
      // Convert to TechniqueSeed shape for local state
      const newTech: TechniqueSeed = {
        slug: data.technique.slug,
        name: data.technique.name,
        positionSlug,
        category: data.technique.category as TechniqueCategory,
        discipline: data.technique.discipline as Discipline | "all",
        difficulty: data.technique.difficulty as Difficulty,
        summary: data.technique.summary || "",
        description: data.technique.summary || "",
        tips: data.technique.tips || [],
        commonMistakes: data.technique.commonMistakes || [],
        transitionTarget: data.technique.transitionTarget || undefined,
      };
      onAdded(newTech);
      onClose();
    } catch {
      setError("Network error");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gi-500/30 rounded-lg bg-mat-800/50 p-4 space-y-3 animate-in">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-mat-100">
          Add technique to {positionName}
        </h4>
        <button type="button" onClick={onClose} className="text-mat-500 hover:text-mat-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
      )}

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Technique name"
        required
        className="w-full px-3 py-2 bg-mat-800/50 border border-mat-700/50 rounded-lg text-mat-100 placeholder:text-mat-500 text-sm focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30"
      />

      {/* Category + Discipline + Difficulty in a row */}
      <div className="grid grid-cols-3 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TechniqueCategory)}
          className="px-2 py-2 bg-mat-800/50 border border-mat-700/50 rounded-lg text-mat-100 text-xs focus:outline-none focus:border-gi-500/50"
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
          ))}
        </select>
        <select
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value as Discipline | "all")}
          className="px-2 py-2 bg-mat-800/50 border border-mat-700/50 rounded-lg text-mat-100 text-xs focus:outline-none focus:border-gi-500/50"
        >
          <option value="all">All</option>
          <option value="nogi">No-Gi</option>
          <option value="gi">Gi</option>
          <option value="wrestling">Wrestling</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="px-2 py-2 bg-mat-800/50 border border-mat-700/50 rounded-lg text-mat-100 text-xs focus:outline-none focus:border-gi-500/50"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Brief summary (optional)"
        rows={2}
        className="w-full px-3 py-2 bg-mat-800/50 border border-mat-700/50 rounded-lg text-mat-100 placeholder:text-mat-500 text-xs focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30 resize-none"
      />

      {/* Tips */}
      <div>
        <label className="text-xs text-mat-400 font-medium mb-1 block">Tips</label>
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-1 mb-1">
            <input
              value={tip}
              onChange={(e) => { const t = [...tips]; t[i] = e.target.value; setTips(t); }}
              placeholder={`Tip ${i + 1}`}
              className="flex-1 px-2 py-1.5 bg-mat-800/50 border border-mat-700/50 rounded text-mat-100 placeholder:text-mat-500 text-xs focus:outline-none focus:border-gi-500/50"
            />
            {tips.length > 1 && (
              <button type="button" onClick={() => setTips(tips.filter((_, j) => j !== i))} className="text-mat-500 hover:text-red-400 px-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
        {tips.length < 4 && (
          <button type="button" onClick={() => setTips([...tips, ""])} className="text-xs text-gi-400 hover:text-gi-300 mt-0.5">+ Add tip</button>
        )}
      </div>

      {/* Common Mistakes */}
      <div>
        <label className="text-xs text-mat-400 font-medium mb-1 block">Common Mistakes</label>
        {mistakes.map((m, i) => (
          <div key={i} className="flex gap-1 mb-1">
            <input
              value={m}
              onChange={(e) => { const ms = [...mistakes]; ms[i] = e.target.value; setMistakes(ms); }}
              placeholder={`Mistake ${i + 1}`}
              className="flex-1 px-2 py-1.5 bg-mat-800/50 border border-mat-700/50 rounded text-mat-100 placeholder:text-mat-500 text-xs focus:outline-none focus:border-gi-500/50"
            />
            {mistakes.length > 1 && (
              <button type="button" onClick={() => setMistakes(mistakes.filter((_, j) => j !== i))} className="text-mat-500 hover:text-red-400 px-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
        {mistakes.length < 3 && (
          <button type="button" onClick={() => setMistakes([...mistakes, ""])} className="text-xs text-gi-400 hover:text-gi-300 mt-0.5">+ Add mistake</button>
        )}
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full py-2.5 rounded-lg bg-gi-600 text-white font-medium text-sm transition-all hover:bg-gi-500 active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? "Adding..." : "Add Technique"}
      </button>
    </form>
  );
}

// ─── Library Content (uses searchParams) ─────────────────────────────

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isCoach = (session?.user as any)?.role === "coach";

  // Custom techniques state
  const [customTechniques, setCustomTechniques] = useState<TechniqueSeed[]>([]);
  const [addingToPosition, setAddingToPosition] = useState<string | null>(null);

  // Read filters from URL
  const search = searchParams.get("search") || "";
  const disciplineFilter = (searchParams.get("discipline") || "all") as Discipline | "all";
  const categoryFilter = (searchParams.get("category") || "") as TechniqueCategory | "";
  const difficultyFilter = (searchParams.get("difficulty") || "") as Difficulty | "";
  const expandedSlug = searchParams.get("position") || "";

  // Update URL params without full page reload
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset position expansion when filters change (except position itself)
      if (key !== "position") {
        params.delete("position");
      }
      router.replace(`/library?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Merge static + custom techniques by position
  const allTechniquesByPosition = useMemo(() => {
    const merged = { ...TECHNIQUES_BY_POSITION };
    for (const t of customTechniques) {
      if (!merged[t.positionSlug]) merged[t.positionSlug] = [];
      // Avoid duplicates
      if (!merged[t.positionSlug].some((x) => x.slug === t.slug)) {
        merged[t.positionSlug] = [...merged[t.positionSlug], t];
      }
    }
    return merged;
  }, [customTechniques]);

  // Filter logic
  const { filteredPositions, totalTechniques, totalPositions } = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    const results: { position: PositionSeed; techniques: TechniqueSeed[] }[] = [];
    let techCount = 0;

    for (const pos of POSITIONS) {
      const posTechniques = allTechniquesByPosition[pos.slug] || [];

      // Filter techniques
      const filtered = posTechniques.filter((t) => {
        if (disciplineFilter !== "all" && t.discipline !== "all" && t.discipline !== disciplineFilter)
          return false;
        if (categoryFilter && t.category !== categoryFilter) return false;
        if (difficultyFilter && t.difficulty !== difficultyFilter) return false;
        if (lowerSearch) {
          const matchesTech = t.name.toLowerCase().includes(lowerSearch);
          const matchesPos = pos.name.toLowerCase().includes(lowerSearch);
          const matchesDesc = (t.description || "").toLowerCase().includes(lowerSearch);
          if (!matchesTech && !matchesPos && !matchesDesc) return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        results.push({ position: pos, techniques: filtered });
        techCount += filtered.length;
      }
    }

    return {
      filteredPositions: results,
      totalTechniques: techCount,
      totalPositions: results.length,
    };
  }, [search, disciplineFilter, categoryFilter, difficultyFilter]);

  // Category distribution for a position
  const getCategoryDots = (techniques: TechniqueSeed[]) => {
    const counts: Partial<Record<TechniqueCategory, number>> = {};
    for (const t of techniques) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // show top 6 categories
  };

  // Get position name from slug for transition targets
  const getPositionName = (slug: string) => {
    return POSITIONS.find((p) => p.slug === slug)?.name || slug;
  };

  // Group techniques by category
  const groupByCategory = (techniques: TechniqueSeed[]) => {
    const groups: Record<string, TechniqueSeed[]> = {};
    for (const t of techniques) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return Object.entries(groups).sort(
      (a, b) =>
        ALL_CATEGORIES.indexOf(a[0] as TechniqueCategory) -
        ALL_CATEGORIES.indexOf(b[0] as TechniqueCategory)
    );
  };

  return (
    <div className="space-y-6">
      {/* ─── Search bar ──────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 bg-mat-950/80 backdrop-blur-md -mx-4 px-4 py-3 border-b border-mat-800/30">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mat-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="Search positions, techniques..."
            className="w-full pl-10 pr-4 py-3 bg-mat-800/50 border border-mat-700/50 rounded-xl text-mat-100 placeholder:text-mat-500 text-base focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => setParam("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mat-500 hover:text-mat-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ─── Filter chips ──────────────────────────────────────── */}
        <div className="mt-3 space-y-2">
          {/* Discipline toggles */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {ALL_DISCIPLINES.map((d) => {
              const active = disciplineFilter === d;
              const label = d === "all" ? "All" : d === "nogi" ? "No-Gi" : d === "gi" ? "Gi" : "Wrestling";
              return (
                <button
                  key={d}
                  onClick={() => setParam("discipline", d === "all" ? "" : d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? d === "all"
                        ? "bg-mat-700 text-mat-100"
                        : `${DISCIPLINE_CONFIG[d as Discipline].bg} ${DISCIPLINE_CONFIG[d as Discipline].text} border ${DISCIPLINE_CONFIG[d as Discipline].border}`
                      : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60 hover:text-mat-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}

            <div className="w-px bg-mat-700/50 mx-1 self-stretch" />

            {/* Difficulty toggles */}
            {DIFFICULTIES.map((d) => {
              const active = difficultyFilter === d;
              const cfg = DIFFICULTY_COLORS[d];
              return (
                <button
                  key={d}
                  onClick={() => setParam("difficulty", active ? "" : d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? `${cfg.bg} ${cfg.text} border ${cfg.border}`
                      : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60 hover:text-mat-300"
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              );
            })}
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setParam("category", "")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                !categoryFilter
                  ? "bg-mat-700 text-mat-100"
                  : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60 hover:text-mat-300"
              }`}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const active = categoryFilter === cat;
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setParam("category", active ? "" : cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? `${cfg.bg} ${cfg.text} border ${cfg.border}`
                      : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60 hover:text-mat-300"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Results count ───────────────────────────────────────── */}
      <div className="text-sm text-mat-400">
        Showing {totalTechniques} technique{totalTechniques !== 1 ? "s" : ""} across{" "}
        {totalPositions} position{totalPositions !== 1 ? "s" : ""}
      </div>

      {/* ─── Position cards grid ─────────────────────────────────── */}
      {filteredPositions.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-12 h-12 text-mat-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-mat-400 text-base font-medium mb-1">No techniques found</p>
          <p className="text-mat-500 text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPositions.map(({ position, techniques }) => {
            const isExpanded = expandedSlug === position.slug;
            const dots = getCategoryDots(techniques);

            return (
              <div
                key={position.slug}
                className={`card transition-all duration-200 ${
                  isExpanded
                    ? "md:col-span-2 lg:col-span-3 border-gi-500/30"
                    : "hover:border-mat-700/50 hover:bg-mat-900/70 cursor-pointer"
                }`}
              >
                {/* Card header — always visible */}
                <button
                  onClick={() =>
                    setParam("position", isExpanded ? "" : position.slug)
                  }
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-mat-100 mb-1">
                        {position.name}
                      </h3>
                      {position.description && (
                        <p
                          className={`text-sm text-mat-400 ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {position.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-mat-800 text-mat-300 text-xs font-medium">
                        {techniques.length}
                      </span>
                      <svg
                        className={`w-4 h-4 text-mat-500 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Category dots */}
                  {!isExpanded && (
                    <div className="flex items-center gap-1 mt-2.5">
                      {dots.map(([cat, count]) => {
                        const cfg = CATEGORY_CONFIG[cat as TechniqueCategory];
                        return Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                          <div
                            key={`${cat}-${i}`}
                            className={`w-2 h-2 rounded-full ${cfg.bg} border ${cfg.border}`}
                            title={`${cfg.label}: ${count}`}
                          />
                        ));
                      })}
                    </div>
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 animate-in">
                    <div className="border-t border-mat-800/50 pt-4 space-y-5">
                      {groupByCategory(techniques).map(([cat, techs]) => {
                        const cfg = CATEGORY_CONFIG[cat as TechniqueCategory];
                        return (
                          <div key={cat}>
                            <h4
                              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${cfg.text}`}
                            >
                              {cfg.label} ({techs.length})
                            </h4>
                            <div className="space-y-2">
                              {techs.map((t) => (
                                <TechniqueCard
                                  key={t.slug}
                                  technique={t}
                                  getPositionName={getPositionName}
                                  onTransition={(slug) => setParam("position", slug)}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Technique */}
                      {isCoach && addingToPosition === position.slug ? (
                        <AddTechniqueForm
                          positionSlug={position.slug}
                          positionName={position.name}
                          onClose={() => setAddingToPosition(null)}
                          onAdded={(t) => {
                            setCustomTechniques((prev) => [...prev, t]);
                            setAddingToPosition(null);
                          }}
                        />
                      ) : isCoach ? (
                        <button
                          onClick={() => setAddingToPosition(position.slug)}
                          className="w-full py-2.5 rounded-lg border border-dashed border-mat-700/50 text-mat-400 text-sm hover:border-gi-500/40 hover:text-gi-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Technique
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page wrapper with Suspense ──────────────────────────────────────

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-mat-700 border-t-gi-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
