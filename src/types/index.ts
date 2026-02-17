// ─── Discipline Types ────────────────────────────────────────────────

export type Discipline = "gi" | "nogi" | "wrestling";

export type TechniqueCategory =
  | "submission"
  | "sweep"
  | "pass"
  | "escape"
  | "takedown"
  | "throw"
  | "transition"
  | "control"
  | "defense";

export type Difficulty = "fundamental" | "intermediate" | "advanced";

export type SkillLevel = "exposed" | "drilling" | "sparring" | "proficient";

export type MilestoneSlug = "explorer" | "traveler" | "navigator" | "guide";

export type UserRole = "student" | "coach" | "admin";

// ─── UI Types ────────────────────────────────────────────────────────

export const DISCIPLINE_CONFIG: Record<
  Discipline,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  gi: {
    label: "Gi",
    color: "gi",
    bg: "bg-gi-500/10",
    border: "border-gi-500/30",
    text: "text-gi-400",
  },
  nogi: {
    label: "No-Gi",
    color: "nogi",
    bg: "bg-nogi-500/10",
    border: "border-nogi-500/30",
    text: "text-nogi-400",
  },
  wrestling: {
    label: "Wrestling",
    color: "wrestling",
    bg: "bg-wrestling-500/10",
    border: "border-wrestling-500/30",
    text: "text-wrestling-400",
  },
};

export const SKILL_LEVEL_CONFIG: Record<
  SkillLevel,
  { label: string; color: string; description: string }
> = {
  exposed: {
    label: "Exposed",
    color: "text-mat-400",
    description: "Seen in class, basic awareness",
  },
  drilling: {
    label: "Drilling",
    color: "text-yellow-400",
    description: "Actively practicing with partner",
  },
  sparring: {
    label: "Sparring",
    color: "text-gi-400",
    description: "Attempting in live rolls",
  },
  proficient: {
    label: "Proficient",
    color: "text-green-400",
    description: "Can execute reliably under pressure",
  },
};

export const MILESTONE_CONFIG: Record<
  MilestoneSlug,
  { label: string; months: string; description: string; icon: string }
> = {
  explorer: {
    label: "Explorer",
    months: "0-6 months",
    description: "Building survival instincts and fundamental movements",
    icon: "🧭",
  },
  traveler: {
    label: "Traveler",
    months: "6-12 months",
    description: "Developing offensive systems and guard work",
    icon: "🗺️",
  },
  navigator: {
    label: "Navigator",
    months: "1-2 years",
    description: "Building a personal game and advanced concepts",
    icon: "⭐",
  },
  guide: {
    label: "Guide",
    months: "2+ years",
    description: "Multiple game plans, teaching ability, creative expression",
    icon: "🏔️",
  },
};

export const CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  submission: "Submissions",
  sweep: "Sweeps",
  pass: "Passes",
  escape: "Escapes",
  takedown: "Takedowns",
  throw: "Throws",
  transition: "Transitions",
  control: "Control",
  defense: "Defense",
};

// ─── Heatmap Types ───────────────────────────────────────────────────

export interface HeatmapCell {
  positionId: string;
  positionName: string;
  category: TechniqueCategory;
  count: number;
  techniques: string[];
}

// ─── Feed Types ──────────────────────────────────────────────────────

export type FeedPostType =
  | "checkin"
  | "milestone"
  | "badge"
  | "note"
  | "challenge";
