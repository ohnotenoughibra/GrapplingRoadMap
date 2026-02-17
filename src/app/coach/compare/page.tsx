"use client";

import { useState, useEffect } from "react";

interface StudentCompare {
  id: string;
  name: string;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalClasses: number;
  beltRank: string;
  skills: { total: number; proficient: number; sparring: number; drilling: number; exposed: number };
  skillsByPosition: Record<string, Record<string, number>>;
  badges: Array<{ name: string; icon: string }>;
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
}

export default function ComparePage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparison, setComparison] = useState<StudentCompare[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/coach/attendance?classId=__list_students__")
      .catch(() => null);
    // Fetch all students
    fetch("/api/coach/attendance?classId=none")
      .then((r) => r.json())
      .then((d) => setStudents(d.allStudents || []))
      .catch(() => {});
  }, []);

  async function compare() {
    if (selected.length < 2) return;
    setLoading(true);
    const res = await fetch(`/api/coach/compare?ids=${selected.join(",")}`);
    const data = await res.json();
    setComparison(data.students || []);
    setLoading(false);
  }

  function toggleStudent(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const beltColor = (b: string) => {
    const colors: Record<string, string> = { white: "text-mat-100", blue: "text-blue-400", purple: "text-purple-400", brown: "text-amber-600", black: "text-mat-100" };
    return colors[b] || "text-mat-400";
  };

  const allPositions = Array.from(
    new Set(comparison.flatMap((s) => Object.keys(s.skillsByPosition)))
  ).sort();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mat-100">Compare Students</h1>
        <p className="text-sm text-mat-500 mt-1">Side-by-side skill comparison</p>
      </div>

      {/* Student selector */}
      <div className="card p-5 mb-6">
        <div className="text-xs text-mat-500 uppercase tracking-wider mb-3">Select students to compare</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleStudent(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                selected.includes(s.id)
                  ? "bg-gi-500/20 border border-gi-500/40 text-gi-400"
                  : "bg-mat-800/30 border border-mat-700/30 text-mat-400 hover:text-mat-300"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button
          onClick={compare}
          disabled={selected.length < 2 || loading}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {comparison.length >= 2 && (
        <>
          {/* Overview comparison */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mat-700/30">
                  <th className="text-left text-xs text-mat-500 uppercase py-3 px-4">Metric</th>
                  {comparison.map((s) => (
                    <th key={s.id} className="text-center text-xs text-mat-500 uppercase py-3 px-4">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mat-800/30">
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Belt</td>
                  {comparison.map((s) => (
                    <td key={s.id} className={`py-3 px-4 text-center text-sm font-semibold capitalize ${beltColor(s.beltRank)}`}>{s.beltRank}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">XP</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm font-semibold text-mat-200">{s.xp}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Classes</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm font-semibold text-mat-200">{s.totalClasses}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Streak</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm font-semibold text-nogi-400">{s.currentStreak}d</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Proficient</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm font-semibold text-green-400">{s.skills.proficient}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Sparring</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm font-semibold text-gi-400">{s.skills.sparring}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Drilling</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm font-semibold text-yellow-400">{s.skills.drilling}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-mat-400">Badges</td>
                  {comparison.map((s) => (
                    <td key={s.id} className="py-3 px-4 text-center text-sm">{s.badges.map((b) => b.icon).join(" ")}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Position breakdown */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">Skills by Position</h2>
            <div className="space-y-3">
              {allPositions.map((pos) => (
                <div key={pos}>
                  <div className="text-xs text-mat-500 uppercase tracking-wider mb-2">{pos}</div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${comparison.length}, 1fr)` }}>
                    {comparison.map((s) => {
                      const p = s.skillsByPosition[pos] || { proficient: 0, sparring: 0, drilling: 0, exposed: 0 };
                      const total = p.proficient + p.sparring + p.drilling + p.exposed;
                      return (
                        <div key={s.id} className="flex items-center gap-1.5">
                          <span className="text-[10px] text-mat-500 w-12 truncate">{s.name.split(" ")[0]}</span>
                          <div className="flex-1 h-3 rounded-full bg-mat-800 overflow-hidden flex">
                            {total > 0 && (
                              <>
                                <div className="h-full bg-green-500" style={{ width: `${(p.proficient / total) * 100}%` }} />
                                <div className="h-full bg-gi-500" style={{ width: `${(p.sparring / total) * 100}%` }} />
                                <div className="h-full bg-yellow-500" style={{ width: `${(p.drilling / total) * 100}%` }} />
                                <div className="h-full bg-mat-600" style={{ width: `${(p.exposed / total) * 100}%` }} />
                              </>
                            )}
                          </div>
                          <span className="text-[10px] text-mat-400 w-6 text-right">{total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
