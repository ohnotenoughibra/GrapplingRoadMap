"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline, TechniqueCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface HeatmapData {
  positions: { id: string; name: string; slug: string }[];
  heatmap: Record<string, Record<string, { count: number; techniques: string[] }>>;
  maxCount: number;
  totalClasses: number;
}

const DATE_RANGES = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "6 months", days: 180 },
  { label: "All time", days: 0 },
] as const;

export default function HeatmapPage() {
  const [discipline, setDiscipline] = useState<Discipline | "all">("nogi");
  const [days, setDays] = useState<number>(90);
  const [data, setData] = useState<HeatmapData | null>(null);
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/heatmap?discipline=${discipline}&days=${days}`)
      .then((r) => r.json())
      .then(setData);
  }, [discipline, days]);

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

  const buildPlanLink = (posSlug: string, posName: string, cat: string) => {
    const title = `${posName} ${CATEGORY_LABELS[cat as TechniqueCategory]}s`;
    return `/coach/log-class?discipline=${discipline === "all" ? "nogi" : discipline}&title=${encodeURIComponent(title)}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Topic Heatmap</h1>
        <p className="text-mat-400 text-sm mt-1">
          Dark spots = blind spots. Tap to explore.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <DisciplineToggle selected={discipline} onChange={setDiscipline} />
          <div className="inline-flex rounded-lg bg-mat-800/50 border border-mat-700/30 p-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range.days}
                onClick={() => setDays(range.days)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  days === range.days
                    ? "bg-mat-700 text-mat-100"
                    : "text-mat-400 hover:text-mat-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        {data && (
          <div className="mt-2 text-xs text-mat-500">
            {data.totalClasses} class{data.totalClasses !== 1 ? "es" : ""} logged
            {days > 0 ? ` in the last ${days} days` : " (all time)"}
          </div>
        )}
      </div>

      {!data ? (
        <div className="text-center py-20 text-mat-500">Loading heatmap...</div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-3 mb-5 text-xs text-mat-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded bg-mat-800/20 border border-mat-800/30" />
              <div className="w-5 h-5 rounded bg-emerald-900/20 border border-emerald-800/30" />
              <div className="w-5 h-5 rounded bg-emerald-700/40 border border-emerald-600/30" />
              <div className="w-5 h-5 rounded bg-emerald-500/50 border border-emerald-400/30" />
            </div>
            <span>More</span>
          </div>

          {/* Desktop table -- hidden on mobile */}
          <div className="hidden lg:block card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-mat-500 uppercase tracking-wider w-40">
                    Position
                  </th>
                  {categories.map((cat) => (
                    <th key={cat} className="p-3 text-xs font-medium text-mat-500 uppercase tracking-wider text-center">
                      {CATEGORY_LABELS[cat]}
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
                      const cell = data.heatmap[pos.slug]?.[cat] ?? { count: 0, techniques: [] };
                      const cellKey = `${pos.slug}-${cat}`;
                      const isExpanded = expandedCell === cellKey;
                      const isGap = cell.count === 0;
                      return (
                        <td key={cat} className="p-1.5">
                          <div
                            className={`relative rounded-md border p-2 min-h-[40px] flex items-center justify-center transition-all duration-150 cursor-pointer ${getHeatClass(cell.count, data.maxCount)} ${isExpanded ? "ring-1 ring-mat-400/50" : ""}`}
                            onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                          >
                            <span className={`text-xs font-mono ${cell.count > 0 ? "text-emerald-400" : "text-mat-600"}`}>
                              {cell.count || "\u2014"}
                            </span>
                            {isExpanded && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-3 rounded-lg bg-mat-800 border border-mat-700/50 shadow-xl">
                                <div className="text-xs font-medium text-mat-300 mb-1">
                                  {pos.name} / {CATEGORY_LABELS[cat]}
                                </div>
                                {cell.techniques.length > 0 ? (
                                  <div className="text-[10px] text-mat-400 space-y-0.5">
                                    {cell.techniques.map((name) => (
                                      <div key={name}>{name}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-mat-500 italic mb-2">
                                    Not covered yet
                                  </div>
                                )}
                                {isGap && (
                                  <Link
                                    href={buildPlanLink(pos.slug, pos.name, cat)}
                                    className="mt-2 block text-center text-[10px] font-medium px-2 py-1 rounded bg-nogi-500/15 text-nogi-400 border border-nogi-500/20 hover:bg-nogi-500/25 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Plan a class for this
                                  </Link>
                                )}
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

          {/* Mobile: Card per position with inline heat cells */}
          <div className="lg:hidden space-y-3">
            {data.positions.map((pos) => {
              const activeCats = categories.filter(
                (cat) => data.heatmap[pos.slug]?.[cat]?.count
              );
              const gapCats = categories.filter(
                (cat) => !data.heatmap[pos.slug]?.[cat]?.count
              );
              const totalCount = activeCats.reduce(
                (sum, cat) => sum + (data.heatmap[pos.slug]?.[cat]?.count ?? 0),
                0
              );
              const cellKey = `mob-${pos.slug}`;
              const isExpanded = expandedCell === cellKey;

              return (
                <button
                  key={pos.id}
                  onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                  className="w-full text-left card p-4 active:bg-mat-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-medium text-sm text-mat-200">
                      {pos.name}
                    </span>
                    <span className={`text-xs font-mono ${totalCount > 0 ? "text-emerald-400" : "text-mat-600"}`}>
                      {totalCount > 0 ? `${totalCount} covered` : "none"}
                    </span>
                  </div>

                  {/* Mini heat grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {categories.slice(0, 5).map((cat) => {
                      const cell = data.heatmap[pos.slug]?.[cat] ?? { count: 0, techniques: [] };
                      return (
                        <div key={cat} className="text-center">
                          <div
                            className={`rounded-md border h-8 flex items-center justify-center ${getHeatClass(cell.count, data.maxCount)}`}
                          >
                            <span className={`text-[10px] font-mono ${cell.count > 0 ? "text-emerald-400" : "text-mat-700"}`}>
                              {cell.count || "\u2014"}
                            </span>
                          </div>
                          <div className="text-[8px] text-mat-600 mt-0.5 truncate">
                            {CATEGORY_LABELS[cat].slice(0, 4)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {categories.length > 5 && (
                    <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                      {categories.slice(5).map((cat) => {
                        const cell = data.heatmap[pos.slug]?.[cat] ?? { count: 0, techniques: [] };
                        return (
                          <div key={cat} className="text-center">
                            <div
                              className={`rounded-md border h-8 flex items-center justify-center ${getHeatClass(cell.count, data.maxCount)}`}
                            >
                              <span className={`text-[10px] font-mono ${cell.count > 0 ? "text-emerald-400" : "text-mat-700"}`}>
                                {cell.count || "\u2014"}
                              </span>
                            </div>
                            <div className="text-[8px] text-mat-600 mt-0.5 truncate">
                              {CATEGORY_LABELS[cat].slice(0, 4)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-mat-800/50 space-y-2">
                      {activeCats.length > 0 && activeCats.map((cat) => {
                        const cell = data.heatmap[pos.slug]![cat]!;
                        return (
                          <div key={cat}>
                            <div className="text-[10px] text-mat-500 uppercase tracking-wider mb-1">
                              {CATEGORY_LABELS[cat]}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {cell.techniques.map((name) => (
                                <span
                                  key={name}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {gapCats.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[10px] text-mat-500 uppercase tracking-wider mb-1.5">
                            Gaps -- plan a class
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {gapCats.slice(0, 4).map((cat) => (
                              <Link
                                key={cat}
                                href={buildPlanLink(pos.slug, pos.name, cat)}
                                className="text-[11px] px-2 py-1 rounded-md bg-nogi-500/10 text-nogi-400 border border-nogi-500/15 hover:bg-nogi-500/20 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {CATEGORY_LABELS[cat]}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Gap analysis */}
          <div className="mt-6 card p-4 lg:p-6">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-3">
              Coverage Gaps
            </h2>
            <p className="text-xs text-mat-500 mb-3">
              Positions and categories not yet covered{days > 0 ? ` in the last ${days} days` : ""}.
              Tap a gap to plan a class.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.positions.map((pos) =>
                categories
                  .filter((cat) => !data.heatmap[pos.slug]?.[cat]?.count)
                  .slice(0, 3) // Show max 3 gaps per position to avoid overflow
                  .map((cat) => (
                    <Link
                      key={`${pos.slug}-${cat}`}
                      href={buildPlanLink(pos.slug, pos.name, cat)}
                      className="px-2 py-1 rounded-md bg-wrestling-500/5 border border-wrestling-500/10 text-wrestling-400 text-[11px] hover:bg-wrestling-500/10 transition-colors"
                    >
                      {pos.name} -- {CATEGORY_LABELS[cat]}
                    </Link>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
