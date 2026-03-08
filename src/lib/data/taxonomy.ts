// ─── The Complete Grappling Taxonomy ─────────────────────────────────
// Positions, techniques, and their relationships for Gi, NoGi, and Wrestling.
// This is the knowledge base that drives the entire application.

import type { Discipline, TechniqueCategory, Difficulty } from "@/types";

export interface PositionSeed {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface TechniqueSeed {
  name: string;
  slug: string;
  description: string;
  positionSlug: string;
  discipline: Discipline | "all";
  category: TechniqueCategory;
  difficulty: Difficulty;
  transitionTarget?: string;
}

// ─── Positions ───────────────────────────────────────────────────────

export const POSITIONS: PositionSeed[] = [
  {
    name: "Standing",
    slug: "standing",
    description: "On feet — takedowns, throws, clinch work, distance management",
    sortOrder: 0,
  },
  {
    name: "Closed Guard",
    slug: "closed-guard",
    description: "Full guard with legs locked around opponent's waist",
    sortOrder: 1,
  },
  {
    name: "Open Guard",
    slug: "open-guard",
    description: "Guard with feet on hips, collar-sleeve, spider, lasso variations",
    sortOrder: 2,
  },
  {
    name: "Half Guard",
    slug: "half-guard",
    description: "Bottom position controlling one of opponent's legs",
    sortOrder: 3,
  },
  {
    name: "Butterfly Guard",
    slug: "butterfly-guard",
    description: "Seated guard with feet hooked inside opponent's thighs",
    sortOrder: 4,
  },
  {
    name: "De La Riva",
    slug: "de-la-riva",
    description: "Open guard hooking outside opponent's lead leg",
    sortOrder: 5,
  },
  {
    name: "X-Guard / SLX",
    slug: "x-guard",
    description: "Underneath opponent with leg entanglements for sweeps",
    sortOrder: 6,
  },
  {
    name: "50/50",
    slug: "fifty-fifty",
    description: "Symmetrical leg entanglement, key position for leg locks",
    sortOrder: 7,
  },
  {
    name: "Mount",
    slug: "mount",
    description: "Top position sitting on opponent's torso",
    sortOrder: 8,
  },
  {
    name: "Side Control",
    slug: "side-control",
    description: "Chest-to-chest control perpendicular to opponent",
    sortOrder: 9,
  },
  {
    name: "Knee on Belly",
    slug: "knee-on-belly",
    description: "Dominant top position with knee driving into opponent's midsection",
    sortOrder: 10,
  },
  {
    name: "North-South",
    slug: "north-south",
    description: "Head-to-head pin position, chest on chest",
    sortOrder: 11,
  },
  {
    name: "Back Control",
    slug: "back-control",
    description: "Behind opponent with seatbelt grip and hooks or body triangle",
    sortOrder: 12,
  },
  {
    name: "Turtle",
    slug: "turtle",
    description: "Defensive balled-up position on hands and knees",
    sortOrder: 13,
  },
  {
    name: "Front Headlock",
    slug: "front-headlock",
    description: "Controlling opponent's head from the front, sprawl position",
    sortOrder: 14,
  },
  {
    name: "Leg Entanglements",
    slug: "leg-entanglements",
    description: "Ashi garami positions for leg lock attacks",
    sortOrder: 15,
  },
  {
    name: "Crucifix",
    slug: "crucifix",
    description: "Controlling both arms with legs and arm from behind",
    sortOrder: 16,
  },
  {
    name: "Guard Top (Passing)",
    slug: "guard-top",
    description: "Standing or kneeling in opponent's guard, looking to pass",
    sortOrder: 17,
  },
  {
    name: "Wrestling - Mat",
    slug: "wrestling-mat",
    description: "Ground wrestling: rides, turns, escapes from referee's position",
    sortOrder: 18,
  },
  {
    name: "Saddle / Honey Hole",
    slug: "saddle",
    description: "Inside leg entanglement (411, honey hole) — the premier heel hook position",
    sortOrder: 19,
  },
  {
    name: "Truck",
    slug: "truck",
    description: "Back-exposure position with legs threaded, attacking twister and calf slicer",
    sortOrder: 20,
  },
  {
    name: "Body Lock",
    slug: "body-lock",
    description: "Clinch position with hands clasped around opponent's torso — passing, takedowns, and retention",
    sortOrder: 21,
  },
];

// ─── Techniques ──────────────────────────────────────────────────────

export const TECHNIQUES: TechniqueSeed[] = [
  // ═══════════════════════════════════════════════════════════════════
  // STANDING
  // ═══════════════════════════════════════════════════════════════════

  // Takedowns
  { name: "Double Leg", slug: "double-leg", description: "Level change, penetration step, drive through both legs", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Single Leg (High Crotch)", slug: "single-leg-high-c", description: "Attack one leg at hip level, turn the corner to finish", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Single Leg (Low)", slug: "single-leg-low", description: "Shoot to the ankle/knee level single", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Ankle Pick", slug: "ankle-pick", description: "Snap down and grab the far ankle while controlling the head", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Snap Down", slug: "snap-down", description: "Pull opponent's head down using collar tie to force turtle or front headlock", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "fundamental", transitionTarget: "front-headlock" },
  { name: "Arm Drag to Back", slug: "arm-drag-back", description: "2-on-1 pull to clear the arm and take the back", positionSlug: "standing", discipline: "nogi", category: "takedown", difficulty: "fundamental", transitionTarget: "back-control" },
  { name: "Duck Under", slug: "duck-under", description: "From underhook, duck under opponent's arm to reach the back", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "intermediate", transitionTarget: "back-control" },
  { name: "Fireman's Carry", slug: "firemans-carry", description: "Drop under opponent's arm and carry them over your shoulder", positionSlug: "standing", discipline: "wrestling", category: "takedown", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Bodylock Takedown", slug: "bodylock-takedown", description: "Clasp hands around opponent's waist and trip or lift", positionSlug: "standing", discipline: "all", category: "takedown", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Guard Pull", slug: "guard-pull", description: "Controlled pull to closed or open guard", positionSlug: "standing", discipline: "all", category: "transition", difficulty: "fundamental", transitionTarget: "closed-guard" },
  { name: "Front Headlock (Standing)", slug: "standing-front-headlock", description: "Snap down to front headlock control from standing", positionSlug: "standing", discipline: "nogi", category: "control", difficulty: "fundamental" },
  { name: "Go Behind", slug: "go-behind", description: "Circle behind opponent to take the back from standing", positionSlug: "standing", discipline: "wrestling", category: "takedown", difficulty: "fundamental", transitionTarget: "back-control" },
  { name: "Inside Trip from Body Lock", slug: "standing-inside-trip", description: "From body lock clinch, hook inside leg and trip to ground", positionSlug: "standing", discipline: "nogi", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Knee Tap from Body Lock", slug: "standing-knee-tap", description: "From body lock, tap the knee to collapse opponent's base", positionSlug: "standing", discipline: "nogi", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },

  // Throws
  { name: "Osoto Gari", slug: "osoto-gari", description: "Major outer reap — classic judo throw", positionSlug: "standing", discipline: "gi", category: "throw", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Ouchi Gari", slug: "ouchi-gari", description: "Major inner reap targeting opponent's far leg", positionSlug: "standing", discipline: "gi", category: "throw", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Seoi Nage", slug: "seoi-nage", description: "Shoulder throw, turning in under opponent", positionSlug: "standing", discipline: "gi", category: "throw", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Harai Goshi", slug: "harai-goshi", description: "Sweeping hip throw", positionSlug: "standing", discipline: "gi", category: "throw", difficulty: "advanced", transitionTarget: "side-control" },
  { name: "Uchi Mata", slug: "uchi-mata", description: "Inner thigh throw — one of the most effective throws in judo", positionSlug: "standing", discipline: "gi", category: "throw", difficulty: "advanced", transitionTarget: "side-control" },
  { name: "Lateral Drop", slug: "lateral-drop", description: "Over-under or bodylock to lateral throw", positionSlug: "standing", discipline: "all", category: "throw", difficulty: "advanced", transitionTarget: "side-control" },

  // Standing defense
  { name: "Sprawl", slug: "sprawl", description: "Hips back, chest down to defend shot", positionSlug: "standing", discipline: "all", category: "defense", difficulty: "fundamental", transitionTarget: "front-headlock" },
  { name: "Whizzer / Overhook", slug: "whizzer", description: "Overhook to control and counter underhook or single leg", positionSlug: "standing", discipline: "all", category: "defense", difficulty: "fundamental" },
  { name: "Crossface Defense", slug: "crossface-defense", description: "Use crossface to redirect opponent's shot", positionSlug: "standing", discipline: "all", category: "defense", difficulty: "fundamental" },

  // Standing control
  { name: "Collar Tie", slug: "collar-tie", description: "Controlling opponent's head with hand behind the neck", positionSlug: "standing", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Russian Tie (2-on-1)", slug: "russian-tie", description: "Two hands controlling one of opponent's arms for off-balancing", positionSlug: "standing", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Underhook", slug: "underhook", description: "Inside control under opponent's arm — the most important wrestling tie", positionSlug: "standing", discipline: "all", category: "control", difficulty: "fundamental" },

  // ═══════════════════════════════════════════════════════════════════
  // CLOSED GUARD (Bottom)
  // ═══════════════════════════════════════════════════════════════════
  { name: "Armbar from Guard", slug: "armbar-closed-guard", description: "Hip out, control arm, swing leg over face", positionSlug: "closed-guard", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Triangle from Guard", slug: "triangle-closed-guard", description: "Control posture, angle off, lock triangle choke", positionSlug: "closed-guard", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Kimura from Guard", slug: "kimura-closed-guard", description: "Figure-four grip on wrist, hip out, isolate the arm", positionSlug: "closed-guard", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Cross Collar Choke", slug: "cross-collar-guard", description: "Deep cross grip, second hand feeds in for the choke", positionSlug: "closed-guard", discipline: "gi", category: "submission", difficulty: "fundamental" },
  { name: "Guillotine from Guard", slug: "guillotine-closed-guard", description: "Chin strap grip, close guard, hip into the choke", positionSlug: "closed-guard", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Hip Bump Sweep", slug: "hip-bump-sweep", description: "Post on one hand, bump hips to off-balance and come on top", positionSlug: "closed-guard", discipline: "all", category: "sweep", difficulty: "fundamental", transitionTarget: "mount" },
  { name: "Scissor Sweep", slug: "scissor-sweep", description: "Shin across belly, pull sleeve, chop legs to sweep", positionSlug: "closed-guard", discipline: "all", category: "sweep", difficulty: "fundamental", transitionTarget: "mount" },
  { name: "Flower Sweep (Pendulum)", slug: "flower-sweep", description: "Control sleeve and pants, pendulum legs to sweep", positionSlug: "closed-guard", discipline: "all", category: "sweep", difficulty: "fundamental", transitionTarget: "mount" },
  { name: "Armbar-Triangle-Omoplata Chain", slug: "ato-chain", description: "Flowing between armbar, triangle, and omoplata from guard", positionSlug: "closed-guard", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Omoplata", slug: "omoplata-guard", description: "Shoulder lock using legs from guard position", positionSlug: "closed-guard", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "K-Guard Entry", slug: "closed-guard-k-guard-entry", description: "Transition from closed guard to K-guard for leg lock entries", positionSlug: "closed-guard", discipline: "nogi", category: "entry", difficulty: "advanced" },
  { name: "Closed Guard Retention", slug: "closed-guard-retention", description: "Maintaining closed guard against posture-up and pass attempts", positionSlug: "closed-guard", discipline: "all", category: "retention", difficulty: "fundamental" },

  // ═══════════════════════════════════════════════════════════════════
  // OPEN GUARD
  // ═══════════════════════════════════════════════════════════════════
  { name: "Collar-Sleeve Guard", slug: "collar-sleeve-guard", description: "Controlling collar and sleeve with feet on hips/biceps", positionSlug: "open-guard", discipline: "gi", category: "control", difficulty: "fundamental" },
  { name: "Spider Guard", slug: "spider-guard", description: "Feet on biceps with sleeve grips for distance control", positionSlug: "open-guard", discipline: "gi", category: "control", difficulty: "intermediate" },
  { name: "Lasso Guard", slug: "lasso-guard", description: "Leg wraps around opponent's arm from spider guard", positionSlug: "open-guard", discipline: "gi", category: "control", difficulty: "intermediate" },
  { name: "Spider Sweep", slug: "spider-sweep", description: "Off-balance and sweep from spider guard grips", positionSlug: "open-guard", discipline: "gi", category: "sweep", difficulty: "intermediate", transitionTarget: "mount" },
  { name: "Lasso Sweep", slug: "lasso-sweep", description: "Use the lasso wrap to sweep opponent overhead or to the side", positionSlug: "open-guard", discipline: "gi", category: "sweep", difficulty: "intermediate", transitionTarget: "mount" },
  { name: "Triangle from Lasso", slug: "triangle-lasso", description: "Transition from lasso guard to triangle choke", positionSlug: "open-guard", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Sit-Up Guard", slug: "sit-up-guard", description: "Seated guard reaching for single leg or underhook", positionSlug: "open-guard", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Collar Drag", slug: "collar-drag", description: "From seated guard, drag opponent's collar to take back", positionSlug: "open-guard", discipline: "gi", category: "sweep", difficulty: "fundamental", transitionTarget: "back-control" },
  { name: "Reverse De La Riva", slug: "reverse-dlr-guard", description: "Inside hook on opponent's lead leg for off-balancing and entries", positionSlug: "open-guard", discipline: "nogi", category: "control", difficulty: "intermediate" },
  { name: "K-Guard", slug: "k-guard", description: "Inverted guard position for leg lock and back take entries", positionSlug: "open-guard", discipline: "nogi", category: "control", difficulty: "advanced" },
  { name: "Crab Ride Entry", slug: "crab-ride-entry", description: "Transition to crab ride position from open guard for back takes", positionSlug: "open-guard", discipline: "nogi", category: "entry", difficulty: "advanced", transitionTarget: "back-control" },
  { name: "Matrix Entry", slug: "matrix-entry", description: "Leg pummeling entry to leg entanglements from open guard", positionSlug: "open-guard", discipline: "nogi", category: "entry", difficulty: "advanced", transitionTarget: "leg-entanglements" },
  { name: "Open Guard Retention", slug: "open-guard-retention", description: "Maintaining guard with hip movement, frames, and reconnecting feet", positionSlug: "open-guard", discipline: "all", category: "retention", difficulty: "fundamental" },

  // ═══════════════════════════════════════════════════════════════════
  // HALF GUARD
  // ═══════════════════════════════════════════════════════════════════
  { name: "Knee Shield", slug: "knee-shield", description: "Frame with shin across opponent's chest to maintain distance", positionSlug: "half-guard", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Underhook Sweep", slug: "underhook-sweep-hg", description: "Get the underhook, come to knees, drive through to top", positionSlug: "half-guard", discipline: "all", category: "sweep", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Old School Sweep", slug: "old-school-sweep", description: "Deep half entry, come under opponent and sweep to top", positionSlug: "half-guard", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Lockdown", slug: "lockdown", description: "Figure-four legs around opponent's trapped leg for control", positionSlug: "half-guard", discipline: "all", category: "control", difficulty: "intermediate" },
  { name: "Electric Chair", slug: "electric-chair", description: "From lockdown, whip up and stretch opponent's legs", positionSlug: "half-guard", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Deep Half Guard", slug: "deep-half", description: "Under opponent with head between legs for sweeps", positionSlug: "half-guard", discipline: "all", category: "control", difficulty: "intermediate" },
  { name: "Kimura from Half", slug: "kimura-half-guard", description: "Attack the kimura when opponent posts hand in half guard", positionSlug: "half-guard", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Half Guard Recovery", slug: "hg-to-full-guard", description: "Reguard from half guard back to full or open guard", positionSlug: "half-guard", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "closed-guard" },
  { name: "Coyote Half Guard", slug: "coyote-half-guard", description: "Advanced half guard variation using outside leg positioning for sweeps", positionSlug: "half-guard", discipline: "nogi", category: "control", difficulty: "advanced" },
  { name: "Half Guard Retention", slug: "half-guard-retention", description: "Maintaining half guard against smash and pass attempts", positionSlug: "half-guard", discipline: "all", category: "retention", difficulty: "fundamental" },
  { name: "Body Lock Pass from Half", slug: "bodylock-pass-half", description: "Lock body lock from top half guard and pass to side control", positionSlug: "half-guard", discipline: "nogi", category: "pass", difficulty: "intermediate", transitionTarget: "side-control" },

  // ═══════════════════════════════════════════════════════════════════
  // BUTTERFLY GUARD
  // ═══════════════════════════════════════════════════════════════════
  { name: "Butterfly Sweep (Hook Sweep)", slug: "butterfly-sweep", description: "Underhook, elevate with hook, sweep to mount", positionSlug: "butterfly-guard", discipline: "all", category: "sweep", difficulty: "fundamental", transitionTarget: "mount" },
  { name: "Arm Drag from Butterfly", slug: "arm-drag-butterfly", description: "Pull arm across to take the back from butterfly", positionSlug: "butterfly-guard", discipline: "all", category: "transition", difficulty: "fundamental", transitionTarget: "back-control" },
  { name: "Guillotine from Butterfly", slug: "guillotine-butterfly", description: "Catch the guillotine when opponent shoots in, close butterfly", positionSlug: "butterfly-guard", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Butterfly to X-Guard", slug: "butterfly-to-x", description: "Transition from butterfly hooks to X-guard entry", positionSlug: "butterfly-guard", discipline: "all", category: "transition", difficulty: "intermediate", transitionTarget: "x-guard" },

  // ═══════════════════════════════════════════════════════════════════
  // DE LA RIVA
  // ═══════════════════════════════════════════════════════════════════
  { name: "DLR Hook & Control", slug: "dlr-control", description: "Outside hook on lead leg with collar and ankle grips", positionSlug: "de-la-riva", discipline: "all", category: "control", difficulty: "intermediate" },
  { name: "DLR Sweep (Basic)", slug: "dlr-sweep-basic", description: "Off-balance with DLR hook, kick leg through to sweep", positionSlug: "de-la-riva", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Berimbolo", slug: "berimbolo", description: "Invert from DLR to take the back", positionSlug: "de-la-riva", discipline: "all", category: "transition", difficulty: "advanced", transitionTarget: "back-control" },
  { name: "DLR to X-Guard", slug: "dlr-to-x", description: "Transition from DLR hook underneath to X-guard", positionSlug: "de-la-riva", discipline: "all", category: "transition", difficulty: "intermediate", transitionTarget: "x-guard" },
  { name: "RDLR Sweep", slug: "rdlr-sweep", description: "Reverse De La Riva hook to off-balance and come on top", positionSlug: "de-la-riva", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "side-control" },

  // ═══════════════════════════════════════════════════════════════════
  // X-GUARD / SLX
  // ═══════════════════════════════════════════════════════════════════
  { name: "X-Guard Sweep (Stand Up)", slug: "x-guard-standup", description: "Elevate and stand to dump opponent, come to top", positionSlug: "x-guard", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Technical Stand Up from SLX", slug: "slx-standup", description: "Control leg from single leg X, stand to single leg", positionSlug: "x-guard", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "standing" },
  { name: "Heel Hook from SLX", slug: "heel-hook-slx", description: "Inside heel hook attack from single leg X position", positionSlug: "x-guard", discipline: "nogi", category: "submission", difficulty: "advanced" },

  // ═══════════════════════════════════════════════════════════════════
  // 50/50
  // ═══════════════════════════════════════════════════════════════════
  { name: "50/50 Guard Control", slug: "fifty-fifty-control", description: "Managing the symmetrical leg entanglement position", positionSlug: "fifty-fifty", discipline: "all", category: "control", difficulty: "intermediate" },
  { name: "Heel Hook from 50/50", slug: "heel-hook-fifty", description: "Inside or outside heel hook from 50/50", positionSlug: "fifty-fifty", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "50/50 Sweep", slug: "fifty-fifty-sweep", description: "Coming on top from 50/50 entanglement", positionSlug: "fifty-fifty", discipline: "all", category: "sweep", difficulty: "intermediate", transitionTarget: "fifty-fifty" },
  { name: "Kneebar from 50/50", slug: "kneebar-fifty", description: "Extending hips for kneebar from 50/50", positionSlug: "fifty-fifty", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "Inside Heel Hook from 50/50", slug: "inside-heel-hook-fifty", description: "Inside heel hook attack from 50/50 entanglement", positionSlug: "fifty-fifty", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Outside Heel Hook from 50/50", slug: "outside-heel-hook-fifty", description: "Outside heel hook from 50/50, controlling the far leg", positionSlug: "fifty-fifty", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Backside 50/50 Entry", slug: "fifty-fifty-backside-entry", description: "Transition from 50/50 to saddle/honey hole position", positionSlug: "fifty-fifty", discipline: "nogi", category: "entry", difficulty: "intermediate", transitionTarget: "saddle" },

  // ═══════════════════════════════════════════════════════════════════
  // MOUNT (Top)
  // ═══════════════════════════════════════════════════════════════════
  { name: "Mount Pressure & Control", slug: "mount-control", description: "Maintaining mount with proper weight distribution and grapevines", positionSlug: "mount", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Americana from Mount", slug: "americana-mount", description: "Figure-four lock on wrist, paint the arm to the mat", positionSlug: "mount", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Cross Choke from Mount", slug: "cross-choke-mount", description: "Deep cross collar grip, second hand feeds in for choke", positionSlug: "mount", discipline: "gi", category: "submission", difficulty: "fundamental" },
  { name: "Armbar from Mount", slug: "armbar-mount", description: "S-mount transition to armbar, control and extend", positionSlug: "mount", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Ezekiel Choke", slug: "ezekiel-mount", description: "Sleeve-assisted forearm choke from mount", positionSlug: "mount", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Mounted Triangle", slug: "mounted-triangle", description: "Isolate arm, step over head into triangle from mount", positionSlug: "mount", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Gift Wrap to Back", slug: "gift-wrap-back", description: "Control wrist across face, use it to take the back", positionSlug: "mount", discipline: "all", category: "transition", difficulty: "intermediate", transitionTarget: "back-control" },
  { name: "Mounted Triangle Setup", slug: "mounted-triangle-setup", description: "Step-by-step mounted triangle isolation and lock", positionSlug: "mount", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "S-Mount", slug: "s-mount", description: "High mount with one leg over opponent's shoulder for armbar/triangle", positionSlug: "mount", discipline: "nogi", category: "control", difficulty: "intermediate" },
  { name: "Gift Wrap", slug: "gift-wrap-mount", description: "Control opponent's wrist across their face for back take or submissions", positionSlug: "mount", discipline: "nogi", category: "control", difficulty: "intermediate", transitionTarget: "back-control" },

  // Mount escapes
  { name: "Trap & Roll (Upa)", slug: "trap-roll", description: "Bridge and roll trapping arm and leg on same side", positionSlug: "mount", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "closed-guard" },
  { name: "Elbow-Knee Escape (Shrimp)", slug: "elbow-knee-escape", description: "Frame on hip, shrimp to recover half guard or guard", positionSlug: "mount", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "half-guard" },

  // ═══════════════════════════════════════════════════════════════════
  // SIDE CONTROL
  // ═══════════════════════════════════════════════════════════════════
  { name: "Side Control Pressure", slug: "side-control-pressure", description: "Crossface and underhook control with proper weight distribution", positionSlug: "side-control", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Kimura from Side", slug: "kimura-side-control", description: "Step over head, figure-four the near arm", positionSlug: "side-control", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Americana from Side", slug: "americana-side", description: "Figure-four on the near arm while maintaining crossface", positionSlug: "side-control", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Far-Side Armbar", slug: "far-armbar-side", description: "Step over to armbar the far arm from side control", positionSlug: "side-control", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Baseball Bat Choke", slug: "baseball-bat-choke", description: "Split grip on collar, spin to north-south for the choke", positionSlug: "side-control", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Bread Cutter Choke", slug: "bread-cutter", description: "Cross lapel grip, slice forearm across neck", positionSlug: "side-control", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Mount Transition", slug: "side-to-mount", description: "Transition from side control to full mount", positionSlug: "side-control", discipline: "all", category: "transition", difficulty: "fundamental", transitionTarget: "mount" },
  { name: "KOB Transition", slug: "side-to-kob", description: "Transition from side control to knee on belly", positionSlug: "side-control", discipline: "all", category: "transition", difficulty: "fundamental", transitionTarget: "knee-on-belly" },
  { name: "Paper Cutter Choke", slug: "paper-cutter-choke", description: "Cross-face grip with forearm blade across throat from side control", positionSlug: "side-control", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "North South Choke (from Side)", slug: "ns-choke-from-side", description: "Transition to north-south and apply the choke", positionSlug: "side-control", discipline: "nogi", category: "submission", difficulty: "intermediate" },

  // Side control escapes
  { name: "Shrimp to Guard", slug: "shrimp-escape-sc", description: "Frame, shrimp hips, recover guard with knee-elbow connection", positionSlug: "side-control", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "closed-guard" },
  { name: "Underhook Escape", slug: "underhook-escape-sc", description: "Get underhook, turn into opponent, recover to knees or single leg", positionSlug: "side-control", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "half-guard" },
  { name: "Ghost Escape", slug: "ghost-escape", description: "Turn away, create space, slip out from under opponent", positionSlug: "side-control", discipline: "all", category: "escape", difficulty: "intermediate", transitionTarget: "turtle" },

  // ═══════════════════════════════════════════════════════════════════
  // KNEE ON BELLY
  // ═══════════════════════════════════════════════════════════════════
  { name: "KOB Pressure", slug: "kob-pressure", description: "Driving knee into belly/solar plexus with proper angle", positionSlug: "knee-on-belly", discipline: "all", category: "control", difficulty: "intermediate" },
  { name: "Collar Choke from KOB", slug: "collar-choke-kob", description: "Use KOB pressure to open collar choke opportunity", positionSlug: "knee-on-belly", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Armbar from KOB", slug: "armbar-kob", description: "When opponent pushes knee, spin to armbar", positionSlug: "knee-on-belly", discipline: "all", category: "submission", difficulty: "intermediate" },

  // ═══════════════════════════════════════════════════════════════════
  // NORTH-SOUTH
  // ═══════════════════════════════════════════════════════════════════
  { name: "North-South Choke", slug: "ns-choke", description: "Arm under neck, squeeze by walking hips away", positionSlug: "north-south", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Kimura from North-South", slug: "kimura-ns", description: "Figure-four from north-south position", positionSlug: "north-south", discipline: "all", category: "submission", difficulty: "intermediate" },

  // ═══════════════════════════════════════════════════════════════════
  // BACK CONTROL
  // ═══════════════════════════════════════════════════════════════════
  { name: "Seatbelt & Hooks", slug: "seatbelt-hooks", description: "Over-under grip (seatbelt) with both hooks in", positionSlug: "back-control", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Body Triangle", slug: "body-triangle", description: "Triangle legs around opponent's body from back", positionSlug: "back-control", discipline: "all", category: "control", difficulty: "intermediate" },
  { name: "Rear Naked Choke", slug: "rnc", description: "Arm under chin, lock behind head, squeeze — the king of submissions", positionSlug: "back-control", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Bow & Arrow Choke", slug: "bow-arrow", description: "Cross collar grip, grab pants, extend for the choke", positionSlug: "back-control", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Short Choke (Mata Leão)", slug: "short-choke", description: "Quick choke variation when opponent defends deep RNC", positionSlug: "back-control", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Armbar from Back", slug: "armbar-back", description: "Transition from back control to armbar when opponent defends neck", positionSlug: "back-control", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Straight Jacket System", slug: "straight-jacket", description: "Advanced back control trapping both arms for guaranteed RNC finish", positionSlug: "back-control", discipline: "nogi", category: "control", difficulty: "advanced" },
  { name: "Truck Entry from Back", slug: "truck-entry-from-back", description: "Thread legs into truck position from back control", positionSlug: "back-control", discipline: "nogi", category: "transition", difficulty: "intermediate", transitionTarget: "truck" },

  // Back escapes
  { name: "Back Escape (Shoulder Walk)", slug: "back-escape-shoulder", description: "Get shoulders to mat, strip hooks, escape to guard", positionSlug: "back-control", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "closed-guard" },
  { name: "Back Escape (Hand Fighting)", slug: "back-escape-hands", description: "Two-on-one grip fighting to strip the choking arm", positionSlug: "back-control", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "half-guard" },

  // ═══════════════════════════════════════════════════════════════════
  // TURTLE
  // ═══════════════════════════════════════════════════════════════════
  { name: "Turtle Defense", slug: "turtle-defense", description: "Elbows tight, protect neck, control wrists", positionSlug: "turtle", discipline: "all", category: "defense", difficulty: "fundamental" },
  { name: "Sit-Out from Turtle", slug: "sit-out", description: "Post hand, kick leg through, turn to face opponent", positionSlug: "turtle", discipline: "all", category: "escape", difficulty: "fundamental", transitionTarget: "open-guard" },
  { name: "Granby Roll", slug: "granby-roll", description: "Invert and roll to recover guard from turtle", positionSlug: "turtle", discipline: "all", category: "escape", difficulty: "intermediate", transitionTarget: "open-guard" },
  { name: "Peterson Roll", slug: "peterson-roll", description: "Wrestling-based roll to escape from bottom turtle", positionSlug: "turtle", discipline: "wrestling", category: "escape", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Clock Choke", slug: "clock-choke", description: "Collar grip, walk around to tighten choke on turtled opponent", positionSlug: "turtle", discipline: "gi", category: "submission", difficulty: "intermediate" },
  { name: "Seatbelt to Back Take", slug: "seatbelt-back-take", description: "Get seatbelt grip, insert hooks to take the back", positionSlug: "turtle", discipline: "all", category: "transition", difficulty: "fundamental", transitionTarget: "back-control" },
  { name: "Turk Ride (Turtle)", slug: "turk-ride-turtle", description: "Leg ride control on turtled opponent from top", positionSlug: "turtle", discipline: "wrestling", category: "control", difficulty: "intermediate" },
  { name: "Spiral Ride (Turtle)", slug: "spiral-ride-turtle", description: "Spiral pressure to break down turtled opponent", positionSlug: "turtle", discipline: "wrestling", category: "control", difficulty: "intermediate" },
  { name: "Front Headlock from Turtle", slug: "front-headlock-from-turtle", description: "Snap down and control head from front of turtle", positionSlug: "turtle", discipline: "nogi", category: "control", difficulty: "fundamental" },
  { name: "Crucifix Entry", slug: "crucifix-entry-turtle", description: "Thread arm and leg to enter crucifix from turtle", positionSlug: "turtle", discipline: "nogi", category: "transition", difficulty: "advanced", transitionTarget: "crucifix" },

  // ═══════════════════════════════════════════════════════════════════
  // FRONT HEADLOCK
  // ═══════════════════════════════════════════════════════════════════
  { name: "Front Headlock Control", slug: "front-headlock-control", description: "Chin strap and far wrist control from sprawl", positionSlug: "front-headlock", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Guillotine (Arm-In)", slug: "guillotine-arm-in", description: "Arm-in guillotine from front headlock", positionSlug: "front-headlock", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Guillotine (High Elbow)", slug: "guillotine-high-elbow", description: "Marcelo Garcia style high elbow guillotine", positionSlug: "front-headlock", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "D'Arce Choke", slug: "darce", description: "Arm triangle variant threading arm under neck from front headlock", positionSlug: "front-headlock", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Anaconda Choke", slug: "anaconda", description: "Arm triangle rolling through, opposite threading of D'Arce", positionSlug: "front-headlock", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Go-Behind from Front Headlock", slug: "go-behind-fhl", description: "Spin behind to take the back from front headlock", positionSlug: "front-headlock", discipline: "all", category: "transition", difficulty: "fundamental", transitionTarget: "back-control" },

  // ═══════════════════════════════════════════════════════════════════
  // LEG ENTANGLEMENTS
  // ═══════════════════════════════════════════════════════════════════
  { name: "Straight Ankle Lock", slug: "straight-ankle", description: "Control foot, extend hips for achilles lock", positionSlug: "leg-entanglements", discipline: "all", category: "submission", difficulty: "fundamental" },
  { name: "Kneebar", slug: "kneebar", description: "Extend opponent's knee hyperextending the joint", positionSlug: "leg-entanglements", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Inside Heel Hook", slug: "inside-heel-hook", description: "Rotational attack on the knee via inside heel hook", positionSlug: "leg-entanglements", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "Outside Heel Hook", slug: "outside-heel-hook", description: "Rotational attack from outside ashi garami", positionSlug: "leg-entanglements", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "Toe Hold", slug: "toe-hold", description: "Figure-four grip on foot, rotating ankle/foot", positionSlug: "leg-entanglements", discipline: "all", category: "submission", difficulty: "intermediate" },
  { name: "Calf Slicer", slug: "calf-slicer", description: "Compression lock on the calf from leg entanglement or back", positionSlug: "leg-entanglements", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Estima Lock", slug: "estima-lock", description: "Foot lock attacking the ankle from top position during guard pass", positionSlug: "leg-entanglements", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "Leg Lock Defense (Boot)", slug: "leg-lock-defense", description: "Hiding the heel, straightening the leg, clearing the knee line", positionSlug: "leg-entanglements", discipline: "all", category: "defense", difficulty: "intermediate" },
  { name: "Ashi Garami Control", slug: "ashi-garami", description: "Standard ashi garami position and control principles", positionSlug: "leg-entanglements", discipline: "all", category: "control", difficulty: "intermediate" },

  // ═══════════════════════════════════════════════════════════════════
  // CRUCIFIX
  // ═══════════════════════════════════════════════════════════════════
  { name: "Crucifix Control", slug: "crucifix-control", description: "Trapping both arms using legs and grip from behind", positionSlug: "crucifix", discipline: "all", category: "control", difficulty: "advanced" },
  { name: "Crucifix Choke", slug: "crucifix-choke", description: "RNC or collar choke with both opponent's arms trapped", positionSlug: "crucifix", discipline: "all", category: "submission", difficulty: "advanced" },

  // ═══════════════════════════════════════════════════════════════════
  // GUARD TOP (Passing)
  // ═══════════════════════════════════════════════════════════════════
  { name: "Toreando Pass", slug: "toreando", description: "Control legs, push to one side, step around to side control", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Knee Cut Pass", slug: "knee-cut", description: "Slice knee through guard to cross to side control", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Over-Under Pass", slug: "over-under", description: "One arm over, one arm under legs, pressure pass to side", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Leg Drag", slug: "leg-drag", description: "Push legs across body line, pin hip and pass", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Stack Pass", slug: "stack-pass", description: "Drive forward folding opponent, walk around their guard", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Long Step Pass", slug: "long-step", description: "From headquarters, long step around guard to complete pass", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Smash Pass", slug: "smash-pass", description: "Heavy crossface pressure, smashing half guard flat", positionSlug: "guard-top", discipline: "all", category: "pass", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Body Lock Pass", slug: "bodylock-pass", description: "Clasp hands around waist, use pressure to pass guard", positionSlug: "guard-top", discipline: "nogi", category: "pass", difficulty: "intermediate", transitionTarget: "side-control" },
  { name: "Headquarters Position", slug: "headquarters", description: "One knee up, one knee down — the hub for passing", positionSlug: "guard-top", discipline: "all", category: "control", difficulty: "fundamental" },
  { name: "Guard Posture & Grip Breaking", slug: "posture-grip-break", description: "Maintaining posture in guard and systematically breaking grips", positionSlug: "guard-top", discipline: "all", category: "defense", difficulty: "fundamental" },

  // ═══════════════════════════════════════════════════════════════════
  // WRESTLING - MAT
  // ═══════════════════════════════════════════════════════════════════
  { name: "Referee's Position (Bottom)", slug: "ref-position-bottom", description: "Starting position for bottom wrestler, ready to escape", positionSlug: "wrestling-mat", discipline: "wrestling", category: "control", difficulty: "fundamental" },
  { name: "Stand Up (Wrestling)", slug: "standup-wrestling", description: "Base, hand control, stand and face opponent from bottom", positionSlug: "wrestling-mat", discipline: "wrestling", category: "escape", difficulty: "fundamental", transitionTarget: "standing" },
  { name: "Switch", slug: "switch", description: "Reverse position by switching hips underneath", positionSlug: "wrestling-mat", discipline: "wrestling", category: "escape", difficulty: "intermediate", transitionTarget: "standing" },
  { name: "Sit-Out Turn-In", slug: "sit-out-turn-in", description: "Sit out, turn in to face opponent from bottom", positionSlug: "wrestling-mat", discipline: "wrestling", category: "escape", difficulty: "fundamental", transitionTarget: "standing" },
  { name: "Spiral Ride", slug: "spiral-ride", description: "Controlling opponent from top with spiral pressure", positionSlug: "wrestling-mat", discipline: "wrestling", category: "control", difficulty: "intermediate" },
  { name: "Half Nelson", slug: "half-nelson", description: "Thread arm under opponent's arm and behind neck to turn", positionSlug: "wrestling-mat", discipline: "wrestling", category: "control", difficulty: "fundamental" },
  { name: "Turk Ride", slug: "turk-ride", description: "Leg ride control from top wrestling position", positionSlug: "wrestling-mat", discipline: "wrestling", category: "control", difficulty: "intermediate" },

  // ═══════════════════════════════════════════════════════════════════
  // SADDLE / HONEY HOLE
  // ═══════════════════════════════════════════════════════════════════
  { name: "Inside Heel Hook (Saddle)", slug: "saddle-inside-heel-hook", description: "Inside heel hook from the saddle/honey hole position", positionSlug: "saddle", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Outside Heel Hook (Saddle)", slug: "saddle-outside-heel-hook", description: "Outside heel hook from saddle, attacking the far leg", positionSlug: "saddle", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Toe Hold from Saddle", slug: "saddle-toe-hold", description: "Figure-four toe hold attack from the saddle position", positionSlug: "saddle", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Knee Bar from Saddle", slug: "saddle-kneebar", description: "Extend hips for kneebar from saddle position", positionSlug: "saddle", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Backside 50/50 Entry (Saddle)", slug: "saddle-backside-fifty-entry", description: "Transition from saddle to backside 50/50 for outside heel hook", positionSlug: "saddle", discipline: "nogi", category: "entry", difficulty: "intermediate" },
  { name: "Cross Ashi Entry", slug: "saddle-cross-ashi-entry", description: "Entry to cross ashi garami from saddle for heel hook finish", positionSlug: "saddle", discipline: "nogi", category: "entry", difficulty: "intermediate" },
  { name: "Saddle Escape - Hip Switch", slug: "saddle-escape-hip-switch", description: "Clear the knee line and hip switch to escape the saddle", positionSlug: "saddle", discipline: "nogi", category: "escape", difficulty: "intermediate", transitionTarget: "standing" },
  { name: "Saddle Escape - Boot Scoot", slug: "saddle-escape-boot-scoot", description: "Boot and scoot hips to disentangle from the saddle", positionSlug: "saddle", discipline: "nogi", category: "escape", difficulty: "intermediate", transitionTarget: "open-guard" },

  // ═══════════════════════════════════════════════════════════════════
  // TRUCK
  // ═══════════════════════════════════════════════════════════════════
  { name: "Twister", slug: "truck-twister", description: "Spinal lock from the truck position — devastating submission", positionSlug: "truck", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "Calf Slicer from Truck", slug: "truck-calf-slicer", description: "Compression lock on the calf from truck position", positionSlug: "truck", discipline: "nogi", category: "submission", difficulty: "intermediate" },
  { name: "Back Take from Truck", slug: "truck-back-take", description: "Roll through from truck to full back control with hooks", positionSlug: "truck", discipline: "nogi", category: "transition", difficulty: "intermediate", transitionTarget: "back-control" },
  { name: "Banana Split", slug: "truck-banana-split", description: "Groin stretch submission splitting opponent's legs from truck", positionSlug: "truck", discipline: "nogi", category: "submission", difficulty: "advanced" },
  { name: "Truck Entry from Back", slug: "truck-entry-from-back-pos", description: "Thread legs into truck from back control position", positionSlug: "truck", discipline: "nogi", category: "entry", difficulty: "intermediate" },
  { name: "Truck Entry from Half Guard", slug: "truck-entry-from-half", description: "Enter the truck from bottom half guard by threading the lockdown", positionSlug: "truck", discipline: "nogi", category: "entry", difficulty: "intermediate" },

  // ═══════════════════════════════════════════════════════════════════
  // BODY LOCK
  // ═══════════════════════════════════════════════════════════════════
  { name: "Body Lock Pass to Side Control", slug: "body-lock-pass-side", description: "Use body lock clinch to pressure pass to side control", positionSlug: "body-lock", discipline: "nogi", category: "pass", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Body Lock Pass to Mount", slug: "body-lock-pass-mount", description: "Use body lock to step over and pass directly to mount", positionSlug: "body-lock", discipline: "nogi", category: "pass", difficulty: "intermediate", transitionTarget: "mount" },
  { name: "Body Lock Takedown (Position)", slug: "body-lock-takedown", description: "From body lock clinch, trip or lift to take opponent down", positionSlug: "body-lock", discipline: "nogi", category: "takedown", difficulty: "fundamental" },
  { name: "Body Lock Guard Retention", slug: "body-lock-guard-retention", description: "Defending and retaining guard against body lock passing", positionSlug: "body-lock", discipline: "nogi", category: "retention", difficulty: "intermediate" },
  { name: "Inside Trip from Body Lock (Position)", slug: "body-lock-inside-trip", description: "Hook inside leg from body lock clinch and trip to ground", positionSlug: "body-lock", discipline: "nogi", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },
  { name: "Knee Tap from Body Lock (Position)", slug: "body-lock-knee-tap", description: "Tap the knee from body lock to collapse opponent's base", positionSlug: "body-lock", discipline: "nogi", category: "takedown", difficulty: "fundamental", transitionTarget: "side-control" },
];

// ─── Milestone Technique Assignments ─────────────────────────────────

export interface MilestoneSeed {
  name: string;
  slug: string;
  description: string;
  monthsMin: number;
  monthsMax: number | null;
  sortOrder: number;
  techniqueSlugs: string[];
}

export const MILESTONES: MilestoneSeed[] = [
  {
    name: "Explorer",
    slug: "explorer",
    description: "Building survival instincts and fundamental movements. You're learning the language of grappling.",
    monthsMin: 0,
    monthsMax: 6,
    sortOrder: 0,
    techniqueSlugs: [
      // Standing
      "double-leg", "guard-pull", "sprawl", "collar-tie", "standing-front-headlock", "snap-down",
      // Closed Guard
      "armbar-closed-guard", "triangle-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "scissor-sweep", "closed-guard-retention",
      // Open Guard
      "open-guard-retention",
      // Passing
      "toreando", "knee-cut", "stack-pass", "posture-grip-break", "headquarters",
      // Mount
      "mount-control", "americana-mount", "armbar-mount", "trap-roll", "elbow-knee-escape",
      // Side Control
      "side-control-pressure", "kimura-side-control", "americana-side", "shrimp-escape-sc", "underhook-escape-sc", "side-to-mount",
      // Back
      "seatbelt-hooks", "rnc", "back-escape-shoulder", "back-escape-hands",
      // Turtle
      "turtle-defense", "sit-out", "seatbelt-back-take", "front-headlock-from-turtle",
      // Front Headlock
      "front-headlock-control", "guillotine-arm-in",
      // Half Guard
      "knee-shield", "underhook-sweep-hg", "hg-to-full-guard", "half-guard-retention",
      // Butterfly
      "butterfly-sweep",
      // Leg Locks
      "straight-ankle",
      // Body Lock
      "body-lock-pass-side", "body-lock-takedown",
    ],
  },
  {
    name: "Traveler",
    slug: "traveler",
    description: "Developing offensive systems and chaining attacks. You're starting to find your voice on the mat.",
    monthsMin: 6,
    monthsMax: 12,
    sortOrder: 1,
    techniqueSlugs: [
      // Standing
      "single-leg-high-c", "ankle-pick", "arm-drag-back", "whizzer", "russian-tie", "underhook",
      "standing-inside-trip", "standing-knee-tap", "go-behind",
      // Closed Guard
      "guillotine-closed-guard", "cross-collar-guard", "flower-sweep", "ato-chain", "omoplata-guard",
      // Open Guard
      "collar-sleeve-guard", "sit-up-guard", "collar-drag", "spider-guard", "lasso-guard", "reverse-dlr-guard",
      // Half Guard
      "old-school-sweep", "lockdown", "kimura-half-guard", "bodylock-pass-half",
      // Butterfly
      "arm-drag-butterfly", "guillotine-butterfly",
      // Mount
      "cross-choke-mount", "ezekiel-mount", "gift-wrap-back", "s-mount", "gift-wrap-mount",
      // Side Control
      "far-armbar-side", "side-to-kob", "ghost-escape", "paper-cutter-choke", "ns-choke-from-side",
      // Back
      "bow-arrow", "short-choke", "body-triangle",
      // Turtle
      "granby-roll", "clock-choke", "turk-ride-turtle", "spiral-ride-turtle",
      // Front Headlock
      "darce", "go-behind-fhl",
      // Passing
      "over-under", "leg-drag", "smash-pass",
      // Leg Lock
      "leg-lock-defense", "ashi-garami", "toe-hold", "kneebar", "calf-slicer",
      // KOB
      "kob-pressure",
      // Wrestling
      "standup-wrestling", "sit-out-turn-in", "half-nelson",
      // Body Lock
      "body-lock-pass-mount", "body-lock-guard-retention", "body-lock-inside-trip", "body-lock-knee-tap",
      // Saddle
      "saddle-inside-heel-hook", "saddle-escape-hip-switch", "saddle-escape-boot-scoot",
      // 50/50
      "inside-heel-hook-fifty", "outside-heel-hook-fifty",
    ],
  },
  {
    name: "Navigator",
    slug: "navigator",
    description: "Building a personal game. Advanced positions, leg locks, and creative expression on the mat.",
    monthsMin: 12,
    monthsMax: 24,
    sortOrder: 2,
    techniqueSlugs: [
      // Standing
      "single-leg-low", "duck-under", "bodylock-takedown", "osoto-gari", "ouchi-gari", "seoi-nage", "crossface-defense",
      // Open Guard
      "spider-sweep", "lasso-sweep", "triangle-lasso", "matrix-entry",
      // Half Guard
      "electric-chair", "deep-half",
      // Butterfly
      "butterfly-to-x",
      // DLR
      "dlr-control", "dlr-sweep-basic", "dlr-to-x", "rdlr-sweep",
      // X-Guard
      "x-guard-standup", "slx-standup",
      // 50/50
      "fifty-fifty-control", "fifty-fifty-sweep", "fifty-fifty-backside-entry",
      // Mount
      "mounted-triangle", "mounted-triangle-setup",
      // Side Control
      "baseball-bat-choke", "bread-cutter",
      // Back
      "armbar-back", "straight-jacket", "truck-entry-from-back",
      // Front Headlock
      "guillotine-high-elbow", "anaconda",
      // Leg Locks
      "inside-heel-hook",
      // Passing
      "long-step", "bodylock-pass",
      // KOB
      "collar-choke-kob", "armbar-kob",
      // NS
      "ns-choke", "kimura-ns",
      // Wrestling
      "firemans-carry", "switch", "spiral-ride", "ref-position-bottom",
      // Saddle
      "saddle-outside-heel-hook", "saddle-toe-hold", "saddle-kneebar",
      "saddle-backside-fifty-entry", "saddle-cross-ashi-entry",
      // Truck
      "truck-calf-slicer", "truck-back-take",
      "truck-entry-from-back-pos", "truck-entry-from-half",
    ],
  },
  {
    name: "Guide",
    slug: "guide",
    description: "Multiple game plans, teaching ability, and creative problem solving. You're writing your own story.",
    monthsMin: 24,
    monthsMax: null,
    sortOrder: 3,
    techniqueSlugs: [
      // Advanced Standing
      "harai-goshi", "uchi-mata", "lateral-drop",
      // Advanced Guards
      "berimbolo", "k-guard", "crab-ride-entry", "coyote-half-guard",
      "closed-guard-k-guard-entry",
      // Advanced Leg Locks
      "outside-heel-hook", "heel-hook-slx", "heel-hook-fifty", "kneebar-fifty", "estima-lock",
      // Advanced Positions
      "crucifix-control", "crucifix-choke", "crucifix-entry-turtle",
      // Advanced Truck
      "truck-twister", "truck-banana-split",
      // Advanced Escapes
      "peterson-roll",
      // Advanced Wrestling
      "turk-ride",
    ],
  },
];

// ─── Badges ──────────────────────────────────────────────────────────

export interface BadgeSeed {
  name: string;
  slug: string;
  description: string;
  icon: string;
  criteria: string;
  category: string;
}

export const BADGES: BadgeSeed[] = [
  // Mat Time
  { name: "First Roll", slug: "first-roll", description: "Attended your first class", icon: "🥋", criteria: '{"type":"classes","count":1}', category: "mat_time" },
  { name: "Consistent", slug: "consistent", description: "Trained 3 times in one week", icon: "🔥", criteria: '{"type":"weekly_classes","count":3}', category: "mat_time" },
  { name: "Iron Will", slug: "iron-will", description: "30-day training streak", icon: "⛓️", criteria: '{"type":"streak","days":30}', category: "mat_time" },
  { name: "Century", slug: "century", description: "100 classes attended", icon: "💯", criteria: '{"type":"classes","count":100}', category: "mat_time" },
  { name: "Mat Rat", slug: "mat-rat", description: "250 classes attended", icon: "🐀", criteria: '{"type":"classes","count":250}', category: "mat_time" },
  { name: "Lifer", slug: "lifer", description: "500 classes attended", icon: "🏛️", criteria: '{"type":"classes","count":500}', category: "mat_time" },

  // Skills
  { name: "First Sub", slug: "first-sub", description: "Became proficient in your first submission", icon: "🔒", criteria: '{"type":"proficient_category","category":"submission","count":1}', category: "skills" },
  { name: "Submission Hunter", slug: "sub-hunter", description: "Proficient in 10 submissions", icon: "🎯", criteria: '{"type":"proficient_category","category":"submission","count":10}', category: "skills" },
  { name: "Guard Player", slug: "guard-player", description: "Proficient in 5 sweeps", icon: "🌊", criteria: '{"type":"proficient_category","category":"sweep","count":5}', category: "skills" },
  { name: "Passer", slug: "passer", description: "Proficient in 5 guard passes", icon: "🚪", criteria: '{"type":"proficient_category","category":"pass","count":5}', category: "skills" },
  { name: "Escape Artist", slug: "escape-artist", description: "Proficient in all fundamental escapes", icon: "🪄", criteria: '{"type":"proficient_category","category":"escape","count":5}', category: "skills" },
  { name: "Leg Locker", slug: "leg-locker", description: "Proficient in 3 leg lock attacks", icon: "🦵", criteria: '{"type":"proficient_leg_locks","count":3}', category: "skills" },

  // Milestones
  { name: "Explorer Complete", slug: "explorer-complete", description: "Completed the Explorer milestone", icon: "🧭", criteria: '{"type":"milestone","slug":"explorer"}', category: "milestone" },
  { name: "Traveler Complete", slug: "traveler-complete", description: "Completed the Traveler milestone", icon: "🗺️", criteria: '{"type":"milestone","slug":"traveler"}', category: "milestone" },
  { name: "Navigator Complete", slug: "navigator-complete", description: "Completed the Navigator milestone", icon: "⭐", criteria: '{"type":"milestone","slug":"navigator"}', category: "milestone" },
  { name: "Guide Complete", slug: "guide-complete", description: "Completed the Guide milestone", icon: "🏔️", criteria: '{"type":"milestone","slug":"guide"}', category: "milestone" },

  // Social
  { name: "Team Player", slug: "team-player", description: "Posted 10 times in the feed", icon: "🤝", criteria: '{"type":"feed_posts","count":10}', category: "social" },
  { name: "Motivator", slug: "motivator", description: "Checked in 50 times", icon: "📣", criteria: '{"type":"checkins","count":50}', category: "social" },
];
