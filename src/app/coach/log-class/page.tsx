"use client";

import { useState, useEffect } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import type { Discipline } from "@/types";

interface Position {
  id: string;
  name: string;
  slug: string;
}

interface Technique {
  id: string;
  name: string;
  slug: string;
  discipline: string;
  category: string;
  difficulty: string;
  position: Position;
}

interface Student {
  id: string;
  name: string;
  beltRank: string;
}

export default function LogClassPage() {
  const [discipline, setDiscipline] = useState<Discipline>("nogi");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Fetch techniques and students
  useEffect(() => {
    fetch("/api/techniques")
      .then((r) => r.json())
      .then((data) => {
        setTechniques(data.techniques || []);
        setPositions(data.positions || []);
      });
    fetch("/api/coach/attendance")
      .then((r) => r.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch(() => {});
  }, []);

  // Filter techniques
  const filtered = techniques.filter((t) => {
    const matchesDiscipline =
      t.discipline === "all" || t.discipline === discipline;
    const matchesPosition =
      filterPosition === "all" || t.position.slug === filterPosition;
    const matchesSearch =
      !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchesDiscipline && matchesPosition && matchesSearch;
  });

  // Group by position
  const grouped = filtered.reduce(
    (acc, t) => {
      const key = t.position.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    },
    {} as Record<string, Technique[]>
  );

  const toggleTechnique = (id: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedTechniques.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          discipline,
          title: title || undefined,
          notes: notes || undefined,
          techniqueIds: selectedTechniques,
          attendeeIds: selectedStudents.length > 0 ? selectedStudents : undefined,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setSelectedTechniques([]);
        setSelectedStudents([]);
        setTitle("");
        setNotes("");
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Log a Class</h1>
        <p className="text-mat-400 text-sm mt-1">
          Record what was covered. Takes 30 seconds.
        </p>
      </div>

      {/* Success message */}
      {saved && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          Class logged successfully. Your students&apos; journeys have been updated.
        </div>
      )}

      {/* Class details */}
      <div className="card p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-mat-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-3 lg:py-2 rounded-xl lg:rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50 focus:border-gi-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mat-400 mb-1.5">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Lasso Guard Attacks"
              className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50 focus:border-gi-500/50"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-mat-400 mb-1.5">
            Discipline
          </label>
          <DisciplineToggle
            selected={discipline}
            onChange={(d) => {
              if (d !== "all") setDiscipline(d);
            }}
            showAll={false}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-mat-400 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Key concepts, drills, focus areas..."
            className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50 focus:border-gi-500/50 resize-none"
          />
        </div>
      </div>

      {/* Attendance */}
      {students.length > 0 && (
        <div className="card p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
              Who Trained?
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-mat-500">{selectedStudents.length} present</span>
              <button
                onClick={() =>
                  setSelectedStudents(
                    selectedStudents.length === students.length
                      ? []
                      : students.map((s) => s.id)
                  )
                }
                className="text-xs text-gi-400 hover:text-gi-300"
              >
                {selectedStudents.length === students.length ? "Clear" : "All"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {students.map((s) => {
              const isSelected = selectedStudents.includes(s.id);
              const beltColors: Record<string, string> = {
                white: "border-mat-300",
                blue: "border-blue-500",
                purple: "border-purple-500",
                brown: "border-amber-700",
                black: "border-mat-100",
              };
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelectedStudents(
                      isSelected
                        ? selectedStudents.filter((id) => id !== s.id)
                        : [...selectedStudents, s.id]
                    )
                  }
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-gi-500/10 text-gi-400 border border-gi-500/30"
                      : "bg-mat-800/30 text-mat-400 border border-mat-700/20 hover:text-mat-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full border-2 ${beltColors[s.beltRank] || "border-mat-500"}`}
                  />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Technique selection */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
            Techniques Covered
          </h2>
          <span className="text-xs text-mat-500">
            {selectedTechniques.length} selected
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search techniques..."
            className="flex-1 px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50"
          />
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
          >
            <option value="all">All Positions</option>
            {positions.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected techniques preview */}
        {selectedTechniques.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-gi-500/5 border border-gi-500/10">
            <div className="flex flex-wrap gap-2">
              {selectedTechniques.map((id) => {
                const tech = techniques.find((t) => t.id === id);
                return tech ? (
                  <button
                    key={id}
                    onClick={() => toggleTechnique(id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gi-500/10 text-gi-400 text-xs hover:bg-gi-500/20 transition-colors"
                  >
                    {tech.name}
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Technique list */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {Object.entries(grouped).map(([positionName, techs]) => (
            <div key={positionName}>
              <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2 sticky top-0 bg-mat-900/90 backdrop-blur-sm py-1">
                {positionName}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {techs.map((t) => {
                  const isSelected = selectedTechniques.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTechnique(t.id)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                        isSelected
                          ? "bg-gi-500/10 border border-gi-500/30 text-gi-400"
                          : "bg-mat-800/30 border border-mat-800/30 text-mat-300 hover:bg-mat-800/50 hover:text-mat-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-gi-500 border-gi-500"
                              : "border-mat-600"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">{t.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit — sticky on mobile */}
      <div className="sticky bottom-20 lg:static mt-4 lg:mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedTechniques.length === 0 || saving}
          className="btn-primary w-full lg:w-auto disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-mat-950/80 lg:shadow-none"
        >
          {saving ? "Logging..." : `Log Class (${selectedTechniques.length} techniques)`}
        </button>
      </div>
    </div>
  );
}
