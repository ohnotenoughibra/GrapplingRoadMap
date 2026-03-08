"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
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
    <div className="flex items-center justify-center w-full h-full bg-[#0a0a0a] dark:bg-[#0a0a0a]">
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
const LIGHT_BG = "#f1f5f9"; // slate-100
const LIGHT_CONTAINS_LINK = "rgba(30,41,59,0.08)";
const LIGHT_TRANSITION_LINK = "rgba(139,92,246,0.35)";

export default function ConstellationMap({
  positions,
  techniques,
}: ConstellationMapProps) {
  const { theme } = useTheme();
  const lightMode = theme === "light";
  const [discipline, setDiscipline] = useState("");
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [legendOpen, setLegendOpen] = useState(false);
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

  // Auto-rotate camera
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    // Set up slow auto-rotation
    const controls = fg.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, [graphRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build graph data (memoized on filter/theme change)
  const graphData: GraphData = useMemo(() => {
    const data = buildGraphData(positions, techniques, {
      discipline: discipline || undefined,
    });
    if (!lightMode) return data;
    // Override colors for light mode
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
  const nodeLabel = useCallback((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const bg = lightMode ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.85)";
    const textColor = lightMode ? "#0f172a" : "#fff";
    const subColor = lightMode ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.5)";
    const dotColor = lightMode ? "rgba(15,23,42,0.3)" : "rgba(255,255,255,0.4)";
    const borderBase = lightMode ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.15)";

    if (node.type === "position") {
      return `<div style="background:${bg};padding:8px 14px;border-radius:8px;border:1px solid ${borderBase};backdrop-filter:blur(8px);">
        <div style="font-weight:700;font-size:14px;color:${textColor};">${node.name}</div>
        <div style="font-size:11px;color:${subColor};margin-top:2px;">Position</div>
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
  }, [lightMode]);

  // Link width
  const linkWidth = useCallback((link: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (link.type === "position-transition") return 1.5;
    if (link.type === "transition") return 1;
    return 0.3;
  }, []);

  // Link opacity
  const linkOpacity = useCallback((link: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (link.type === "contains") return 0.08;
    if (link.type === "position-transition") return 0.3;
    return 0.5;
  }, []);

  // Node hover handler
  const onNodeHover = useCallback((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setHoveredNode(node || null);
    document.body.style.cursor = node ? "pointer" : "default";
  }, []);

  // Node click: zoom to node
  const onNodeClick = useCallback((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const fg = graphRef.current;
    if (!fg) return;
    const distance = node.type === "position" ? 120 : 80;
    fg.cameraPosition(
      {
        x: node.x + distance,
        y: node.y + distance / 2,
        z: node.z + distance,
      },
      { x: node.x, y: node.y, z: node.z },
      1000
    );
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.cameraPosition({ x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 1000);
  }, []);

  // Custom node painting for glow effect
  const nodeThreeObject = useCallback((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // We'll use the default sphere rendering but with custom colors via nodeColor
    // For custom three.js objects we'd need THREE imported, but the default works great
    return false; // use default rendering
  }, []);

  return (
    <div className={`relative w-full h-full ${lightMode ? "bg-[#f1f5f9]" : "bg-[#0a0a0a]"}`}>
      {/* 3D Graph */}
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={nodeLabel}
        nodeColor={(node: any) => node.color} // eslint-disable-line @typescript-eslint/no-explicit-any
        nodeVal={(node: any) => node.val} // eslint-disable-line @typescript-eslint/no-explicit-any
        nodeOpacity={0.9}
        linkColor={(link: any) => link.color} // eslint-disable-line @typescript-eslint/no-explicit-any
        linkWidth={linkWidth}
        linkOpacity={0.4}
        onNodeHover={onNodeHover}
        onNodeClick={onNodeClick}
        backgroundColor={lightMode ? LIGHT_BG : "#0a0a0a"}
        width={dimensions.width}
        height={dimensions.height}
        showNavInfo={false}
        enableNodeDrag={true}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        linkDirectionalParticles={(link: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
          link.type === "position-transition" ? 2 : 0
        }
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={(link: any) => link.color} // eslint-disable-line @typescript-eslint/no-explicit-any
      />

      {/* Controls Panel - Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        {/* Title */}
        <div className={`backdrop-blur-md rounded-xl border px-4 py-3 ${lightMode ? "bg-white/80 border-slate-200" : "bg-black/70 border-white/10"}`}>
          <h1 className={`font-bold text-lg tracking-tight ${lightMode ? "text-slate-900" : "text-white"}`}>
            Grappling Universe
          </h1>
          <p className={`text-xs mt-0.5 ${lightMode ? "text-slate-400" : "text-white/40"}`}>
            {graphData.nodes.length} nodes &middot;{" "}
            {graphData.links.length} connections
          </p>
        </div>

        {/* Discipline Filter */}
        <div className={`backdrop-blur-md rounded-xl border p-2 ${lightMode ? "bg-white/80 border-slate-200" : "bg-black/70 border-white/10"}`}>
          <div className="flex gap-1">
            {DISCIPLINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDiscipline(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  discipline === opt.value
                    ? lightMode ? "bg-slate-900 text-white" : "bg-white text-black"
                    : lightMode ? "text-slate-500 hover:text-slate-800 hover:bg-slate-100" : "text-white/60 hover:text-white hover:bg-white/10"
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
          className={`backdrop-blur-md rounded-xl border px-4 py-2 text-left ${lightMode ? "bg-white/80 border-slate-200" : "bg-black/70 border-white/10"}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${lightMode ? "text-slate-600" : "text-white/70"}`}>Legend</span>
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
          <div className={`backdrop-blur-md rounded-xl border px-4 py-3 ${lightMode ? "bg-white/80 border-slate-200" : "bg-black/70 border-white/10"}`}>
            <div className="space-y-1.5">
              {/* Position indicator */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: lightMode ? LIGHT_POSITION_COLOR : "#ffffff", boxShadow: `0 0 6px ${lightMode ? LIGHT_POSITION_COLOR : "#ffffff"}` }}
                />
                <span className={`text-xs ${lightMode ? "text-slate-500" : "text-white/60"}`}>Position</span>
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
                  <span className={`text-xs ${lightMode ? "text-slate-500" : "text-white/60"}`}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset View */}
        <button
          onClick={resetView}
          className={`backdrop-blur-md rounded-xl border px-4 py-2 text-xs font-medium transition-all ${lightMode ? "bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white" : "bg-black/70 border-white/10 text-white/70 hover:text-white hover:bg-white/10"}`}
        >
          Reset View
        </button>
      </div>

      {/* Hovered Node Info - Bottom Center (mobile-friendly) */}
      {hoveredNode && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 backdrop-blur-md rounded-xl border px-5 py-3 pointer-events-none ${lightMode ? "bg-white/90 border-slate-200" : "bg-black/80 border-white/10"}`}>
          <div className={`font-semibold text-sm ${lightMode ? "text-slate-900" : "text-white"}`}>
            {hoveredNode.name}
          </div>
          {hoveredNode.type === "technique" && (
            <div className="flex gap-2 mt-1 text-xs">
              <span style={{ color: CATEGORY_COLORS[hoveredNode.category!] }}>
                {hoveredNode.category}
              </span>
              <span className={lightMode ? "text-slate-300" : "text-white/30"}>|</span>
              <span className={lightMode ? "text-slate-500" : "text-white/50"}>{hoveredNode.difficulty}</span>
              <span className={lightMode ? "text-slate-300" : "text-white/30"}>|</span>
              <span className={lightMode ? "text-slate-500" : "text-white/50"}>{hoveredNode.discipline}</span>
            </div>
          )}
          {hoveredNode.type === "position" && (
            <div className={`text-xs mt-1 ${lightMode ? "text-slate-400" : "text-white/40"}`}>
              Click to zoom in
            </div>
          )}
        </div>
      )}

      {/* Instructions - Bottom Right */}
      <div className={`absolute bottom-4 right-4 z-10 text-[10px] text-right hidden sm:block ${lightMode ? "text-slate-300" : "text-white/20"}`}>
        <p>Drag to rotate</p>
        <p>Scroll to zoom</p>
        <p>Click node to focus</p>
      </div>
    </div>
  );
}
