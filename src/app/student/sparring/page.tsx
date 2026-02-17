"use client";

import { useState, useEffect } from "react";

interface SparringLog {
  id: string;
  date: string;
  partner: string;
  rounds: number;
  duration: number | null;
  notes: string | null;
  submissions: string | null;
  caughtIn: string | null;
  positions: string | null;
  mood: string | null;
}

const MOOD_MAP: Record<string, { label: string; color: string }> = {
  great: { label: "Fired Up", color: "text-green-400" },
  good: { label: "Good", color: "text-gi-400" },
  okay: { label: "Okay", color: "text-yellow-400" },
  tough: { label: "Tough", color: "text-orange-400" },
  bad: { label: "Rough", color: "text-red-400" },
};

const COMMON_SUBS = [
  "Armbar", "Triangle", "RNC", "Guillotine", "Kimura", "Americana",
  "Bow & Arrow", "Cross Collar", "D'Arce", "Anaconda", "Heel Hook",
  "Kneebar", "Toe Hold", "Ezekiel", "Loop Choke", "Omoplata",
];

const COMMON_POSITIONS = [
  "Closed Guard", "Open Guard", "Half Guard", "Mount", "Side Control",
  "Back Control", "Butterfly", "De La Riva", "X-Guard", "Turtle",
  "Standing", "50/50", "Leg Entanglements", "North-South",
];

export default function SparringPage() {
  const [logs, setLogs] = useState<SparringLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [partner, setPartner] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rounds, setRounds] = useState(3);
  const [duration, setDuration] = useState(5);
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [caughtIn, setCaughtIn] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/student/sparring")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []));
  }, []);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSubmit = async () => {
    if (!partner.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/student/sparring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner: partner.trim(),
          date,
          rounds,
          duration,
          mood: mood || undefined,
          notes: notes || undefined,
          submissions: submissions.length > 0 ? submissions : undefined,
          caughtIn: caughtIn.length > 0 ? caughtIn : undefined,
          positions: positions.length > 0 ? positions : undefined,
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        setLogs([newLog, ...logs]);
        setShowForm(false);
        setPartner("");
        setNotes("");
        setSubmissions([]);
        setCaughtIn([]);
        setPositions([]);
        setMood("");
      }
    } finally {
      setSaving(false);
    }
  };

  const parseJson = (str: string | null): string[] => {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return []; }
  };

  // Stats
  const totalRounds = logs.reduce((sum, l) => sum + l.rounds, 0);
  const uniquePartners = new Set(logs.map((l) => l.partner)).size;
  const allSubs = logs.flatMap((l) => parseJson(l.submissions));
  const allCaught = logs.flatMap((l) => parseJson(l.caughtIn));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Sparring Log</h1>
          <p className="text-mat-400 text-sm mt-1">Track your rolls, partners, and progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          {showForm ? "Cancel" : "+ Log Roll"}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gi-400">{logs.length}</div>
          <div className="text-xs text-mat-500">Sessions</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-nogi-400">{totalRounds}</div>
          <div className="text-xs text-mat-500">Total Rounds</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-wrestling-400">{uniquePartners}</div>
          <div className="text-xs text-mat-500">Partners</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{allSubs.length}</div>
          <div className="text-xs text-mat-400">Subs Hit</div>
          <div className="text-lg font-bold text-red-400 mt-1">{allCaught.length}</div>
          <div className="text-xs text-mat-500">Caught In</div>
        </div>
      </div>

      {/* New Roll Form */}
      {showForm && (
        <div className="card p-4 lg:p-6 mb-6 border border-gi-500/20">
          <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">Log a Roll</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-mat-400 mb-1.5">Partner</label>
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="Who did you roll with?"
                className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mat-400 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-3 lg:py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-base lg:text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-mat-400 mb-1.5">Rounds</label>
              <input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                min={1}
                max={20}
                className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mat-400 mb-1.5">Min/Round</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={30}
                className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
              />
            </div>
          </div>

          {/* Mood */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-mat-400 mb-2">How did it feel?</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MOOD_MAP).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => setMood(mood === key ? "" : key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    mood === key
                      ? `${color} bg-mat-700 border border-mat-600`
                      : "text-mat-400 bg-mat-800/50 border border-mat-700/30 hover:text-mat-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Hit */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-mat-400 mb-2">Submissions Hit</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUBS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleItem(submissions, setSubmissions, sub)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${
                    submissions.includes(sub)
                      ? "bg-green-500/15 text-green-400 border border-green-500/30"
                      : "bg-mat-800/30 text-mat-400 border border-mat-700/20 hover:text-mat-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Caught In */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-mat-400 mb-2">Caught In</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUBS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleItem(caughtIn, setCaughtIn, sub)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${
                    caughtIn.includes(sub)
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : "bg-mat-800/30 text-mat-400 border border-mat-700/20 hover:text-mat-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Positions Played */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-mat-400 mb-2">Positions Played</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => toggleItem(positions, setPositions, pos)}
                  className={`px-2 py-1 rounded-md text-xs transition-all ${
                    positions.includes(pos)
                      ? "bg-nogi-500/15 text-nogi-400 border border-nogi-500/30"
                      : "bg-mat-800/30 text-mat-400 border border-mat-700/20 hover:text-mat-200"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-mat-400 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What went well? What to work on?"
              className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!partner.trim() || saving}
            className="btn-primary w-full disabled:opacity-40"
          >
            {saving ? "Saving..." : "Log Roll"}
          </button>
        </div>
      )}

      {/* Roll History */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-mat-500 text-sm">No sparring sessions logged yet. Hit &quot;+ Log Roll&quot; to start tracking.</div>
          </div>
        ) : (
          logs.map((log) => {
            const subs = parseJson(log.submissions);
            const caught = parseJson(log.caughtIn);
            const pos = parseJson(log.positions);
            const moodInfo = log.mood ? MOOD_MAP[log.mood] : null;

            return (
              <div key={log.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-mat-100">{log.partner}</span>
                      {moodInfo && (
                        <span className={`text-xs ${moodInfo.color}`}>{moodInfo.label}</span>
                      )}
                    </div>
                    <div className="text-xs text-mat-500 mt-0.5">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {" · "}
                      {log.rounds} round{log.rounds !== 1 ? "s" : ""}
                      {log.duration ? ` · ${log.duration}min each` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {subs.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400">
                        {subs.length} sub{subs.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {caught.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                        {caught.length} caught
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {subs.map((s, i) => (
                    <span key={`s-${i}`} className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400">{s}</span>
                  ))}
                  {caught.map((c, i) => (
                    <span key={`c-${i}`} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400">{c}</span>
                  ))}
                  {pos.map((p, i) => (
                    <span key={`p-${i}`} className="px-1.5 py-0.5 rounded text-[10px] bg-nogi-500/10 text-nogi-400">{p}</span>
                  ))}
                </div>

                {log.notes && (
                  <p className="text-xs text-mat-400 mt-2 italic">{log.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
