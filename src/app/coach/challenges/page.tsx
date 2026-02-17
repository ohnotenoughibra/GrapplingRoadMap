"use client";

import { useState, useEffect } from "react";

interface Participant {
  user: { id: string; name: string };
  progress: number;
  completed: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  startDate: string;
  endDate: string;
  active: boolean;
  creator: { name: string };
  participants: Participant[];
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "attendance", target: 5,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((d) => setChallenges(d.challenges || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const challenge = await res.json();
      setChallenges([{ ...challenge, participants: [] }, ...challenges]);
      setShowForm(false);
      setForm({ title: "", description: "", type: "attendance", target: 5, startDate: new Date().toISOString().split("T")[0], endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });
    }
    setSubmitting(false);
  }

  const typeEmoji = (t: string) => t === "attendance" ? "\u{1F94B}" : t === "skill" ? "\u{1F3AF}" : "\u26A1";
  const daysLeft = (end: string) => {
    const d = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return d > 0 ? `${d}d left` : "Ended";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mat-100">Challenges</h1>
          <p className="text-sm text-mat-500 mt-1">Create challenges to motivate your students</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold transition-all active:scale-[0.97]"
        >
          {showForm ? "Cancel" : "+ New Challenge"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-3">
          <input type="text" placeholder="Challenge title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50 resize-none" />

          <div className="flex gap-2">
            {["attendance", "skill", "custom"].map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.type === t ? "bg-gi-500/20 border border-gi-500/40 text-gi-400" : "bg-mat-800/30 border border-mat-700/30 text-mat-500"}`}>
                {typeEmoji(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-mat-500 mb-1 block">Target</label>
              <input type="number" min={1} value={form.target} onChange={(e) => setForm({ ...form, target: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm text-center focus:outline-none focus:border-gi-500/50" />
            </div>
            <div>
              <label className="text-xs text-mat-500 mb-1 block">Start</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-gi-500/50" />
            </div>
            <div>
              <label className="text-xs text-mat-500 mb-1 block">End</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:border-gi-500/50" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]">
            {submitting ? "Creating..." : "Create Challenge"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-mat-500">Loading challenges...</div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">{"\u{1F525}"}</div>
          <div className="text-mat-400 font-medium">No active challenges</div>
          <div className="text-sm text-mat-500 mt-1">Create one to motivate your students</div>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((ch) => (
            <div key={ch.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-mat-100 flex items-center gap-2">
                    {typeEmoji(ch.type)} {ch.title}
                  </h3>
                  {ch.description && <p className="text-sm text-mat-400 mt-1">{ch.description}</p>}
                </div>
                <span className="text-xs text-mat-500 whitespace-nowrap">{daysLeft(ch.endDate)}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-mat-500 mb-3">
                <span>Target: {ch.target} {ch.type === "attendance" ? "classes" : ch.type === "skill" ? "techniques" : "points"}</span>
                <span>{ch.participants.length} joined</span>
                <span>by {ch.creator.name}</span>
              </div>

              {ch.participants.length > 0 && (
                <div className="space-y-2">
                  {ch.participants.map((p) => (
                    <div key={p.user.id} className="flex items-center gap-3">
                      <span className="text-xs text-mat-300 w-20 truncate">{p.user.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-mat-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${p.completed ? "bg-green-500" : "bg-gi-500"}`}
                          style={{ width: `${Math.min((p.progress / ch.target) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-mat-500">{p.progress}/{ch.target}</span>
                      {p.completed && <span className="text-green-400 text-xs">Done!</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
