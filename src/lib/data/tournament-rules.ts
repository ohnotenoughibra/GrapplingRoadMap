// ─── Tournament Rules Reference Data ────────────────────────────────

export interface PointAction {
  action: string;
  points: number;
  notes?: string;
}

export interface TimeDivision {
  division: string;
  time: string;
}

export interface Penalty {
  infraction: string;
  consequence: string;
}

export interface Ruleset {
  id: string;
  name: string;
  shortName: string;
  description: string;
  format: string; // "Gi" | "No-Gi" | "Both"
  color: string;
  scoring: PointAction[];
  matchTimes: TimeDivision[];
  advantages?: string;
  penalties: Penalty[];
  submissions: { allowed: string[]; banned: string[] };
  winConditions: string[];
  keyRules: string[];
}

export const TOURNAMENT_RULES: Ruleset[] = [
  {
    id: "ibjjf-gi",
    name: "International Brazilian Jiu-Jitsu Federation",
    shortName: "IBJJF Gi",
    description:
      "The gold standard of competitive BJJ. Gi-based competition with a structured point system, advantages, and belt-specific match times.",
    format: "Gi",
    color: "gi",
    scoring: [
      { action: "Takedown", points: 2, notes: "From standing to top control" },
      { action: "Sweep", points: 2, notes: "From guard to top position" },
      { action: "Knee on Belly", points: 2, notes: "Must stabilize for 3 seconds" },
      { action: "Guard Pass", points: 3, notes: "Must clear legs and establish control" },
      { action: "Mount", points: 4, notes: "Full mount or technical mount" },
      { action: "Back Control", points: 4, notes: "Seatbelt + hooks or body triangle" },
      { action: "Back Mount", points: 4, notes: "Back with both hooks in" },
    ],
    matchTimes: [
      { division: "White Belt Adult", time: "5 min" },
      { division: "Blue Belt Adult", time: "6 min" },
      { division: "Purple Belt Adult", time: "7 min" },
      { division: "Brown Belt Adult", time: "8 min" },
      { division: "Black Belt Adult", time: "10 min" },
      { division: "Juvenile", time: "5 min" },
      { division: "Master 1-6", time: "5-6 min" },
    ],
    advantages:
      "Advantages are awarded for near-scoring actions (e.g., almost passing guard, close submission attempts). Advantages break ties when points are equal. An advantage is worth less than a point but more than a penalty on the opponent.",
    penalties: [
      { infraction: "Stalling / lack of combativeness", consequence: "Penalty (advantage to opponent)" },
      { infraction: "Pulling guard without grip", consequence: "Penalty (2 points to opponent if both pull)" },
      { infraction: "Reaping the knee (below brown belt)", consequence: "Immediate DQ" },
      { infraction: "Slamming from guard", consequence: "Immediate DQ" },
      { infraction: "Heel hooks (all belt levels in Gi)", consequence: "Immediate DQ" },
      { infraction: "Neck cranks without choke", consequence: "Immediate DQ" },
      { infraction: "Scissor takedown", consequence: "Immediate DQ" },
    ],
    submissions: {
      allowed: [
        "All chokes (including lapel)",
        "Armbar",
        "Kimura",
        "Americana",
        "Omoplata",
        "Wrist locks (brown/black)",
        "Straight ankle lock (all belts)",
        "Kneebar (brown/black)",
        "Toe hold (brown/black)",
        "Calf slicer (brown/black)",
      ],
      banned: [
        "Heel hooks (all belts in Gi)",
        "Reaping (white through purple)",
        "Wrist locks (white through purple)",
        "Kneebar (white through purple)",
        "Toe hold (white through purple)",
        "Calf slicer (white through purple)",
        "Scissor takedown",
        "Slam",
        "Neck cranks",
        "Spine locks (can opener)",
      ],
    },
    winConditions: [
      "Submission",
      "Points (most points wins)",
      "Advantages (if points tied)",
      "Penalties on opponent (if advantages tied)",
      "Referee decision (as last resort)",
    ],
    keyRules: [
      "Points scored only when position is stabilized for 3 seconds",
      "No points awarded until guard is cleared during a pass",
      "Guard pull is not scored — pulling guard gives no points to either",
      "If both athletes pull guard, one must come up within 20s or penalty",
      "Knee reaping allowed at brown/black only",
      "Close-out matches are allowed (teammates can split medals)",
    ],
  },
  {
    id: "ibjjf-nogi",
    name: "IBJJF No-Gi Rules",
    shortName: "IBJJF No-Gi",
    description:
      "IBJJF no-gi competition follows the same point structure as Gi but with expanded leg lock rules at certain experience levels. No gripping the clothing.",
    format: "No-Gi",
    color: "nogi",
    scoring: [
      { action: "Takedown", points: 2 },
      { action: "Sweep", points: 2 },
      { action: "Knee on Belly", points: 2 },
      { action: "Guard Pass", points: 3 },
      { action: "Mount", points: 4 },
      { action: "Back Control", points: 4 },
    ],
    matchTimes: [
      { division: "Beginner / Intermediate", time: "5 min" },
      { division: "Advanced", time: "7 min" },
      { division: "No-Gi Worlds (Advanced)", time: "8 min" },
    ],
    advantages:
      "Same advantage system as Gi. Near-scoring attempts earn advantages as tiebreakers.",
    penalties: [
      { infraction: "Grabbing clothing (shorts, rashguard)", consequence: "Penalty" },
      { infraction: "Stalling", consequence: "Penalty (advantage to opponent)" },
      { infraction: "Slamming", consequence: "Immediate DQ" },
    ],
    submissions: {
      allowed: [
        "All chokes (RNC, guillotine, D'arce, etc.)",
        "Armbar / Kimura / Americana",
        "Straight ankle lock (all levels)",
        "Kneebar (advanced)",
        "Toe hold (advanced)",
        "Calf slicer (advanced)",
        "Heel hook — inside (advanced, since rule changes)",
        "Heel hook — outside (advanced, since rule changes)",
      ],
      banned: [
        "Heel hooks (beginner/intermediate)",
        "Reaping (beginner/intermediate)",
        "Wrist locks (beginner/intermediate)",
        "Neck cranks",
        "Slams",
        "Scissor takedown",
      ],
    },
    winConditions: [
      "Submission",
      "Points",
      "Advantages",
      "Referee decision",
    ],
    keyRules: [
      "Same 3-second stabilization rule as Gi",
      "No gi grips — can't grab shorts, rashguard, or any clothing",
      "Advanced division has full leg lock access including heel hooks",
      "Must wear ranked rashguard (color matches experience level)",
    ],
  },
  {
    id: "adcc",
    name: "Abu Dhabi Combat Club",
    shortName: "ADCC",
    description:
      "The most prestigious submission grappling event. Unique two-phase scoring: no points in the first half, full points in the second. Penalizes guard pulling. Rewards aggression.",
    format: "No-Gi",
    color: "nogi",
    scoring: [
      { action: "Takedown (to top)", points: 2, notes: "Clean takedown landing in top" },
      { action: "Takedown (to dominant)", points: 4, notes: "Takedown landing in mount, back, or side" },
      { action: "Clean Sweep", points: 2, notes: "Guard to top position" },
      { action: "Sweep to Dominant", points: 4, notes: "Sweep directly to mount, back, or knee on belly" },
      { action: "Knee on Belly", points: 2, notes: "Established knee on belly" },
      { action: "Guard Pass", points: 3, notes: "Clearing guard to side control or better" },
      { action: "Mount", points: 2, notes: "Full mount (NOT 4 like IBJJF)" },
      { action: "Back Mount", points: 3, notes: "Back control with hooks" },
    ],
    matchTimes: [
      { division: "66kg / 77kg / 88kg / 99kg / +99kg (Men)", time: "10 min" },
      { division: "Absolute (Men)", time: "20 min" },
      { division: "55kg / 65kg / +65kg (Women)", time: "8 min" },
      { division: "ADCC Trials", time: "10 min" },
    ],
    penalties: [
      { infraction: "Pulling guard (without attack)", consequence: "-1 point penalty" },
      { infraction: "Passivity / stalling", consequence: "Penalty point, then referee stand-up" },
      { infraction: "Fleeing the mat", consequence: "Penalty" },
      { infraction: "Intentional slamming", consequence: "Warning, then DQ" },
    ],
    submissions: {
      allowed: [
        "All chokes",
        "All arm locks",
        "All leg locks including heel hooks",
        "Kneebar",
        "Toe hold",
        "Calf slicer",
        "Wrist locks",
        "Neck cranks",
        "Twister",
        "Reaping is fully legal",
      ],
      banned: [
        "Full nelson",
        "Striking",
        "Biting",
        "Eye gouging",
        "Groin attacks",
        "Small joint manipulation (fingers/toes)",
      ],
    },
    winConditions: [
      "Submission (always wins regardless of points)",
      "Points (counted only in second half of match)",
      "Penalty differential",
      "Referee decision (if all else tied)",
    ],
    keyRules: [
      "FIRST HALF: No points scored — submission only period",
      "SECOND HALF: Points begin counting (same actions, now score)",
      "Guard pulling = automatic -1 point penalty",
      "Overtime: Ride time — one athlete starts on back, must escape or submit in time limit",
      "All leg locks legal for all competitors",
      "No advantages system — only points, penalties, and subs",
      "Considered the highest level of submission grappling competition",
    ],
  },
  {
    id: "naga",
    name: "North American Grappling Association",
    shortName: "NAGA",
    description:
      "One of the largest amateur grappling organizations. Offers both Gi and No-Gi divisions with beginner-friendly rules. Popular first tournament for many competitors.",
    format: "Both",
    color: "wrestling",
    scoring: [
      { action: "Takedown", points: 2 },
      { action: "Sweep", points: 2 },
      { action: "Knee on Belly", points: 2 },
      { action: "Guard Pass", points: 3 },
      { action: "Mount", points: 4 },
      { action: "Back Mount (hooks in)", points: 4 },
    ],
    matchTimes: [
      { division: "Novice (< 6 months)", time: "5 min" },
      { division: "Beginner (6-18 months)", time: "5 min" },
      { division: "Intermediate (18+ months)", time: "6 min" },
      { division: "Advanced / Expert", time: "7 min" },
    ],
    penalties: [
      { infraction: "Stalling", consequence: "Warning, then penalty point" },
      { infraction: "Slamming", consequence: "DQ" },
    ],
    submissions: {
      allowed: [
        "All chokes",
        "All armlocks",
        "Straight ankle lock (all)",
        "Kneebar (intermediate+)",
        "Toe hold (intermediate+)",
        "Heel hooks (expert no-gi only)",
        "Calf slicer (intermediate+)",
      ],
      banned: [
        "Heel hooks (all Gi divisions)",
        "Heel hooks (beginner no-gi)",
        "Neck cranks (novice/beginner)",
        "Wrist locks (novice/beginner)",
        "Slam from any position",
      ],
    },
    winConditions: [
      "Submission",
      "Points",
      "Referee decision",
    ],
    keyRules: [
      "Experience-based divisions (not belt-based)",
      "Good entry-level tournament for beginners",
      "Same-day weigh-ins",
      "Round-robin format in small brackets",
      "Heel hooks only in expert no-gi",
    ],
  },
  {
    id: "ajp",
    name: "Abu Dhabi Jiu-Jitsu Pro (AJP Tour)",
    shortName: "AJP / UAEJJF",
    description:
      "The global professional BJJ tour backed by the UAE. Runs the Abu Dhabi World Pro and the AJP Tour Grand Slams. Point system similar to IBJJF with some key differences.",
    format: "Both",
    color: "gi",
    scoring: [
      { action: "Takedown", points: 2 },
      { action: "Takedown to Dominant", points: 4, notes: "Landing in mount, back, or KOB" },
      { action: "Sweep", points: 2 },
      { action: "Knee on Belly", points: 2 },
      { action: "Guard Pass", points: 3 },
      { action: "Mount", points: 4 },
      { action: "Back Control", points: 4 },
    ],
    matchTimes: [
      { division: "White Belt", time: "4 min" },
      { division: "Blue Belt", time: "5 min" },
      { division: "Purple Belt", time: "6 min" },
      { division: "Brown Belt", time: "7 min" },
      { division: "Black Belt", time: "8 min" },
    ],
    penalties: [
      { infraction: "Stalling / passivity", consequence: "Warning, then penalty (points to opponent)" },
      { infraction: "Guard pulling with no attack", consequence: "Penalty at certain levels" },
      { infraction: "Slamming", consequence: "DQ" },
    ],
    submissions: {
      allowed: [
        "All chokes",
        "Armlocks",
        "Straight ankle lock (all belts)",
        "Kneebar (brown/black)",
        "Toe hold (brown/black)",
        "Calf slicer (brown/black)",
      ],
      banned: [
        "Heel hooks (all Gi divisions)",
        "Leg reaping (white through purple)",
        "Wrist locks (white through blue)",
        "Neck cranks",
        "Slams",
      ],
    },
    winConditions: [
      "Submission",
      "Points",
      "Advantages (if tied)",
      "Penalties on opponent",
      "Referee decision",
    ],
    keyRules: [
      "Golden score overtime if tied (first to score wins)",
      "Global ranking system with tour points",
      "Professional prize money at Grand Slam events",
      "Takedown to dominant position scores 4 (vs 2 in IBJJF)",
      "Stricter passivity enforcement than IBJJF",
    ],
  },
  {
    id: "grappling-industries",
    name: "Grappling Industries",
    shortName: "Grappling Industries",
    description:
      "Round-robin format tournament — you are guaranteed multiple matches regardless of bracket size. Popular worldwide with both Gi and No-Gi divisions on the same day.",
    format: "Both",
    color: "nogi",
    scoring: [
      { action: "Takedown", points: 2 },
      { action: "Sweep", points: 2 },
      { action: "Knee on Belly", points: 2 },
      { action: "Guard Pass", points: 3 },
      { action: "Mount", points: 4 },
      { action: "Back Control", points: 4 },
    ],
    matchTimes: [
      { division: "Beginner", time: "5 min" },
      { division: "Intermediate", time: "5 min" },
      { division: "Advanced", time: "6 min" },
    ],
    penalties: [
      { infraction: "Stalling", consequence: "Warning, then advantage to opponent" },
      { infraction: "Slamming", consequence: "DQ" },
    ],
    submissions: {
      allowed: [
        "All chokes",
        "All armlocks",
        "Straight ankle lock (all levels)",
        "Kneebar (intermediate+)",
        "Toe hold (intermediate+)",
        "Heel hook (advanced no-gi only)",
        "Calf slicer (intermediate+)",
      ],
      banned: [
        "Heel hooks (Gi and beginner no-gi)",
        "Wrist locks (beginner)",
        "Neck cranks (beginner)",
        "Slams",
      ],
    },
    winConditions: [
      "Submission (3 points in round-robin standings)",
      "Points win (2 points in standings)",
      "Draw (1 point each)",
      "Most standings points wins bracket",
    ],
    keyRules: [
      "ROUND-ROBIN format — guaranteed 3-4 matches minimum",
      "Submission wins earn bonus standings points (3 vs 2 for points win)",
      "Can compete in Gi and No-Gi same day with one registration",
      "Great value for competitors — most matches per dollar",
      "Sub-only overtime if tied at end of regulation",
    ],
  },
  {
    id: "uww",
    name: "United World Wrestling (Grappling)",
    shortName: "UWW Grappling",
    description:
      "The Olympic wrestling body also governs grappling/submission wrestling. UWW Grappling is the pathway for grappling to potentially become an Olympic sport.",
    format: "No-Gi",
    color: "wrestling",
    scoring: [
      { action: "Takedown (2 point)", points: 2, notes: "Basic takedown to top" },
      { action: "Takedown (4 point)", points: 4, notes: "High-amplitude throw" },
      { action: "Sweep", points: 2 },
      { action: "Guard Pass", points: 2 },
      { action: "Mount", points: 2 },
      { action: "Back Control", points: 2 },
      { action: "Clean Throw", points: 4, notes: "Similar to Judo ippon-style" },
    ],
    matchTimes: [
      { division: "Senior", time: "6 min (2x3min periods)" },
      { division: "Junior", time: "6 min (2x3min periods)" },
    ],
    penalties: [
      { infraction: "Passivity", consequence: "Warning, then standing reset" },
      { infraction: "Fleeing the mat", consequence: "Point to opponent" },
    ],
    submissions: {
      allowed: [
        "All chokes",
        "All arm locks",
        "Leg locks (varies by level)",
        "Kneebar",
        "Toe hold",
      ],
      banned: [
        "Varies by competition level",
        "Heel hooks (often restricted at lower levels)",
        "Neck cranks",
        "Slams",
      ],
    },
    winConditions: [
      "Submission",
      "Points (across both periods)",
      "Technical superiority (large point gap)",
    ],
    keyRules: [
      "Two-period format like wrestling",
      "Wrestling-style emphasis on takedowns and aggression",
      "Potential Olympic pathway for grappling",
      "Takedown-heavy scoring rewards wrestlers",
      "International federation with national qualifiers",
    ],
  },
  {
    id: "cjj",
    name: "Combat Jiu-Jitsu (CJJ)",
    shortName: "CJJ",
    description:
      "Eddie Bravo's format that adds open-palm strikes on the ground to submission grappling. Creates urgency and punishes passive guard play.",
    format: "No-Gi",
    color: "nogi",
    scoring: [
      { action: "Takedown", points: 2 },
      { action: "Sweep", points: 2 },
      { action: "Guard Pass", points: 3 },
      { action: "Mount", points: 4 },
      { action: "Back Control", points: 4 },
    ],
    matchTimes: [
      { division: "Standard", time: "10 min regulation" },
      { division: "Overtime", time: "3 min EBI overtime rounds" },
    ],
    penalties: [
      { infraction: "Closed fist strikes", consequence: "Warning / DQ" },
      { infraction: "Strikes while standing", consequence: "Not allowed — ground only" },
      { infraction: "Stalling", consequence: "Stand up / penalty" },
    ],
    submissions: {
      allowed: [
        "All submissions legal",
        "All leg locks including heel hooks",
        "Neck cranks",
        "Wrist locks",
        "Twister",
        "Open palm strikes (ground only)",
      ],
      banned: [
        "Closed fist strikes",
        "Strikes while standing",
        "Elbows / knees",
        "Eye gouging / groin",
      ],
    },
    winConditions: [
      "Submission",
      "TKO (strikes)",
      "Points",
      "EBI overtime (fastest escape/submission time)",
    ],
    keyRules: [
      "Open palm strikes allowed ON THE GROUND ONLY",
      "No striking while standing — grappling only on feet",
      "Creates urgency — can't stall in bad positions",
      "EBI overtime if regulation is a draw",
      "All leg locks legal",
      "Bridges the gap between sport BJJ and MMA grappling",
    ],
  },
];

