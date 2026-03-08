"use client";

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  Fragment,
} from "react";
import type { PositionSeed, TechniqueSeed } from "@/lib/data/taxonomy";
import {
  getPositionLayout,
  TRANSITION_MAP,
  CATEGORY_COLORS,
  type PositionLayout,
  type PositionZone,
} from "@/lib/graph-builder";
import {
  CATEGORY_CONFIG,
  DISCIPLINE_CONFIG,
  type TechniqueCategory,
  type Discipline,
  type Difficulty,
} from "@/types";
import { useTheme } from "@/components/shared/ThemeProvider";

// ─── Types ──────────────────────────────────────────────────────────

type MapView =
  | { mode: "overview" }
  | { mode: "position"; positionSlug: string }
  | { mode: "technique"; positionSlug: string; techniqueSlug: string };

// ─── Constants ──────────────────────────────────────────────────────

const ZONE_COLORS: Record<PositionZone, { fill: string; stroke: string; label: string }> = {
  standing: { fill: "#f59e0b", stroke: "#f59e0b", label: "Standing" },
  guard: { fill: "#3b82f6", stroke: "#3b82f6", label: "Guard" },
  top: { fill: "#10b981", stroke: "#10b981", label: "Top Control" },
  leglock: { fill: "#8b5cf6", stroke: "#8b5cf6", label: "Leg Locks" },
  other: { fill: "#64748b", stroke: "#64748b", label: "Other" },
};

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

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 900;
const NODE_RADIUS = 48;

// ─── Props ──────────────────────────────────────────────────────────

interface PositionMapProps {
  positions: PositionSeed[];
  techniques: TechniqueSeed[];
}

// ─── Helper: curved path between two points ─────────────────────────

function curvedPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Perpendicular offset for curve
  const offset = Math.min(dist * 0.15, 40);
  const mx = (x1 + x2) / 2 - (dy / dist) * offset;
  const my = (y1 + y2) / 2 + (dx / dist) * offset;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

// ─── Technique Card ─────────────────────────────────────────────────

