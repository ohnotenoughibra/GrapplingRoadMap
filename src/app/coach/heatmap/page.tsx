"use client";

import { useState, useEffect } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline, TechniqueCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface HeatmapData {
  positions: { id: string; name: string; slug: string }[];
  heatmap: Record<string, Record<string, { count: number; techniques: string[] }>>;
  maxCount: number;
}

export default function HeatmapPage() {
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [data, setData] = useState<HeatmapData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ pos: string; cat: string } | null>(null);

  useEffect(() => {
    fetch(`/api/heatmap?discipline=${discipline}`)
      .then((r) => r.json())
      .then(setData);
  }, [discipline]);

  const categories: TechniqueCategory[] = [
    "submission", "sweep", "pass", "escape", "takedown", "throw", "transition", "control", "defense",
  ];

  const getHeatClass = (count: number, max: number) => {
    if (count === 0) return "bg-mat-800/20 border-mat-800/30";
    const ratio = max > 0 ? count / max : 0;
    if (ratio <= 0.2) return "bg-emerald-900/20 border-emerald-800/30";
    if (ratio <= 0.4) return "bg-emerald-800/30 border-emerald-700/30";
    if (ratio <= 0.6) return "bg-emerald-700/40 border-emerald-600/30";
    if (ratio <= 0.8) return "bg-emerald-600/40 border-emerald-500/30";
    return "bg-emerald-500/50 border-emerald-400/30";
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-mat-100">Topic Heatmap</h1>
          <p className="text-mat-400 text-sm mt-1">
            See what you&apos;re covering and what you&apos;re missing. Dark spots = opportunity.
          </p>
        </div>
        <DisciplineToggle selected={discipline} onChange={setDiscipline} />
      </div>

      {!data ? (
        <div className="text-center py-20 text-mat-500">Loading heatmap...</div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-6 text-xs text-mat-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-mat-800/20 border border-mat-800/30" />
              <div className="w-4 h-4 rounded bg-emerald-900/20 border border-emerald-800/30" />
              <div className="w-4 h-4 rounded bg-emerald-800/30 border border-emerald-700/30" />
              <div className="w-4 h-4 rounded bg-emerald-700/40 border border-emerald-600/30" />
              <div className="w-4 h-4 rounded bg-emerald-600/40 border border-emerald-500/30" />
              <div className="w-4 h-4 rounded bg-emerald-500/50 border border-emerald-400/30" />
            </div>
            <span>More</span>
          </div>

          {/* Heatmap grid */}
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-mat-500 uppercase tracking-wider w-40">
                    Position
                  </th>
                  {categories.map((cat) => (
                    <th
                      key={cat}
                      className="p-3 text-xs font-medium text-mat-500 uppercase tracking-wider text-center"
                    >
                      <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
                      <span className="sm:hidden">{CATEGORY_LABELS[cat].slice(0, 3)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.positions.map((pos) => (
                  <tr key={pos.id} className="border-t border-mat-800/30">
                    <td className="p-3 text-sm text-mat-300 font-medium">
                      {pos.name}
                    </td>
                    {categories.map((cat) => {
                      const cell = data.heatmap[pos.slug]?.[cat] ?? {
                        count: 0,
                        techniques: [],
                      };
                      const isHovered =
                        hoveredCell?.pos === pos.slug &&
                        hoveredCell?.cat === cat;
                      return (
                        <td key={cat} className="p-1.5">
                          <div
                            className={`relative rounded-md border p-2 min-h-[40px] flex items-center justify-center transition-all duration-150 cursor-default ${getHeatClass(cell.count, data.maxCount)} ${isHovered ? "ring-1 ring-mat-400/50 scale-105" : ""}`}
                            onMouseEnter={() =>
                              setHoveredCell({ pos: pos.slug, cat })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <span
                              className={`text-xs font-mono ${cell.count > 0 ? "text-emerald-400" : "text-mat-600"}`}
                            >
                              {cell.count || "—"}
                            </span>

                            {/* Tooltip */}
                            {isHovered && cell.techniques.length > 0 && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-3 rounded-lg bg-mat-800 border border-mat-700/50 shadow-xl">
                                <div className="text-xs font-medium text-mat-300 mb-1">
                                  {pos.name} / {CATEGORY_LABELS[cat]}
                                </div>
                                <div className="text-[10px] text-mat-400 space-y-0.5">
                                  {cell.techniques.map((name) => (
                                    <div key={name}>{name}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gap analysis */}
          <div className="mt-8 card p-6">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
              Coverage Gaps
            </h2>
            <p className="text-xs text-mat-500 mb-4">
              Positions and categories that haven&apos;t been covered yet. These are your blind spots.
            </p>
            <div className="flex flex-wrap gap-2">
              {data.positions.map((pos) =>
                categories
                  .filter(
                    (cat) =>
                      !data.heatmap[pos.slug]?.[cat]?.count
                  )
                  .map((cat) => (
                    <span
                      key={`${pos.slug}-${cat}`}
                      className="px-2 py-1 rounded-md bg-wrestling-500/5 border border-wrestling-500/10 text-wrestling-400 text-xs"
                    >
                      {pos.name} — {CATEGORY_LABELS[cat]}
                    </span>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
