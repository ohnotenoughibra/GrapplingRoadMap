"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Fragment } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import {
  buildGraphData,
  CATEGORY_COLORS,
  type GraphNode,
  type GraphData,
} from "@/lib/graph-builder";
import type { PositionSeed, TechniqueSeed } from "@/lib/data/taxonomy";
import { useTheme } from "@/components/shared/ThemeProvider";

// Must be dynamically imported — uses browser APIs
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#050510]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/50 text-sm">Loading constellation...</p>
      </div>
    </div>
  ),
});

interface ConstellationMapProps {
  positions: PositionSeed[];
  techniques: TechniqueSeed[];
}

const DISCIPLINE_OPTIONS = [
  { value: "", label: "All" },
  { value: "nogi", label: "No-Gi" },
  { value: "gi", label: "Gi" },
  { value: "wrestling", label: "Wrestling" },
];

const CATEGORY_LEGEND = [
  { key: "submission", label: "Submissions", color: "#ef4444" },
  { key: "sweep", label: "Sweeps", color: "#22c55e" },
  { key: "pass", label: "Passes", color: "#3b82f6" },
  { key: "escape", label: "Escapes", color: "#f59e0b" },
  { key: "takedown", label: "Takedowns", color: "#8b5cf6" },
  { key: "control", label: "Control", color: "#06b6d4" },
  { key: "transition", label: "Transitions", color: "#ec4899" },
  { key: "defense", label: "Defense", color: "#64748b" },
  { key: "entry", label: "Entries", color: "#14b8a6" },
  { key: "scramble", label: "Scrambles", color: "#f97316" },
];

// Light mode overrides
const LIGHT_POSITION_COLOR = "#1e293b"; // slate-800
const LIGHT_BG = "#f0f0f5";
const LIGHT_CONTAINS_LINK = "rgba(30,41,59,0.08)";
const LIGHT_TRANSITION_LINK = "rgba(139,92,246,0.35)";

// ─── Glow texture generator ─────────────────────────────────────────
const textureCache = new Map<string, THREE.Texture>();