function TechniqueCard({
  technique,
  getPositionName,
  onTransition,
  expanded,
  onToggle,
}: {
  technique: TechniqueSeed;
  getPositionName: (slug: string) => string;
  onTransition: (slug: string) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const t = technique;
  const hasTipsOrMistakes = (t.tips?.length ?? 0) > 0 || (t.commonMistakes?.length ?? 0) > 0;
  const catCfg = CATEGORY_CONFIG[t.category];

  return (
    <div className="rounded-lg bg-mat-800/40 dark:bg-mat-800/30 border border-mat-200 dark:border-mat-800/50 overflow-hidden transition-colors">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h5 className="text-sm font-medium text-mat-900 dark:text-mat-100">{t.name}</h5>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[t.difficulty].bg} ${DIFFICULTY_COLORS[t.difficulty].text} border ${DIFFICULTY_COLORS[t.difficulty].border}`}
            >
              {DIFFICULTY_LABELS[t.difficulty]}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${catCfg.bg} ${catCfg.text} border ${catCfg.border}`}
            >
              {catCfg.label}
            </span>
          </div>
        </div>
        {t.summary && (
          <p className="text-xs text-mat-500 dark:text-mat-400 mb-1.5 leading-relaxed">{t.summary}</p>
        )}
        <div className="flex items-center gap-3">
          {t.transitionTarget && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTransition(t.transitionTarget!);
              }}
              className="inline-flex items-center gap-1 text-xs text-gi-500 dark:text-gi-400 hover:text-gi-400 dark:hover:text-gi-300 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {getPositionName(t.transitionTarget)}
            </button>
          )}
          {hasTipsOrMistakes && (
            <button
              onClick={onToggle}
              className="inline-flex items-center gap-1 text-xs text-mat-500 dark:text-mat-400 hover:text-mat-700 dark:hover:text-mat-200 transition-colors ml-auto"
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

      {expanded && hasTipsOrMistakes && (
        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-mat-200 dark:border-mat-700/30">
          {t.tips && t.tips.length > 0 && (
            <div className="pt-2.5">
              <h6 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-1.5">
                Tips
              </h6>
              <div className="space-y-1 ml-0.5">
                {t.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs text-mat-600 dark:text-mat-300 leading-snug">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {t.commonMistakes && t.commonMistakes.length > 0 && (
            <div className={t.tips?.length ? "" : "pt-2.5"}>
              <h6 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-1.5">
                Common Mistakes
              </h6>
              <div className="space-y-1 ml-0.5">
                {t.commonMistakes.map((mistake, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs text-mat-600 dark:text-mat-300 leading-snug">{mistake}</span>
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

// ─── Position Detail Panel ──────────────────────────────────────────

function PositionDetail({
  position,
  positions,
  onNavigate,
  onClose,
}: {
  position: PositionLayout;
  positions: PositionLayout[];
  onNavigate: (slug: string) => void;
  onClose: () => void;
}) {
  const [expandedTech, setExpandedTech] = useState<string | null>(null);
  const [techSearch, setTechSearch] = useState("");

  const getPositionName = useCallback(
    (slug: string) => positions.find((p) => p.slug === slug)?.name || slug,
    [positions]
  );

  // Group techniques by category
  const groupedTechniques = useMemo(() => {
    const lowerSearch = techSearch.toLowerCase();
    const filtered = position.techniques.filter((t) => {
      if (!lowerSearch) return true;
      return (
        t.name.toLowerCase().includes(lowerSearch) ||
        (t.summary || "").toLowerCase().includes(lowerSearch) ||
        (t.description || "").toLowerCase().includes(lowerSearch)
      );
    });

    const groups: Record<string, TechniqueSeed[]> = {};
    for (const t of filtered) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return Object.entries(groups).sort(
      (a, b) =>
        Object.keys(CATEGORY_CONFIG).indexOf(a[0]) -
        Object.keys(CATEGORY_CONFIG).indexOf(b[0])
    );
  }, [position.techniques, techSearch]);

  const zoneColor = ZONE_COLORS[position.zone];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: zoneColor.fill + "30", border: `2px solid ${zoneColor.stroke}` }}
          >
            {position.techniqueCount}
          </div>
          <div>
            <h2 className="text-xl font-bold text-mat-900 dark:text-mat-50">{position.name}</h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: zoneColor.fill + "15",
                color: zoneColor.fill,
              }}
            >
              {zoneColor.label}
            </span>
          </div>
        </div>
        <p className="text-sm text-mat-600 dark:text-mat-400 leading-relaxed">
          {position.description}
        </p>
      </div>

      {/* Connected positions */}
      {position.transitions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-mat-500 dark:text-mat-400 mb-2">
            Connected Positions
          </h3>
          <div className="flex flex-wrap gap-2">
            {position.transitions.map((slug) => {
              const target = positions.find((p) => p.slug === slug);
              if (!target) return null;
              const targetZone = ZONE_COLORS[target.zone];
              return (
                <button
                  key={slug}
                  onClick={() => onNavigate(slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-mat-100 dark:bg-mat-800/50 text-mat-700 dark:text-mat-300 hover:bg-mat-200 dark:hover:bg-mat-700/50 border border-mat-200 dark:border-mat-700/50 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: targetZone.fill }}
                  />
                  {target.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Technique search */}
      {position.techniques.length > 6 && (
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mat-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={techSearch}
            onChange={(e) => setTechSearch(e.target.value)}
            placeholder="Filter techniques..."
            className="w-full pl-9 pr-4 py-2 bg-mat-100 dark:bg-mat-800/50 border border-mat-200 dark:border-mat-700/50 rounded-lg text-mat-900 dark:text-mat-100 placeholder:text-mat-400 dark:placeholder:text-mat-500 text-sm focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30 transition-colors"
          />
        </div>
      )}

      {/* Techniques grouped by category */}
      {groupedTechniques.length === 0 ? (
        <p className="text-sm text-mat-400 text-center py-8">No techniques match your filter.</p>
      ) : (
        <div className="space-y-5">
          {groupedTechniques.map(([cat, techs]) => {
            const cfg = CATEGORY_CONFIG[cat as TechniqueCategory];
            return (
              <div key={cat}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${cfg.text}`}>
                  {cfg.label} ({techs.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {techs.map((t) => (
                    <TechniqueCard
                      key={t.slug}
                      technique={t}
                      getPositionName={getPositionName}
                      onTransition={onNavigate}
                      expanded={expandedTech === t.slug}
                      onToggle={() =>
                        setExpandedTech(expandedTech === t.slug ? null : t.slug)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Position List ───────────────────────────────────────────

function MobilePositionList({
  positions,
  search,
  onSearch,
  view,
  onSelectPosition,
  onClose,
}: {
  positions: PositionLayout[];
  search: string;
  onSearch: (s: string) => void;
  view: MapView;
  onSelectPosition: (slug: string) => void;
  onClose: () => void;
}) {
  const grouped = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const zones: Record<PositionZone, PositionLayout[]> = {
      standing: [],
      guard: [],
      top: [],
      leglock: [],
      other: [],
    };

    for (const pos of positions) {
      const matchesPosition = pos.name.toLowerCase().includes(lowerSearch);
      const matchesTechnique = pos.techniques.some(
        (t) =>
          t.name.toLowerCase().includes(lowerSearch) ||
          (t.summary || "").toLowerCase().includes(lowerSearch)
      );
      if (lowerSearch && !matchesPosition && !matchesTechnique) continue;
      zones[pos.zone].push(pos);
    }

    return Object.entries(zones).filter(([, list]) => list.length > 0) as [
      PositionZone,
      PositionLayout[]
    ][];
  }, [positions, search]);

  const selectedPosition =
    view.mode !== "overview"
      ? positions.find((p) => p.slug === view.positionSlug)
      : null;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-mat-50/95 dark:bg-mat-950/95 backdrop-blur-sm px-4 py-3 border-b border-mat-200 dark:border-mat-800/50">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mat-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search positions & techniques..."
            className="w-full pl-9 pr-4 py-2.5 bg-mat-100 dark:bg-mat-800/50 border border-mat-200 dark:border-mat-700/50 rounded-xl text-mat-900 dark:text-mat-100 placeholder:text-mat-400 dark:placeholder:text-mat-500 text-sm focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mat-400 hover:text-mat-600 dark:hover:text-mat-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Breadcrumb */}
        {selectedPosition && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <button
              onClick={onClose}
              className="text-gi-500 dark:text-gi-400 hover:underline font-medium"
            >
              All Positions
            </button>
            <svg className="w-3 h-3 text-mat-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-mat-700 dark:text-mat-300 font-medium">{selectedPosition.name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {selectedPosition ? (
          <PositionDetail
            position={selectedPosition}
            positions={positions}
            onNavigate={onSelectPosition}
            onClose={onClose}
          />
        ) : (
          <div className="space-y-6">
            {grouped.map(([zone, list]) => {
              const zoneColor = ZONE_COLORS[zone];
              return (
                <div key={zone}>
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: zoneColor.fill }}
                  >
                    {zoneColor.label}
                  </h3>
                  <div className="space-y-2">
                    {list.map((pos) => (
                      <button
                        key={pos.slug}
                        onClick={() => onSelectPosition(pos.slug)}
                        className="w-full text-left p-3 rounded-lg bg-mat-100 dark:bg-mat-800/30 border border-mat-200 dark:border-mat-800/50 hover:bg-mat-200 dark:hover:bg-mat-800/60 transition-colors"
                        style={{ borderLeftWidth: 3, borderLeftColor: zoneColor.fill }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-mat-900 dark:text-mat-100">
                            {pos.name}
                          </h4>
                          <span className="text-xs text-mat-500 dark:text-mat-400 bg-mat-200 dark:bg-mat-700/50 px-2 py-0.5 rounded-md font-medium">
                            {pos.techniqueCount}
                          </span>
                        </div>
                        <p className="text-xs text-mat-500 dark:text-mat-400 mt-1 line-clamp-2">
                          {pos.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG Map (Desktop) ──────────────────────────────────────────────

function SVGMap({
  positions,
  hoveredSlug,
  onHover,
  onSelect,
  isDark,
  searchMatches,
}: {
  positions: PositionLayout[];
  hoveredSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  isDark: boolean;
  searchMatches: Set<string>;
}) {
  const posMap = useMemo(() => {
    const m = new Map<string, PositionLayout>();
    for (const p of positions) m.set(p.slug, p);
    return m;
  }, [positions]);

  // Collect all unique transition edges (deduplicated)
  const edges = useMemo(() => {
    const seen = new Set<string>();
    const result: { from: PositionLayout; to: PositionLayout }[] = [];

    for (const pos of positions) {
      for (const targetSlug of pos.transitions) {
        const key = [pos.slug, targetSlug].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const target = posMap.get(targetSlug);
        if (target) result.push({ from: pos, to: target });
      }
    }
    return result;
  }, [positions, posMap]);

  // Which positions are connected to the hovered one
  const connectedSlugs = useMemo(() => {
    if (!hoveredSlug) return new Set<string>();
    const pos = posMap.get(hoveredSlug);
    if (!pos) return new Set<string>();
    const set = new Set(pos.transitions);
    // Also include positions that transition TO this one
    for (const p of positions) {
      if (p.transitions.includes(hoveredSlug)) set.add(p.slug);
    }
    set.add(hoveredSlug);
    return set;
  }, [hoveredSlug, posMap, positions]);

  const hasSearch = searchMatches.size > 0;

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="w-full h-full"
      role="img"
      aria-label="Interactive grappling position map"
    >
      <defs>
        {/* Dot grid pattern */}
        <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle
            cx="15"
            cy="15"
            r="0.8"
            fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}
          />
        </pattern>
        {/* Arrowhead */}
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L8,3 L0,6"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}
            strokeWidth="1"
          />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L8,3 L0,6"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)"}
            strokeWidth="1.5"
          />
        </marker>
        {/* Glow filter for search matches */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="transparent" />
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#dotGrid)" />

      {/* Zone labels */}
      {[
        { zone: "standing" as PositionZone, x: 80, y: 30 },
        { zone: "guard" as PositionZone, x: 80, y: 260 },
        { zone: "top" as PositionZone, x: 960, y: 370 },
        { zone: "leglock" as PositionZone, x: 180, y: 600 },
      ].map(({ zone, x, y }) => (
        <text
          key={zone}
          x={x}
          y={y}
          fill={ZONE_COLORS[zone].fill}
          opacity={0.35}
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.1em"
          textAnchor="start"
          className="uppercase select-none pointer-events-none"
        >
          {ZONE_COLORS[zone].label}
        </text>
      ))}

      {/* Transition edges */}
      <g>
        {edges.map(({ from, to }) => {
          const key = `${from.slug}-${to.slug}`;
          const isActive =
            hoveredSlug &&
            connectedSlugs.has(from.slug) &&
            connectedSlugs.has(to.slug) &&
            (from.slug === hoveredSlug || to.slug === hoveredSlug);

          const dimmed = hoveredSlug && !isActive;

          return (
            <path
              key={key}
              d={curvedPath(from.x, from.y, to.x, to.y)}
              fill="none"
              stroke={
                isActive
                  ? isDark
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(0,0,0,0.25)"
                  : isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.06)"
              }
              strokeWidth={isActive ? 2 : 1}
              opacity={dimmed ? 0.3 : 1}
              markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
              className="transition-all duration-200"
            />
          );
        })}
      </g>

      {/* Position nodes */}
      <g>
        {positions.map((pos) => {
          const zoneColor = ZONE_COLORS[pos.zone];
          const isHovered = hoveredSlug === pos.slug;
          const isConnected = connectedSlugs.has(pos.slug);
          const isSearchMatch = hasSearch && searchMatches.has(pos.slug);
          const dimmed = (hoveredSlug && !isConnected) || (hasSearch && !isSearchMatch);

          const fillOpacity = isHovered ? 0.25 : isConnected ? 0.15 : 0.08;
          const strokeOpacity = isHovered ? 0.9 : isConnected ? 0.6 : 0.3;
          const scale = isHovered ? 1.08 : 1;
          const r = NODE_RADIUS;

          return (
            <g
              key={pos.slug}
              className="cursor-pointer"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transformOrigin: `${pos.x}px ${pos.y}px`,
                transition: "transform 150ms ease-out, opacity 200ms ease",
                opacity: dimmed ? 0.25 : 1,
              }}
              onMouseEnter={() => onHover(pos.slug)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(pos.slug)}
              role="button"
              tabIndex={0}
              aria-label={`${pos.name} - ${pos.techniqueCount} techniques. ${zoneColor.label} zone.`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(pos.slug);
                }
              }}
            >
              {/* Glow ring for search matches */}
              {isSearchMatch && (
                <circle
                  cx={0}
                  cy={0}
                  r={r + 6}
                  fill="none"
                  stroke={zoneColor.stroke}
                  strokeWidth="2"
                  opacity={0.6}
                  filter="url(#glow)"
                />
              )}

              {/* Main circle */}
              <circle
                cx={0}
                cy={0}
                r={r}
                fill={zoneColor.fill}
                fillOpacity={isDark ? fillOpacity : fillOpacity * 1.5}
                stroke={zoneColor.stroke}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={strokeOpacity}
              />

              {/* Position name - multiline for long names */}
              {pos.name.length > 12 ? (
                <>
                  <text
                    x={0}
                    y={-6}
                    textAnchor="middle"
                    fill={isDark ? "#e2e8f0" : "#1e293b"}
                    fontSize="11"
                    fontWeight="600"
                    className="select-none pointer-events-none"
                  >
                    {pos.name.split(/[\s/]+/)[0]}
                  </text>
                  <text
                    x={0}
                    y={8}
                    textAnchor="middle"
                    fill={isDark ? "#e2e8f0" : "#1e293b"}
                    fontSize="10"
                    fontWeight="500"
                    className="select-none pointer-events-none"
                  >
                    {pos.name.split(/[\s/]+/).slice(1).join(" ")}
                  </text>
                </>
              ) : (
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isDark ? "#e2e8f0" : "#1e293b"}
                  fontSize="11.5"
                  fontWeight="600"
                  className="select-none pointer-events-none"
                >
                  {pos.name}
                </text>
              )}

              {/* Technique count badge */}
              <circle
                cx={r * 0.65}
                cy={-r * 0.65}
                r={11}
                fill={isDark ? "#1e293b" : "#f1f5f9"}
                stroke={zoneColor.stroke}
                strokeWidth="1.5"
                strokeOpacity={0.5}
              />
              <text
                x={r * 0.65}
                y={-r * 0.65}
                textAnchor="middle"
                dominantBaseline="central"
                fill={zoneColor.fill}
                fontSize="10"
                fontWeight="700"
                className="select-none pointer-events-none"
              >
                {pos.techniqueCount}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── Main PositionMap Component ─────────────────────────────────────

export default function PositionMap({ positions, techniques }: PositionMapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [view, setView] = useState<MapView>({ mode: "overview" });
  const [search, setSearch] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const layoutPositions = useMemo(
    () => getPositionLayout(positions, techniques),
    [positions, techniques]
  );

  const posMap = useMemo(() => {
    const m = new Map<string, PositionLayout>();
    for (const p of layoutPositions) m.set(p.slug, p);
    return m;
  }, [layoutPositions]);

  // Search matching
  const searchMatches = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const lower = search.toLowerCase();
    const matches = new Set<string>();

    for (const pos of layoutPositions) {
      if (pos.name.toLowerCase().includes(lower)) {
        matches.add(pos.slug);
        continue;
      }
      // Check if any technique matches
      for (const t of pos.techniques) {
        if (
          t.name.toLowerCase().includes(lower) ||
          (t.summary || "").toLowerCase().includes(lower)
        ) {
          matches.add(pos.slug);
          break;
        }
      }
    }
    return matches;
  }, [search, layoutPositions]);

  const handleSelectPosition = useCallback((slug: string) => {
    setView({ mode: "position", positionSlug: slug });
    setSearch("");
  }, []);

  const handleClose = useCallback(() => {
    setView({ mode: "overview" });
  }, []);

  const selectedPosition =
    view.mode !== "overview"
      ? layoutPositions.find((p) => p.slug === view.positionSlug) || null
      : null;

  return (
    <div className="w-full h-full flex flex-col bg-mat-50 dark:bg-mat-950 transition-colors">
      {/* Mobile: vertical list */}
      <div className="md:hidden flex-1 overflow-hidden">
        <MobilePositionList
          positions={layoutPositions}
          search={search}
          onSearch={setSearch}
          view={view}
          onSelectPosition={handleSelectPosition}
          onClose={handleClose}
        />
      </div>

      {/* Desktop: SVG map + detail panel */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: Map or detail */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-mat-200 dark:border-mat-800/50 bg-mat-50/80 dark:bg-mat-950/80 backdrop-blur-sm shrink-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              <button
                onClick={handleClose}
                className={`font-medium transition-colors ${
                  view.mode === "overview"
                    ? "text-mat-900 dark:text-mat-100"
                    : "text-gi-500 dark:text-gi-400 hover:underline"
                }`}
              >
                All Positions
              </button>
              {selectedPosition && (
                <>
                  <svg className="w-3 h-3 text-mat-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-mat-900 dark:text-mat-100 font-medium">
                    {selectedPosition.name}
                  </span>
                </>
              )}
            </nav>

            <div className="flex-1" />

            {/* Search */}
            <div className="relative w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mat-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value) setView({ mode: "overview" });
                }}
                placeholder="Search positions & techniques..."
                className="w-full pl-9 pr-4 py-2 bg-mat-100 dark:bg-mat-800/50 border border-mat-200 dark:border-mat-700/50 rounded-lg text-mat-900 dark:text-mat-100 placeholder:text-mat-400 dark:placeholder:text-mat-500 text-sm focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mat-400 hover:text-mat-600 dark:hover:text-mat-300"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 ml-2">
              {Object.entries(ZONE_COLORS).map(([zone, cfg]) => (
                <div key={zone} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cfg.fill }}
                  />
                  <span className="text-[11px] text-mat-500 dark:text-mat-400 font-medium">
                    {cfg.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Map area */}
          {view.mode === "overview" ? (
            <div className="flex-1 overflow-hidden p-2">
              <SVGMap
                positions={layoutPositions}
                hoveredSlug={hoveredSlug}
                onHover={setHoveredSlug}
                onSelect={handleSelectPosition}
                isDark={isDark}
                searchMatches={searchMatches}
              />
            </div>
          ) : selectedPosition ? (
            <div className="flex-1 overflow-y-auto p-6">
              <PositionDetail
                position={selectedPosition}
                positions={layoutPositions}
                onNavigate={handleSelectPosition}
                onClose={handleClose}
              />
            </div>
          ) : null}
        </div>

        {/* Right sidebar: tooltip on hover (only in overview) */}
        {view.mode === "overview" && hoveredSlug && (
          <div className="w-72 border-l border-mat-200 dark:border-mat-800/50 bg-mat-50 dark:bg-mat-900/50 p-4 overflow-y-auto shrink-0 animate-in fade-in slide-in-from-right-2 duration-150">
            {(() => {
              const pos = posMap.get(hoveredSlug);
              if (!pos) return null;
              const zoneColor = ZONE_COLORS[pos.zone];

              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: zoneColor.fill }}
                    />
                    <h3 className="text-base font-semibold text-mat-900 dark:text-mat-100">
                      {pos.name}
                    </h3>
                  </div>
                  <span
                    className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-3"
                    style={{
                      backgroundColor: zoneColor.fill + "15",
                      color: zoneColor.fill,
                    }}
                  >
                    {zoneColor.label} zone
                  </span>
                  <p className="text-xs text-mat-600 dark:text-mat-400 leading-relaxed mb-3 line-clamp-4">
                    {pos.description}
                  </p>
                  <div className="text-xs text-mat-500 dark:text-mat-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Techniques</span>
                      <span className="font-semibold text-mat-700 dark:text-mat-300">{pos.techniqueCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span className="font-semibold text-mat-700 dark:text-mat-300">{pos.transitions.length}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-mat-200 dark:border-mat-700/30">
                    <p className="text-[10px] text-mat-400 uppercase tracking-wider font-medium mb-1.5">
                      Connected to
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pos.transitions.slice(0, 8).map((slug) => {
                        const target = posMap.get(slug);
                        return (
                          <span
                            key={slug}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-mat-200 dark:bg-mat-700/50 text-mat-600 dark:text-mat-300"
                          >
                            {target?.name || slug}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[10px] text-mat-400 mt-3 italic">
                    Click to explore techniques
                  </p>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
