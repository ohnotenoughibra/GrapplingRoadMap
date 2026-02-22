import { PrismaClient } from "@prisma/client";
import { POSITIONS, TECHNIQUES, MILESTONES, BADGES } from "../src/lib/data/taxonomy";
import {
  CURRICULUM,
  CLASS_TEMPLATES,
  SPARRING_LOGS,
  TRAINING_LOGS,
  FEED_POSTS,
  COMPETITIONS,
} from "../src/lib/data/curriculum";

const prisma = new PrismaClient();

// Deterministic pseudo-random for reproducible demo data
let rngState = 42;
function rng() {
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("Seeding database...\n");

  // ─── Clear existing data ────────────────────────────────────────
  await prisma.dailyMission.deleteMany();
  await prisma.sparringLog.deleteMany();
  await prisma.trainingLog.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.challengeParticipant.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.feedPost.deleteMany();
  await prisma.coachNote.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.classAttendance.deleteMany();
  await prisma.classTechnique.deleteMany();
  await prisma.classTemplateTechnique.deleteMany();
  await prisma.classTemplate.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.milestoneTechnique.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.technique.deleteMany();
  await prisma.position.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.beltPromotion.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.academyMember.deleteMany();
  await prisma.academy.deleteMany();
  await prisma.user.deleteMany();

  // ─── Positions ──────────────────────────────────────────────────
  console.log("Creating positions...");
  for (const pos of POSITIONS) {
    await prisma.position.create({ data: pos });
  }
  console.log(`  ${POSITIONS.length} positions`);

  // ─── Techniques ─────────────────────────────────────────────────
  console.log("Creating techniques...");
  const positionMap = new Map<string, string>();
  const allPositions = await prisma.position.findMany();
  for (const p of allPositions) positionMap.set(p.slug, p.id);

  const techniqueMap = new Map<string, string>();
  for (const tech of TECHNIQUES) {
    const positionId = positionMap.get(tech.positionSlug);
    if (!positionId) {
      console.warn(`  WARNING: Position "${tech.positionSlug}" not found for "${tech.name}"`);
      continue;
    }
    const created = await prisma.technique.create({
      data: {
        name: tech.name, slug: tech.slug, description: tech.description,
        discipline: tech.discipline, category: tech.category, difficulty: tech.difficulty,
        positionId,
      },
    });
    techniqueMap.set(tech.slug, created.id);
  }
  console.log(`  ${techniqueMap.size} techniques`);

  // ─── Milestones ─────────────────────────────────────────────────
  console.log("Creating milestones...");
  for (const ms of MILESTONES) {
    const milestone = await prisma.milestone.create({
      data: {
        name: ms.name, slug: ms.slug, description: ms.description,
        monthsMin: ms.monthsMin, monthsMax: ms.monthsMax, sortOrder: ms.sortOrder,
      },
    });
    let linked = 0;
    for (const techSlug of ms.techniqueSlugs) {
      const techId = techniqueMap.get(techSlug);
      if (techId) {
        await prisma.milestoneTechnique.create({ data: { milestoneId: milestone.id, techniqueId: techId } });
        linked++;
      }
    }
    console.log(`  ${ms.name}: ${linked} techniques`);
  }

  // ─── Badges ─────────────────────────────────────────────────────
  console.log("Creating badges...");
  for (const badge of BADGES) { await prisma.badge.create({ data: badge }); }
  console.log(`  ${BADGES.length} badges`);

  // ─── Class Templates ──────────────────────────────────────────
  console.log("Creating class templates...");
  for (const tpl of CLASS_TEMPLATES) {
    const techIds = tpl.techniques.map((slug) => techniqueMap.get(slug)).filter((id): id is string => !!id);
    await prisma.classTemplate.create({
      data: {
        name: tpl.name, discipline: tpl.discipline, warmup: tpl.warmup, notes: tpl.notes,
        techniques: { create: techIds.map((id) => ({ techniqueId: id })) },
      },
    });
  }
  console.log(`  ${CLASS_TEMPLATES.length} class templates`);

  // ─── Academy ──────────────────────────────────────────────────
  const academy = await prisma.academy.create({
    data: { name: "Roots Collective", slug: "roots-collective", timezone: "America/New_York" },
  });

  // ─── Users ────────────────────────────────────────────────────
  console.log("Creating users...");
  const coach = await prisma.user.create({
    data: { name: "Coach Ibrahim", email: "coach@rootscollective.com", role: "coach", beltRank: "black" },
  });

  const students = await Promise.all([
    prisma.user.create({ data: { name: "Alex Rivera", email: "alex@rootscollective.com", role: "student", beltRank: "blue", xp: 1850, currentStreak: 5, longestStreak: 21, lastTrainedAt: daysAgo(0) } }),
    prisma.user.create({ data: { name: "Sam Chen", email: "sam@rootscollective.com", role: "student", beltRank: "purple", xp: 4200, currentStreak: 12, longestStreak: 45, lastTrainedAt: daysAgo(0) } }),
    prisma.user.create({ data: { name: "Jordan Taylor", email: "jordan@rootscollective.com", role: "student", beltRank: "white", xp: 320, currentStreak: 3, longestStreak: 7, lastTrainedAt: daysAgo(1) } }),
    prisma.user.create({ data: { name: "Morgan Kim", email: "morgan@rootscollective.com", role: "student", beltRank: "brown", xp: 8500, currentStreak: 0, longestStreak: 60, lastTrainedAt: daysAgo(5) } }),
    prisma.user.create({ data: { name: "Casey Martinez", email: "casey@rootscollective.com", role: "student", beltRank: "white", xp: 150, currentStreak: 1, longestStreak: 4, lastTrainedAt: daysAgo(2) } }),
    prisma.user.create({ data: { name: "Riley Brooks", email: "riley@rootscollective.com", role: "student", beltRank: "blue", xp: 2100, currentStreak: 8, longestStreak: 30, lastTrainedAt: daysAgo(0) } }),
  ]);

  await prisma.academyMember.create({ data: { academyId: academy.id, userId: coach.id, role: "owner" } });
  for (const s of students) {
    await prisma.academyMember.create({ data: { academyId: academy.id, userId: s.id, role: "student" } });
  }
  console.log(`  1 coach, ${students.length} students`);

  // ─── 12-Week Class Calendar ───────────────────────────────────
  console.log("Creating 12-week class calendar...");
  const now = new Date();
  const twelveWeeksAgo = new Date(now);
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);
  const dow = twelveWeeksAgo.getDay();
  const startMonday = new Date(twelveWeeksAgo);
  startMonday.setDate(startMonday.getDate() - (dow === 0 ? 6 : dow - 1));

  let totalClasses = 0;
  const attendanceProb = [0.80, 0.90, 0.55, 0.70, 0.40, 0.85];

  for (const week of CURRICULUM) {
    for (const cls of week.classes) {
      const classDate = new Date(startMonday);
      classDate.setDate(classDate.getDate() + (week.weekNumber - 1) * 7 + (cls.dayOfWeek - 1));
      if (classDate > now) continue;

      const techIds = cls.techniques.map((slug) => techniqueMap.get(slug)).filter((id): id is string => !!id);

      const classSession = await prisma.classSession.create({
        data: {
          date: classDate, discipline: cls.discipline, title: cls.title,
          notes: cls.notes, coachId: coach.id,
          techniques: { create: techIds.map((id) => ({ techniqueId: id })) },
        },
      });
      totalClasses++;

      for (let i = 0; i < students.length; i++) {
        if (rng() < attendanceProb[i]) {
          await prisma.classAttendance.create({ data: { classSessionId: classSession.id, userId: students[i].id } });
          for (const techId of techIds) {
            await prisma.studentSkill.upsert({
              where: { userId_techniqueId: { userId: students[i].id, techniqueId: techId } },
              update: {},
              create: { userId: students[i].id, techniqueId: techId, level: "exposed" },
            });
          }
        }
      }
    }
  }
  console.log(`  ${totalClasses} classes`);

  // ─── Skill Progression Overlay ─────────────────────────────────
  console.log("Building skill progression...");
  const [explorerTechs, travelerTechs, navigatorTechs, guideTechs] =
    MILESTONES.map((m) => m.techniqueSlugs);

  async function setSkill(userId: string, slug: string, level: string) {
    const techId = techniqueMap.get(slug);
    if (!techId) return;
    await prisma.studentSkill.upsert({
      where: { userId_techniqueId: { userId, techniqueId: techId } },
      update: { level },
      create: { userId, techniqueId: techId, level },
    });
  }

  // Morgan (brown) — mastered explorer+traveler, working navigator
  for (const s of [...explorerTechs, ...travelerTechs]) await setSkill(students[3].id, s, "proficient");
  for (const s of navigatorTechs) await setSkill(students[3].id, s, rng() > 0.4 ? "proficient" : rng() > 0.3 ? "sparring" : "drilling");
  for (const s of guideTechs.slice(0, 6)) await setSkill(students[3].id, s, rng() > 0.5 ? "sparring" : "drilling");

  // Sam (purple) — mastered explorer, working traveler
  for (const s of explorerTechs) await setSkill(students[1].id, s, rng() > 0.15 ? "proficient" : "sparring");
  for (const s of travelerTechs) { const r = rng(); await setSkill(students[1].id, s, r > 0.6 ? "proficient" : r > 0.3 ? "sparring" : "drilling"); }
  for (const s of navigatorTechs.slice(0, 10)) await setSkill(students[1].id, s, rng() > 0.5 ? "drilling" : "exposed");

  // Alex (blue) — working through explorer
  for (const s of explorerTechs) { const r = rng(); await setSkill(students[0].id, s, r > 0.55 ? "proficient" : r > 0.3 ? "sparring" : "drilling"); }
  for (const s of travelerTechs.slice(0, 15)) await setSkill(students[0].id, s, rng() > 0.6 ? "drilling" : "exposed");

  // Riley (blue) — similar to Alex
  for (const s of explorerTechs) { const r = rng(); await setSkill(students[5].id, s, r > 0.5 ? "proficient" : r > 0.25 ? "sparring" : "drilling"); }

  // Jordan (white, 3 months)
  for (const s of explorerTechs.slice(0, 15)) await setSkill(students[2].id, s, rng() > 0.6 ? "drilling" : "exposed");

  // Casey (white, 1 month)
  for (const s of explorerTechs.slice(0, 8)) await setSkill(students[4].id, s, "exposed");

  console.log(`  Skill progression built`);

  // ─── Sparring Logs ────────────────────────────────────────────
  console.log("Creating sparring logs...");
  const sparringStudents = [1, 1, 1, 1, 0, 0, 0, 2, 2, 3, 3];
  for (let i = 0; i < SPARRING_LOGS.length; i++) {
    const log = SPARRING_LOGS[i];
    const student = students[sparringStudents[i]];
    await prisma.sparringLog.create({
      data: {
        userId: student.id, date: daysAgo(log.daysAgo), partner: log.partner,
        rounds: log.rounds, duration: log.duration, mood: log.mood, notes: log.notes,
        submissions: JSON.stringify(log.submissions), caughtIn: JSON.stringify(log.caughtIn),
        positions: JSON.stringify(log.positions),
      },
    });
  }
  console.log(`  ${SPARRING_LOGS.length} sparring logs`);

  // ─── Training Logs ────────────────────────────────────────────
  console.log("Creating training logs...");
  const trainingStudents = [1, 0, 1, 0, 3, 0, 2, 3];
  for (let i = 0; i < TRAINING_LOGS.length; i++) {
    const log = TRAINING_LOGS[i];
    await prisma.trainingLog.create({
      data: {
        userId: students[trainingStudents[i]].id, date: daysAgo(log.daysAgo),
        title: log.title, content: log.content, mood: log.mood, energy: log.energy,
        tags: JSON.stringify(log.tags),
      },
    });
  }
  console.log(`  ${TRAINING_LOGS.length} training logs`);

  // ─── Feed Posts ────────────────────────────────────────────────
  console.log("Creating feed posts...");
  for (const post of FEED_POSTS) {
    await prisma.feedPost.create({
      data: { userId: students[post.studentIndex].id, type: post.type, content: post.content, createdAt: daysAgo(post.daysAgo) },
    });
  }
  console.log(`  ${FEED_POSTS.length} feed posts`);

  // ─── Competitions ─────────────────────────────────────────────
  console.log("Creating competitions...");
  for (const comp of COMPETITIONS) {
    await prisma.competition.create({
      data: {
        userId: students[comp.studentIndex].id, name: comp.name, date: new Date(comp.date),
        location: comp.location, discipline: comp.discipline, weightClass: comp.weightClass,
        result: comp.result, wins: comp.wins, losses: comp.losses,
        submissionBy: comp.submissionBy, submittedBy: comp.submittedBy, notes: comp.notes,
      },
    });
  }
  console.log(`  ${COMPETITIONS.length} competitions`);

  // ─── Coach Notes ──────────────────────────────────────────────
  console.log("Creating coach notes...");
  const coachNotes = [
    { si: 2, content: "Jordan is picking things up fast. Great attitude. Focus on guard retention — tends to give up position too easily when pressured.", d: 2 },
    { si: 0, content: "Alex's guard passing has improved significantly this month. The knee cut is becoming automatic. Next step: maintaining side control after the pass.", d: 5 },
    { si: 1, content: "Sam is ready for competition. Back take game is sharp. Need to work on takedown defense — getting taken down too easily.", d: 7 },
    { si: 3, content: "Morgan should be teaching more. Their understanding of concepts is at instructor level. Consider for assistant coach role.", d: 10 },
    { si: 4, content: "Casey's first month. Very athletic but needs to slow down and learn technique before relying on strength. Emphasized positional hierarchy.", d: 3 },
    { si: 5, content: "Riley's half guard is becoming a real weapon. The knee shield to underhook sweep is high percentage. Encourage more no-gi.", d: 8 },
    { si: 2, content: "Promoted Jordan to 2nd stripe. Consistent attendance and real improvement in fundamentals. Trap and roll escape is solid.", d: 14 },
    { si: 1, content: "Post-competition debrief: Sam's guard game was excellent but got caught with a bow and arrow in the final. Drill back escape under fatigue.", d: 9 },
  ];
  for (const n of coachNotes) {
    await prisma.coachNote.create({ data: { coachId: coach.id, studentId: students[n.si].id, content: n.content, createdAt: daysAgo(n.d) } });
  }
  console.log(`  ${coachNotes.length} coach notes`);

  // ─── Challenges ───────────────────────────────────────────────
  const c1 = await prisma.challenge.create({
    data: { title: "5 Classes This Week", description: "Attend 5 classes in a single week.", type: "attendance", target: 5, startDate: daysAgo(7), endDate: daysAgo(0), creatorId: coach.id, active: true },
  });
  const c2 = await prisma.challenge.create({
    data: { title: "Sweep from Every Guard", description: "Land a sweep from closed, half, butterfly, and open guard in sparring.", type: "skill", target: 4, startDate: daysAgo(14), endDate: daysAgo(0), creatorId: coach.id, active: true },
  });
  await prisma.challengeParticipant.createMany({
    data: [
      { challengeId: c1.id, userId: students[0].id, progress: 4 },
      { challengeId: c1.id, userId: students[1].id, progress: 5, completed: true },
      { challengeId: c1.id, userId: students[5].id, progress: 4 },
      { challengeId: c2.id, userId: students[1].id, progress: 3 },
      { challengeId: c2.id, userId: students[3].id, progress: 4, completed: true },
    ],
  });
  console.log(`  2 challenges`);

  // ─── Badges ───────────────────────────────────────────────────
  console.log("Assigning badges...");
  const badgeMap = new Map<string, string>();
  for (const b of await prisma.badge.findMany()) badgeMap.set(b.slug, b.id);

  const badges: [number, string][] = [
    [0,"first-roll"],[1,"first-roll"],[2,"first-roll"],[3,"first-roll"],[4,"first-roll"],[5,"first-roll"],
    [0,"consistent"],[1,"consistent"],[3,"consistent"],[5,"consistent"],
    [1,"iron-will"],[3,"iron-will"],
    [0,"first-sub"],[1,"first-sub"],[3,"first-sub"],[5,"first-sub"],
    [1,"sub-hunter"],[3,"sub-hunter"],
    [1,"guard-player"],[3,"guard-player"],
    [1,"passer"],[3,"passer"],
    [3,"escape-artist"],[3,"leg-locker"],
    [3,"explorer-complete"],[3,"traveler-complete"],[1,"explorer-complete"],
  ];
  for (const [si, slug] of badges) {
    const bid = badgeMap.get(slug);
    if (bid) await prisma.userBadge.create({ data: { userId: students[si].id, badgeId: bid } });
  }
  console.log(`  ${badges.length} badges assigned`);

  // ─── Belt Promotions ──────────────────────────────────────────
  const promos = [
    { si: 3, from: "purple", to: "brown", d: 90, notes: "Outstanding technical depth and competition results." },
    { si: 1, from: "blue", to: "purple", d: 60, notes: "Consistent competitor, excellent guard game." },
    { si: 0, from: "white", to: "blue", d: 120, notes: "Solid fundamentals across all positions." },
    { si: 5, from: "white", to: "blue", d: 90, notes: "Technical precision and dedication to drilling." },
  ];
  for (const p of promos) {
    await prisma.beltPromotion.create({
      data: { studentId: students[p.si].id, coachId: coach.id, fromBelt: p.from, toBelt: p.to, date: daysAgo(p.d), notes: p.notes },
    });
  }
  console.log(`  ${promos.length} belt promotions`);

  // ─── Summary ──────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════");
  console.log("  Seed complete! Your gym is alive.");
  console.log("══════════════════════════════════════════");
  console.log(`  ${POSITIONS.length} positions | ${techniqueMap.size} techniques`);
  console.log(`  ${MILESTONES.length} milestones | ${BADGES.length} badges`);
  console.log(`  ${CLASS_TEMPLATES.length} class templates | ${totalClasses} classes`);
  console.log(`  ${students.length + 1} users | ${SPARRING_LOGS.length} sparring logs`);
  console.log(`  ${TRAINING_LOGS.length} training logs | ${FEED_POSTS.length} feed posts`);
  console.log(`  ${COMPETITIONS.length} competitions | ${coachNotes.length} coach notes`);
  console.log("══════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
