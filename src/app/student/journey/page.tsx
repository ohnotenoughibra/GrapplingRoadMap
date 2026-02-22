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
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/journey?discipline=${discipline}`)
      .then((r) => r.json())
      .then((data) => setMilestones(data.milestones || []));
  }, [discipline]);

  const cycleSkillLevel = useCallback(async (techniqueId: string, currentLevel: SkillLevel | null) => {
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    const nextLevel = SKILL_LEVELS[(currentIndex + 1) % SKILL_LEVELS.length];
    const newLevel = nextLevel || "exposed";

    setUpdating(techniqueId);

    setMilestones((prev) =>
      prev.map((m) => {
        const techIndex = m.techniques.findIndex((t) => t.id === techniqueId);
        if (techIndex === -1) return m;

        const updatedTechniques = [...m.techniques];
        updatedTechniques[techIndex] = { ...updatedTechniques[techIndex], level: newLevel };

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
        fetch("/api/gamification/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "__self__" }),
        }).catch(() => {});
      }
    } catch {
      fetch(`/api/student/journey?discipline=${discipline}`)
        .then((r) => r.json())
        .then((data) => setMilestones(data.milestones || []));
    }

    setUpdating(null);
  }, [discipline]);

  // Find the current (first incomplete) milestone
  const currentMilestoneIndex = milestones.findIndex(
    (m) => m.stats.proficient < m.stats.total
  );
  const currentMilestone = currentMilestoneIndex >= 0
    ? milestones[currentMilestoneIndex]
    : milestones[milestones.length - 1];

  const completedMilestones = milestones.filter(
    (m) => m.stats.proficient >= m.stats.total && m.stats.total > 0
  );
  const futureMilestones = milestones.filter(
    (m, i) => i > currentMilestoneIndex && currentMilestoneIndex >= 0
  );

  // Position mastery map for current milestone
  const positionMastery = currentMilestone
    ? Object.entries(
        currentMilestone.techniques.reduce((acc, t) => {
          const pos = t.position.name;
          if (!acc[pos]) acc[pos] = { total: 0, proficient: 0, sparring: 0, drilling: 0, exposed: 0, none: 0, techniques: [] };
          acc[pos].total++;
          if (t.level === "proficient") acc[pos].proficient++;
          else if (t.level === "sparring") acc[pos].sparring++;
          else if (t.level === "drilling") acc[pos].drilling++;
          else if (t.level === "exposed") acc[pos].exposed++;
          else acc[pos].none++;
          acc[pos].techniques.push(t);
          return acc;
        }, {} as Record<string, { total: number; proficient: number; sparring: number; drilling: number; exposed: number; none: number; techniques: TechniqueProgress[] }>)
      ).sort((a, b) => b[1].total - a[1].total)
    : [];

  const getMasteryColor = (data: { total: number; proficient: number; sparring: number; drilling: number }) => {
    const pct = data.total > 0 ? data.proficient / data.total : 0;
    const sparPct = data.total > 0 ? (data.proficient + data.sparring) / data.total : 0;
    if (pct >= 0.8) return "bg-green-500/20 border-green-500/40 text-green-400";
    if (sparPct >= 0.5) return "bg-gi-500/15 border-gi-500/30 text-gi-400";
    if (data.drilling > 0 || data.proficient > 0 || data.sparring > 0) return "bg-yellow-500/10 border-yellow-500/25 text-yellow-400";
    return "bg-mat-800/30 border-mat-700/30 text-mat-500";
  };

  if (!currentMilestone) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-mat-800 rounded-lg" />
          <div className="h-48 bg-mat-800/30 rounded-xl" />
        </div>
      </div>
    );
  }

  const config = MILESTONE_CONFIG[currentMilestone.slug as MilestoneSlug];
  const completionPercent =
    currentMilestone.stats.total > 0
      ? Math.round((currentMilestone.stats.proficient / currentMilestone.stats.total) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">My Journey</h1>
        <p className="text-mat-400 text-sm mt-1">
          Tap positions to explore, tap techniques to level up
        </p>
        <div className="mt-3">
          <DisciplineToggle selected={discipline} onChange={setDiscipline} />
        </div>
      </div>

      {/* Completed milestones — compact */}
      {completedMilestones.length > 0 && (
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10 mb-4 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-400 font-medium">
              {completedMilestones.length} milestone{completedMilestones.length !== 1 ? "s" : ""} completed
            </span>
          </div>
          <svg className={`w-4 h-4 text-green-400/50 transition-transform ${showCompleted ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {showCompleted && completedMilestones.map((m) => {
        const mConfig = MILESTONE_CONFIG[m.slug as MilestoneSlug];
        return (
          <div key={m.slug} className="card p-4 mb-3 opacity-60">
            <div className="flex items-center gap-2">
              <span>{mConfig?.icon}</span>
              <span className="text-sm font-medium text-mat-300">{m.name}</span>
              <span className="text-[10px] text-green-400 ml-auto">100%</span>
            </div>
          </div>
        );
      })}

      {/* ═══ CURRENT MILESTONE — Hero section ═══ */}
      <div className="card overflow-hidden mb-6">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{config?.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-mat-100">{currentMilestone.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-mat-500">{config?.months}</span>
                <span className="text-xs text-mat-600">&middot;</span>
                <span className="text-xs text-mat-500">{currentMilestone.stats.total} techniques</span>
              </div>
            </div>
            <span className="ml-auto text-lg font-mono font-bold text-mat-300">{completionPercent}%</span>
          </div>

          <p className="text-sm text-mat-400 mb-4">{currentMilestone.description}</p>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-mat-800 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gi-500 to-nogi-500 transition-all duration-700"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          {/* Skill breakdown */}
          <div className="flex gap-4 mt-3">
            {(["exposed", "drilling", "sparring", "proficient"] as SkillLevel[]).map((level) => (
              <span key={level} className="text-[10px]">
                <span className={SKILL_LEVEL_CONFIG[level].color + " font-semibold"}>
                  {currentMilestone.stats[level]}
                </span>
                <span className="text-mat-500 ml-1">{level}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ═══ POSITION MASTERY MAP ═══ */}
        <div className="border-t border-mat-800/50 p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-mat-500 mb-3">
            Position Mastery
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {positionMastery.map(([posName, data]) => (
              <button
                key={posName}
                onClick={() => setSelectedPosition(selectedPosition === posName ? null : posName)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedPosition === posName
                    ? "ring-1 ring-gi-500/50 " + getMasteryColor(data)
                    : getMasteryColor(data)
                }`}
              >
                <div className="text-sm font-medium mb-1">{posName}</div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1.5 rounded-full bg-mat-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-current opacity-50 transition-all"
                      style={{ width: `${data.total > 0 ? (data.proficient / data.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono ml-1">
                    {data.proficient}/{data.total}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ SELECTED POSITION TECHNIQUES ═══ */}
        {selectedPosition && (
          <div className="border-t border-mat-800/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mat-200">{selectedPosition}</h3>
              <div className="flex gap-2">
                {(["exposed", "drilling", "sparring", "proficient"] as SkillLevel[]).map((level) => (
                  <span key={level} className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      level === "exposed" ? "bg-mat-500" :
                      level === "drilling" ? "bg-yellow-500" :
                      level === "sparring" ? "bg-gi-500" : "bg-green-500"
                    }`} />
                    <span className="text-[9px] text-mat-600">{SKILL_LEVEL_CONFIG[level].label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {positionMastery
                .find(([name]) => name === selectedPosition)?.[1]
                .techniques.map((t) => {
                  const levelConfig = t.level ? SKILL_LEVEL_CONFIG[t.level] : null;
                  const isUpdating = updating === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => cycleSkillLevel(t.id, t.level)}
                      disabled={isUpdating}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150 active:scale-[0.98] cursor-pointer text-left ${
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
                        <span className="text-sm text-mat-300">{t.name}</span>
                        {t.videoUrl && (
                          <svg className="w-3 h-3 text-mat-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        )}
      </div>

      {/* Future milestones — teaser */}
      {futureMilestones.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-mat-600 mb-2">
            Coming Up
          </div>
          {futureMilestones.map((m) => {
            const mConfig = MILESTONE_CONFIG[m.slug as MilestoneSlug];
            return (
              <div key={m.slug} className="card p-4 opacity-40">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{mConfig?.icon}</span>
                  <div>
                    <span className="text-sm font-medium text-mat-400">{m.name}</span>
                    <span className="text-xs text-mat-600 ml-2">{mConfig?.months}</span>
                  </div>
                  <span className="ml-auto text-xs text-mat-600">{m.stats.total} techniques</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
