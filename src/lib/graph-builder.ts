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
  description?: string;
  summary?: string;
  tips?: string[];
  commonMistakes?: string[];
  transitionTarget?: string;
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
      description: pos.description || "",
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
      summary: tech.summary || "",
      description: tech.description || "",
      tips: tech.tips,
      commonMistakes: tech.commonMistakes,
      transitionTarget: tech.transitionTarget,
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

export { CATEGORY_COLORS, TRANSITION_MAP };

// ─── 2D Position Map Layout ────────────────────────────────────────

export type PositionZone = "standing" | "guard" | "top" | "leglock" | "other";

export interface PositionLayout {
  slug: string;
  name: string;
  description: string;
  zone: PositionZone;
  x: number; // 0-1200 range
  y: number; // 0-900 range
  techniqueCount: number;
  techniques: TechniqueSeed[];
  transitions: string[]; // slugs of connected positions
}

const ZONE_ASSIGNMENTS: Record<string, PositionZone> = {
  standing: "standing",
  "front-headlock": "standing",
  "body-lock": "standing",
  "wrestling-mat": "standing",
  "closed-guard": "guard",
  "open-guard": "guard",
  "half-guard": "guard",
  "butterfly-guard": "guard",
  "de-la-riva": "guard",
  "x-guard": "guard",
  "guard-top": "guard",
  "side-control": "top",
  mount: "top",
  "knee-on-belly": "top",
  "north-south": "top",
  "back-control": "top",
  crucifix: "top",
  "fifty-fifty": "leglock",
  "leg-entanglements": "leglock",
  saddle: "leglock",
  truck: "leglock",
  turtle: "other",
};

// Hand-tuned coordinates for semantic layout (viewBox 0 0 1200 900)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  // Standing zone (top)
  standing: { x: 600, y: 70 },
  "front-headlock": { x: 360, y: 130 },
  "body-lock": { x: 840, y: 130 },
  "wrestling-mat": { x: 160, y: 70 },

  // Guard zone (middle)
  "closed-guard": { x: 200, y: 330 },
  "open-guard": { x: 420, y: 290 },
  "butterfly-guard": { x: 600, y: 350 },
  "half-guard": { x: 160, y: 450 },
  "de-la-riva": { x: 380, y: 440 },
  "x-guard": { x: 560, y: 480 },
  "guard-top": { x: 830, y: 330 },

  // Top/control zone (right)
  "side-control": { x: 920, y: 440 },
  mount: { x: 1060, y: 340 },
  "knee-on-belly": { x: 1060, y: 500 },
  "north-south": { x: 780, y: 530 },
  "back-control": { x: 1000, y: 620 },
  crucifix: { x: 840, y: 700 },

  // Leg lock zone (bottom)
  "fifty-fifty": { x: 280, y: 640 },
  "leg-entanglements": { x: 460, y: 700 },
  saddle: { x: 600, y: 760 },
  truck: { x: 700, y: 830 },

  // Other
  turtle: { x: 500, y: 180 },
};

export function getPositionLayout(
  positions: PositionSeed[],
  techniques: TechniqueSeed[]
): PositionLayout[] {
  const techByPosition = new Map<string, TechniqueSeed[]>();
  for (const t of techniques) {
    const list = techByPosition.get(t.positionSlug) || [];
    list.push(t);
    techByPosition.set(t.positionSlug, list);
  }

  const positionSlugs = new Set(positions.map((p) => p.slug));

  return positions.map((pos) => {
    const coords = POSITION_COORDS[pos.slug] || { x: 600, y: 450 };
    const zone = ZONE_ASSIGNMENTS[pos.slug] || "other";
    const posTechniques = techByPosition.get(pos.slug) || [];
    const transitions = (TRANSITION_MAP[pos.slug] || []).filter((s) =>
      positionSlugs.has(s)
    );

    return {
      slug: pos.slug,
      name: pos.name,
      description: pos.description,
      zone,
      x: coords.x,
      y: coords.y,
      techniqueCount: posTechniques.length,
      techniques: posTechniques,
      transitions,
    };
  });
}
