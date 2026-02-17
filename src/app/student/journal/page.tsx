"use client";

import { useState, useEffect } from "react";

const MOODS = [
  { value: "great", label: "Fired Up", emoji: "😤" },
  { value: "good", label: "Good", emoji: "💪" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "tough", label: "Tough", emoji: "😓" },
  { value: "bad", label: "Rough", emoji: "😵" },
];

interface TrainingLog {
  id: string;
  date: string;
  title: string | null;
  content: string;
  mood: string | null;
  energy: number | null;
  createdAt: string;
}

export default function JournalPage() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/training-log")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/training-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || null, content, mood, energy }),
    });

    if (res.ok) {
      const log = await res.json();
      setLogs([log, ...logs]);
      setTitle("");
      setContent("");
      setMood(null);
      setEnergy(null);
      setShowForm(false);
    }
    setSubmitting(false);
  }

  const moodEmoji = (m: string | null) => MOODS.find((x) => x.value === m)?.emoji || "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mat-100">Training Journal</h1>
          <p className="text-sm text-mat-500 mt-1">Your personal training notes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold transition-all active:scale-[0.97]"
        >
          {showForm ? "Cancel" : "+ New Entry"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-4">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50"
          />
          <textarea
            placeholder="What happened in training today? What clicked? What's still fuzzy?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50 resize-none"
          />

          <div>
            <div className="text-xs text-mat-500 mb-2">How'd it feel?</div>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? null : m.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    mood === m.value
                      ? "bg-gi-500/20 border border-gi-500/40 text-mat-100"
                      : "bg-mat-800/30 border border-mat-700/30 text-mat-400 hover:text-mat-300"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span className="hidden sm:inline text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-mat-500 mb-2">Energy level</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergy(energy === n ? null : n)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    energy !== null && n <= energy
                      ? "bg-nogi-500/30 border border-nogi-500/50 text-nogi-400"
                      : "bg-mat-800/30 border border-mat-700/30 text-mat-500"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gi-500 to-nogi-500 text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {submitting ? "Saving..." : "Save Entry"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-mat-500">Loading journal...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📓</div>
          <div className="text-mat-400 font-medium">No entries yet</div>
          <div className="text-sm text-mat-500 mt-1">Start logging your training thoughts</div>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {log.title && (
                    <h3 className="font-semibold text-mat-100 text-sm">{log.title}</h3>
                  )}
                  <div className="text-xs text-mat-500">
                    {new Date(log.date || log.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.mood && <span className="text-lg">{moodEmoji(log.mood)}</span>}
                  {log.energy && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`w-1.5 h-1.5 rounded-full ${
                            n <= log.energy! ? "bg-nogi-500" : "bg-mat-700"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-mat-300 whitespace-pre-wrap">{log.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
