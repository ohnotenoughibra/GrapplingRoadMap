// ─── The 12-Week Curriculum ─────────────────────────────────────────
//
// A complete, opinionated training schedule for a grappling academy.
// Built from first principles: how do the best gyms in the world
// structure their weeks?
//
// Structure:
//   Mon → Gi (position of the week)
//   Tue → No-Gi (same position, nogi grips)
//   Wed → Wrestling / Takedowns
//   Thu → Gi (attacks from the position)
//   Fri → No-Gi Competition Class (chain attacks, live scenarios)
//   Sat → Open Mat / Review
//
// Each 2-week block focuses on one positional theme:
//   Weeks 1-2:  Closed Guard
//   Weeks 3-4:  Guard Passing
//   Weeks 5-6:  Half Guard + Butterfly
//   Weeks 7-8:  Mount + Side Control
//   Weeks 9-10: Back Control + Turtle
//   Weeks 11-12: Standing + Front Headlock + Leg Locks

export interface ClassPlan {
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  discipline: "gi" | "nogi" | "wrestling";
  title: string;
  notes: string;
  techniques: string[]; // slugs
}

export interface WeekPlan {
  weekNumber: number;
  theme: string;
  classes: ClassPlan[];
}

// ═══════════════════════════════════════════════════════════════════
// 12-WEEK CURRICULUM
// ═══════════════════════════════════════════════════════════════════

