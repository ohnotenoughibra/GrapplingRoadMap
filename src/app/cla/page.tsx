"use client";

import { useState, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────

type GameCategory =
  | "engagement"
  | "passing"
  | "retention"
  | "escapes"
  | "submissions"
  | "back-control"
  | "leg-locks"
  | "scrambles";

type ConstraintType = "task" | "environmental" | "individual";

interface CLAGame {
  name: string;
  slug: string;
  category: GameCategory;
  constraintType: ConstraintType;
  startPosition: string;
  constraint: string;
  playerA: { role: string; objective: string };
  playerB: { role: string; objective: string };
  skillsDeveloped: string[];
  scalingFocus?: string; // Souders' concept — what to tell different skill levels
  resetCondition: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  source?: string; // Attribution
}

// ─── Constants ──────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  GameCategory,
  { label: string; description: string; bg: string; text: string; border: string; icon: string }
> = {
  engagement: {
    label: "Engagement & Standing",
    description: "Making connections, grip fighting, takedowns",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  passing: {
    label: "Guard Passing",
    description: "Getting past the legs, pressure, movement",
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    icon: "M13 7l5 5m0 0l-5 5m5-5H6",
  },
  retention: {
    label: "Guard Retention & Bottom",
    description: "Maintaining guard, sweeps, distance management",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  escapes: {
    label: "Escapes & Defense",
    description: "Pin escapes, survival, recovery",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z",
  },
  submissions: {
    label: "Submissions",
    description: "Isolation, setup, finishing mechanics",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  "back-control": {
    label: "Back Control & Transitions",
    description: "Taking the back, maintaining, attacking",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  "leg-locks": {
    label: "Leg Locks",
    description: "Entries, entanglements, finishing, defense",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  },
  scrambles: {
    label: "Scrambles & Flow",
    description: "Chaos, adaptability, multi-format games",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/30",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
};

const CONSTRAINT_LABELS: Record<ConstraintType, { label: string; color: string }> = {
  task: { label: "Task", color: "text-emerald-400" },
  environmental: { label: "Environment", color: "text-amber-400" },
  individual: { label: "Individual", color: "text-violet-400" },
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  intermediate: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  advanced: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

// ─── Games Data ─────────────────────────────────────────────────────

const GAMES: CLAGame[] = [
  // ═══ ENGAGEMENT & STANDING ═══
  {
    name: "Grip Fighting Only",
    slug: "grip-fighting-only",
    category: "engagement",
    constraintType: "task",
    startPosition: "Standing, facing each other",
    constraint: "No takedowns allowed — only grip fighting. Reset if anyone goes to the ground.",
    playerA: { role: "Player A", objective: "Establish and maintain dominant grips (collar tie, underhook, 2-on-1) for 3 seconds" },
    playerB: { role: "Player B", objective: "Strip all grips and establish your own dominant connection" },
    skillsDeveloped: ["Hand fighting", "Grip breaking", "Understanding connection", "Collar tie mechanics"],
    scalingFocus: "Beginners: focus on just stripping grips. Advanced: chain grip breaks into re-grips without pause.",
    resetCondition: "Reset if anyone goes to the ground or scores a takedown",
    difficulty: "beginner",
    source: "Greg Souders",
  },
  {
    name: "Engagement Phase",
    slug: "engagement-phase",
    category: "engagement",
    constraintType: "task",
    startPosition: "Standing, 2 meters apart",
    constraint: "Can only train the engagement — reset immediately if a takedown occurs or guard is pulled. Focus on the initial connection.",
    playerA: { role: "Player A", objective: "Close distance and establish a controlling connection (collar tie, underhook, body lock)" },
    playerB: { role: "Player B", objective: "Deny the connection, create distance, disengage cleanly" },
    skillsDeveloped: ["Distance management", "Entry timing", "Understanding why grips matter", "Level changes"],
    scalingFocus: "Beginners: just make contact. Intermediate: make contact AND establish a specific tie. Advanced: establish the tie that leads to your best takedown.",
    resetCondition: "Reset if takedown or guard pull occurs",
    difficulty: "beginner",
    source: "Greg Souders",
  },
  {
    name: "Sumo",
    slug: "sumo",
    category: "engagement",
    constraintType: "environmental",
    startPosition: "Standing in a small circle (2-3m diameter)",
    constraint: "Must stay within the marked circle. Stepping out = losing.",
    playerA: { role: "Player A", objective: "Push, pull, or trip opponent out of bounds or take them down" },
    playerB: { role: "Player B", objective: "Same — stay in bounds while forcing opponent out" },
    skillsDeveloped: ["Balance", "Base", "Pressure distribution", "Weight manipulation", "Clinch work"],
    scalingFocus: "Beginners: focus on staying balanced. Advanced: use push-pull rhythm to manipulate their weight before the attack.",
    resetCondition: "Reset when someone steps out of bounds or is taken down",
    difficulty: "beginner",
  },
  {
    name: "Takedown to Pin",
    slug: "takedown-to-pin",
    category: "engagement",
    constraintType: "task",
    startPosition: "Standing",
    constraint: "Must complete a takedown AND hold side control or mount for 3 seconds to win. Takedown alone doesn't count.",
    playerA: { role: "Player A", objective: "Score a takedown and hold a dominant pin for 3 seconds" },
    playerB: { role: "Player B", objective: "Defend the takedown, or if taken down, escape the pin before 3 seconds" },
    skillsDeveloped: ["Takedown-to-control transitions", "Not settling after the takedown", "Scramble wrestling"],
    scalingFocus: "Beginners: any takedown + any pin. Advanced: specific takedown (e.g., double leg) + specific pin (mount only).",
    resetCondition: "Reset after a 3-second pin or if bottom player stands back up",
    difficulty: "intermediate",
    source: "Greg Souders",
  },
  {
    name: "Stand-Up Game",
    slug: "stand-up-game",
    category: "engagement",
    constraintType: "task",
    startPosition: "One player on their back, one player standing over them",
    constraint: "Bottom player's only win condition is getting to their feet. Top player cannot submit.",
    playerA: { role: "Bottom", objective: "Stand up using any method (technical stand-up, wrestling get-up, granby to feet)" },
    playerB: { role: "Top", objective: "Keep the bottom player on the ground — follow, pressure, ride" },
    skillsDeveloped: ["Technical stand-ups", "Base building", "Wrestling get-ups", "Top pressure without submission"],
    resetCondition: "Reset when bottom player reaches their feet or after 60 seconds",
    difficulty: "beginner",
  },

  // ═══ GUARD PASSING ═══
  {
    name: "No-Hands Passing",
    slug: "no-hands-passing",
    category: "passing",
    constraintType: "individual",
    startPosition: "Top player in opponent's open guard",
    constraint: "Passer cannot use their hands — arms behind back or holding belt. Must pass using only body positioning, pressure, and hips.",
    playerA: { role: "Passer", objective: "Pass guard using only hips, shoulders, chest pressure, and footwork" },
    playerB: { role: "Guard", objective: "Retain guard using all available tools" },
    skillsDeveloped: ["Weight distribution", "Hip pressure", "Understanding passing without arm reliance", "Body lock mechanics"],
    scalingFocus: "Beginners: just try to advance past the legs. Advanced: try to replicate your body lock pass mechanics without actually gripping.",
    resetCondition: "Reset if passer uses hands, or after pass is completed, or after 90 seconds",
    difficulty: "intermediate",
    source: "Greg Souders",
  },
  {
    name: "Corner Passing",
    slug: "corner-passing",
    category: "passing",
    constraintType: "environmental",
    startPosition: "Guard player placed in the corner of the mat with limited retreat space",
    constraint: "Guard player has limited space to move/retreat — they're backed into a corner.",
    playerA: { role: "Passer", objective: "Use the corner to limit their hip movement and pass" },
    playerB: { role: "Guard", objective: "Retain guard despite limited space — frame, create angles, escape the corner" },
    skillsDeveloped: ["Pressure passing", "Hip pinning", "Guard retention under pressure", "Spatial awareness"],
    resetCondition: "Reset after pass or if guard player escapes the corner",
    difficulty: "intermediate",
  },
  {
    name: "Commitment Passing",
    slug: "commitment-passing",
    category: "passing",
    constraintType: "task",
    startPosition: "Top player in open guard",
    constraint: "If passer backs out or disengages at any point, they restart inside the guard. No retreating.",
    playerA: { role: "Passer", objective: "Pass to side control and stabilize for 3 seconds — no backing out allowed" },
    playerB: { role: "Guard", objective: "Retain guard or sweep" },
    skillsDeveloped: ["Forward pressure commitment", "Passing without retreat", "Dealing with guard recovery under pressure"],
    scalingFocus: "Beginners: just stay engaged without backing up. Advanced: chain passes forward without resetting stance.",
    resetCondition: "Reset inside guard if passer backs out. Win on 3-second pin after pass.",
    difficulty: "intermediate",
    source: "Greg Souders",
  },
  {
    name: "Speed Passing (30-Second Clock)",
    slug: "speed-passing",
    category: "passing",
    constraintType: "environmental",
    startPosition: "Top player in open guard",
    constraint: "Pass must be completed within 30 seconds or guard player wins. Creates urgency.",
    playerA: { role: "Passer", objective: "Pass guard within 30 seconds" },
    playerB: { role: "Guard", objective: "Survive for 30 seconds without getting passed" },
    skillsDeveloped: ["Decision-making under pressure", "Efficient transitions", "Guard retention composure"],
    resetCondition: "Reset after 30 seconds or after pass. Rotate roles.",
    difficulty: "intermediate",
  },
  {
    name: "Half Guard Knee Free",
    slug: "half-guard-knee-free",
    category: "passing",
    constraintType: "task",
    startPosition: "Top player trapped in half guard",
    constraint: "Top player can only win by freeing their trapped knee (to either side). No submissions.",
    playerA: { role: "Top", objective: "Free the trapped knee to complete the pass to mount or side control" },
    playerB: { role: "Bottom", objective: "Maintain the half guard trap, sweep, or take the back" },
    skillsDeveloped: ["Half guard top mechanics", "Knee extraction", "Weight distribution", "Underhook battles"],
    resetCondition: "Reset after knee is freed and pass completed, or after sweep/back take",
    difficulty: "beginner",
  },
  {
    name: "Passer Stays Standing",
    slug: "passer-stays-standing",
    category: "passing",
    constraintType: "individual",
    startPosition: "Top player standing, bottom player in seated/open guard",
    constraint: "Top player cannot drop to their knees at any point during the pass. Must remain standing throughout.",
    playerA: { role: "Passer", objective: "Pass guard while remaining on your feet the entire time" },
    playerB: { role: "Guard", objective: "Retain guard, sweep, or submit from bottom" },
    skillsDeveloped: ["Standing passing mechanics", "Toreando timing", "Posture management", "Guard player: attacking standing opponents"],
    resetCondition: "Reset if passer drops to knees, or after pass completion",
    difficulty: "intermediate",
    source: "Souders / Biernacki",
  },

  // ═══ GUARD RETENTION & BOTTOM ═══
  {
    name: "No-Hands Guard",
    slug: "no-hands-guard",
    category: "retention",
    constraintType: "individual",
    startPosition: "Bottom player in open guard, hands behind back or holding belt",
    constraint: "Bottom player cannot use their hands — must retain guard using only legs and hips.",
    playerA: { role: "Guard (no hands)", objective: "Retain guard using only legs, hips, and body movement" },
    playerB: { role: "Passer", objective: "Pass guard normally" },
    skillsDeveloped: ["Leg dexterity", "Hip movement", "Guard retention fundamentals", "Feet-on-hips mechanics"],
    scalingFocus: "Beginners: just keep feet connected to their body. Advanced: use leg pummeling to recover from near-passes.",
    resetCondition: "Reset after guard is passed or after 90 seconds",
    difficulty: "intermediate",
    source: "Greg Souders",
  },
  {
    name: "Guard Retention Only",
    slug: "guard-retention-only",
    category: "retention",
    constraintType: "task",
    startPosition: "Bottom player in open guard",
    constraint: "Bottom player cannot sweep or submit — can only retain/recover guard. Top player must stay engaged (no backing out).",
    playerA: { role: "Guard", objective: "Retain or recover guard for the entire round — no sweeps, no subs" },
    playerB: { role: "Passer", objective: "Pass guard" },
    skillsDeveloped: ["Framing", "Hip escapes", "Angle recovery", "Guard recovery from near-passes", "Composure"],
    scalingFocus: "Beginners: focus on keeping feet connected. Advanced: focus on minimum-effort recovery — how late can you leave it?",
    resetCondition: "Reset after pass. Guard player 'wins' by surviving the round.",
    difficulty: "beginner",
    source: "Greg Souders",
  },
  {
    name: "Seated Guard vs Standing",
    slug: "seated-vs-standing",
    category: "retention",
    constraintType: "task",
    startPosition: "Bottom player seated on the mat, top player standing",
    constraint: "Bottom player cannot close guard or pull into butterfly. Must stay seated.",
    playerA: { role: "Seated Guard", objective: "Maintain seated position using posts, frames, and grips — don't get flattened" },
    playerB: { role: "Standing", objective: "Get the seated player flat on their back with chest-to-chest connection" },
    skillsDeveloped: ["Seated guard structure", "Posts and frames", "Distance management from seated", "Engagement from top"],
    resetCondition: "Reset when seated player is flattened or after 60 seconds",
    difficulty: "intermediate",
    source: "Greg Souders / Gordon Ryan",
  },
  {
    name: "FYJJ Sweeping (F*** Your Jiu-Jitsu)",
    slug: "fyjj-sweeping",
    category: "retention",
    constraintType: "task",
    startPosition: "Bottom player in any open guard",
    constraint: "Top player walks into guard casually and dismissively — intentionally gives openings. Bottom MUST capitalize and sweep.",
    playerA: { role: "Guard", objective: "Sweep the top player by capitalizing on the openings they give" },
    playerB: { role: "Top (casual)", objective: "Walk into guard dismissively — be careless with your base. Don't fight the sweep, give reactions." },
    skillsDeveloped: ["Sweep timing", "Opportunism", "Reading weight shifts", "Taking what's given"],
    scalingFocus: "Beginners: top player gives very obvious openings. Advanced: top player gives subtle weight shifts that require reading.",
    resetCondition: "Reset after sweep. Rotate.",
    difficulty: "beginner",
    source: "Ryan Hall / Rob Biernacki",
  },
  {
    name: "Closed Guard Break",
    slug: "closed-guard-break",
    category: "retention",
    constraintType: "task",
    startPosition: "Top player trapped in opponent's closed guard",
    constraint: "Bottom player cannot submit — only maintain closed guard. Top player's only goal is to break the guard open.",
    playerA: { role: "Top", objective: "Break the closed guard open using posture, grips, and standing" },
    playerB: { role: "Guard", objective: "Maintain closed guard — don't let them open it" },
    skillsDeveloped: ["Posture in closed guard", "Guard breaking mechanics", "Closed guard retention"],
    resetCondition: "Reset after guard is broken open or after 90 seconds",
    difficulty: "beginner",
  },

  // ═══ ESCAPES & DEFENSE ═══
  {
    name: "Mount Escape",
    slug: "mount-escape-game",
    category: "escapes",
    constraintType: "task",
    startPosition: "Bottom player mounted",
    constraint: "Top player maintains mount but cannot submit. Focus purely on positional battle.",
    playerA: { role: "Bottom", objective: "Escape mount — recover guard, reverse, or stand up" },
    playerB: { role: "Top", objective: "Maintain mount position — ride all escape attempts" },
    skillsDeveloped: ["Framing", "Bridging", "Elbow-knee escape", "Composure under pressure"],
    scalingFocus: "Beginners: just create enough space to breathe. Intermediate: chain trap-and-roll with elbow-knee. Advanced: use frames to create micro-escapes.",
    resetCondition: "Reset after escape or after 90 seconds. Rotate.",
    difficulty: "beginner",
    source: "Greg Souders",
  },
  {
    name: "Side Control Escape",
    slug: "side-escape-game",
    category: "escapes",
    constraintType: "task",
    startPosition: "Bottom player in side control",
    constraint: "No submissions from either player. Purely positional.",
    playerA: { role: "Bottom", objective: "Escape to guard, stand up, or reverse position" },
    playerB: { role: "Top", objective: "Maintain side control — advance to mount or knee-on-belly" },
    skillsDeveloped: ["Hip escapes", "Frames", "Guard recovery from pins", "Underhook escapes"],
    resetCondition: "Reset after escape, advancement to mount, or after 90 seconds",
    difficulty: "beginner",
  },
  {
    name: "360 Rotation",
    slug: "360-rotation",
    category: "escapes",
    constraintType: "task",
    startPosition: "Top player in mount",
    constraint: "Top player must complete a full rotation: mount > side > north-south > opposite side > back to mount. Bottom player tries to stand up before rotation completes.",
    playerA: { role: "Top", objective: "Complete a full 360-degree rotation around the bottom player without losing control" },
    playerB: { role: "Bottom", objective: "Stand up before the top player completes the full rotation" },
    skillsDeveloped: ["Top: transitions, control continuity, weight distribution. Bottom: scrambling, urgency, technical stand-ups"],
    resetCondition: "Reset after full rotation completes or bottom player stands up",
    difficulty: "intermediate",
  },
  {
    name: "Turtle Escape",
    slug: "turtle-escape-game",
    category: "escapes",
    constraintType: "task",
    startPosition: "Bottom player in turtle, top player has seatbelt",
    constraint: "Top player has seatbelt but no hooks yet. No submissions initially.",
    playerA: { role: "Bottom", objective: "Escape turtle — sit out, granby roll, stand up, or recover guard" },
    playerB: { role: "Top", objective: "Maintain back control and insert hooks" },
    skillsDeveloped: ["Turtle defense", "Sit-outs", "Granby rolls", "Wrestling get-ups"],
    resetCondition: "Reset after escape or after hooks are inserted",
    difficulty: "beginner",
  },
  {
    name: "Back Escape",
    slug: "back-escape-game",
    category: "escapes",
    constraintType: "task",
    startPosition: "Opponent has full back control (hooks in, seatbelt)",
    constraint: "Attacker has full submission options. Defender must escape.",
    playerA: { role: "Defender", objective: "Escape back control — clear hooks, turn in, get to floor, recover guard" },
    playerB: { role: "Attacker", objective: "Maintain back control and submit (RNC, arm triangle, etc.)" },
    skillsDeveloped: ["Hand fighting", "Hook clearing", "Shoulder walking", "Composure with back taken"],
    scalingFocus: "Beginners: focus on protecting the neck. Intermediate: chain hand fighting with hook clearing. Advanced: time your escape with their submission attempt.",
    resetCondition: "Reset after escape or submission",
    difficulty: "intermediate",
    source: "Greg Souders / Danaher",
  },
  {
    name: "Pin Escape Progression",
    slug: "pin-escape-progression",
    category: "escapes",
    constraintType: "task",
    startPosition: "Bottom in mount (worst pin first)",
    constraint: "Sequential — must escape mount, then side control, then half guard. Each escape advances to the next pin.",
    playerA: { role: "Bottom", objective: "Escape each pin in sequence: mount > side > half guard" },
    playerB: { role: "Top", objective: "Maintain each pin as long as possible" },
    skillsDeveloped: ["Systematic escape across all pins", "Endurance under pressure", "Transitioning between escape strategies"],
    resetCondition: "Game ends when all three pins are escaped or time runs out",
    difficulty: "intermediate",
    source: "Gordon Ryan pin escape methodology",
  },

  // ═══ BACK CONTROL & TRANSITIONS ═══
  {
    name: "Back Take from Everywhere",
    slug: "back-take-everywhere",
    category: "back-control",
    constraintType: "task",
    startPosition: "Any agreed position (closed guard, turtle, seated guard)",
    constraint: "No submissions allowed — only goal is to take the back (achieve seatbelt + at least one hook).",
    playerA: { role: "Attacker", objective: "Take the back — achieve seatbelt + hooks from any position" },
    playerB: { role: "Defender", objective: "Prevent the back take — maintain facing position" },
    skillsDeveloped: ["Back-taking entries", "Arm drag timing", "Angle creation", "Reading posture shifts"],
    resetCondition: "Reset after back is taken or after 90 seconds",
    difficulty: "intermediate",
    source: "Danaher / Gordon Ryan",
  },
  {
    name: "Turtle Attack vs Defense",
    slug: "turtle-attack-defense",
    category: "back-control",
    constraintType: "task",
    startPosition: "One player in turtle, attacker on top",
    constraint: "Attacker cannot submit from turtle — only try to take the back. Defender can escape to any position.",
    playerA: { role: "Attacker", objective: "Take the back with both hooks from the turtle" },
    playerB: { role: "Defender", objective: "Escape turtle to guard, standing, or reverse position" },
    skillsDeveloped: ["Seatbelt control", "Hook insertion", "Ride positioning", "Turtle escapes"],
    resetCondition: "Reset after back take or successful escape",
    difficulty: "beginner",
  },
  {
    name: "Back Control Maintenance",
    slug: "back-maintenance",
    category: "back-control",
    constraintType: "task",
    startPosition: "Attacker has full back control (hooks + seatbelt)",
    constraint: "Attacker can only win by maintaining back control for 60 seconds. No submissions.",
    playerA: { role: "Attacker", objective: "Maintain back control for 60 consecutive seconds" },
    playerB: { role: "Defender", objective: "Escape back control before 60 seconds" },
    skillsDeveloped: ["Ride control", "Hook management", "Adjusting to escape attempts", "Systematic back escapes"],
    resetCondition: "Reset after 60 seconds of control or after escape",
    difficulty: "intermediate",
    source: "Danaher back attack system",
  },

  // ═══ SUBMISSIONS ═══
  {
    name: "Triangle Setup Game 1: Breaking Posture",
    slug: "triangle-setup-1",
    category: "submissions",
    constraintType: "task",
    startPosition: "Bottom player in closed guard",
    constraint: "Bottom's only goal: make top player post their hand on the mat. No sweeps, no subs.",
    playerA: { role: "Guard", objective: "Break the top player's posture until they post a hand on the mat" },
    playerB: { role: "Top", objective: "Maintain perfect posture — keep hands on opponent, don't post" },
    skillsDeveloped: ["Breaking posture", "Creating reactions", "Understanding posture mechanics"],
    scalingFocus: "Beginners: any posture break counts. Advanced: break posture using specific grips (cross collar, overhook).",
    resetCondition: "Reset when hand posts on mat. Bottom player 'scores.' Rotate after 3 scores.",
    difficulty: "beginner",
    source: "Souders / Enrique Iturriaga (80/20 BJJ Coach)",
  },
  {
    name: "Triangle Setup Game 2: Securing the Arm",
    slug: "triangle-setup-2",
    category: "submissions",
    constraintType: "task",
    startPosition: "Bottom in closed guard, top player has posted one hand",
    constraint: "Bottom must secure an overhook or underhook on the posting arm. No submissions yet.",
    playerA: { role: "Guard", objective: "Secure overhook or underhook on the posting arm" },
    playerB: { role: "Top", objective: "Recover posture, don't let them control your posting arm" },
    skillsDeveloped: ["Capitalizing on reactions", "Arm control", "Overhook/underhook mechanics"],
    resetCondition: "Reset when arm control is established or posture is recovered",
    difficulty: "beginner",
    source: "Souders / Enrique Iturriaga",
  },
  {
    name: "Triangle Setup Game 3: Arm Isolation",
    slug: "triangle-setup-3",
    category: "submissions",
    constraintType: "task",
    startPosition: "Bottom has overhook or underhook on top player's arm",
    constraint: "Bottom must achieve 'arm in, arm out' configuration — isolate one arm inside and push the other outside. No triangle lock yet.",
    playerA: { role: "Guard", objective: "Achieve the arm-in-arm-out configuration for triangle" },
    playerB: { role: "Top", objective: "Escape the overhook/underhook, recover posture" },
    skillsDeveloped: ["Triangle setup mechanics", "Arm isolation", "Reading which arm to target"],
    resetCondition: "Reset when arm-in-arm-out is achieved or top escapes",
    difficulty: "intermediate",
    source: "Souders / Enrique Iturriaga",
  },
  {
    name: "Triangle Finishing Game",
    slug: "triangle-finishing",
    category: "submissions",
    constraintType: "task",
    startPosition: "Bottom has a locked triangle (legs in figure-four around neck + one arm)",
    constraint: "Attacker can only work finishing details. Defender tries to escape a locked triangle.",
    playerA: { role: "Guard", objective: "Finish the triangle — angle, squeeze, cut, pull head" },
    playerB: { role: "Top", objective: "Escape the locked triangle — posture up, stack, or pull arm out" },
    skillsDeveloped: ["Triangle finishing mechanics", "Angle cutting", "Triangle defense and escape"],
    resetCondition: "Reset after submission or escape",
    difficulty: "intermediate",
  },
  {
    name: "Single Submission Hunt",
    slug: "single-sub-hunt",
    category: "submissions",
    constraintType: "task",
    startPosition: "Any agreed position (mount, back, guard, side control)",
    constraint: "Attacker can ONLY win by one specific submission (e.g., armbar only, RNC only, kimura only). No other subs count.",
    playerA: { role: "Attacker", objective: "Finish the designated submission from the agreed position" },
    playerB: { role: "Defender", objective: "Defend that specific submission — escape or reverse position" },
    skillsDeveloped: ["Deep exploration of one submission's entries", "Finding multiple paths to the same finish", "Submission-specific defense"],
    scalingFocus: "Vary the submission each round. Monday = armbars. Tuesday = triangles. Wednesday = kimuras.",
    resetCondition: "Reset after submission or escape. Track scores over multiple rounds.",
    difficulty: "intermediate",
  },
  {
    name: "Armbar from Mount",
    slug: "armbar-mount-game",
    category: "submissions",
    constraintType: "task",
    startPosition: "Attacker in mount",
    constraint: "Only armbars allowed — no other submissions. Top player works isolation to armbar.",
    playerA: { role: "Top", objective: "Isolate an arm and finish the armbar from mount" },
    playerB: { role: "Bottom", objective: "Defend the armbar — keep elbows tight, escape mount" },
    skillsDeveloped: ["Mount-to-armbar transitions", "Arm isolation", "S-mount mechanics", "Armbar defense from bottom mount"],
    resetCondition: "Reset after armbar or mount escape",
    difficulty: "intermediate",
  },
  {
    name: "Submission Chain Game",
    slug: "submission-chain",
    category: "submissions",
    constraintType: "task",
    startPosition: "Any dominant position (mount, back, side control)",
    constraint: "Attacker must attempt at least 3 different submission types before a finish counts. Can't just spam one attack.",
    playerA: { role: "Attacker", objective: "Chain between 3+ different submissions to find the finish" },
    playerB: { role: "Defender", objective: "Defend all submissions and escape" },
    skillsDeveloped: ["Submission chaining", "Transitioning between attacks", "Multi-threat offense", "Sequential defense"],
    resetCondition: "Reset after submission (if 3+ attempts were made) or escape",
    difficulty: "advanced",
    source: "Danaher system concept",
  },

  // ═══ LEG LOCKS ═══
  {
    name: "Leg Entanglement Entry",
    slug: "leg-entry-game",
    category: "leg-locks",
    constraintType: "task",
    startPosition: "Both players seated or from open guard",
    constraint: "No upper body submissions allowed. Only leg entanglement entries count as scoring.",
    playerA: { role: "Attacker", objective: "Enter any leg entanglement (ashi, SLX, saddle, 50/50)" },
    playerB: { role: "Defender", objective: "Defend entries — disengage, clear knee line, or counter-entangle" },
    skillsDeveloped: ["Leg lock entries", "Reading leg exposure", "Leg pummeling", "Entry defense"],
    scalingFocus: "Beginners: just get to any ashi garami. Advanced: enter a specific entanglement (saddle only, or cross ashi only).",
    resetCondition: "Reset after entanglement is established or after 60 seconds",
    difficulty: "intermediate",
    source: "Greg Souders / Danaher",
  },
  {
    name: "Heel Hook Finishing",
    slug: "heel-hook-finishing",
    category: "leg-locks",
    constraintType: "task",
    startPosition: "Attacker has inside sankaku/ashi garami with foot controlled",
    constraint: "Attacker already has position — must finish. Defender starts in a disadvantageous position.",
    playerA: { role: "Attacker", objective: "Finish the heel hook from established ashi garami" },
    playerB: { role: "Defender", objective: "Escape the leg entanglement — clear knee line, boot, rotate out" },
    skillsDeveloped: ["Heel hook finishing mechanics", "Breaking mechanics", "Boot defense", "Knee line escape"],
    resetCondition: "Reset after submission or escape. Controlled taps — safety first.",
    difficulty: "advanced",
    source: "Craig Jones / Danaher",
  },
  {
    name: "Leg Lock Integration",
    slug: "leg-lock-integration",
    category: "leg-locks",
    constraintType: "task",
    startPosition: "Guard player vs passer — normal open guard start",
    constraint: "Guard player can attack legs AND sweep/submit normally. Passer can pass AND defend legs. Full game but with leg lock awareness.",
    playerA: { role: "Guard", objective: "Sweep, submit, or attack legs from any position" },
    playerB: { role: "Passer", objective: "Pass guard, defend legs, take back, or counter-attack" },
    skillsDeveloped: ["Leg lock integration into full game", "When to attack legs vs. play guard", "Leg lock awareness for passers"],
    resetCondition: "Normal sparring resets — submission, pass + pin, or time",
    difficulty: "advanced",
    source: "Craig Jones approach",
  },
  {
    name: "50/50 Battle",
    slug: "fifty-fifty-battle",
    category: "leg-locks",
    constraintType: "task",
    startPosition: "Both players enter 50/50 entanglement",
    constraint: "Start in 50/50 — first to submit, sweep to top, or escape wins.",
    playerA: { role: "Player A", objective: "Submit with heel hook/kneebar, sweep to top, or disengage to pass" },
    playerB: { role: "Player B", objective: "Same — submit, sweep, or disengage" },
    skillsDeveloped: ["50/50 attacks and defense", "Inside position battles", "Heel hook racing", "50/50 passing"],
    resetCondition: "Reset after submission, sweep, or successful disengage to pass",
    difficulty: "advanced",
    source: "Craig Jones",
  },

  // ═══ SCRAMBLES & FLOW ═══
  {
    name: "King of the Hill",
    slug: "king-of-hill",
    category: "scrambles",
    constraintType: "environmental",
    startPosition: "Any agreed position",
    constraint: "Winner stays on the mat, loser rotates out. Fresh opponent enters each round.",
    playerA: { role: "King", objective: "Win (submit, pass, sweep) and stay on the mat" },
    playerB: { role: "Challenger", objective: "Dethrone the king — beat them by any means" },
    skillsDeveloped: ["Endurance", "Adaptability to different body types", "Performance under fatigue", "Consistency"],
    resetCondition: "Loser exits, new challenger enters. King stays until defeated.",
    difficulty: "intermediate",
  },
  {
    name: "Shark Tank",
    slug: "shark-tank",
    category: "scrambles",
    constraintType: "environmental",
    startPosition: "Any position",
    constraint: "One person stays in the center for the entire round (3-5 minutes). Fresh opponents rotate in every 30-60 seconds.",
    playerA: { role: "Shark (center)", objective: "Survive and perform against continuous fresh opponents" },
    playerB: { role: "Rotating opponents", objective: "Push the pace — attack aggressively with fresh energy" },
    skillsDeveloped: ["Cardio", "Composure under fatigue", "Technical efficiency", "Mental toughness"],
    resetCondition: "Rotation every 30-60 seconds. Shark stays for full round.",
    difficulty: "advanced",
  },
  {
    name: "Position Scramble",
    slug: "position-scramble",
    category: "scrambles",
    constraintType: "environmental",
    startPosition: "Both players neutral — standing or on knees",
    constraint: "Coach calls out positions randomly. Both players race to achieve the called position.",
    playerA: { role: "Player A", objective: "Achieve the called position first (mount, back, side control, etc.)" },
    playerB: { role: "Player B", objective: "Same — race to the position" },
    skillsDeveloped: ["Transitional speed", "Positional recognition", "Scramble instincts", "Reaction time"],
    resetCondition: "Reset to neutral after each position is achieved. Coach calls next position.",
    difficulty: "intermediate",
  },
  {
    name: "Progressive Resistance",
    slug: "progressive-resistance",
    category: "scrambles",
    constraintType: "task",
    startPosition: "Specific position the coach wants to develop",
    constraint: "Defender gradually increases resistance: Round 1 = 30% resistance, Round 2 = 50%, Round 3 = 70%, Round 4 = 100%.",
    playerA: { role: "Attacker", objective: "Execute technique/position against increasing resistance" },
    playerB: { role: "Defender", objective: "Provide calibrated resistance — honest but scaled to the round" },
    skillsDeveloped: ["Technique refinement under pressure", "Understanding when technique breaks down", "Building toward full resistance"],
    scalingFocus: "Souders discusses this as a bridge between drilling and live sparring. The scaling IS the learning.",
    resetCondition: "Reset and increase resistance each round",
    difficulty: "beginner",
    source: "Souders / Priit Mihkelson discussion",
  },
  {
    name: "Two-Touch Sparring",
    slug: "two-touch",
    category: "scrambles",
    constraintType: "task",
    startPosition: "Any position",
    constraint: "Each player can only maintain two points of contact at any time. Removing a contact point requires establishing a new one elsewhere.",
    playerA: { role: "Player A", objective: "Advance position, sweep, or submit with only 2 contact points" },
    playerB: { role: "Player B", objective: "Same" },
    skillsDeveloped: ["Understanding which connections matter most", "Efficient use of contact points", "Pressure with minimal grips"],
    resetCondition: "Normal sparring rules. Monitor contact point rule.",
    difficulty: "advanced",
    source: "Ecological dynamics concept",
  },
  {
    name: "Flow Rolling (Souders Style)",
    slug: "flow-rolling",
    category: "scrambles",
    constraintType: "task",
    startPosition: "Any — standing or ground",
    constraint: "Both players work at 40-50% intensity. Focus on movement, transitions, and exploration — not winning. If caught in a submission, acknowledge and continue (don't tap and reset).",
    playerA: { role: "Player A", objective: "Explore movements, try new positions, chain transitions without fighting" },
    playerB: { role: "Player B", objective: "Same — cooperate in exploration, respond naturally to movements" },
    skillsDeveloped: ["Movement creativity", "Position discovery", "Transitional awareness", "Injury prevention"],
    scalingFocus: "Beginners: just move and explore. Advanced: explore specific positions or chains you're developing.",
    resetCondition: "No resets — continuous movement for the entire round (5-10 minutes)",
    difficulty: "beginner",
  },
];

// ─── Components ─────────────────────────────────────────────────────

function GameCard({ game, expanded, onToggle }: { game: CLAGame; expanded: boolean; onToggle: () => void }) {
  const catCfg = CATEGORY_CONFIG[game.category];
  const diffCfg = DIFFICULTY_COLORS[game.difficulty];
  const constraintCfg = CONSTRAINT_LABELS[game.constraintType];

  return (
    <div className={`card transition-all duration-200 ${expanded ? "border-gi-500/30" : "hover:border-mat-700/50 cursor-pointer"}`}>
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-mat-100 mb-1">{game.name}</h3>
            <p className="text-xs text-mat-400 line-clamp-2">{game.constraint}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${diffCfg.bg} ${diffCfg.text} border ${diffCfg.border}`}>
              {game.difficulty}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${constraintCfg.color} bg-mat-800/50 border border-mat-700/30`}>
              {constraintCfg.label}
            </span>
            <svg className={`w-4 h-4 text-mat-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-mat-800/50 pt-3 animate-in">
          {/* Start Position */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mat-400 mb-1">Start Position</h4>
            <p className="text-xs text-mat-200">{game.startPosition}</p>
          </div>

          {/* Players */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-lg bg-mat-800/30 p-2.5 border border-mat-800/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gi-400 mb-1">{game.playerA.role}</div>
              <p className="text-xs text-mat-200">{game.playerA.objective}</p>
            </div>
            <div className="rounded-lg bg-mat-800/30 p-2.5 border border-mat-800/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-nogi-400 mb-1">{game.playerB.role}</div>
              <p className="text-xs text-mat-200">{game.playerB.objective}</p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mat-400 mb-1.5">Skills Developed</h4>
            <div className="flex flex-wrap gap-1">
              {game.skillsDeveloped.map((skill) => (
                <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-md bg-mat-800/50 text-mat-300 text-[10px] border border-mat-700/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Scaling Focus */}
          {game.scalingFocus && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Scaling Focus (Souders)
              </h4>
              <p className="text-xs text-mat-300 leading-snug">{game.scalingFocus}</p>
            </div>
          )}

          {/* Reset */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-mat-400 mb-1">Reset Condition</h4>
            <p className="text-xs text-mat-300">{game.resetCondition}</p>
          </div>

          {/* Source */}
          {game.source && (
            <div className="text-[10px] text-mat-500 italic">Source: {game.source}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function CLACornerPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GameCategory | "">("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [constraintFilter, setConstraintFilter] = useState<ConstraintType | "">("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return GAMES.filter((g) => {
      if (categoryFilter && g.category !== categoryFilter) return false;
      if (difficultyFilter && g.difficulty !== difficultyFilter) return false;
      if (constraintFilter && g.constraintType !== constraintFilter) return false;
      if (lowerSearch) {
        const matches =
          g.name.toLowerCase().includes(lowerSearch) ||
          g.constraint.toLowerCase().includes(lowerSearch) ||
          g.skillsDeveloped.some((s) => s.toLowerCase().includes(lowerSearch));
        if (!matches) return false;
      }
      return true;
    });
  }, [search, categoryFilter, difficultyFilter, constraintFilter]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CLAGame[]> = {};
    for (const game of filtered) {
      if (!groups[game.category]) groups[game.category] = [];
      groups[game.category].push(game);
    }
    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-mat-100 mb-2">CLA Corner</h1>
        <p className="text-sm text-mat-400 max-w-lg mx-auto">
          Constraints-Led Approach games for grappling. Categorized by Greg Souders&apos; philosophy:
          design the problem space, let athletes discover solutions.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-mat-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Task
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Environment
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" /> Individual
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-14 z-30 bg-mat-950/80 backdrop-blur-md -mx-4 px-4 py-3 border-b border-mat-800/30">
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mat-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games, skills..."
            className="w-full pl-10 pr-4 py-3 bg-mat-800/50 border border-mat-700/50 rounded-xl text-mat-100 placeholder:text-mat-500 text-base focus:outline-none focus:border-gi-500/50 focus:ring-1 focus:ring-gi-500/30 transition-colors"
          />
        </div>

        <div className="space-y-2">
          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${!categoryFilter ? "bg-mat-700 text-mat-100" : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60"}`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_CONFIG) as GameCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(active ? "" : cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${active ? `${cfg.bg} ${cfg.text} border ${cfg.border}` : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60"}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Difficulty + Constraint type */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {(["beginner", "intermediate", "advanced"] as const).map((d) => {
              const active = difficultyFilter === d;
              const cfg = DIFFICULTY_COLORS[d];
              return (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(active ? "" : d)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${active ? `${cfg.bg} ${cfg.text} border ${cfg.border}` : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60"}`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              );
            })}
            <div className="w-px bg-mat-700/50 mx-1 self-stretch" />
            {(["task", "environmental", "individual"] as ConstraintType[]).map((ct) => {
              const active = constraintFilter === ct;
              const cfg = CONSTRAINT_LABELS[ct];
              return (
                <button
                  key={ct}
                  onClick={() => setConstraintFilter(active ? "" : ct)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${active ? `${cfg.color} bg-mat-800 border border-mat-600/50` : "bg-mat-800/30 text-mat-500 hover:bg-mat-800/60"}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-mat-400">
        {filtered.length} game{filtered.length !== 1 ? "s" : ""} across {grouped.length} categor{grouped.length !== 1 ? "ies" : "y"}
      </div>

      {/* Games grouped by category */}
      {grouped.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-mat-400 text-base font-medium mb-1">No games found</p>
          <p className="text-mat-500 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([cat, games]) => {
            const cfg = CATEGORY_CONFIG[cat as GameCategory];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <svg className={`w-5 h-5 ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
                  </svg>
                  <h2 className={`text-sm font-semibold uppercase tracking-wider ${cfg.text}`}>
                    {cfg.label}
                  </h2>
                  <span className="text-xs text-mat-500">({games.length})</span>
                </div>
                <p className="text-xs text-mat-500 mb-3">{cfg.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {games.map((game) => (
                    <GameCard
                      key={game.slug}
                      game={game}
                      expanded={expandedSlug === game.slug}
                      onToggle={() => setExpandedSlug(expandedSlug === game.slug ? null : game.slug)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer attribution */}
      <div className="border-t border-mat-800/50 pt-6 pb-4 text-center space-y-2">
        <p className="text-xs text-mat-500">
          Based on the Constraints-Led Approach (CLA) and Ecological Dynamics framework.
        </p>
        <p className="text-xs text-mat-600">
          Influenced by Greg Souders (Standard Jiu-Jitsu), Rob Biernacki (BJJ Concepts),
          Ryan Hall, Priit Mihkelson, and Dr. Rob Gray.
        </p>
      </div>
    </div>
  );
}
