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
  | "defense"
  | "retention"
  | "entry"
  | "scramble";

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
  retention: "Retention",
  entry: "Entries",
  scramble: "Scrambles",
};

export const CATEGORY_CONFIG: Record<
  TechniqueCategory,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  submission: {
    label: "Submissions",
    color: "red",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  sweep: {
    label: "Sweeps",
    color: "green",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
  },
  pass: {
    label: "Passes",
    color: "purple",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
  },
  escape: {
    label: "Escapes",
    color: "yellow",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
  },
  takedown: {
    label: "Takedowns",
    color: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  throw: {
    label: "Throws",
    color: "lime",
    bg: "bg-lime-500/10",
    border: "border-lime-500/30",
    text: "text-lime-400",
  },
  transition: {
    label: "Transitions",
    color: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
  },
  control: {
    label: "Control",
    color: "indigo",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
  },
  defense: {
    label: "Defense",
    color: "slate",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    text: "text-slate-400",
  },
  retention: {
    label: "Retention",
    color: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  entry: {
    label: "Entries",
    color: "teal",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-teal-400",
  },
  scramble: {
    label: "Scrambles",
    color: "orange",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
  },
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
