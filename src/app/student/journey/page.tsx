"use client";

import { useState, useEffect, useCallback } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline } from "@/types";
import { MILESTONE_CONFIG, SKILL_LEVEL_CONFIG, type MilestoneSlug, type SkillLevel } from "@/types";

const SKILL_LEVELS: (SkillLevel | null)[] = [null, "exposed", "drilling", "sparring", "proficient"];

interface TechniqueProgress {
  id: string;
  name: string;
  slug: string;
  discipline: string;
  category: string;
  position: { name: string };
  level: SkillLevel | null;
  videoUrl?: string | null;
}

interface MilestoneProgress {
  slug: string;
  name: string;
  description: string;
  techniques: TechniqueProgress[];
  stats: {
    total: number;
    exposed: number;
    drilling: number;
    sparring: number;
    proficient: number;
  };
}

export default function JourneyPage() {
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [milestones, setMilestones] = useState<MilestoneProgress[]>([]);
  const [expandedMilestone, setExpandedMilestone] = useState<string>("explorer");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/journey?discipline=${discipline}`)
      .then((r) => r.json())
      .then((data) => setMilestones(data.milestones || []));
  }, [discipline]);

  const cycleSkillLevel = useCallback(async (techniqueId: string, currentLevel: SkillLevel | null) => {
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    const nextLevel = SKILL_LEVELS[(currentIndex + 1) % SKILL_LEVELS.length];

    // If cycling back to null, set to exposed (can't un-track)
    const newLevel = nextLevel || "exposed";

    setUpdating(techniqueId);

    // Optimistically update UI
    setMilestones((prev) =>
      prev.map((m) => {
        const techIndex = m.techniques.findIndex((t) => t.id === techniqueId);
        if (techIndex === -1) return m;

        const updatedTechniques = [...m.techniques];
        const oldLevel = updatedTechniques[techIndex].level;
        updatedTechniques[techIndex] = { ...updatedTechniques[techIndex], level: newLevel };

        // Recalculate stats
        const stats = { total: m.stats.total, exposed: 0, drilling: 0, sparring: 0, proficient: 0 };
        for (const t of updatedTechniques) {
          if (t.level && t.level in stats) stats[t.level as keyof typeof stats]++;
        }

        return { ...m, techniques: updatedTechniques, stats };
      })
    );

    try {
      const res = await fetch("/api/student/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techniqueId, level: newLevel }),
      });

      if (res.ok) {
        // Trigger badge evaluation in background
        fetch("/api/gamification/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "__self__" }),
        }).catch(() => {});
      }
    } catch {
      // Revert on error — refetch
      fetch(`/api/student/journey?discipline=${discipline}`)
        .then((r) => r.json())
        .then((data) => setMilestones(data.milestones || []));
    }

    setUpdating(null);
  }, [discipline]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">My Journey</h1>
        <p className="text-mat-400 text-sm mt-1">
          Tap any technique to update your skill level.
        </p>
        <div className="mt-3">
          <DisciplineToggle selected={discipline} onChange={setDiscipline} />
        </div>
      </div>

      {/* Milestones */}
      <div className="relative">
        {/* Vertical journey line */}
        <div className="absolute left-4 lg:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gi-500/50 via-nogi-500/50 to-wrestling-500/50" />

        <div className="space-y-6">
          {milestones.map((milestone) => {
            const config = MILESTONE_CONFIG[milestone.slug as MilestoneSlug];
            const isExpanded = expandedMilestone === milestone.slug;
            const completionPercent =
              milestone.stats.total > 0
                ? Math.round(
                    (milestone.stats.proficient / milestone.stats.total) * 100
                  )
                : 0;

            const techniquesByPosition = milestone.techniques.reduce(
              (acc, t) => {
                const key = t.position.name;
                if (!acc[key]) acc[key] = [];
                acc[key].push(t);
                return acc;
              },
              {} as Record<string, TechniqueProgress[]>
            );

            return (
              <div key={milestone.slug} className="relative pl-10 lg:pl-16">
                {/* Timeline node */}
                <div
                  className={`absolute left-1.5 lg:left-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    completionPercent === 100
                      ? "bg-green-500/20 border-green-500"
                      : completionPercent > 0
                        ? "bg-gi-500/20 border-gi-500/50"
                        : "bg-mat-900 border-mat-600"
                  }`}
                >
                  {completionPercent === 100 ? (
                    <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        completionPercent > 0 ? "bg-gi-400" : "bg-mat-600"
                      }`}
                    />
                  )}
                </div>

                <div className="card overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedMilestone(isExpanded ? "" : milestone.slug)
                    }
                    className="w-full text-left p-4 lg:p-6 active:bg-mat-800/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">{config?.icon}</span>
                          <h3 className="text-lg font-semibold text-mat-100">
                            {milestone.name}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-mat-800 text-mat-400 border border-mat-700/30">
                            {config?.months}
                          </span>
                        </div>
                        <p className="text-sm text-mat-400 mt-1">
                          {milestone.description}
                        </p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-mat-500 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-mat-500">
                          {milestone.stats.proficient} / {milestone.stats.total} proficient
                        </span>
                        <span className="font-mono text-mat-400">
                          {completionPercent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-mat-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            completionPercent === 100
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-gi-500 to-nogi-500"
                          }`}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      {/* Skill level breakdown */}
                      <div className="flex gap-4 mt-2">
                        {(["exposed", "drilling", "sparring", "proficient"] as SkillLevel[]).map((level) => (
                          <span key={level} className="text-[10px] text-mat-500">
                            <span className={SKILL_LEVEL_CONFIG[level].color}>
                              {milestone.stats[level]}
                            </span>{" "}
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-mat-800/50 p-4 lg:p-6">
                      {/* Legend */}
                      <div className="flex flex-wrap gap-3 mb-4 pb-3 border-b border-mat-800/30">
                        <span className="text-[10px] text-mat-500 uppercase tracking-wider">Tap to update:</span>
                        {(["exposed", "drilling", "sparring", "proficient"] as SkillLevel[]).map((level) => (
                          <span key={level} className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${
                              level === "exposed" ? "bg-mat-500" :
                              level === "drilling" ? "bg-yellow-500" :
                              level === "sparring" ? "bg-gi-500" : "bg-green-500"
                            }`} />
                            <span className={`text-[10px] ${SKILL_LEVEL_CONFIG[level].color}`}>
                              {SKILL_LEVEL_CONFIG[level].label}
                            </span>
                          </span>
                        ))}
                      </div>

                      <div className="space-y-5">
                        {Object.entries(techniquesByPosition).map(
                          ([position, techs]) => (
                            <div key={position}>
                              <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2">
                                {position}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {techs.map((t) => {
                                  const levelConfig = t.level
                                    ? SKILL_LEVEL_CONFIG[t.level]
                                    : null;
                                  const isUpdating = updating === t.id;
                                  return (
                                    <button
                                      key={t.id}
                                      onClick={() => cycleSkillLevel(t.id, t.level)}
                                      disabled={isUpdating}
                                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150 active:scale-[0.98] cursor-pointer text-left ${
                                        t.level === "proficient"
                                          ? "skill-proficient"
                                          : t.level === "sparring"
                                            ? "skill-sparring"
                                            : t.level === "drilling"
                                              ? "skill-drilling"
                                              : t.level === "exposed"
                                                ? "skill-exposed"
                                                : "bg-mat-800/20 border-mat-800/30 hover:border-mat-600/50"
                                      } ${isUpdating ? "opacity-50" : ""}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            t.discipline === "gi"
                                              ? "bg-gi-500"
                                              : t.discipline === "nogi"
                                                ? "bg-nogi-500"
                                                : t.discipline === "wrestling"
                                                  ? "bg-wrestling-500"
                                                  : "bg-mat-400"
                                          }`}
                                        />
                                        <span className="text-sm text-mat-300">
                                          {t.name}
                                        </span>
                                        {t.videoUrl && (
                                          <svg className="w-3 h-3 text-mat-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        )}
                                      </div>
                                      <span
                                        className={`text-[10px] font-medium whitespace-nowrap ${levelConfig?.color ?? "text-mat-600"}`}
                                      >
                                        {levelConfig?.label ?? "—"}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