function createGlowTexture(color: string, size = 64): THREE.Texture {
  const key = `${color}-${size}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.3, color + "aa");
  gradient.addColorStop(0.6, color + "40");
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

// ─── Detail Panel Component ──────────────────────────────────────────

interface DetailPanelProps {
  node: GraphNode;
  graphData: GraphData;
  positions: PositionSeed[];
  techniques: TechniqueSeed[];
  lightMode: boolean;
  onClose: () => void;
  onNodeSelect: (nodeId: string) => void;
}

function DetailPanel({
  node,
  graphData,
  positions,
  techniques,
  lightMode,
  onClose,
  onNodeSelect,
}: DetailPanelProps) {
  const isPosition = node.type === "position";
  const [expandedTechIds, setExpandedTechIds] = useState<Set<string>>(new Set());

  const toggleTechExpand = useCallback((id: string) => {
    setExpandedTechIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Find related data
  const childTechniques = useMemo(() => {
    if (!isPosition) return [];
    return graphData.nodes.filter(
      (n) => n.type === "technique" && n.positionId === node.id
    );
  }, [isPosition, graphData.nodes, node.id]);

  const groupedTechniques = useMemo(() => {
    const groups: Record<string, GraphNode[]> = {};
    for (const t of childTechniques) {
      const cat = t.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    }
    return groups;
  }, [childTechniques]);

  const connectedPositions = useMemo(() => {
    if (!isPosition) return [];
    const connected = new Set<string>();
    for (const link of graphData.links) {
      if (link.type !== "position-transition") continue;
      const src =
        typeof link.source === "string" ? link.source : (link.source as any).id;
      const tgt =
        typeof link.target === "string" ? link.target : (link.target as any).id;
      if (src === node.id) connected.add(tgt);
      if (tgt === node.id) connected.add(src);
    }
    return graphData.nodes.filter(
      (n) => n.type === "position" && connected.has(n.id)
    );
  }, [isPosition, graphData, node.id]);

  const parentPosition = useMemo(() => {
    if (isPosition || !node.positionId) return null;
    return graphData.nodes.find(
      (n) => n.type === "position" && n.id === node.positionId
    );
  }, [isPosition, node.positionId, graphData.nodes]);

  const transitionTargetNode = useMemo(() => {
    if (isPosition || !node.transitionTarget) return null;
    return graphData.nodes.find(
      (n) => n.type === "position" && n.id === node.transitionTarget
    );
  }, [isPosition, node.transitionTarget, graphData.nodes]);

  const relatedTechniques = useMemo(() => {
    if (isPosition || !node.positionId) return [];
    return graphData.nodes.filter(
      (n) =>
        n.type === "technique" &&
        n.positionId === node.positionId &&
        n.id !== node.id
    );
  }, [isPosition, node.positionId, node.id, graphData.nodes]);

  const bg = lightMode
    ? "bg-white/95 border-slate-200"
    : "bg-[#0c0c1a]/95 border-white/10";
  const textPrimary = lightMode ? "text-slate-900" : "text-white";
  const textSecondary = lightMode ? "text-slate-500" : "text-white/60";
  const textTertiary = lightMode ? "text-slate-400" : "text-white/40";
  const chipBg = lightMode
    ? "bg-slate-100 text-slate-700"
    : "bg-white/10 text-white/80";
  const hoverBg = lightMode ? "hover:bg-slate-50" : "hover:bg-white/5";
  const divider = lightMode ? "border-slate-100" : "border-white/10";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
        onClick={onClose}
      />

      {/* Panel - bottom sheet on mobile, right panel on desktop */}
      <div
        className={`fixed z-40 overflow-hidden
          bottom-0 left-0 right-0 max-h-[65vh] rounded-t-2xl slide-in-from-bottom
          md:top-0 md:bottom-0 md:right-0 md:left-auto md:max-h-none md:w-[400px] md:rounded-t-none md:rounded-l-2xl md:slide-in-from-right
          border ${bg} backdrop-blur-xl shadow-2xl`}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div
            className={`w-10 h-1 rounded-full ${lightMode ? "bg-slate-300" : "bg-white/20"}`}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${lightMode ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "bg-white/10 text-white/60 hover:bg-white/20"} transition-colors`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(65vh-32px)] md:max-h-screen p-5 md:p-6 space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPosition ? (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${lightMode ? "bg-slate-800 text-white" : "bg-white/20 text-white/80"}`}
                >
                  Position
                </span>
              ) : (
                <>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        (CATEGORY_COLORS[node.category!] || "#888") + "20",
                      color: CATEGORY_COLORS[node.category!] || "#888",
                    }}
                  >
                    {node.category}
                  </span>
                  {node.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${chipBg}`}>
                      {node.difficulty}
                    </span>
                  )}
                  {node.discipline && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${chipBg}`}>
                      {node.discipline}
                    </span>
                  )}
                </>
              )}
            </div>
            <h2 className={`text-xl font-bold ${textPrimary} mt-2`}>
              {node.name}
            </h2>
            {(node.description || node.summary) && (
              <p className={`text-sm mt-2 leading-relaxed ${textSecondary}`}>
                {node.summary || node.description}
              </p>
            )}
          </div>

          {/* ─── Position Detail ─── */}
          {isPosition && (
            <>
              {/* Technique count */}
              <div className={`text-sm ${textTertiary}`}>
                {childTechniques.length} technique
                {childTechniques.length !== 1 ? "s" : ""}
              </div>

              {/* Techniques grouped by category */}
              {Object.keys(groupedTechniques).length > 0 && (
                <div className="space-y-3">
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider ${textTertiary}`}
                  >
                    Techniques
                  </h3>
                  {Object.entries(groupedTechniques).map(([cat, techs]) => (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: CATEGORY_COLORS[cat] || "#888",
                            boxShadow: `0 0 4px ${CATEGORY_COLORS[cat] || "#888"}`,
                          }}
                        />
                        <span
                          className="text-xs font-medium capitalize"
                          style={{ color: CATEGORY_COLORS[cat] || "#888" }}
                        >
                          {cat}
                        </span>
                        <span className={`text-xs ${textTertiary}`}>
                          ({techs.length})
                        </span>
                      </div>
                      <div className="space-y-0.5 ml-4">
                        {techs.map((t) => {
                          const isExpTech = expandedTechIds.has(t.id);
                          return (
                            <Fragment key={t.id}>
                              <div className={`rounded-lg ${isExpTech ? (lightMode ? "bg-slate-50" : "bg-white/5") : ""}`}>
                                <div className="flex items-center">
                                  {/* Expand toggle */}
                                  {(t.summary || t.tips?.length || t.commonMistakes?.length) ? (
                                    <button
                                      onClick={() => toggleTechExpand(t.id)}
                                      className={`px-1.5 py-1.5 flex-shrink-0 ${textTertiary} hover:${textSecondary} transition-colors`}
                                    >
                                      <svg className={`w-3 h-3 transition-transform duration-150 ${isExpTech ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <span className="w-6" />
                                  )}
                                  {/* Technique name — click navigates */}
                                  <button
                                    onClick={() => onNodeSelect(t.id)}
                                    className={`flex-1 text-left px-2 py-1.5 text-sm ${textPrimary} ${hoverBg} transition-colors truncate`}
                                  >
                                    {t.name}
                                  </button>
                                  {t.difficulty && (
                                    <span className={`text-[10px] mr-3 flex-shrink-0 ${textTertiary}`}>
                                      {t.difficulty}
                                    </span>
                                  )}
                                </div>
                                {/* Expanded inline detail */}
                                {isExpTech && (
                                  <div className="px-3 pb-2.5 pt-0.5 ml-6 space-y-2">
                                    {t.summary && (
                                      <p className={`text-xs leading-relaxed ${textSecondary}`}>{t.summary}</p>
                                    )}
                                    {t.tips && t.tips.length > 0 && (
                                      <div className="space-y-1">
                                        {t.tips.map((tip, i) => (
                                          <div key={i} className="flex items-start gap-1.5">
                                            <svg className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-xs leading-snug ${textSecondary}`}>{tip}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {t.commonMistakes && t.commonMistakes.length > 0 && (
                                      <div className="space-y-1">
                                        {t.commonMistakes.map((m, i) => (
                                          <div key={i} className="flex items-start gap-1.5">
                                            <svg className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span className={`text-xs leading-snug ${textSecondary}`}>{m}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Connected positions */}
              {connectedPositions.length > 0 && (
                <div className={`border-t pt-4 ${divider}`}>
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textTertiary}`}
                  >
                    Transitions
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedPositions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onNodeSelect(p.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${lightMode ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-white/70 hover:bg-white/10"}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Library link */}
              <div className={`border-t pt-4 ${divider}`}>
                <a
                  href={`/library?position=${node.id}`}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${lightMode ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}
                >
                  View in Library
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            </>
          )}

          {/* ─── Technique Detail ─── */}
          {!isPosition && (
            <>
              {/* Tips */}
              {node.tips && node.tips.length > 0 && (
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textTertiary}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Tips
                    </span>
                  </h3>
                  <div className="space-y-1.5">
                    {node.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm leading-snug ${textSecondary}`}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {node.commonMistakes && node.commonMistakes.length > 0 && (
                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textTertiary}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Common Mistakes
                    </span>
                  </h3>
                  <div className="space-y-1.5">
                    {node.commonMistakes.map((mistake, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={`text-sm leading-snug ${textSecondary}`}>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parent position */}
              {parentPosition && (
                <div>
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${textTertiary}`}
                  >
                    Position
                  </h3>
                  <button
                    onClick={() => onNodeSelect(parentPosition.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full text-left transition-colors ${lightMode ? "border-slate-200 hover:bg-slate-50" : "border-white/10 hover:bg-white/5"}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        background: lightMode ? LIGHT_POSITION_COLOR : "#fff",
                        boxShadow: `0 0 6px ${lightMode ? LIGHT_POSITION_COLOR : "#fff"}`,
                      }}
                    />
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {parentPosition.name}
                    </span>
                  </button>
                </div>
              )}

              {/* Transition target */}
              {transitionTargetNode && (
                <div>
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${textTertiary}`}
                  >
                    Transitions To
                  </h3>
                  <button
                    onClick={() => onNodeSelect(transitionTargetNode.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border w-full text-left transition-colors ${lightMode ? "border-slate-200 hover:bg-slate-50" : "border-white/10 hover:bg-white/5"}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        background: lightMode ? LIGHT_POSITION_COLOR : "#fff",
                        boxShadow: `0 0 6px ${lightMode ? LIGHT_POSITION_COLOR : "#fff"}`,
                      }}
                    />
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {transitionTargetNode.name}
                    </span>
                  </button>
                </div>
              )}

              {/* Related techniques */}
              {relatedTechniques.length > 0 && (
                <div className={`border-t pt-4 ${divider}`}>
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textTertiary}`}
                  >
                    Related Techniques
                  </h3>
                  <div className="space-y-0.5">
                    {relatedTechniques.slice(0, 10).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onNodeSelect(t.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${textPrimary} ${hoverBg} transition-colors flex items-center gap-2`}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background:
                              CATEGORY_COLORS[t.category!] || "#888",
                          }}
                        />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                    {relatedTechniques.length > 10 && (
                      <p className={`text-xs pl-3 pt-1 ${textTertiary}`}>
                        +{relatedTechniques.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function ConstellationMap({
  positions,
  techniques,
}: ConstellationMapProps) {
  const { theme } = useTheme();
  const lightMode = theme === "light";
  const [discipline, setDiscipline] = useState("");
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [legendOpen, setLegendOpen] = useState(false);
  const [graphReady, setGraphReady] = useState(false);
  const graphRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Responsive sizing
  useEffect(() => {
    function updateSize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Auto-rotate camera + celestial scene setup
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;

    // Auto-rotation
    const controls = fg.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
    }

    // Start zoomed out
    fg.cameraPosition({ x: 0, y: 100, z: 600 }, { x: 0, y: 0, z: 0 }, 0);

    const scene = fg.scene();
    if (!scene) return;

    // Starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 4000;
      starSizes[i] = Math.random() * 1.5 + 0.3;
    }
    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    const starColor = lightMode ? 0x334155 : 0xffffff;
    const starsMaterial = new THREE.PointsMaterial({
      color: starColor,
      size: 0.7,
      transparent: true,
      opacity: lightMode ? 0.15 : 0.5,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.name = "starfield";
    scene.add(stars);

    // Fog for depth
    const fogColor = lightMode ? 0xf0f0f5 : 0x050510;
    scene.fog = new THREE.FogExp2(fogColor, 0.0006);

    setGraphReady(true);

    return () => {
      const existingStars = scene.getObjectByName("starfield");
      if (existingStars) scene.remove(existingStars);
      scene.fog = null;
    };
  }, [graphRef.current, lightMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build graph data (memoized on filter/theme change)
  const graphData: GraphData = useMemo(() => {
    const data = buildGraphData(positions, techniques, {
      discipline: discipline || undefined,
    });
    if (!lightMode) return data;
    return {
      nodes: data.nodes.map((n) => ({
        ...n,
        color: n.type === "position" ? LIGHT_POSITION_COLOR : n.color,
      })),
      links: data.links.map((l) => ({
        ...l,
        color:
          l.type === "contains"
            ? LIGHT_CONTAINS_LINK
            : l.type === "position-transition"
              ? LIGHT_TRANSITION_LINK
              : l.color,
      })),
    };
  }, [positions, techniques, discipline, lightMode]);

  // Node label on hover
  const nodeLabel = useCallback(
    (node: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      const bg = lightMode ? "rgba(255,255,255,0.92)" : "rgba(5,5,16,0.92)";
      const textColor = lightMode ? "#0f172a" : "#fff";
      const subColor = lightMode
        ? "rgba(15,23,42,0.5)"
        : "rgba(255,255,255,0.5)";
      const dotColor = lightMode
        ? "rgba(15,23,42,0.3)"
        : "rgba(255,255,255,0.4)";
      const borderBase = lightMode
        ? "rgba(15,23,42,0.12)"
        : "rgba(255,255,255,0.15)";

      if (node.type === "position") {
        return `<div style="background:${bg};padding:8px 14px;border-radius:8px;border:1px solid ${borderBase};backdrop-filter:blur(8px);">
        <div style="font-weight:700;font-size:14px;color:${textColor};">${node.name}</div>
        <div style="font-size:11px;color:${subColor};margin-top:2px;">Position — click for details</div>
      </div>`;
      }
      const catColor = CATEGORY_COLORS[node.category] || "#888";
      return `<div style="background:${bg};padding:8px 14px;border-radius:8px;border:1px solid ${catColor}40;backdrop-filter:blur(8px);">
      <div style="font-weight:700;font-size:14px;color:${textColor};">${node.name}</div>
      <div style="display:flex;gap:8px;margin-top:4px;font-size:11px;">
        <span style="color:${catColor};">${node.category}</span>
        <span style="color:${dotColor};">•</span>
        <span style="color:${subColor};">${node.difficulty || ""}</span>
        <span style="color:${dotColor};">•</span>
        <span style="color:${subColor};">${node.discipline || ""}</span>
      </div>
    </div>`;
    },
    [lightMode]
  );

  // Link width
  const linkWidth = useCallback((link: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (link.type === "position-transition") return 1.2;
    if (link.type === "transition") return 0.8;
    return 0.15;
  }, []);

  // Node hover handler
  const onNodeHover = useCallback((node: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    setHoveredNode(node || null);
    document.body.style.cursor = node ? "pointer" : "default";
  }, []);

  // Node click: zoom to node + open detail panel
  const onNodeClick = useCallback(
    (node: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      const fg = graphRef.current;
      if (!fg) return;

      setSelectedNode(node as GraphNode);

      const distance = node.type === "position" ? 150 : 100;
      fg.cameraPosition(
        {
          x: node.x + distance * 0.7,
          y: node.y + distance * 0.3,
          z: node.z + distance * 0.7,
        },
        { x: node.x, y: node.y, z: node.z },
        1200
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Handle node selection from detail panel
  const handlePanelNodeSelect = useCallback(
    (nodeId: string) => {
      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      // Need to find the runtime node with x/y/z coords
      const fg = graphRef.current;
      if (!fg) return;
      const gData = fg.graphData();
      const runtimeNode = gData.nodes.find((n: any) => n.id === nodeId);
      if (runtimeNode) {
        onNodeClick(runtimeNode);
      }
    },
    [graphData.nodes, onNodeClick]
  );

  // Close panel
  const closePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    const fg = graphRef.current;
    if (!fg) return;
    setSelectedNode(null);
    fg.cameraPosition({ x: 0, y: 100, z: 600 }, { x: 0, y: 0, z: 0 }, 1200);
  }, []);

  // Custom Three.js node rendering for celestial glow
  const nodeThreeObject = useCallback(
    (node: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      if (typeof window === "undefined") return false;

      const isPosition = node.type === "position";
      const color = node.color || "#ffffff";
      const group = new THREE.Group();

      if (isPosition) {
        // Position: large glowing star with halo
        const coreColor = lightMode ? "#1e293b" : "#fffbe6";
        const glowColor = lightMode ? "#475569" : color;

        // Core
        const coreTexture = createGlowTexture(coreColor, 64);
        const coreMat = new THREE.SpriteMaterial({
          map: coreTexture,
          transparent: true,
          opacity: 0.95,
          blending: lightMode
            ? THREE.NormalBlending
            : THREE.AdditiveBlending,
          depthWrite: false,
        });
        const core = new THREE.Sprite(coreMat);
        core.scale.set(14, 14, 1);
        group.add(core);

        // Outer halo
        const haloTexture = createGlowTexture(glowColor, 128);
        const haloMat = new THREE.SpriteMaterial({
          map: haloTexture,
          transparent: true,
          opacity: lightMode ? 0.08 : 0.12,
          blending: lightMode
            ? THREE.NormalBlending
            : THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.set(42, 42, 1);
        group.add(halo);

        // Label
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = 512;
        canvas.height = 80;
        ctx.font = "bold 32px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = lightMode
          ? "rgba(15,23,42,0.65)"
          : "rgba(255,255,255,0.65)";
        ctx.fillText(node.name, 256, 50);
        const labelTexture = new THREE.CanvasTexture(canvas);
        const labelMat = new THREE.SpriteMaterial({
          map: labelTexture,
          transparent: true,
          depthWrite: false,
        });
        const label = new THREE.Sprite(labelMat);
        label.scale.set(40, 6, 1);
        label.position.set(0, -12, 0);
        group.add(label);
      } else {
        // Technique: small glowing colored star
        const techColor = color;
        const texture = createGlowTexture(techColor, 48);
        const mat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.85,
          blending: lightMode
            ? THREE.NormalBlending
            : THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(5, 5, 1);
        group.add(sprite);

        // Subtle outer glow for techniques too
        const glowTexture = createGlowTexture(techColor, 64);
        const glowMat = new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          opacity: lightMode ? 0.05 : 0.08,
          blending: lightMode
            ? THREE.NormalBlending
            : THREE.AdditiveBlending,
          depthWrite: false,
        });
        const glow = new THREE.Sprite(glowMat);
        glow.scale.set(12, 12, 1);
        group.add(glow);
      }

      return group;
    },
    [lightMode]
  );

  // Twinkle animation for technique nodes
  useEffect(() => {
    if (!graphReady) return;
    let animFrame: number;
    const animate = () => {
      const fg = graphRef.current;
      if (fg) {
        const gData = fg.graphData();
        const time = Date.now() * 0.001;
        for (const node of gData.nodes) {
          if (
            node.type === "technique" &&
            (node as any).__threeObj
          ) {
            const obj = (node as any).__threeObj as THREE.Group;
            const mainSprite = obj.children[0] as THREE.Sprite;
            if (mainSprite?.material) {
              // Each node gets a unique phase based on its index
              const phase =
                ((node as any).__idx || node.id.length) * 1.7;
              mainSprite.material.opacity =
                0.7 + 0.2 * Math.sin(time * 2 + phase);
            }
          }
        }
      }
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [graphReady]);

  const darkBg = "#050510";
  const bgColor = lightMode ? LIGHT_BG : darkBg;

  return (
    <div
      className="relative w-full h-full"
      style={{ background: bgColor }}
    >
      {/* 3D Graph */}
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={nodeLabel}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={(link: any) => link.color} // eslint-disable-line @typescript-eslint/no-explicit-any
        linkWidth={linkWidth}
        linkOpacity={0.4}
        onNodeHover={onNodeHover}
        onNodeClick={onNodeClick}
        backgroundColor={bgColor}
        width={dimensions.width}
        height={dimensions.height}
        showNavInfo={false}
        enableNodeDrag={true}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        linkDirectionalParticles={(link: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
          link.type === "position-transition" ? 5 : 0
        }
        linkDirectionalParticleSpeed={0.008}
        linkDirectionalParticleWidth={1.8}
        linkDirectionalParticleColor={(link: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
          lightMode ? LIGHT_POSITION_COLOR : link.color
        }
        linkLineDash={(link: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
          link.type === "contains" ? [1, 3] : undefined
        }
      />

      {/* Controls Panel - Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        {/* Title */}
        <div
          className={`backdrop-blur-md rounded-xl border px-4 py-3 ${lightMode ? "bg-white/80 border-slate-200" : "bg-[#050510]/80 border-white/10"}`}
        >
          <h1
            className={`font-bold text-lg tracking-tight ${lightMode ? "text-slate-900" : "text-white"}`}
          >
            Grappling Universe
          </h1>
          <p
            className={`text-xs mt-0.5 ${lightMode ? "text-slate-400" : "text-white/40"}`}
          >
            {graphData.nodes.length} nodes &middot;{" "}
            {graphData.links.length} connections
          </p>
        </div>

        {/* Discipline Filter */}
        <div
          className={`backdrop-blur-md rounded-xl border p-2 ${lightMode ? "bg-white/80 border-slate-200" : "bg-[#050510]/80 border-white/10"}`}
        >
          <div className="flex gap-1">
            {DISCIPLINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDiscipline(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  discipline === opt.value
                    ? lightMode
                      ? "bg-slate-900 text-white"
                      : "bg-white text-black"
                    : lightMode
                      ? "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend Toggle */}
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className={`backdrop-blur-md rounded-xl border px-4 py-2 text-left ${lightMode ? "bg-white/80 border-slate-200" : "bg-[#050510]/80 border-white/10"}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${lightMode ? "text-slate-600" : "text-white/70"}`}
            >
              Legend
            </span>
            <svg
              className={`w-3 h-3 transition-transform ${legendOpen ? "rotate-180" : ""} ${lightMode ? "text-slate-400" : "text-white/40"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {legendOpen && (
          <div
            className={`backdrop-blur-md rounded-xl border px-4 py-3 ${lightMode ? "bg-white/80 border-slate-200" : "bg-[#050510]/80 border-white/10"}`}
          >
            <div className="space-y-1.5">
              {/* Position indicator */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: lightMode ? LIGHT_POSITION_COLOR : "#fffbe6",
                    boxShadow: `0 0 8px ${lightMode ? LIGHT_POSITION_COLOR : "#fffbe6"}`,
                  }}
                />
                <span
                  className={`text-xs ${lightMode ? "text-slate-500" : "text-white/60"}`}
                >
                  Position
                </span>
              </div>
              {/* Category colors */}
              {CATEGORY_LEGEND.map((cat) => (
                <div key={cat.key} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: cat.color,
                      boxShadow: `0 0 4px ${cat.color}`,
                    }}
                  />
                  <span
                    className={`text-xs ${lightMode ? "text-slate-500" : "text-white/60"}`}
                  >
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset View */}
        <button
          onClick={resetView}
          className={`backdrop-blur-md rounded-xl border px-4 py-2 text-xs font-medium transition-all ${lightMode ? "bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white" : "bg-[#050510]/80 border-white/10 text-white/70 hover:text-white hover:bg-white/10"}`}
        >
          Reset View
        </button>
      </div>

      {/* Hovered Node Info - Bottom Center (mobile-friendly) */}
      {hoveredNode && !selectedNode && (
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 backdrop-blur-md rounded-xl border px-5 py-3 pointer-events-none ${lightMode ? "bg-white/90 border-slate-200" : "bg-[#050510]/90 border-white/10"}`}
        >
          <div
            className={`font-semibold text-sm ${lightMode ? "text-slate-900" : "text-white"}`}
          >
            {hoveredNode.name}
          </div>
          {hoveredNode.type === "technique" && (
            <div className="flex gap-2 mt-1 text-xs">
              <span
                style={{
                  color: CATEGORY_COLORS[hoveredNode.category!],
                }}
              >
                {hoveredNode.category}
              </span>
              <span
                className={
                  lightMode ? "text-slate-300" : "text-white/30"
                }
              >
                |
              </span>
              <span
                className={
                  lightMode ? "text-slate-500" : "text-white/50"
                }
              >
                {hoveredNode.difficulty}
              </span>
              <span
                className={
                  lightMode ? "text-slate-300" : "text-white/30"
                }
              >
                |
              </span>
              <span
                className={
                  lightMode ? "text-slate-500" : "text-white/50"
                }
              >
                {hoveredNode.discipline}
              </span>
            </div>
          )}
          {hoveredNode.type === "position" && (
            <div
              className={`text-xs mt-1 ${lightMode ? "text-slate-400" : "text-white/40"}`}
            >
              Click for details
            </div>
          )}
        </div>
      )}

      {/* Instructions - Bottom Right */}
      <div
        className={`absolute bottom-4 right-4 z-10 text-[10px] text-right hidden sm:block ${lightMode ? "text-slate-300" : "text-white/20"}`}
      >
        <p>Drag to rotate</p>
        <p>Scroll to zoom</p>
        <p>Click node for details</p>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <DetailPanel
          node={selectedNode}
          graphData={graphData}
          positions={positions}
          techniques={techniques}
          lightMode={lightMode}
          onClose={closePanel}
          onNodeSelect={handlePanelNodeSelect}
        />
      )}
    </div>
  );
}
