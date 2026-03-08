"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { POSITIONS } from "@/lib/data/taxonomy";

// ─── Types ────────────────────────────────────────────────────────────

interface GapEntry {
  positionSlug: string;
  categories: string[];
  notes?: string;
}

interface SavedGap {
  id: string;
  date: string;
  name: string | null;
  notes: string | null;
  gaps: GapEntry[];
  createdAt: string;
}

interface WeekPlan {
  week: number;
  theme: string;
  techniques: {
    id: string;
    name: string;
    slug: string;
    positionName: string;
    category: string;
  }[];
}

interface ClassPlan {
  weeks: WeekPlan[];
  basedOnGaps: number;
  gapPositions: string[];
}

const CATEGORIES = [
  { value: "submission", label: "Submissions" },
  { value: "sweep", label: "Sweeps" },
  { value: "pass", label: "Passes" },
  { value: "escape", label: "Escapes" },
  { value: "takedown", label: "Takedowns" },
  { value: "defense", label: "Defense" },
  { value: "control", label: "Control" },
  { value: "transition", label: "Transitions" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  submission: "bg-red-500/20 text-red-400 border-red-500/30",
  sweep: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pass: "bg-green-500/20 text-green-400 border-green-500/30",
  escape: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  takedown: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  defense: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  control: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  transition: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

// ─── Component ────────────────────────────────────────────────────────

export default function CompAnalysisPage() {
  const router = useRouter();

  // ─── Log Form State ───────────────────────────────────────
  const [compDate, setCompDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [compName, setCompName] = useState("");
  const [compNotes, setCompNotes] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [positionCategories, setPositionCategories] = useState<
    Record<string, string[]>
  >({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ─── Data State ───────────────────────────────────────────
  const [savedGaps, setSavedGaps] = useState<SavedGap[]>([]);
  const [classPlan, setClassPlan] = useState<ClassPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingGaps, setLoadingGaps] = useState(true);
  const [activeTab, setActiveTab] = useState<"log" | "plan" | "history">(
    "log"
  );

  // ─── Load saved gaps on mount ─────────────────────────────
  useEffect(() => {
    loadGaps();
  }, []);

  function loadGaps() {
    setLoadingGaps(true);
    fetch("/api/coach/comp-gaps")
      .then((r) => r.json())
      .then((data) => setSavedGaps(data.gaps || []))
      .catch(() => {})
      .finally(() => setLoadingGaps(false));
  }

  // ─── Position toggling ────────────────────────────────────
  function togglePosition(slug: string) {
    setSelectedPositions((prev) => {
      if (prev.includes(slug)) {
        // Remove position and its categories
        const next = prev.filter((s) => s !== slug);
        setPositionCategories((pc) => {
          const copy = { ...pc };
          delete copy[slug];
          return copy;
        });
        return next;
      }
      return [...prev, slug];
    });
  }

  function toggleCategory(posSlug: string, category: string) {
    setPositionCategories((prev) => {
      const current = prev[posSlug] || [];
      const next = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      return { ...prev, [posSlug]: next };
    });
  }

  // ─── Save gap analysis ───────────────────────────────────
  async function handleSave() {
    if (selectedPositions.length === 0) return;

    const gaps: GapEntry[] = selectedPositions.map((slug) => ({
      positionSlug: slug,
      categories: positionCategories[slug] || [],
    }));

    setSaving(true);
    try {
      const res = await fetch("/api/coach/comp-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: compDate,
          name: compName || undefined,
          notes: compNotes || undefined,
          gaps,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Reset form
        setSelectedPositions([]);
        setPositionCategories({});
        setCompNotes("");
        setCompName("");
        // Reload gaps
        loadGaps();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  // ─── Generate class plan ──────────────────────────────────
  async function generatePlan() {
    setLoadingPlan(true);
    try {
      const res = await fetch("/api/coach/class-plan");
      const data = await res.json();
      setClassPlan(data);
      setActiveTab("plan");
    } catch {
      // ignore
    } finally {
      setLoadingPlan(false);
    }
  }

  // ─── Use plan: navigate to log-class with pre-filled data ─
  function usePlanWeek(week: WeekPlan) {
    const techIds = week.techniques.map((t) => t.id).join(",");
    const params = new URLSearchParams({
      discipline: "nogi",
      title: week.theme,
      techniques: techIds,
    });
    router.push(`/coach/log-class?${params.toString()}`);
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mat-100">Comp Analysis</h1>
        <p className="text-sm text-mat-500 mt-1">
          Log where students got exposed at competitions, then generate a class
          plan to address the gaps.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-mat-800/30 border border-mat-700/30">
        {(
          [
            { key: "log", label: "Log Gaps" },
            { key: "plan", label: "Class Plan" },
            { key: "history", label: "History" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? "bg-mat-700/50 text-mat-100 shadow-sm"
                : "text-mat-500 hover:text-mat-300"
            }`}
          >
            {t.label}
            {t.key === "history" && savedGaps.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-mat-700/50">
                {savedGaps.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: Log Gaps
          ═══════════════════════════════════════════════════════ */}
      {activeTab === "log" && (
        <div className="space-y-6">
          {/* Competition info */}
          <div className="card p-4 space-y-4">
            <h2 className="text-lg font-semibold text-mat-100">
              Competition Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-mat-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={compDate}
                  onChange={(e) => setCompDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-mat-900 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-nogi-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-mat-500 mb-1">
                  Competition Name
                </label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. NAGA, Grappling Industries"
                  className="w-full px-3 py-2 rounded-lg bg-mat-900 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:border-nogi-500/50"
                />
              </div>
            </div>
          </div>

          {/* Position selection */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-mat-100 mb-3">
              Where did students get exposed?
            </h2>
            <p className="text-xs text-mat-500 mb-4">
              Select positions where your team lost or got dominated. Then tag
              the technique categories for each.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POSITIONS.map((pos) => {
                const isSelected = selectedPositions.includes(pos.slug);
                return (
                  <button
                    key={pos.slug}
                    onClick={() => togglePosition(pos.slug)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-nogi-500/15 border-nogi-500/40 text-nogi-400"
                        : "bg-mat-900/50 border-mat-700/30 text-mat-400 hover:border-mat-600/50 hover:text-mat-300"
                    }`}
                  >
                    {pos.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category tagging per selected position */}
          {selectedPositions.length > 0 && (
            <div className="space-y-3">
              {selectedPositions.map((posSlug) => {
                const pos = POSITIONS.find((p) => p.slug === posSlug);
                const selected = positionCategories[posSlug] || [];
                return (
                  <div
                    key={posSlug}
                    className="card p-4 border-l-2 border-l-nogi-500/50"
                  >
                    <h3 className="text-sm font-semibold text-mat-200 mb-2">
                      {pos?.name || posSlug}
                    </h3>
                    <p className="text-xs text-mat-500 mb-3">
                      What categories did students struggle with here?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => {
                        const isActive = selected.includes(cat.value);
                        return (
                          <button
                            key={cat.value}
                            onClick={() =>
                              toggleCategory(posSlug, cat.value)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isActive
                                ? CATEGORY_COLORS[cat.value]
                                : "bg-mat-800/50 border-mat-700/30 text-mat-500 hover:text-mat-400"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-mat-300 mb-2">
              Notes
            </label>
            <textarea
              value={compNotes}
              onChange={(e) => setCompNotes(e.target.value)}
              placeholder="General observations about the competition... e.g. 'Most losses came from guard — students couldn't retain guard when pressured'"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-mat-900 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:border-nogi-500/50 resize-none"
            />
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || selectedPositions.length === 0}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                selectedPositions.length === 0
                  ? "bg-mat-800 text-mat-600 cursor-not-allowed"
                  : saving
                  ? "bg-nogi-500/30 text-nogi-400 cursor-wait"
                  : "bg-nogi-500 text-white hover:bg-nogi-600 active:scale-95"
              }`}
            >
              {saving ? "Saving..." : "Save Gap Analysis"}
            </button>
            {saveSuccess && (
              <span className="text-sm text-green-400 animate-pulse">
                Saved!
              </span>
            )}
          </div>

          {/* Generate plan CTA */}
          {savedGaps.length > 0 && (
            <div className="card p-4 bg-mat-800/20 border-dashed border-mat-700/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-mat-200">
                    Ready to plan?
                  </p>
                  <p className="text-xs text-mat-500">
                    {savedGaps.length} competition{savedGaps.length !== 1 ? "s" : ""}{" "}
                    logged. Generate a 4-week class plan based on your
                    team&apos;s gaps.
                  </p>
                </div>
                <button
                  onClick={generatePlan}
                  disabled={loadingPlan}
                  className="px-4 py-2 rounded-lg bg-nogi-500/15 border border-nogi-500/30 text-nogi-400 text-sm font-medium hover:bg-nogi-500/25 transition-all"
                >
                  {loadingPlan ? "Generating..." : "Generate Plan"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Class Plan
          ═══════════════════════════════════════════════════════ */}
      {activeTab === "plan" && (
        <div className="space-y-4">
          {!classPlan && !loadingPlan && (
            <div className="text-center py-12">
              <p className="text-mat-500 mb-4">
                No plan generated yet. Log competition gaps first, then generate
                a plan.
              </p>
              <button
                onClick={generatePlan}
                disabled={loadingPlan}
                className="px-6 py-2.5 rounded-lg bg-nogi-500 text-white font-medium text-sm hover:bg-nogi-600 transition-all"
              >
                Generate 4-Week Plan
              </button>
            </div>
          )}

          {loadingPlan && (
            <div className="text-center py-12 text-mat-500">
              Analyzing gaps and building your plan...
            </div>
          )}

          {classPlan && (
            <>
              <div className="card p-4 bg-mat-800/20">
                <p className="text-sm text-mat-400">
                  Plan based on{" "}
                  <span className="text-nogi-400 font-medium">
                    {classPlan.basedOnGaps} competition
                    {classPlan.basedOnGaps !== 1 ? "s" : ""}
                  </span>{" "}
                  from the last 90 days
                  {classPlan.gapPositions.length > 0 && (
                    <>
                      {" "}
                      &mdash; targeting{" "}
                      <span className="text-mat-200">
                        {classPlan.gapPositions
                          .map(
                            (slug) =>
                              POSITIONS.find((p) => p.slug === slug)?.name ||
                              slug
                          )
                          .join(", ")}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {classPlan.weeks.map((week) => (
                <div key={week.week} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-medium text-nogi-400 uppercase tracking-wider">
                        Week {week.week}
                      </span>
                      <h3 className="text-lg font-semibold text-mat-100">
                        {week.theme}
                      </h3>
                    </div>
                    <button
                      onClick={() => usePlanWeek(week)}
                      className="px-3 py-1.5 rounded-lg bg-nogi-500/15 border border-nogi-500/30 text-nogi-400 text-xs font-medium hover:bg-nogi-500/25 transition-all"
                    >
                      Use This Plan
                    </button>
                  </div>

                  <div className="space-y-2">
                    {week.techniques.map((tech) => (
                      <div
                        key={tech.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-mat-900/50 border border-mat-800/50"
                      >
                        <div>
                          <span className="text-sm text-mat-200">
                            {tech.name}
                          </span>
                          <span className="text-xs text-mat-500 ml-2">
                            {tech.positionName}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${
                            CATEGORY_COLORS[tech.category] ||
                            "bg-mat-700/30 text-mat-400 border-mat-600/30"
                          }`}
                        >
                          {tech.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={generatePlan}
                disabled={loadingPlan}
                className="w-full py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/30 text-mat-400 text-sm font-medium hover:text-mat-300 hover:border-mat-600/50 transition-all"
              >
                Regenerate Plan
              </button>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: History
          ═══════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {loadingGaps && (
            <div className="text-center py-12 text-mat-500">
              Loading history...
            </div>
          )}

          {!loadingGaps && savedGaps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-mat-500">
                No competition gaps logged yet. Switch to the Log tab to get
                started.
              </p>
            </div>
          )}

          {savedGaps.map((gap) => (
            <div key={gap.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-mat-200">
                    {gap.name || "Competition"}
                  </h3>
                  <span className="text-xs text-mat-500">
                    {new Date(gap.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-xs text-mat-500">
                  {gap.gaps.length} position{gap.gaps.length !== 1 ? "s" : ""}{" "}
                  flagged
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {gap.gaps.map((g, i) => {
                  const pos = POSITIONS.find((p) => p.slug === g.positionSlug);
                  return (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 rounded-lg bg-mat-900/50 border border-mat-700/30"
                    >
                      <span className="text-xs font-medium text-mat-300">
                        {pos?.name || g.positionSlug}
                      </span>
                      {g.categories.length > 0 && (
                        <span className="text-xs text-mat-500 ml-1">
                          ({g.categories.join(", ")})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {gap.notes && (
                <p className="text-xs text-mat-500 mt-2 italic">
                  {gap.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
