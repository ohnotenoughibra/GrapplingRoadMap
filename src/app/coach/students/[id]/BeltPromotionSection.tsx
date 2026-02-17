"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BELTS = ["white", "blue", "purple", "brown", "black"];
const BELT_COLORS: Record<string, string> = {
  white: "bg-mat-100",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  brown: "bg-amber-700",
  black: "bg-mat-900 border border-mat-500",
};

interface Promotion {
  id: string;
  fromBelt: string;
  toBelt: string;
  stripes: number;
  notes: string | null;
  coachName: string;
  date: string;
}

export default function BeltPromotionSection({
  studentId,
  currentBelt,
  promotions,
}: {
  studentId: string;
  currentBelt: string;
  promotions: Promotion[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [toBelt, setToBelt] = useState("");
  const [stripes, setStripes] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextBelts = BELTS.filter(
    (b) => BELTS.indexOf(b) > BELTS.indexOf(currentBelt)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!toBelt) return;
    setSubmitting(true);

    const res = await fetch("/api/coach/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, toBelt, stripes, notes: notes || null }),
    });

    if (res.ok) {
      setShowForm(false);
      setToBelt("");
      setStripes(0);
      setNotes("");
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider">
          Belt Timeline
        </h2>
        {nextBelts.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-gi-400 hover:text-gi-300"
          >
            {showForm ? "Cancel" : "Promote"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-lg bg-mat-800/30 border border-mat-700/30 space-y-3">
          <div>
            <div className="text-xs text-mat-500 mb-2">Promote to</div>
            <div className="flex gap-2">
              {nextBelts.map((belt) => (
                <button
                  key={belt}
                  type="button"
                  onClick={() => setToBelt(belt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                    toBelt === belt
                      ? "bg-gi-500/20 border border-gi-500/40 text-mat-100"
                      : "bg-mat-800/30 border border-mat-700/30 text-mat-400"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${BELT_COLORS[belt]}`} />
                  {belt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-mat-500 mb-2">Stripes</div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStripes(s)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                    stripes === s
                      ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
                      : "bg-mat-800/30 border border-mat-700/30 text-mat-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Promotion notes (optional)"
            className="w-full px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-xs focus:outline-none focus:border-gi-500/50"
          />

          <button
            type="submit"
            disabled={submitting || !toBelt}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            {submitting ? "Promoting..." : "Confirm Promotion"}
          </button>
        </form>
      )}

      {/* Current belt */}
      <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-mat-800/30">
        <div className={`w-4 h-4 rounded-full ${BELT_COLORS[currentBelt]}`} />
        <span className="text-sm font-medium text-mat-200 capitalize">{currentBelt} Belt</span>
        <span className="text-[10px] text-mat-500 ml-auto">Current</span>
      </div>

      {/* Promotion history */}
      {promotions.length > 0 && (
        <div className="space-y-2 mt-3">
          <div className="text-[10px] text-mat-500 uppercase tracking-wider">History</div>
          {promotions.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${BELT_COLORS[p.fromBelt]}`} />
              <svg className="w-3 h-3 text-mat-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <div className={`w-3 h-3 rounded-full ${BELT_COLORS[p.toBelt]}`} />
              <span className="text-mat-400 capitalize">{p.toBelt}</span>
              {p.stripes > 0 && (
                <span className="text-yellow-500">{"★".repeat(p.stripes)}</span>
              )}
              <span className="text-mat-600 ml-auto">
                {new Date(p.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
