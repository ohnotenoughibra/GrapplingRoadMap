import { PrismaClient } from "@prisma/client";
import { POSITIONS, TECHNIQUES, MILESTONES, BADGES } from "../src/lib/data/taxonomy";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // ─── Clear existing data ────────────────────────────────────────
  await prisma.userBadge.deleteMany();
  await prisma.feedPost.deleteMany();
  await prisma.coachNote.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.classAttendance.deleteMany();
  await prisma.classTechnique.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.milestoneTechnique.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.technique.deleteMany();
  await prisma.position.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();

  // ─── Positions ──────────────────────────────────────────────────
  console.log("Creating positions...");
  for (const pos of POSITIONS) {
    await prisma.position.create({ data: pos });
  }
  console.log(`  ${POSITIONS.length} positions created`);

  // ─── Techniques ─────────────────────────────────────────────────
  console.log("Creating techniques...");
  const positionMap = new Map<string, string>();
  const allPositions = await prisma.position.findMany();
  for (const p of allPositions) {
    positionMap.set(p.slug, p.id);
  }

  const techniqueMap = new Map<string, string>();
  for (const tech of TECHNIQUES) {
    const positionId = positionMap.get(tech.positionSlug);
    if (!positionId) {
      console.warn(`  WARNING: Position "${tech.positionSlug}" not found for technique "${tech.name}"`);
      continue;
    }
    const created = await prisma.technique.create({
      data: {
        name: tech.name,
        slug: tech.slug,
        description: tech.description,
        discipline: tech.discipline,
        category: tech.category,
        difficulty: tech.difficulty,
        positionId,
      },
    });
    techniqueMap.set(tech.slug, created.id);
  }
  console.log(`  ${techniqueMap.size} techniques created`);

  // ─── Milestones ─────────────────────────────────────────────────
  console.log("Creating milestones...");
  for (const ms of MILESTONES) {
    const milestone = await prisma.milestone.create({
      data: {
        name: ms.name,
        slug: ms.slug,
        description: ms.description,
        monthsMin: ms.monthsMin,
        monthsMax: ms.monthsMax,
        sortOrder: ms.sortOrder,
      },
    });

    // Link techniques to milestone
    let linkedCount = 0;
    for (const techSlug of ms.techniqueSlugs) {
      const techId = techniqueMap.get(techSlug);
      if (techId) {
        await prisma.milestoneTechnique.create({
          data: {
            milestoneId: milestone.id,
            techniqueId: techId,
          },
        });
        linkedCount++;
      } else {
        console.warn(`  WARNING: Technique "${techSlug}" not found for milestone "${ms.name}"`);
      }
    }
    console.log(`  ${ms.name}: ${linkedCount} techniques linked`);
  }

  // ─── Badges ─────────────────────────────────────────────────────
  console.log("Creating badges...");
  for (const badge of BADGES) {
    await prisma.badge.create({ data: badge });
  }
  console.log(`  ${BADGES.length} badges created`);

  // ─── Demo Users ─────────────────────────────────────────────────
  console.log("Creating demo users...");

  const coach = await prisma.user.create({
    data: {
      name: "Coach Ibrahim",
      email: "coach@rootscollective.com",
      role: "coach",
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: "alex@rootscollective.com",
        role: "student",
        xp: 450,
        currentStreak: 5,
        longestStreak: 14,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sam Chen",
        email: "sam@rootscollective.com",
        role: "student",
        xp: 1200,
        currentStreak: 12,
        longestStreak: 30,
      },
    }),
    prisma.user.create({
      data: {
        name: "Jordan Taylor",
        email: "jordan@rootscollective.com",
        role: "student",
        xp: 280,
        currentStreak: 2,
        longestStreak: 7,
      },
    }),
    prisma.user.create({
      data: {
        name: "Morgan Kim",
        email: "morgan@rootscollective.com",
        role: "student",
        xp: 3500,
        currentStreak: 0,
        longestStreak: 45,
      },
    }),
  ]);

  console.log(`  1 coach, ${students.length} students created`);

  // ─── Demo Classes ───────────────────────────────────────────────
  console.log("Creating demo classes...");

  const demoClasses = [
    {
      date: new Date("2026-02-10"),
      discipline: "nogi",
      title: "Lasso Guard to Submissions",
      notes: "Focus on controlling distance with lasso grips and transitioning to triangle and armbar.",
      techniques: ["lasso-guard", "lasso-sweep", "triangle-lasso"],
    },
    {
      date: new Date("2026-02-11"),
      discipline: "gi",
      title: "Closed Guard Fundamentals",
      notes: "Breaking posture, controlling grips, basic submission chain from closed guard.",
      techniques: ["armbar-closed-guard", "triangle-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "scissor-sweep"],
    },
    {
      date: new Date("2026-02-12"),
      discipline: "wrestling",
      title: "Takedown Entries",
      notes: "Level change, penetration step, finishing the double and single leg.",
      techniques: ["double-leg", "single-leg-high-c", "collar-tie", "sprawl"],
    },
    {
      date: new Date("2026-02-13"),
      discipline: "nogi",
      title: "Front Headlock Series",
      notes: "Snap down to front headlock. Guillotine, D'Arce, and go-behind options.",
      techniques: ["snap-down", "front-headlock-control", "guillotine-arm-in", "guillotine-high-elbow", "darce", "go-behind-fhl"],
    },
    {
      date: new Date("2026-02-14"),
      discipline: "gi",
      title: "Guard Passing Day",
      notes: "Toreando and knee cut as our primary passing system. Headquarters position.",
      techniques: ["toreando", "knee-cut", "headquarters", "posture-grip-break"],
    },
    {
      date: new Date("2026-02-15"),
      discipline: "nogi",
      title: "Back Attacks",
      notes: "Taking the back from various positions, maintaining control, finishing the RNC.",
      techniques: ["seatbelt-hooks", "rnc", "short-choke", "arm-drag-back", "seatbelt-back-take"],
    },
    {
      date: new Date("2026-02-17"),
      discipline: "gi",
      title: "Half Guard Sweeps",
      notes: "Knee shield retention, underhook game, old school sweep.",
      techniques: ["knee-shield", "underhook-sweep-hg", "old-school-sweep", "kimura-half-guard"],
    },
  ];

  for (const cls of demoClasses) {
    const techIds = cls.techniques
      .map((slug) => techniqueMap.get(slug))
      .filter((id): id is string => !!id);

    const classSession = await prisma.classSession.create({
      data: {
        date: cls.date,
        discipline: cls.discipline,
        title: cls.title,
        notes: cls.notes,
        coachId: coach.id,
        techniques: {
          create: techIds.map((id) => ({ techniqueId: id })),
        },
      },
    });

    // Random attendance (most students attend most classes)
    for (const student of students) {
      if (Math.random() > 0.25) {
        await prisma.classAttendance.create({
          data: {
            classSessionId: classSession.id,
            userId: student.id,
          },
        });
      }
    }
  }
  console.log(`  ${demoClasses.length} demo classes created`);

  // ─── Demo Skill Progress ───────────────────────────────────────
  console.log("Creating demo skill progress...");

  // Sam (most experienced) - proficient in many explorer techniques
  const explorerTechs = MILESTONES[0].techniqueSlugs;
  const travelerTechs = MILESTONES[1].techniqueSlugs;

  for (const slug of explorerTechs) {
    const techId = techniqueMap.get(slug);
    if (techId) {
      await prisma.studentSkill.create({
        data: {
          userId: students[1].id, // Sam
          techniqueId: techId,
          level: Math.random() > 0.3 ? "proficient" : "sparring",
        },
      });
    }
  }
  for (const slug of travelerTechs.slice(0, 15)) {
    const techId = techniqueMap.get(slug);
    if (techId) {
      await prisma.studentSkill.create({
        data: {
          userId: students[1].id,
          techniqueId: techId,
          level: Math.random() > 0.5 ? "sparring" : "drilling",
        },
      });
    }
  }

  // Alex (intermediate) - working through explorer
  for (const slug of explorerTechs.slice(0, 20)) {
    const techId = techniqueMap.get(slug);
    if (techId) {
      const rand = Math.random();
      await prisma.studentSkill.create({
        data: {
          userId: students[0].id,
          techniqueId: techId,
          level: rand > 0.6 ? "proficient" : rand > 0.3 ? "sparring" : "drilling",
        },
      });
    }
  }

  // Jordan (newer) - exposed to basics
  for (const slug of explorerTechs.slice(0, 10)) {
    const techId = techniqueMap.get(slug);
    if (techId) {
      await prisma.studentSkill.create({
        data: {
          userId: students[2].id,
          techniqueId: techId,
          level: Math.random() > 0.5 ? "drilling" : "exposed",
        },
      });
    }
  }

  // Morgan (most experienced)
  for (const slug of explorerTechs) {
    const techId = techniqueMap.get(slug);
    if (techId) {
      await prisma.studentSkill.create({
        data: {
          userId: students[3].id,
          techniqueId: techId,
          level: "proficient",
        },
      });
    }
  }
  for (const slug of travelerTechs) {
    const techId = techniqueMap.get(slug);
    if (techId) {
      await prisma.studentSkill.create({
        data: {
          userId: students[3].id,
          techniqueId: techId,
          level: Math.random() > 0.2 ? "proficient" : "sparring",
        },
      });
    }
  }

  console.log("  Skill progress created for all students");

  // ─── Demo Feed Posts ────────────────────────────────────────────
  console.log("Creating demo feed posts...");

  const feedPosts = [
    { userId: students[1].id, type: "checkin", content: "Great drilling session today. Finally getting the timing on the lasso sweep.", createdAt: new Date("2026-02-17T18:00:00") },
    { userId: students[0].id, type: "checkin", content: "Hit my first D'Arce in sparring! All those reps are paying off.", createdAt: new Date("2026-02-16T19:30:00") },
    { userId: students[3].id, type: "milestone", content: "Just completed all Explorer milestone techniques. Traveler stage unlocked!", createdAt: new Date("2026-02-15T20:00:00") },
    { userId: students[2].id, type: "checkin", content: "Week 2 of training! Everything is confusing but I'm loving it.", createdAt: new Date("2026-02-14T18:00:00") },
    { userId: students[1].id, type: "note", content: "Key insight from today: the hip bump sweep works so much better when you commit fully to the bump. Half-measures get you nowhere.", createdAt: new Date("2026-02-13T19:00:00") },
    { userId: students[0].id, type: "challenge", content: "Challenge: Who can get 4 training sessions in this week? Let's go!", createdAt: new Date("2026-02-12T17:00:00") },
  ];

  for (const post of feedPosts) {
    await prisma.feedPost.create({ data: post });
  }
  console.log(`  ${feedPosts.length} feed posts created`);

  // ─── Demo Badges ────────────────────────────────────────────────
  console.log("Assigning demo badges...");

  const firstRoll = await prisma.badge.findUnique({ where: { slug: "first-roll" } });
  const consistent = await prisma.badge.findUnique({ where: { slug: "consistent" } });
  const explorerComplete = await prisma.badge.findUnique({ where: { slug: "explorer-complete" } });
  const firstSub = await prisma.badge.findUnique({ where: { slug: "first-sub" } });

  if (firstRoll) {
    for (const student of students) {
      await prisma.userBadge.create({
        data: { userId: student.id, badgeId: firstRoll.id },
      });
    }
  }
  if (consistent && students[1]) {
    await prisma.userBadge.create({
      data: { userId: students[1].id, badgeId: consistent.id },
    });
  }
  if (consistent && students[3]) {
    await prisma.userBadge.create({
      data: { userId: students[3].id, badgeId: consistent.id },
    });
  }
  if (explorerComplete && students[3]) {
    await prisma.userBadge.create({
      data: { userId: students[3].id, badgeId: explorerComplete.id },
    });
  }
  if (firstSub) {
    await prisma.userBadge.create({
      data: { userId: students[1].id, badgeId: firstSub.id },
    });
    await prisma.userBadge.create({
      data: { userId: students[3].id, badgeId: firstSub.id },
    });
  }

  console.log("  Badges assigned");

  console.log("\nSeed complete! Your gym is ready.");
  console.log(`  ${POSITIONS.length} positions`);
  console.log(`  ${techniqueMap.size} techniques`);
  console.log(`  ${MILESTONES.length} milestones`);
  console.log(`  ${BADGES.length} badges`);
  console.log(`  ${students.length + 1} users`);
  console.log(`  ${demoClasses.length} demo classes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
