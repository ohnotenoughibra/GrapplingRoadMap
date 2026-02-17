import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { POSITIONS, TECHNIQUES, MILESTONES, BADGES } from "@/lib/data/taxonomy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Support both GET (browser address bar) and POST
export async function GET(request: NextRequest) {
  return runSeed(request);
}

export async function POST(request: NextRequest) {
  return runSeed(request);
}

async function runSeed(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const key = searchParams.get("key");
  if (key !== "roots-collective-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();

  try {
    // Clear existing data using TRUNCATE CASCADE to avoid FK deadlocks
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "UserBadge", "FeedPost", "CoachNote", "StudentSkill", "ClassAttendance", "ClassTechnique", "ClassSession", "MilestoneTechnique", "Milestone", "Technique", "Position", "Badge", "User" CASCADE`
    );

    // Positions
    for (const pos of POSITIONS) {
      await prisma.position.create({ data: pos });
    }

    // Techniques
    const positionMap = new Map<string, string>();
    const allPositions = await prisma.position.findMany();
    for (const p of allPositions) {
      positionMap.set(p.slug, p.id);
    }

    const techniqueMap = new Map<string, string>();
    for (const tech of TECHNIQUES) {
      const positionId = positionMap.get(tech.positionSlug);
      if (!positionId) continue;
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

    // Milestones
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

      for (const techSlug of ms.techniqueSlugs) {
        const techId = techniqueMap.get(techSlug);
        if (techId) {
          await prisma.milestoneTechnique.create({
            data: { milestoneId: milestone.id, techniqueId: techId },
          });
        }
      }
    }

    // Badges
    for (const badge of BADGES) {
      await prisma.badge.create({ data: badge });
    }

    // Demo users
    const coach = await prisma.user.create({
      data: { name: "Coach Ibrahim", email: "coach@rootscollective.com", role: "coach" },
    });

    const students = await Promise.all([
      prisma.user.create({ data: { name: "Alex Rivera", email: "alex@rootscollective.com", role: "student", xp: 450, currentStreak: 5, longestStreak: 14 } }),
      prisma.user.create({ data: { name: "Sam Chen", email: "sam@rootscollective.com", role: "student", xp: 1200, currentStreak: 12, longestStreak: 30 } }),
      prisma.user.create({ data: { name: "Jordan Taylor", email: "jordan@rootscollective.com", role: "student", xp: 280, currentStreak: 2, longestStreak: 7 } }),
      prisma.user.create({ data: { name: "Morgan Kim", email: "morgan@rootscollective.com", role: "student", xp: 3500, currentStreak: 0, longestStreak: 45 } }),
    ]);

    // Demo classes
    const demoClasses = [
      { date: new Date("2026-02-10"), discipline: "nogi", title: "Lasso Guard to Submissions", notes: "Focus on controlling distance with lasso grips.", techniques: ["lasso-guard", "lasso-sweep", "triangle-lasso"] },
      { date: new Date("2026-02-11"), discipline: "gi", title: "Closed Guard Fundamentals", notes: "Breaking posture, controlling grips, basic submission chain.", techniques: ["armbar-closed-guard", "triangle-closed-guard", "kimura-closed-guard", "hip-bump-sweep", "scissor-sweep"] },
      { date: new Date("2026-02-12"), discipline: "wrestling", title: "Takedown Entries", notes: "Level change, penetration step, finishing the double and single leg.", techniques: ["double-leg", "single-leg-high-c", "collar-tie", "sprawl"] },
      { date: new Date("2026-02-13"), discipline: "nogi", title: "Front Headlock Series", notes: "Snap down to front headlock. Guillotine, D'Arce, and go-behind.", techniques: ["snap-down", "front-headlock-control", "guillotine-arm-in", "guillotine-high-elbow", "darce", "go-behind-fhl"] },
      { date: new Date("2026-02-14"), discipline: "gi", title: "Guard Passing Day", notes: "Toreando and knee cut as our primary passing system.", techniques: ["toreando", "knee-cut", "headquarters", "posture-grip-break"] },
      { date: new Date("2026-02-15"), discipline: "nogi", title: "Back Attacks", notes: "Taking the back, maintaining control, finishing the RNC.", techniques: ["seatbelt-hooks", "rnc", "short-choke", "arm-drag-back", "seatbelt-back-take"] },
      { date: new Date("2026-02-17"), discipline: "gi", title: "Half Guard Sweeps", notes: "Knee shield retention, underhook game, old school sweep.", techniques: ["knee-shield", "underhook-sweep-hg", "old-school-sweep", "kimura-half-guard"] },
    ];

    for (const cls of demoClasses) {
      const techIds = cls.techniques.map((slug) => techniqueMap.get(slug)).filter((id): id is string => !!id);
      const classSession = await prisma.classSession.create({
        data: {
          date: cls.date,
          discipline: cls.discipline,
          title: cls.title,
          notes: cls.notes,
          coachId: coach.id,
          techniques: { create: techIds.map((id) => ({ techniqueId: id })) },
        },
      });

      for (const student of students) {
        if (Math.random() > 0.25) {
          await prisma.classAttendance.create({
            data: { classSessionId: classSession.id, userId: student.id },
          });
        }
      }
    }

    // Demo skill progress
    const explorerTechs = MILESTONES[0].techniqueSlugs;
    const travelerTechs = MILESTONES[1].techniqueSlugs;

    // Sam (experienced)
    for (const slug of explorerTechs) {
      const techId = techniqueMap.get(slug);
      if (techId) await prisma.studentSkill.create({ data: { userId: students[1].id, techniqueId: techId, level: Math.random() > 0.3 ? "proficient" : "sparring" } });
    }
    for (const slug of travelerTechs.slice(0, 15)) {
      const techId = techniqueMap.get(slug);
      if (techId) await prisma.studentSkill.create({ data: { userId: students[1].id, techniqueId: techId, level: Math.random() > 0.5 ? "sparring" : "drilling" } });
    }

    // Alex (intermediate)
    for (const slug of explorerTechs.slice(0, 20)) {
      const techId = techniqueMap.get(slug);
      if (techId) {
        const rand = Math.random();
        await prisma.studentSkill.create({ data: { userId: students[0].id, techniqueId: techId, level: rand > 0.6 ? "proficient" : rand > 0.3 ? "sparring" : "drilling" } });
      }
    }

    // Jordan (newer)
    for (const slug of explorerTechs.slice(0, 10)) {
      const techId = techniqueMap.get(slug);
      if (techId) await prisma.studentSkill.create({ data: { userId: students[2].id, techniqueId: techId, level: Math.random() > 0.5 ? "drilling" : "exposed" } });
    }

    // Morgan (most experienced)
    for (const slug of explorerTechs) {
      const techId = techniqueMap.get(slug);
      if (techId) await prisma.studentSkill.create({ data: { userId: students[3].id, techniqueId: techId, level: "proficient" } });
    }
    for (const slug of travelerTechs) {
      const techId = techniqueMap.get(slug);
      if (techId) await prisma.studentSkill.create({ data: { userId: students[3].id, techniqueId: techId, level: Math.random() > 0.2 ? "proficient" : "sparring" } });
    }

    // Demo feed posts
    await prisma.feedPost.createMany({
      data: [
        { userId: students[1].id, type: "checkin", content: "Great drilling session today. Finally getting the timing on the lasso sweep." },
        { userId: students[0].id, type: "checkin", content: "Hit my first D'Arce in sparring! All those reps are paying off." },
        { userId: students[3].id, type: "milestone", content: "Just completed all Explorer milestone techniques. Traveler stage unlocked!" },
        { userId: students[2].id, type: "checkin", content: "Week 2 of training! Everything is confusing but I'm loving it." },
        { userId: students[1].id, type: "note", content: "Key insight: the hip bump sweep works so much better when you commit fully." },
        { userId: students[0].id, type: "challenge", content: "Challenge: Who can get 4 training sessions in this week? Let's go!" },
      ],
    });

    // Demo badges
    const firstRoll = await prisma.badge.findUnique({ where: { slug: "first-roll" } });
    const consistent = await prisma.badge.findUnique({ where: { slug: "consistent" } });
    const explorerComplete = await prisma.badge.findUnique({ where: { slug: "explorer-complete" } });
    const firstSub = await prisma.badge.findUnique({ where: { slug: "first-sub" } });

    if (firstRoll) {
      for (const student of students) {
        await prisma.userBadge.create({ data: { userId: student.id, badgeId: firstRoll.id } });
      }
    }
    if (consistent) {
      await prisma.userBadge.create({ data: { userId: students[1].id, badgeId: consistent.id } });
      await prisma.userBadge.create({ data: { userId: students[3].id, badgeId: consistent.id } });
    }
    if (explorerComplete) {
      await prisma.userBadge.create({ data: { userId: students[3].id, badgeId: explorerComplete.id } });
    }
    if (firstSub) {
      await prisma.userBadge.create({ data: { userId: students[1].id, badgeId: firstSub.id } });
      await prisma.userBadge.create({ data: { userId: students[3].id, badgeId: firstSub.id } });
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      seeded: {
        positions: POSITIONS.length,
        techniques: techniqueMap.size,
        milestones: MILESTONES.length,
        badges: BADGES.length,
        users: students.length + 1,
        classes: demoClasses.length,
      },
    });
  } catch (e) {
    await prisma.$disconnect();
    return NextResponse.json({ error: "Seed failed", details: String(e) }, { status: 500 });
  }
}
