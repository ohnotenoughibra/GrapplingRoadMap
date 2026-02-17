import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function getStudents() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "student" },
      include: {
        attendances: true,
        skillProgress: true,
        badges: { include: { badge: true } },
      },
      orderBy: { name: "asc" },
    });

    return students.map((s) => ({
      ...s,
      totalClasses: s.attendances.length,
      proficientSkills: s.skillProgress.filter((sp) => sp.level === "proficient").length,
      totalSkills: s.skillProgress.length,
      badgeCount: s.badges.length,
    }));
  } catch {
    return [];
  }
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mat-100">Students</h1>
        <p className="text-mat-400 text-sm mt-1">
          Track your students&apos; journey and provide personalized guidance.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-mat-500 mb-2">No students registered yet.</p>
          <p className="text-mat-600 text-sm">
            Students will appear here once they sign up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/coach/students/${student.id}`}
              className="card-hover p-5"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gi-500/20 to-nogi-500/20 border border-mat-700/50 flex items-center justify-center text-mat-300 font-semibold text-sm flex-shrink-0">
                  {student.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-mat-100">
                      {student.name}
                    </span>
                    {student.currentStreak > 0 && (
                      <span className="text-xs text-nogi-400 streak-flame">
                        {student.currentStreak}d streak
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-mat-500">
                    <span>{student.totalClasses} classes</span>
                    <span>{student.totalSkills} skills tracked</span>
                    <span>{student.proficientSkills} proficient</span>
                  </div>

                  {/* XP bar */}
                  <div className="mt-3 xp-bar">
                    <div
                      className="xp-fill"
                      style={{
                        width: `${Math.min(100, (student.xp / 1000) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-mat-500 font-mono">
                    {student.xp} XP
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
