import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { SKILL_LEVEL_CONFIG, type SkillLevel } from "@/types";
import CoachNotesSection from "./CoachNotesSection";
import BeltPromotionSection from "./BeltPromotionSection";

export const dynamic = "force-dynamic";

const BELT_COLORS: Record<string, string> = {
  white: "bg-mat-100",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  brown: "bg-amber-700",
  black: "bg-mat-900 border border-mat-500",
};

async function getStudent(id: string) {
  try {
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            classSession: {
              include: { techniques: { include: { technique: true } } },
            },
          },
          orderBy: { classSession: { date: "desc" } },
        },
        skillProgress: {
          include: { technique: { include: { position: true } } },
          orderBy: { technique: { position: { sortOrder: "asc" } } },
        },
        badges: { include: { badge: true } },
        coachNotes: {
          include: { coach: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        beltPromotions: {
          include: { coach: { select: { name: true } } },
          orderBy: { date: "desc" },
        },
      },
    });

    return student;
  } catch {
    return null;
  }
}

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const student = await getStudent(params.id);

  if (!student) return notFound();

  const skillsByLevel = {
    proficient: student.skillProgress.filter((s) => s.level === "proficient"),
    sparring: student.skillProgress.filter((s) => s.level === "sparring"),
    drilling: student.skillProgress.filter((s) => s.level === "drilling"),
    exposed: student.skillProgress.filter((s) => s.level === "exposed"),
  };

  const skillsByPosition = student.skillProgress.reduce(
    (acc, sp) => {
      const pos = sp.technique.position.name;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(sp);
      return acc;
    },
    {} as Record<string, typeof student.skillProgress>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gi-500/20 to-nogi-500/20 border border-mat-700/50 flex items-center justify-center text-mat-200 font-bold text-xl flex-shrink-0">
          {student.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-mat-100">{student.name}</h1>
            <div className={`w-4 h-4 rounded-full ${BELT_COLORS[student.beltRank] || "bg-mat-100"}`} title={`${student.beltRank} belt`} />
          </div>
          <div className="flex items-center gap-4 text-sm text-mat-400 mt-1">
            <span>
              Joined{" "}
              {new Date(student.joinedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>{student.attendances.length} classes</span>
            <span>{student.xp} XP</span>
            <span className="capitalize">{student.beltRank} belt</span>
            {student.currentStreak > 0 && (
              <span className="text-nogi-400 streak-flame">
                {student.currentStreak}d streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {(["proficient", "sparring", "drilling", "exposed"] as SkillLevel[]).map((level) => {
          const config = SKILL_LEVEL_CONFIG[level];
          return (
            <div key={level} className="card p-4 text-center">
              <div className={`text-2xl font-bold ${config.color}`}>
                {skillsByLevel[level].length}
              </div>
              <div className="text-xs text-mat-500 mt-1">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills by position */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
              Skill Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(skillsByPosition).map(([position, skills]) => (
                <div key={position}>
                  <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2">
                    {position}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {skills.map((sp) => {
                      const config = SKILL_LEVEL_CONFIG[sp.level as SkillLevel];
                      return (
                        <div
                          key={sp.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                            sp.level === "proficient"
                              ? "skill-proficient"
                              : sp.level === "sparring"
                                ? "skill-sparring"
                                : sp.level === "drilling"
                                  ? "skill-drilling"
                                  : "skill-exposed"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                sp.technique.discipline === "gi"
                                  ? "bg-gi-500"
                                  : sp.technique.discipline === "nogi"
                                    ? "bg-nogi-500"
                                    : sp.technique.discipline === "wrestling"
                                      ? "bg-wrestling-500"
                                      : "bg-mat-400"
                              }`}
                            />
                            <span className="text-sm text-mat-300">
                              {sp.technique.name}
                            </span>
                          </div>
                          <span className={`text-[10px] font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Notes */}
          <CoachNotesSection
            studentId={student.id}
            initialNotes={student.coachNotes.map((n) => ({
              id: n.id,
              content: n.content,
              coachName: n.coach.name,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Belt Promotions */}
          <BeltPromotionSection
            studentId={student.id}
            currentBelt={student.beltRank}
            promotions={student.beltPromotions.map((p) => ({
              id: p.id,
              fromBelt: p.fromBelt,
              toBelt: p.toBelt,
              stripes: p.stripes,
              notes: p.notes,
              coachName: p.coach.name,
              date: p.date.toISOString(),
            }))}
          />

          {/* Badges */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-3">
              Badges ({student.badges.length})
            </h2>
            {student.badges.length === 0 ? (
              <p className="text-mat-500 text-xs">No badges yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {student.badges.map((ub) => (
                  <div
                    key={ub.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-mat-800/50"
                    title={ub.badge.description}
                  >
                    <span>{ub.badge.icon}</span>
                    <span className="text-xs text-mat-300">
                      {ub.badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent classes */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-3">
              Recent Classes
            </h2>
            <div className="space-y-2">
              {student.attendances.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      a.classSession.discipline === "gi"
                        ? "bg-gi-500"
                        : a.classSession.discipline === "nogi"
                          ? "bg-nogi-500"
                          : "bg-wrestling-500"
                    }`}
                  />
                  <span className="text-mat-400 text-xs">
                    {new Date(a.classSession.date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </span>
                  <span className="text-mat-300 truncate">
                    {a.classSession.title ||
                      a.classSession.discipline.charAt(0).toUpperCase() +
                        a.classSession.discipline.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
