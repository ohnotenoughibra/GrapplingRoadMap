// ─── 3D Constellation Map Graph Builder ─────────────────────────────
// Transforms taxonomy data into force-graph compatible format

import type { TechniqueCategory } from "@/types";
import type { PositionSeed, TechniqueSeed } from "@/lib/data/taxonomy";

export interface GraphNode {
  id: string;
  name: string;
  type: "position" | "technique";
  category?: TechniqueCategory;
  discipline?: string;
  difficulty?: string;
  val: number;
  color: string;
  positionId?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: "contains" | "transition" | "position-transition";
  color: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// ─── Color Palette ──────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  submission: "#ef4444",
  sweep: "#22c55e",
  pass: "#3b82f6",
  escape: "#f59e0b",
  takedown: "#8b5cf6",
  throw: "#a855f7",
  control: "#06b6d4",
  transition: "#ec4899",
  setup: "#84cc16",
  defense: "#64748b",
  retention: "#2563eb",
  entry: "#14b8a6",
  scramble: "#f97316",
};

const POSITION_COLOR = "#ffffff";
const CONTAINS_LINK_COLOR = "rgba(255,255,255,0.06)";

// ─── Transition Map ─────────────────────────────────────────────────
// Common position-to-position transitions in grappling

const TRANSITION_MAP: Record<string, string[]> = {
  "closed-guard": ["mount", "side-control", "back-control", "open-guard"],
  "open-guard": [
    "closed-guard",
    "half-guard",
    "back-control",
    "mount",
    "de-la-riva",
    "butterfly-guard",
    "x-guard",
  ],
  "half-guard": [
    "closed-guard",
    "open-guard",
    "back-control",
    "side-control",
  ],
  "butterfly-guard": ["back-control", "mount", "x-guard", "open-guard"],
  "de-la-riva": ["back-control", "x-guard", "open-guard"],
  "x-guard": ["mount", "side-control", "open-guard"],
  "fifty-fifty": ["saddle", "side-control", "standing"],
  "side-control": [
    "mount",
    "back-control",
    "north-south",
    "knee-on-belly",
  ],
  mount: ["back-control", "side-control"],
  "knee-on-belly": ["mount", "side-control", "back-control"],
  "north-south": ["side-control", "mount"],
  "back-control": ["mount", "side-control"],
  turtle: ["back-control", "side-control", "standing", "front-headlock"],
  "front-headlock": ["side-control", "back-control", "guillotine"],
  "leg-entanglements": ["saddle", "fifty-fifty", "side-control"],
  saddle: ["fifty-fifty", "leg-entanglements", "side-control"],
  truck: ["back-control", "saddle"],
  standing: [
    "closed-guard",
    "open-guard",
    "half-guard",
    "side-control",
    "back-control",
    "front-headlock",
    "body-lock",
  ],
  "guard-top": [
    "side-control",
    "mount",
    "knee-on-belly",
    "half-guard",
    "back-control",
  ],
  "wrestling-mat": ["back-control", "side-control", "turtle", "standing"],
  "body-lock": ["side-control", "back-control", "mount", "standing"],
  crucifix: ["back-control", "side-control"],
};

// ─── Builder ────────────────────────────────────────────────────────

export function buildGraphData(
  positions: PositionSeed[],
  techniques: TechniqueSeed[],
  filter?: { discipline?: string }
): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const positionSlugs = new Set(positions.map((p) => p.slug));

  // 1. Create position nodes
  for (const pos of positions) {
    nodes.push({
      id: pos.slug,
      name: pos.name,
      type: "position",
      val: 30,
      color: POSITION_COLOR,
    });
  }

  // 2. Create technique nodes + "contains" links
  const filteredTechniques = techniques.filter((t) => {
    if (!filter?.discipline) return true;
    return t.discipline === filter.discipline || t.discipline === "all";
  });

  for (const tech of filteredTechniques) {
    const color = CATEGORY_COLORS[tech.category] || "#888888";

    nodes.push({
      id: tech.slug,
      name: tech.name,
      type: "technique",
      category: tech.category,
      discipline: tech.discipline,
      difficulty: tech.difficulty,
      val: 5,
      color,
      positionId: tech.positionSlug,
    });

    // Contains link: position -> technique
    if (positionSlugs.has(tech.positionSlug)) {
      links.push({
        source: tech.positionSlug,
        target: tech.slug,
        type: "contains",
        color: CONTAINS_LINK_COLOR,
      });
    }

    // Technique transition link
    if (tech.transitionTarget && positionSlugs.has(tech.transitionTarget)) {
      links.push({
        source: tech.slug,
        target: tech.transitionTarget,
        type: "transition",
        color,
      });
    }
  }

  // 3. Position-to-position transition links
  for (const [sourceSlug, targets] of Object.entries(TRANSITION_MAP)) {
    if (!positionSlugs.has(sourceSlug)) continue;
    for (const targetSlug of targets) {
      if (!positionSlugs.has(targetSlug)) continue;
      links.push({
        source: sourceSlug,
        target: targetSlug,
        type: "position-transition",
        color: "rgba(139,92,246,0.25)", // subtle purple
      });
    }
  }

  return { nodes, links };
}

export { CATEGORY_COLORS };
