"use client";

import { useState, useEffect } from "react";

const RESULTS = [
  { value: "gold", label: "Gold", color: "text-yellow-400" },
  { value: "silver", label: "Silver", color: "text-mat-300" },
  { value: "bronze", label: "Bronze", color: "text-orange-400" },
  { value: "loss", label: "Loss", color: "text-mat-500" },
];

interface Competition {
  id: string;
  name: string;
  date: string;
  location: string | null;
  discipline: string;
  weightClass: string | null;
  result: string | null;
  wins: number;
  losses: number;
  submissionBy: string | null;
  submittedBy: string | null;
  notes: string | null;
  gamePlan: string | null;
}

export default function CompetitionsPage() {
  const [comps, setComps] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", date: "", location: "", discipline: "nogi",
    weightClass: "", result: "", wins: 0, losses: 0,
    submissionBy: "", submittedBy: "", notes: "", gamePlan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/competitions")
      .then((r) => r.json())
      .then((d) => setComps(d.competitions || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/competitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const comp = await res.json();
      setComps([comp, ...comps]);
      setShowForm(false);
      setForm({ name: "", date: "", location: "", discipline: "nogi", weightClass: "", result: "", wins: 0, losses: 0, submissionBy: "", submittedBy: "", notes: "", gamePlan: "" });
    }
    setSubmitting(false);
  }

  const resultConfig = (r: string | null) => RESULTS.find((x) => x.value === r);
  const medalEmoji = (r: string | null) => r === "gold" ? "🥇" : r === "silver" ? "🥈" : r === "bronze" ? "🥉" : "";

  const totalWins = comps.reduce((s, c) => s + c.wins, 0);
  const totalLosses = comps.reduce((s, c) => s + c.losses, 0);
  const golds = comps.filter((c) => c.result === "gold").length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mat-100">Competitions</h1>
          <p className="text-sm text-mat-500 mt-1">Track your tournament journey</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold transition-all active:scale-[0.97]"
        >
          {showForm ? "Cancel" : "+ Log Comp"}
        </button>
      </div>

      {/* Stats bar */}
      {comps.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-mat-100">{comps.length}</div>
            <div className="text-[10px] text-mat-500">Comps</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-green-400">{totalWins}</div>
            <div className="text-[10px] text-mat-500">Wins</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-mat-400">{totalLosses}</div>
            <div className="text-[10px] text-mat-500">Losses</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{golds}</div>
            <div className="text-[10px] text-mat-500">Golds</div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Tournament name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="col-span-2 px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-gi-500/50" />
            <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50" />
          </div>

          <div className="flex gap-2">
            {["gi", "nogi", "both"].map((d) => (
              <button key={d} type="button" onClick={() => setForm({ ...form, discipline: d })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.discipline === d ? "bg-gi-500/20 border border-gi-500/40 text-gi-400" : "bg-mat-800/30 border border-mat-700/30 text-mat-500"}`}>
                {d === "nogi" ? "No-Gi" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Weight class" value={form.weightClass} onChange={(e) => setForm({ ...form, weightClass: e.target.value })} className="px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50" />
            <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-gi-500/50">
              <option value="">Result</option>
              {RESULTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-mat-500">Wins</label>
              <input type="number" min={0} value={form.wins} onChange={(e) => setForm({ ...form, wins: parseInt(e.target.value) || 0 })} className="w-16 px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm text-center focus:outline-none focus:border-gi-500/50" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-mat-500">Losses</label>
              <input type="number" min={0} value={form.losses} onChange={(e) => setForm({ ...form, losses: parseInt(e.target.value) || 0 })} className="w-16 px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm text-center focus:outline-none focus:border-gi-500/50" />
            </div>
          </div>

          <input type="text" placeholder="Won by (e.g. armbar, points)" value={form.submissionBy} onChange={(e) => setForm({ ...form, submissionBy: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50" />
          <input type="text" placeholder="Lost by (e.g. RNC, points)" value={form.submittedBy} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50" />
          <textarea placeholder="Notes / takeaways" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50 resize-none" />
          <textarea placeholder="Game plan (what you planned to do)" value={form.gamePlan} onChange={(e) => setForm({ ...form, gamePlan: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50 resize-none" />

          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]">
            {submitting ? "Saving..." : "Log Competition"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-mat-500">Loading...</div>
      ) : comps.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏆</div>
          <div className="text-mat-400 font-medium">No competitions logged</div>
          <div className="text-sm text-mat-500 mt-1">Log your first tournament</div>
        </div>
      ) : (
        <div className="space-y-3">
          {comps.map((comp) => (
            <div key={comp.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-mat-100 text-sm flex items-center gap-2">
                    {medalEmoji(comp.result)} {comp.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-mat-500 mt-1">
                    <span>{new Date(comp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {comp.location && <span>{comp.location}</span>}
                    <span className={comp.discipline === "gi" ? "text-gi-400" : comp.discipline === "nogi" ? "text-nogi-400" : "text-mat-400"}>
                      {comp.discipline === "nogi" ? "No-Gi" : comp.discipline.charAt(0).toUpperCase() + comp.discipline.slice(1)}
                    </span>
                    {comp.weightClass && <span>{comp.weightClass}</span>}
                  </div>
                </div>
                {comp.result && (
                  <span className={`text-sm font-semibold ${resultConfig(comp.result)?.color || "text-mat-400"}`}>
                    {resultConfig(comp.result)?.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm mb-2">
                <span className="text-green-400">{comp.wins}W</span>
                <span className="text-mat-400">{comp.losses}L</span>
                {comp.submissionBy && <span className="text-xs text-mat-500">Won by: {comp.submissionBy}</span>}
                {comp.submittedBy && <span className="text-xs text-mat-500">Lost by: {comp.submittedBy}</span>}
              </div>

              {comp.gamePlan && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-mat-800/30 border border-mat-700/20">
                  <div className="text-[10px] text-mat-500 uppercase tracking-wider mb-1">Game Plan</div>
                  <p className="text-xs text-mat-400">{comp.gamePlan}</p>
                </div>
              )}
              {comp.notes && <p className="text-xs text-mat-400 mt-2">{comp.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