// ─── Quick Reference: Belt-specific Legal Submissions (IBJJF) ───────

export const IBJJF_LEGAL_SUBS: Record<string, Record<string, boolean>> = {
  "Straight Ankle Lock": { white: true, blue: true, purple: true, brown: true, black: true },
  "Armbar": { white: true, blue: true, purple: true, brown: true, black: true },
  "Triangle": { white: true, blue: true, purple: true, brown: true, black: true },
  "Kimura": { white: true, blue: true, purple: true, brown: true, black: true },
  "Americana": { white: true, blue: true, purple: true, brown: true, black: true },
  "Guillotine": { white: true, blue: true, purple: true, brown: true, black: true },
  "RNC": { white: true, blue: true, purple: true, brown: true, black: true },
  "Omoplata": { white: true, blue: true, purple: true, brown: true, black: true },
  "Ezekiel": { white: true, blue: true, purple: true, brown: true, black: true },
  "Wrist Lock": { white: false, blue: false, purple: false, brown: true, black: true },
  "Kneebar": { white: false, blue: false, purple: false, brown: true, black: true },
  "Toe Hold": { white: false, blue: false, purple: false, brown: true, black: true },
  "Calf Slicer": { white: false, blue: false, purple: false, brown: true, black: true },
  "Inside Heel Hook": { white: false, blue: false, purple: false, brown: false, black: false },
  "Outside Heel Hook": { white: false, blue: false, purple: false, brown: false, black: false },
};
