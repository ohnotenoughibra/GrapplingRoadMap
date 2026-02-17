"use client";

import { useState } from "react";

interface PlannedTechnique {
  id: string;
  name: string;
  position: string;
  category: string;
  difficulty: string;
  reason: string;
}

interface ClassPlan {
  discipline: string;
  suggestedTitle: string;
  techniques: PlannedTechnique[];
  warmupSuggestion: string;
  focusAreas: string[];
}

export default function PlanClassPage() {
  const [discipline, setDiscipline] = useState("nogi");
  const [focus, setFocus] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [plan, setPlan] = useState<ClassPlan | null>(null);
  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    setLoading(true);
    const res = await fetch("/api/ai/class-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discipline, focus: focus || undefined, difficulty: difficulty || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setPlan(data);
    }
    setLoading(false);
  }

  async function useThisPlan() {
    if (!plan) return;
    // Navigate to log-class with pre-filled data
    const params = new URLSearchParams({
      discipline: plan.discipline,
      title: plan.suggestedTitle,
      techniques: plan.techniques.map((t) => t.id).join(","),
      warmup: plan.warmupSuggestion,
    });
    window.location.href = `/coach/log-class?${params.toString()}`;
  }

  const reasonColor = (r: string) => {
    if (r === "Never taught") return "text-red-400";
    if (r === "Student weak spot") return "text-yellow-400";
    return "text-mat-500";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mat-100">AI Class Planner</h1>
        <p className="text-sm text-mat-500 mt-1">
          Generate a class plan based on what your students need
        </p>
      </div>

      {/* Controls */}
      <div className="card p-5 mb-6 space-y-4">
        <div>
          <div className="text-xs text-mat-500 mb-2">Discipline *</div>
          <div className="flex gap-2">
            {["gi", "nogi", "wrestling"].map((d) => (
              <button
                key={d}
                onClick={() => setDiscipline(d)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  discipline === d
                    ? d === "gi" ? "bg-gi-500/20 border border-gi-500/40 text-gi-400"
                      : d === "nogi" ? "bg-nogi-500/20 border border-nogi-500/40 text-nogi-400"
                        : "bg-wrestling-500/20 border border-wrestling-500/40 text-wrestling-400"
                    : "bg-mat-800/30 border border-mat-700/30 text-mat-500"
                }`}
              >
                {d === "nogi" ? "No-Gi" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-mat-500 mb-2">Focus area (optional)</div>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-gi-500/50"
            >
              <option value="">Any</option>
              <optgroup label="Category">
                <option value="submission">Submissions</option>
                <option value="sweep">Sweeps</option>
                <option value="pass">Passes</option>
                <option value="escape">Escapes</option>
                <option value="takedown">Takedowns</option>
                <option value="control">Control</option>
              </optgroup>
            </select>
          </div>
          <div>
            <div className="text-xs text-mat-500 mb-2">Difficulty (optional)</div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-gi-500/50"
            >
              <option value="">Any</option>
              <option value="fundamental">Fundamental</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? "Generating plan..." : "Generate Class Plan"}
        </button>
      </div>

      {/* Plan output */}
      {plan && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-mat-100">{plan.suggestedTitle}</h2>
                <div className="flex gap-2 mt-1">
                  {plan.focusAreas.map((area) => (
                    <span key={area} className="text-[10px] px-2 py-0.5 rounded-full bg-mat-800 text-mat-400 border border-mat-700/30">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={useThisPlan}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30 hover:bg-green-500/30 transition-all"
              >
                Use This Plan
              </button>
            </div>

            {/* Warmup */}
            <div className="mb-4 p-3 rounded-lg bg-mat-800/30 border border-mat-700/20">
              <div className="text-[10px] text-mat-500 uppercase tracking-wider mb-1">Warmup Suggestion</div>
              <p className="text-sm text-mat-300">{plan.warmupSuggestion}</p>
            </div>

            {/* Techniques */}
            <div className="text-xs text-mat-500 uppercase tracking-wider mb-2">Techniques ({plan.techniques.length})</div>
            <div className="space-y-2">
              {plan.techniques.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-mat-800/20 border border-mat-800/30">
                  <span className="text-mat-600 text-xs font-mono w-5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm text-mat-200">{t.name}</div>
                    <div className="text-[10px] text-mat-500">{t.position} &middot; {t.category} &middot; {t.difficulty}</div>
                  </div>
                  <span className={`text-[10px] font-medium ${reasonColor(t.reason)}`}>
                    {t.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
