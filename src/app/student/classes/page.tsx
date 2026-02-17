"use client";

import { useState, useEffect } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline } from "@/types";

interface ClassData {
  id: string;
  date: string;
  discipline: string;
  title: string | null;
  notes: string | null;
  techniques: { technique: { name: string; category: string; position: { name: string } } }[];
  coach: { name: string };
  attended: boolean;
}

export default function ClassesPage() {
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/classes?discipline=${discipline}`)
      .then((r) => r.json())
      .then((data) => setClasses(data.classes || []));
  }, [discipline]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-mat-100">Classes</h1>
          <p className="text-mat-400 text-sm mt-1">
            Every class logged at the gym. Missed one? Catch up here.
          </p>
        </div>
        <DisciplineToggle selected={discipline} onChange={setDiscipline} />
      </div>

      {classes.length === 0 ? (
        <div className="card p-12 text-center text-mat-500">
          No classes logged yet.
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const isExpanded = expandedClass === cls.id;
            return (
              <div key={cls.id} className="card overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedClass(isExpanded ? null : cls.id)
                  }
                  className="w-full text-left p-4 hover:bg-mat-800/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                        cls.discipline === "gi"
                          ? "bg-gi-500"
                          : cls.discipline === "nogi"
                            ? "bg-nogi-500"
                            : "bg-wrestling-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-mat-100 text-sm">
                          {cls.title ||
                            `${cls.discipline === "nogi" ? "No-Gi" : cls.discipline.charAt(0).toUpperCase() + cls.discipline.slice(1)} Class`}
                        </span>
                        {!cls.attended && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-wrestling-500/10 text-wrestling-400 border border-wrestling-500/20">
                            Missed
                          </span>
                        )}
                        {cls.attended && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                            Attended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-mat-500 mt-0.5 flex gap-3">
                        <span>
                          {new Date(cls.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>Coach: {cls.coach.name}</span>
                        <span>{cls.techniques.length} techniques</span>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-mat-500 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-mat-800/50 p-4">
                    {cls.notes && (
                      <div className="mb-4 p-3 rounded-lg bg-mat-800/30 text-sm text-mat-400">
                        {cls.notes}
                      </div>
                    )}

                    <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2">
                      Techniques Covered
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {cls.techniques.map((ct) => (
                        <div
                          key={ct.technique.name}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mat-800/20 border border-mat-800/30"
                        >
                          <span className="text-sm text-mat-300">
                            {ct.technique.name}
                          </span>
                          <span className="text-[10px] text-mat-600 ml-auto">
                            {ct.technique.position.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {!cls.attended && (
                      <div className="mt-4 p-3 rounded-lg bg-nogi-500/5 border border-nogi-500/10">
                        <div className="text-xs font-medium text-nogi-400 mb-1">
                          Catch-up summary
                        </div>
                        <div className="text-xs text-mat-400">
                          This class covered{" "}
                          {cls.techniques.length} technique
                          {cls.techniques.length !== 1 ? "s" : ""} focused on{" "}
                          {[
                            ...new Set(
                              cls.techniques.map(
                                (ct) => ct.technique.position.name
                              )
                            ),
                          ].join(", ")}
                          . Ask your coach or a teammate to walk you through
                          the key concepts.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
