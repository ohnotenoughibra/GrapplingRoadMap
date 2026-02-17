"use client";

import { useState, useEffect } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline } from "@/types";
import { SKILL_LEVEL_CONFIG } from "@/types";

interface Position {
  id: string;
  name: string;
  slug: string;
}

interface Technique {
  id: string;
  name: string;
  slug: string;
  discipline: string;
  category: string;
  difficulty: string;
  description: string | null;
  videoUrl: string | null;
  position: Position;
}

interface SkillMap {
  [techniqueId: string]: { level: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  submission: "bg-red-500/10 text-red-400",
  sweep: "bg-green-500/10 text-green-400",
  pass: "bg-blue-500/10 text-blue-400",
  escape: "bg-yellow-500/10 text-yellow-400",
  takedown: "bg-orange-500/10 text-orange-400",
  throw: "bg-purple-500/10 text-purple-400",
  transition: "bg-cyan-500/10 text-cyan-400",
  control: "bg-indigo-500/10 text-indigo-400",
  defense: "bg-amber-500/10 text-amber-400",
};

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [skills, setSkills] = useState<SkillMap>({});
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/techniques")
      .then((r) => r.json())
      .then((data) => {
        setTechniques(data.techniques || []);
        setPositions(data.positions || []);
      });
    fetch("/api/student/skills")
      .then((r) => r.json())
      .then((data) => {
        const map: SkillMap = {};
        (data.skills || []).forEach((s: { techniqueId: string; level: string }) => {
          map[s.techniqueId] = { level: s.level };
        });
        setSkills(map);
      })
      .catch(() => {});
  }, []);

  const filtered = techniques.filter((t) => {
    if (discipline !== "all" && t.discipline !== "all" && t.discipline !== discipline) return false;
    if (filterPosition !== "all" && t.position.slug !== filterPosition) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce(
    (acc, t) => {
      const key = t.position.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    },
    {} as Record<string, Technique[]>
  );

  const categories = [...new Set(techniques.map((t) => t.category))].sort();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Technique Library</h1>
        <p className="text-mat-400 text-sm mt-1">
          {techniques.length} techniques across {positions.length} positions
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <DisciplineToggle selected={discipline} onChange={setDiscipline} />
          <span className="text-xs text-mat-500">{filtered.length} shown</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mat-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search techniques..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50"
            />
          </div>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
          >
            <option value="all">All Positions</option>
            {positions.map((p) => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Technique List */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([positionName, techs]) => (
          <div key={positionName} className="card">
            <div className="px-4 py-3 border-b border-mat-800/50">
              <h3 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
                {positionName}
                <span className="text-mat-600 ml-2 font-normal normal-case">{techs.length}</span>
              </h3>
            </div>
            <div className="divide-y divide-mat-800/30">
              {techs.map((t) => {
                const skill = skills[t.id];
                const levelConfig = skill ? SKILL_LEVEL_CONFIG[skill.level as keyof typeof SKILL_LEVEL_CONFIG] : null;
                const isExpanded = expanded === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setExpanded(isExpanded ? null : t.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-mat-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-mat-200 truncate">{t.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${CATEGORY_COLORS[t.category] || "bg-mat-700 text-mat-400"}`}>
                            {t.category}
                          </span>
                          {t.difficulty !== "fundamental" && (
                            <span className="text-[10px] text-mat-500">{t.difficulty}</span>
                          )}
                        </div>
                      </div>
                      {levelConfig && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${levelConfig.color} bg-mat-800`}>
                          {levelConfig.label}
                        </span>
                      )}
                      {t.videoUrl && (
                        <svg className="w-4 h-4 text-mat-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="mt-2 text-xs text-mat-400 space-y-1" onClick={(e) => e.stopPropagation()}>
                        {t.description && <p>{t.description}</p>}
                        <div className="flex gap-2 text-[10px] text-mat-500">
                          <span>Discipline: {t.discipline}</span>
                          <span>Difficulty: {t.difficulty}</span>
                        </div>
                        {t.videoUrl && (
                          <a
                            href={t.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gi-400 hover:text-gi-300"
                          >
                            Watch Video
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-8 text-center text-mat-500 text-sm">
            No techniques match your filters. Try adjusting your search.
          </div>
        )}
      </div>
    </div>
  );
}
