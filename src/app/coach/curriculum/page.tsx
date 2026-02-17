"use client";

import { useState, useEffect } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline } from "@/types";
import { MILESTONE_CONFIG, type MilestoneSlug } from "@/types";

interface MilestoneData {
  slug: string;
  name: string;
  description: string;
  techniques: {
    id: string;
    name: string;
    slug: string;
    discipline: string;
    category: string;
    difficulty: string;
    position: { name: string };
    taughtCount: number;
  }[];
}

export default function CurriculumPage() {
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [expandedMilestone, setExpandedMilestone] = useState<string>("explorer");

  useEffect(() => {
    fetch(`/api/curriculum?discipline=${discipline}`)
      .then((r) => r.json())
      .then((data) => setMilestones(data.milestones || []));
  }, [discipline]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-mat-100">Curriculum Map</h1>
          <p className="text-mat-400 text-sm mt-1">
            The roadmap. What skills to develop at each stage of the journey.
          </p>
        </div>
        <DisciplineToggle selected={discipline} onChange={setDiscipline} />
      </div>

      {/* Journey timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gi-500/50 via-nogi-500/50 to-wrestling-500/50" />

        <div className="space-y-6">
          {milestones.map((milestone) => {
            const config = MILESTONE_CONFIG[milestone.slug as MilestoneSlug];
            const isExpanded = expandedMilestone === milestone.slug;
            const techniquesByPosition = milestone.techniques.reduce(
              (acc, t) => {
                const key = t.position.name;
                if (!acc[key]) acc[key] = [];
                acc[key].push(t);
                return acc;
              },
              {} as Record<string, typeof milestone.techniques>
            );

            return (
              <div key={milestone.slug} className="relative pl-16">
                {/* Timeline node */}
                <div className="absolute left-3.5 w-5 h-5 rounded-full bg-mat-900 border-2 border-gi-500/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gi-400" />
                </div>

                {/* Content */}
                <div className="card overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedMilestone(
                        isExpanded ? "" : milestone.slug
                      )
                    }
                    className="w-full text-left p-6 hover:bg-mat-800/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">
                            {config?.icon}
                          </span>
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
                      <div className="flex items-center gap-2 text-sm text-mat-400">
                        <span className="font-mono">
                          {milestone.techniques.length}
                        </span>
                        <span className="text-xs">skills</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                  </button>

                  {isExpanded && (
                    <div className="border-t border-mat-800/50 p-6">
                      <div className="space-y-5">
                        {Object.entries(techniquesByPosition).map(
                          ([position, techs]) => (
                            <div key={position}>
                              <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2">
                                {position}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {techs.map((t) => (
                                  <div
                                    key={t.id}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mat-800/30 border border-mat-800/30"
                                  >
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
                                    <span className="text-sm text-mat-300 truncate">
                                      {t.name}
                                    </span>
                                    {t.taughtCount > 0 && (
                                      <span className="ml-auto text-[10px] text-emerald-400 font-mono flex-shrink-0">
                                        {t.taughtCount}x
                                      </span>
                                    )}
                                  </div>
                                ))}
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