export const CURRICULUM: WeekPlan[] = [
  // ─── WEEKS 1-2: CLOSED GUARD ─────────────────────────────────────
  {
    weekNumber: 1,
    theme: "Closed Guard — Foundations",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Closed Guard Posture Control",
        notes: "Breaking posture, controlling grips. Hip bump + scissor sweep as our first two sweeps.",
        techniques: ["armbar-closed-guard", "hip-bump-sweep", "scissor-sweep", "posture-grip-break"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Closed Guard No-Gi Attacks",
        notes: "Without grips, everything is about head control and overhooks. Guillotine and kimura from guard.",
        techniques: ["guillotine-closed-guard", "kimura-closed-guard", "hip-bump-sweep"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Takedown Fundamentals — Level Change",
        notes: "The double leg is the bread and butter. Penetration step, level change, drive through.",
        techniques: ["double-leg", "sprawl", "collar-tie", "underhook"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Closed Guard Submissions",
        notes: "Armbar-triangle-omoplata chain. When they defend one, the next opens up.",
        techniques: ["triangle-closed-guard", "armbar-closed-guard", "cross-collar-guard", "flower-sweep"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Closed Guard Chains",
        notes: "Live drilling from closed guard. 3-min rounds, bottom player works submissions, top player works passes.",
        techniques: ["ato-chain", "guillotine-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "scissor-sweep"],
      },
    ],
  },
  {
    weekNumber: 2,
    theme: "Closed Guard — Advanced Entries",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Closed Guard Sweep System",
        notes: "Flower sweep when they posture, hip bump when they lean back, scissor when they drive in. Read and react.",
        techniques: ["flower-sweep", "hip-bump-sweep", "scissor-sweep", "omoplata-guard"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Overhook Guard & Omoplata",
        notes: "The overhook from closed guard is a no-gi superpower. Omoplata, triangle, and sweep options.",
        techniques: ["omoplata-guard", "triangle-closed-guard", "ato-chain"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Single Leg Finishes",
        notes: "High crotch entry, running the pipe, limp leg counter. Single leg is the most versatile takedown.",
        techniques: ["single-leg-high-c", "whizzer", "sprawl", "russian-tie"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Guard Pull to Immediate Attacks",
        notes: "Guard pull isn't passive. Pull and immediately attack — collar drag, armbar, triangle setups.",
        techniques: ["guard-pull", "armbar-closed-guard", "collar-drag", "cross-collar-guard"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Sweep or Submit",
        notes: "Positional sparring: bottom guard must sweep or submit in 2 minutes. Intensity up.",
        techniques: ["guillotine-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "ato-chain"],
      },
    ],
  },

  // ─── WEEKS 3-4: GUARD PASSING ────────────────────────────────────
  {
    weekNumber: 3,
    theme: "Guard Passing — Pressure",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Headquarters & Knee Cut",
        notes: "Headquarters is the hub. One knee up, one knee down. From here: knee cut is your #1 pass.",
        techniques: ["headquarters", "knee-cut", "posture-grip-break", "side-to-mount"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Body Lock Passing",
        notes: "Without grips, the body lock is king. Clasp hands, flatten them, walk to side control.",
        techniques: ["bodylock-pass", "smash-pass", "headquarters", "side-control-pressure"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Clinch to Takedown",
        notes: "Collar tie to snap down. Russian tie to ankle pick. Underhook to duck under. Setups matter more than the shot.",
        techniques: ["collar-tie", "snap-down", "ankle-pick", "duck-under"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Toreando & Stack Passing",
        notes: "Speed passing with toreando. When they close guard, stack pass. Two different speeds, same goal.",
        techniques: ["toreando", "stack-pass", "knee-cut", "posture-grip-break"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Pass the Guard",
        notes: "King of the hill: passer vs. guard player. Pass = 3 points. Sweep = 3 points. Sub = instant win.",
        techniques: ["bodylock-pass", "toreando", "knee-cut", "headquarters"],
      },
    ],
  },
  {
    weekNumber: 4,
    theme: "Guard Passing — Speed & Combinations",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Over-Under & Leg Drag",
        notes: "When they have an active open guard, over-under pins the hips. Leg drag clears the legs.",
        techniques: ["over-under", "leg-drag", "knee-cut", "side-control-pressure"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Long Step & Smash Pass",
        notes: "From headquarters, the long step is deceptive. If they recover half guard, transition to smash pass.",
        techniques: ["long-step", "smash-pass", "headquarters", "side-to-mount"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Arm Drags & 2-on-1",
        notes: "The arm drag is the great equalizer. Works standing, works seated, works everywhere.",
        techniques: ["arm-drag-back", "russian-tie", "single-leg-high-c", "bodylock-takedown"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Passing De La Riva & Lasso",
        notes: "When they play DLR or lasso, you need specific counters. Strip the hooks, backstep, leg drag.",
        techniques: ["leg-drag", "toreando", "knee-cut", "long-step"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Top Game Gauntlet",
        notes: "Start standing. Take down → pass → pin for 3 seconds → reset. Pure top game pressure.",
        techniques: ["double-leg", "toreando", "bodylock-pass", "side-control-pressure", "mount-control"],
      },
    ],
  },

  // ─── WEEKS 5-6: HALF GUARD & BUTTERFLY ───────────────────────────
  {
    weekNumber: 5,
    theme: "Half Guard — Bottom Game",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Knee Shield & Underhook",
        notes: "Half guard is NOT a bad position if you have the knee shield. Get the underhook, come to your knees, sweep.",
        techniques: ["knee-shield", "underhook-sweep-hg", "hg-to-full-guard", "kimura-half-guard"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Lockdown & Electric Chair",
        notes: "10th Planet half guard system. Lockdown controls the leg, whip up creates the electric chair.",
        techniques: ["lockdown", "electric-chair", "underhook-sweep-hg", "knee-shield"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Fireman's Carry & Bodylock",
        notes: "The fireman's carry is high-risk high-reward. Bodylock is the safe money. Know both.",
        techniques: ["firemans-carry", "bodylock-takedown", "underhook", "whizzer"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Deep Half Guard",
        notes: "When they flatten you in half guard, go deep. Get under them completely. Old school sweep and waiter sweep.",
        techniques: ["deep-half", "old-school-sweep", "kimura-half-guard"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Half Guard Wars",
        notes: "Start in half guard, bottom player sweeps or submits. Top player passes. 2-minute rounds, rotate.",
        techniques: ["knee-shield", "underhook-sweep-hg", "lockdown", "electric-chair", "kimura-half-guard"],
      },
    ],
  },
  {
    weekNumber: 6,
    theme: "Butterfly Guard & Transitions",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Butterfly Sweep Fundamentals",
        notes: "The butterfly hook sweep is the highest percentage sweep in competition. Underhook + elevate.",
        techniques: ["butterfly-sweep", "arm-drag-butterfly", "collar-drag"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Butterfly to Leg Attacks",
        notes: "Butterfly guard transitions beautifully to single leg X and X-guard entries for leg attacks.",
        techniques: ["butterfly-sweep", "butterfly-to-x", "arm-drag-butterfly", "guillotine-butterfly"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Sprawl & Front Headlock",
        notes: "After a good sprawl, you're in front headlock territory. Guillotine, D'Arce, or go behind.",
        techniques: ["sprawl", "front-headlock-control", "guillotine-arm-in", "go-behind-fhl"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "X-Guard & Single Leg X",
        notes: "Entry from butterfly to X-guard. From SLX, technical standup to single leg finish.",
        techniques: ["butterfly-to-x", "x-guard-standup", "slx-standup"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Sweep Machine",
        notes: "Butterfly guard positional rounds. Land on top = win. Chain sweeps, don't settle for one attempt.",
        techniques: ["butterfly-sweep", "butterfly-to-x", "arm-drag-butterfly", "x-guard-standup"],
      },
    ],
  },

  // ─── WEEKS 7-8: MOUNT & SIDE CONTROL ─────────────────────────────
  {
    weekNumber: 7,
    theme: "Mount — The King Position",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Maintaining Mount",
        notes: "Mount is nothing if you can't hold it. Grapevines, head control, swimming the arms. Stay heavy.",
        techniques: ["mount-control", "americana-mount", "cross-choke-mount", "side-to-mount"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Mount Submissions No-Gi",
        notes: "Without collar chokes, mount becomes about arm isolation. Americana, armbar, gift wrap to back.",
        techniques: ["americana-mount", "armbar-mount", "gift-wrap-back", "mount-control"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Throws — Osoto Gari & Ouchi Gari",
        notes: "Reaping throws are the most practical for BJJ. Osoto gari lands you in side control. Ouchi sets up the double.",
        techniques: ["osoto-gari", "ouchi-gari", "collar-tie", "underhook"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Mount Escapes",
        notes: "You WILL get mounted. Trap and roll when they reach. Elbow-knee escape when they're heavy. Never panic.",
        techniques: ["trap-roll", "elbow-knee-escape", "mount-control"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Mount Domination",
        notes: "Start in mount. Top player attacks, bottom escapes. Sub = instant reset. Escape to guard = point.",
        techniques: ["armbar-mount", "americana-mount", "mounted-triangle", "trap-roll", "elbow-knee-escape"],
      },
    ],
  },
  {
    weekNumber: 8,
    theme: "Side Control — Pin & Attack",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Side Control Pressure & Submissions",
        notes: "Crossface and underhook = immovable pin. From there: kimura, americana, far-side armbar.",
        techniques: ["side-control-pressure", "kimura-side-control", "americana-side", "far-armbar-side"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Side Control Transitions",
        notes: "Side control to mount. Side control to knee on belly. Side control to north-south. Always be moving.",
        techniques: ["side-to-mount", "side-to-kob", "kob-pressure", "ns-choke"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Mat Wrestling — Rides & Turns",
        notes: "Top pressure from referee's position. Spiral ride, half nelson, turk ride. Control and turn.",
        techniques: ["spiral-ride", "half-nelson", "turk-ride", "ref-position-bottom"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Side Control Escapes",
        notes: "Frame, shrimp, recover guard. If they're heavy, underhook escape to knees. Ghost escape as a backup.",
        techniques: ["shrimp-escape-sc", "underhook-escape-sc", "ghost-escape"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Pin to Finish",
        notes: "Start in side control. Top player must submit in 2 minutes. No stalling — constant attacks.",
        techniques: ["kimura-side-control", "far-armbar-side", "side-to-mount", "ns-choke", "kob-pressure"],
      },
    ],
  },

  // ─── WEEKS 9-10: BACK CONTROL & TURTLE ───────────────────────────
  {
    weekNumber: 9,
    theme: "Taking the Back",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Back Takes from Everywhere",
        notes: "Arm drag from guard. Seatbelt from turtle. Gift wrap from mount. The back is the promised land.",
        techniques: ["arm-drag-butterfly", "seatbelt-back-take", "gift-wrap-back", "seatbelt-hooks"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "RNC Finishing Mechanics",
        notes: "Getting to the back is useless if you can't finish. Chin strap, seat belt control, RNC mechanics.",
        techniques: ["rnc", "short-choke", "seatbelt-hooks", "body-triangle"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Wrestling Stand-Ups & Escapes",
        notes: "Bottom wrestling is about standing up or switching. Base, hand fight, posture, stand.",
        techniques: ["standup-wrestling", "switch", "sit-out-turn-in", "ref-position-bottom"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Gi Back Attacks",
        notes: "The bow and arrow is the highest percentage gi choke. Cross collar from back. Clock choke transitions.",
        techniques: ["bow-arrow", "rnc", "armbar-back", "clock-choke"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Back Attack Cycles",
        notes: "Start on back. If they escape, you must retake within 10 seconds or switch. Non-stop pressure.",
        techniques: ["rnc", "short-choke", "armbar-back", "body-triangle", "seatbelt-hooks"],
      },
    ],
  },
  {
    weekNumber: 10,
    theme: "Turtle & Back Escapes",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Turtle Defense & Escapes",
        notes: "Turtle is where you survive when things go wrong. Elbows tight, protect neck. Sit-out or granby to recover.",
        techniques: ["turtle-defense", "sit-out", "granby-roll", "seatbelt-back-take"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Back Escape Systems",
        notes: "When they have your back: fight the hands first (2-on-1), get to the mat side, strip hooks sequentially.",
        techniques: ["back-escape-shoulder", "back-escape-hands", "turtle-defense"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Front Headlock Series",
        notes: "Snap down to front headlock. From here you have three doors: guillotine, D'Arce, or go behind.",
        techniques: ["snap-down", "front-headlock-control", "guillotine-arm-in", "darce", "go-behind-fhl"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Attacking the Turtle",
        notes: "When opponent turtles: seatbelt first, then hooks. Clock choke if they're stubborn. Crucifix if they reach.",
        techniques: ["seatbelt-back-take", "clock-choke", "crucifix-control", "crucifix-choke"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Escape & Counter",
        notes: "Start with opponent on your back. Escape and immediately counter-attack. Defense IS offense.",
        techniques: ["back-escape-hands", "back-escape-shoulder", "sit-out", "arm-drag-back"],
      },
    ],
  },

  // ─── WEEKS 11-12: STANDING & LEG LOCKS ───────────────────────────
  {
    weekNumber: 11,
    theme: "Standing Game & Clinch",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "Judo for BJJ",
        notes: "Grip fighting → kuzushi (off-balance) → throw. Osoto, seoi nage, harai goshi. Land in side control.",
        techniques: ["osoto-gari", "seoi-nage", "collar-tie", "guard-pull"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "No-Gi Takedown Systems",
        notes: "Without the gi: underhook + collar tie controls everything. Double leg off the cage/wall. Single leg finishes.",
        techniques: ["double-leg", "single-leg-high-c", "bodylock-takedown", "snap-down"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Advanced Takedowns",
        notes: "Low single leg, duck under, fireman's carry. Reading your opponent and choosing the right attack.",
        techniques: ["single-leg-low", "duck-under", "firemans-carry", "ankle-pick"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Takedown Defense & Guard Pulling",
        notes: "Sprawl mechanics, whizzer counters, and tactical guard pulls. Sometimes pulling guard IS the smart play.",
        techniques: ["sprawl", "whizzer", "crossface-defense", "guard-pull"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Takedown Tournament",
        notes: "Stand-up only rounds. First takedown wins. Reset and go again. Build that killer instinct on the feet.",
        techniques: ["double-leg", "single-leg-high-c", "arm-drag-back", "snap-down", "sprawl"],
      },
    ],
  },
  {
    weekNumber: 12,
    theme: "Leg Locks & Open Guard Mastery",
    classes: [
      {
        dayOfWeek: 1,
        discipline: "gi",
        title: "De La Riva & Reverse DLR",
        notes: "DLR is the gateway guard. Hook the lead leg, control the ankle, sweep or take the back.",
        techniques: ["dlr-control", "dlr-sweep-basic", "rdlr-sweep", "berimbolo"],
      },
      {
        dayOfWeek: 2,
        discipline: "nogi",
        title: "Leg Lock Fundamentals",
        notes: "Ashi garami control. Straight ankle lock — the only legal white belt leg lock. Heel hook awareness.",
        techniques: ["straight-ankle", "ashi-garami", "leg-lock-defense", "inside-heel-hook"],
      },
      {
        dayOfWeek: 3,
        discipline: "wrestling",
        title: "Throws — Harai Goshi & Uchi Mata",
        notes: "Advanced hip throws. These require timing and commitment. Drill the entry 100 times.",
        techniques: ["harai-goshi", "uchi-mata", "lateral-drop", "seoi-nage"],
      },
      {
        dayOfWeek: 4,
        discipline: "gi",
        title: "Spider Guard & Lasso",
        notes: "Feet on biceps = distance control. Lasso wraps take away their posture. Sweep city.",
        techniques: ["spider-guard", "lasso-guard", "spider-sweep", "lasso-sweep", "triangle-lasso"],
      },
      {
        dayOfWeek: 5,
        discipline: "nogi",
        title: "Competition: Full Match Simulation",
        notes: "6-minute rounds with full rules. Takedowns, guard, passes, submissions — put it all together.",
        techniques: ["double-leg", "butterfly-sweep", "rnc", "armbar-closed-guard", "toreando"],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// CLASS TEMPLATES — Reusable lesson plans for coaches
// ═══════════════════════════════════════════════════════════════════

export interface TemplateSeed {
  name: string;
  discipline: "gi" | "nogi" | "wrestling";
  warmup: string;
  notes: string;
  techniques: string[]; // slugs
}

export const CLASS_TEMPLATES: TemplateSeed[] = [
  // ── Gi Templates ──
  {
    name: "Closed Guard Fundamentals",
    discipline: "gi",
    warmup: "Shrimping, bridging, guard retention drills",
    notes: "Core closed guard attacks and sweeps. Good for all levels.",
    techniques: ["armbar-closed-guard", "triangle-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "scissor-sweep"],
  },
  {
    name: "Guard Passing 101",
    discipline: "gi",
    warmup: "Knee cut drills, hip switch movement",
    notes: "The three fundamental passes every grappler needs.",
    techniques: ["toreando", "knee-cut", "stack-pass", "headquarters", "posture-grip-break"],
  },
  {
    name: "Mount Attack System",
    discipline: "gi",
    warmup: "Mount retention drills, swim-the-arms",
    notes: "Maintaining mount and attacking with collar chokes and armbars.",
    techniques: ["mount-control", "cross-choke-mount", "armbar-mount", "americana-mount", "ezekiel-mount"],
  },
  {
    name: "Side Control Mastery",
    discipline: "gi",
    warmup: "Side control switching drills, hip escapes",
    notes: "Attacks from side control and transitions to mount/KOB.",
    techniques: ["side-control-pressure", "kimura-side-control", "americana-side", "side-to-mount", "side-to-kob"],
  },
  {
    name: "Half Guard Bottom",
    discipline: "gi",
    warmup: "Half guard retention, underhook pummel drills",
    notes: "Knee shield system and sweep options from bottom half.",
    techniques: ["knee-shield", "underhook-sweep-hg", "old-school-sweep", "deep-half", "kimura-half-guard"],
  },
  {
    name: "Back Attack Clinic",
    discipline: "gi",
    warmup: "Seatbelt entry drills, hook insertion",
    notes: "Taking the back and finishing with collar chokes.",
    techniques: ["seatbelt-hooks", "rnc", "bow-arrow", "armbar-back", "body-triangle"],
  },
  {
    name: "Open Guard — Spider & Lasso",
    discipline: "gi",
    warmup: "Feet on bicep drills, hip mobility",
    notes: "Distance management guards for the gi.",
    techniques: ["spider-guard", "lasso-guard", "spider-sweep", "lasso-sweep", "triangle-lasso"],
  },
  {
    name: "De La Riva Day",
    discipline: "gi",
    warmup: "DLR hook retention, inversion drills",
    notes: "DLR control, sweeps, and berimbolo for advanced students.",
    techniques: ["dlr-control", "dlr-sweep-basic", "rdlr-sweep", "dlr-to-x", "berimbolo"],
  },
  {
    name: "Escape Class",
    discipline: "gi",
    warmup: "Bridging, shrimping, turtle drills",
    notes: "Survival and escape from every bad position. Critical for beginners.",
    techniques: ["trap-roll", "elbow-knee-escape", "shrimp-escape-sc", "underhook-escape-sc", "back-escape-hands"],
  },
  {
    name: "Judo for BJJ",
    discipline: "gi",
    warmup: "Breakfalls, grip fighting, footwork",
    notes: "The throws that translate best to BJJ competition.",
    techniques: ["osoto-gari", "ouchi-gari", "seoi-nage", "collar-tie", "guard-pull"],
  },

  // ── No-Gi Templates ──
  {
    name: "No-Gi Closed Guard",
    discipline: "nogi",
    warmup: "Guard retention, overhook drills",
    notes: "Closed guard attacks without grips — guillotine, kimura, hip bump.",
    techniques: ["guillotine-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "ato-chain"],
  },
  {
    name: "Body Lock Passing",
    discipline: "nogi",
    warmup: "Pressure passing drills, body lock entries",
    notes: "The dominant no-gi passing system. Clasp and crush.",
    techniques: ["bodylock-pass", "smash-pass", "long-step", "headquarters", "side-control-pressure"],
  },
  {
    name: "Front Headlock Series",
    discipline: "nogi",
    warmup: "Snap down drills, chin strap entries",
    notes: "The front headlock is a choke factory. Guillotine, D'Arce, anaconda.",
    techniques: ["front-headlock-control", "guillotine-arm-in", "guillotine-high-elbow", "darce", "anaconda"],
  },
  {
    name: "Butterfly & X-Guard",
    discipline: "nogi",
    warmup: "Butterfly hook insertion, elevation drills",
    notes: "Butterfly sweeps and transitions to X-guard and leg attacks.",
    techniques: ["butterfly-sweep", "butterfly-to-x", "x-guard-standup", "slx-standup", "arm-drag-butterfly"],
  },
  {
    name: "Leg Lock Fundamentals",
    discipline: "nogi",
    warmup: "Ashi garami entries, leg pummeling",
    notes: "Straight ankle lock, heel hook mechanics, and defense.",
    techniques: ["straight-ankle", "ashi-garami", "inside-heel-hook", "leg-lock-defense", "heel-hook-slx"],
  },
  {
    name: "No-Gi Back Attacks",
    discipline: "nogi",
    warmup: "Seatbelt drills, body triangle practice",
    notes: "Taking the back and finishing without the collar.",
    techniques: ["seatbelt-hooks", "rnc", "short-choke", "body-triangle", "armbar-back"],
  },
  {
    name: "Takedown to Pass",
    discipline: "nogi",
    warmup: "Level change, penetration step, sprawl drills",
    notes: "Complete sequence: takedown → pass → pin. Top game chain.",
    techniques: ["double-leg", "single-leg-high-c", "bodylock-pass", "toreando", "side-control-pressure"],
  },
  {
    name: "Competition Simulation",
    discipline: "nogi",
    warmup: "Full body warm-up, match pace drilling",
    notes: "Full 6-minute rounds with ADCC/competition rules. Put it all together.",
    techniques: ["double-leg", "butterfly-sweep", "rnc", "armbar-closed-guard", "toreando"],
  },

  // ── Wrestling Templates ──
  {
    name: "Takedown Fundamentals",
    discipline: "wrestling",
    warmup: "Stance & motion, level change, penetration step",
    notes: "Double leg and single leg — the two pillars of wrestling for BJJ.",
    techniques: ["double-leg", "single-leg-high-c", "sprawl", "collar-tie", "underhook"],
  },
  {
    name: "Advanced Takedowns",
    discipline: "wrestling",
    warmup: "Chain wrestling drills, fakes and setups",
    notes: "Low single, fireman's carry, duck under, ankle pick. Expand the toolbox.",
    techniques: ["single-leg-low", "firemans-carry", "duck-under", "ankle-pick", "bodylock-takedown"],
  },
  {
    name: "Clinch & Throws",
    discipline: "wrestling",
    warmup: "Pummeling, overhook/underhook cycles",
    notes: "Controlling the clinch and executing throws for BJJ.",
    techniques: ["osoto-gari", "ouchi-gari", "bodylock-takedown", "lateral-drop", "whizzer"],
  },
  {
    name: "Mat Wrestling",
    discipline: "wrestling",
    warmup: "Referee position drills, ride switching",
    notes: "Top rides and bottom escapes from referee's position.",
    techniques: ["standup-wrestling", "switch", "sit-out-turn-in", "spiral-ride", "half-nelson"],
  },
  {
    name: "Front Headlock & Snap Downs",
    discipline: "wrestling",
    warmup: "Collar tie snapping, chin strap grip",
    notes: "Using the snap down to create front headlock opportunities.",
    techniques: ["snap-down", "front-headlock-control", "guillotine-arm-in", "go-behind-fhl", "darce"],
  },
];

// ═══════════════════════════════════════════════════════════════════
// SPARRING LOG TEMPLATES — Realistic sparring entries
// ═══════════════════════════════════════════════════════════════════

export interface SparringLogSeed {
  partner: string;
  rounds: number;
  duration: number;
  mood: string;
  notes: string;
  submissions: string[];
  caughtIn: string[];
  positions: string[];
  daysAgo: number;
}

export const SPARRING_LOGS: SparringLogSeed[] = [
  // Sam (experienced, diverse game)
  { partner: "Alex", rounds: 5, duration: 5, mood: "great", notes: "Focused on back takes today. Got 3 RNCs, Alex is getting harder to submit.", submissions: ["rnc", "rnc", "armbar"], caughtIn: ["triangle"], positions: ["back-control", "closed-guard", "mount"], daysAgo: 1 },
  { partner: "Morgan", rounds: 4, duration: 6, mood: "tough", notes: "Morgan's guard is a maze. Couldn't pass for the first 3 rounds. Finally hit a knee cut in round 4.", submissions: [], caughtIn: ["kimura", "omoplata"], positions: ["guard-top", "half-guard", "side-control"], daysAgo: 3 },
  { partner: "Jordan", rounds: 3, duration: 5, mood: "good", notes: "Working on my teaching while rolling. Let Jordan work positions then countered. Good for both of us.", submissions: ["darce"], caughtIn: [], positions: ["front-headlock", "side-control", "mount"], daysAgo: 5 },
  { partner: "Visiting Purple", rounds: 4, duration: 5, mood: "tough", notes: "Visitor from Atos. Incredible pressure passer. I need to work on my butterfly guard retention.", submissions: [], caughtIn: ["rnc"], positions: ["butterfly-guard", "half-guard", "turtle"], daysAgo: 8 },

  // Alex (intermediate, finding their game)
  { partner: "Sam", rounds: 5, duration: 5, mood: "good", notes: "Better defense today! Survived Sam's back attack for almost a full round. Hip bump sweep worked twice.", submissions: ["hip-bump-sweep"], caughtIn: ["rnc", "armbar"], positions: ["closed-guard", "back-control", "mount"], daysAgo: 1 },
  { partner: "Jordan", rounds: 4, duration: 5, mood: "great", notes: "Everything clicked today. Hit the D'Arce I've been drilling for weeks. Jordan's improving fast though.", submissions: ["darce", "guillotine"], caughtIn: [], positions: ["front-headlock", "closed-guard", "side-control"], daysAgo: 4 },
  { partner: "Morgan", rounds: 3, duration: 5, mood: "tough", notes: "Morgan is a different animal. Submitted me 4 times. But I escaped mount twice so that's progress.", submissions: [], caughtIn: ["rnc", "armbar", "kimura", "triangle"], positions: ["mount", "back-control", "side-control"], daysAgo: 7 },

  // Jordan (newer, lots of learning)
  { partner: "Alex", rounds: 4, duration: 5, mood: "okay", notes: "Got caught a lot but I'm learning to frame. Almost hit a scissor sweep!", submissions: [], caughtIn: ["darce", "guillotine"], positions: ["closed-guard", "side-control", "turtle"], daysAgo: 1 },
  { partner: "Sam", rounds: 3, duration: 5, mood: "tough", notes: "Sam was nice about it but I couldn't do anything. Need to work on my closed guard defense.", submissions: [], caughtIn: ["armbar", "rnc", "kimura"], positions: ["closed-guard", "mount", "back-control"], daysAgo: 6 },

  // Morgan (most experienced, controlled game)
  { partner: "Sam", rounds: 4, duration: 6, mood: "good", notes: "Good technical rolls with Sam. We're getting evenly matched at the higher level. Worked on my lasso guard.", submissions: ["omoplata", "kimura"], caughtIn: [], positions: ["open-guard", "half-guard", "mount"], daysAgo: 2 },
  { partner: "Alex", rounds: 3, duration: 5, mood: "good", notes: "Alex is getting dangerous with that D'Arce. Had to respect it. Focused on mount transitions.", submissions: ["armbar", "rnc", "triangle", "kimura"], caughtIn: [], positions: ["mount", "back-control", "side-control"], daysAgo: 5 },
];

// ═══════════════════════════════════════════════════════════════════
// TRAINING LOG TEMPLATES — Journal entries
// ═══════════════════════════════════════════════════════════════════

export interface TrainingLogSeed {
  title: string;
  content: string;
  mood: string;
  energy: number;
  tags: string[];
  daysAgo: number;
}

export const TRAINING_LOGS: TrainingLogSeed[] = [
  { title: "Back attack breakthrough", content: "Finally understanding the seatbelt mechanics. When I keep my elbow glued to their hip, they can't escape. The RNC finish is about patience — wait for them to make a mistake defending.", mood: "great", energy: 5, tags: ["back-control", "rnc", "breakthrough"], daysAgo: 1 },
  { title: "Frustrating day", content: "Couldn't pass anyone's guard today. My toreando keeps getting countered because I'm telegraphing it. Need to set up with a knee cut fake first.", mood: "tough", energy: 3, tags: ["passing", "frustration", "needs-work"], daysAgo: 3 },
  { title: "Competition prep notes", content: "Game plan for Saturday: pull guard to butterfly, sweep to mount, arm attack from top. If they pull, knee cut to side control. Don't chase submissions from guard.", mood: "good", energy: 4, tags: ["competition", "game-plan", "strategy"], daysAgo: 5 },
  { title: "Drilling session", content: "200 reps of knee cut pass. 100 reps of armbar from mount. My hands are sore but the movement is becoming automatic. That's the point.", mood: "good", energy: 4, tags: ["drilling", "reps", "fundamentals"], daysAgo: 7 },
  { title: "Open mat discoveries", content: "Rolled with a wrestler today and my takedown defense was embarrassing. Need to spend more time on sprawls and front headlock entries. My guard is good but I can't keep pulling in competition.", mood: "okay", energy: 3, tags: ["open-mat", "takedowns", "weakness"], daysAgo: 10 },
  { title: "Best class ever", content: "Coach showed the connection between the kimura from closed guard and the hip bump sweep. When they defend the kimura by pulling their arm back, that's when you hip bump! Mind = blown.", mood: "great", energy: 5, tags: ["closed-guard", "kimura", "hip-bump", "connection"], daysAgo: 12 },
  { title: "First competition", content: "Lost my first match by points. Got taken down and couldn't escape side control. But I learned more in 5 minutes of competition than 5 weeks of training. Signing up for the next one.", mood: "okay", energy: 4, tags: ["competition", "first-time", "learning"], daysAgo: 18 },
  { title: "Half guard epiphany", content: "The knee shield isn't just a frame — it's a distance manager. When they get too close, I extend. When they back off, I attack the underhook. It's a lever, not a wall.", mood: "great", energy: 5, tags: ["half-guard", "knee-shield", "conceptual"], daysAgo: 22 },
];

// ═══════════════════════════════════════════════════════════════════
// FEED POST TEMPLATES — Social feed activity
// ═══════════════════════════════════════════════════════════════════

export interface FeedPostSeed {
  type: "checkin" | "milestone" | "badge" | "note" | "challenge";
  content: string;
  daysAgo: number;
  studentIndex: number; // which student
}

export const FEED_POSTS: FeedPostSeed[] = [
  // Recent activity (last 2 weeks)
  { type: "checkin", content: "Monday morning class. Started the week right. Closed guard fundamentals never get old.", studentIndex: 1, daysAgo: 0 },
  { type: "note", content: "Key insight: the hip bump sweep works so much better when you commit fully to the bump. Half-measures get you nowhere.", studentIndex: 1, daysAgo: 1 },
  { type: "checkin", content: "Hit my first D'Arce in sparring! All those reps are paying off.", studentIndex: 0, daysAgo: 1 },
  { type: "challenge", content: "Who can get 5 training sessions in this week? Let's build that streak!", studentIndex: 0, daysAgo: 2 },
  { type: "checkin", content: "Back from vacation. Body feels rusty but the techniques are still there. Muscle memory is real.", studentIndex: 3, daysAgo: 2 },
  { type: "milestone", content: "Just completed all Explorer milestone techniques. Traveler stage unlocked!", studentIndex: 3, daysAgo: 3 },
  { type: "checkin", content: "Week 3 of training! Everything is still confusing but I survived a 5-minute round without getting tapped. Progress!", studentIndex: 2, daysAgo: 3 },
  { type: "note", content: "When passing guard: posture first, grips second, pass third. I keep rushing to step 3.", studentIndex: 0, daysAgo: 4 },
  { type: "checkin", content: "Drilling day. 200 reps of knee cut. My legs are jelly but the pass is getting smoother.", studentIndex: 1, daysAgo: 4 },
  { type: "checkin", content: "Open mat with visitors from 3 different gyms. Got humbled. Got better.", studentIndex: 1, daysAgo: 5 },
  { type: "note", content: "The RNC isn't about squeezing harder. It's about making the space smaller. Elbows together, walk your hand behind the head.", studentIndex: 3, daysAgo: 5 },
  { type: "checkin", content: "First time doing takedown sparring. Got sprawled on 100 times. My legs are destroyed. Worth it.", studentIndex: 2, daysAgo: 6 },
  { type: "checkin", content: "Saturday open mat. Rolled for 90 minutes straight. This is the best therapy.", studentIndex: 0, daysAgo: 7 },
  { type: "note", content: "Competition debrief: I need to be more aggressive in the first minute. Playing passive lets them set their grips.", studentIndex: 1, daysAgo: 8 },
  { type: "checkin", content: "Night class. Small group, lots of mat time. Worked exclusively on guard recovery today.", studentIndex: 3, daysAgo: 9 },
  { type: "checkin", content: "I can now shrimp properly! Coach said my hip escape was clean for the first time. Small wins.", studentIndex: 2, daysAgo: 10 },
  { type: "challenge", content: "30-day challenge: hit at least one sweep from every guard position. Starting with closed guard.", studentIndex: 3, daysAgo: 11 },
  { type: "checkin", content: "Competed in the local tournament. Lost first match but won the absolute division consolation. Learning experience.", studentIndex: 1, daysAgo: 14 },
  { type: "note", content: "Half guard bottom isn't about surviving — it's about controlling distance with the knee shield and attacking the underhook.", studentIndex: 0, daysAgo: 16 },
  { type: "checkin", content: "Started training no-gi for the first time. It's SO different without grips. Everything is faster and slippier.", studentIndex: 2, daysAgo: 18 },
];

// ═══════════════════════════════════════════════════════════════════
// COMPETITION TEMPLATES — Competition history
// ═══════════════════════════════════════════════════════════════════

export interface CompetitionSeed {
  name: string;
  date: string;
  location: string;
  discipline: "gi" | "nogi" | "both";
  weightClass: string;
  result: string;
  wins: number;
  losses: number;
  submissionBy: string | null;
  submittedBy: string | null;
  notes: string;
  studentIndex: number;
}

export const COMPETITIONS: CompetitionSeed[] = [
  {
    name: "IBJJF Atlanta Open",
    date: "2026-02-14",
    location: "Atlanta, GA",
    discipline: "gi",
    weightClass: "Medium Heavy",
    result: "silver",
    wins: 3,
    losses: 1,
    submissionBy: "armbar",
    submittedBy: "bow-arrow",
    notes: "Best competition yet. Won 3 by submission, lost in the final to a bow and arrow from back. Need to work on back escapes under pressure.",
    studentIndex: 1,
  },
  {
    name: "Good Fight Sub Only",
    date: "2026-01-25",
    location: "Orlando, FL",
    discipline: "nogi",
    weightClass: "170 lbs",
    result: "gold",
    wins: 4,
    losses: 0,
    submissionBy: "rnc",
    submittedBy: null,
    notes: "Submission only format suits my game. Won all 4 by RNC. Back take game is on point.",
    studentIndex: 3,
  },
  {
    name: "Grappling Industries Miami",
    date: "2026-02-01",
    location: "Miami, FL",
    discipline: "both",
    weightClass: "Middleweight",
    result: "bronze",
    wins: 2,
    losses: 2,
    submissionBy: "triangle",
    submittedBy: "heel-hook",
    notes: "2-2 in the round robin. Won gi matches, lost no-gi. Leg lock defense needs major work.",
    studentIndex: 0,
  },
  {
    name: "Local In-House Tournament",
    date: "2026-02-08",
    location: "Roots Collective",
    discipline: "gi",
    weightClass: "Featherweight",
    result: "loss",
    wins: 0,
    losses: 2,
    submissionBy: null,
    submittedBy: "armbar",
    notes: "First tournament ever! Lost both matches but learned so much. Need to work on side control escapes. The intensity is way different than training.",
    studentIndex: 2,
  },
];
