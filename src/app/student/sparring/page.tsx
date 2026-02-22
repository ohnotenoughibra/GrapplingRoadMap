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

const MOODS = [
  { key: "great", emoji: "🔥", label: "Great" },
  { key: "good", emoji: "😊", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "tough", emoji: "😓", label: "Tough" },
  { key: "bad", emoji: "😵", label: "Rough" },
];

const MOOD_STYLES: Record<string, string> = {
  great: "text-green-400",
  good: "text-gi-400",
  okay: "text-yellow-400",
  tough: "text-orange-400",
  bad: "text-red-400",
};

const QUICK_SUBS = [
  "Armbar", "Triangle", "RNC", "Guillotine", "Kimura", "Americana",
  "Bow & Arrow", "Cross Collar", "D'Arce", "Anaconda", "Heel Hook",
  "Kneebar", "Omoplata", "Ezekiel",
];

const QUICK_POSITIONS = [
  "Closed Guard", "Open Guard", "Half Guard", "Mount", "Side Control",
  "Back Control", "Butterfly", "De La Riva", "Standing", "Leg Entanglements",
];

type Step = "mood" | "details" | "done";

export default function SparringPage() {
  const [logs, setLogs] = useState<SparringLog[]>([]);
  const [step, setStep] = useState<Step | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [mood, setMood] = useState("");
  const [partner, setPartner] = useState("");
  const [rounds, setRounds] = useState(3);
  const [notes, setNotes] = useState("");
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [caughtIn, setCaughtIn] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch("/api/student/sparring")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []));
  }, []);

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/student/sparring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner: partner.trim() || "Training Partner",
          date: new Date().toISOString().split("T")[0],
          rounds,
          duration: 5,
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
        setStep("done");
        // Reset after a moment
        setTimeout(() => {
          setStep(null);
          setMood("");
          setPartner("");
          setNotes("");
          setSubmissions([]);
          setCaughtIn([]);
          setPositions([]);
          setShowAdvanced(false);
        }, 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const parseJson = (str: string | null): string[] => {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return []; }
  };

  const totalRounds = logs.reduce((sum, l) => sum + l.rounds, 0);
  const uniquePartners = new Set(logs.map((l) => l.partner)).size;
  const allSubs = logs.flatMap((l) => parseJson(l.submissions));
  const allCaught = logs.flatMap((l) => parseJson(l.caughtIn));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Sparring Log</h1>
          <p className="text-mat-400 text-sm mt-0.5">Quick capture after rolling</p>
        </div>
        {!step && (
          <button
            onClick={() => setStep("mood")}
            className="btn-primary text-sm"
          >
            + Log Roll
          </button>
        )}
      </div>

      {/* ═══ 3-STEP QUICK CAPTURE ═══ */}
      {step !== null && (
        <div className="card p-5 mb-6 border border-gi-500/20">
          {/* Step indicator */}
          {step !== "done" && (
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === "mood" ? "bg-gi-500 text-white" : "bg-green-500/20 text-green-400"}`}>
              {step === "mood" ? "1" : "✓"}
            </div>
            <div className="h-px flex-1 bg-mat-700" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === "details" ? "bg-gi-500 text-white" : "bg-mat-800 text-mat-500"}`}>
              2
            </div>
          </div>
          )}

          {/* Step 1: Mood — ONE TAP */}
          {step === "mood" && (
            <div>
              <h2 className="text-base font-semibold text-mat-100 mb-4">How&apos;d it go?</h2>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMood(m.key);
                      setStep("details");
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-mat-800/30 bg-mat-800/20 hover:bg-mat-800/50 hover:border-mat-600/50 transition-all active:scale-[0.95]"
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] text-mat-400">{m.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(null)}
                className="mt-4 text-xs text-mat-500 hover:text-mat-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step 2: Quick details (all optional) */}
          {step === "details" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-mat-100">
                  Anything notable?
                  <span className="text-xs text-mat-500 font-normal ml-2">(all optional)</span>
                </h2>
                <span className="text-lg">{MOODS.find((m) => m.key === mood)?.emoji}</span>
              </div>

              {/* Quick notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Quick notes... e.g. 'got a nice triangle on Sam, Jake caught me in a heel hook twice'"
                className="w-full px-3 py-2.5 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50 resize-none mb-3"
                autoFocus
              />

              {/* Partner + rounds — inline */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] font-medium text-mat-500 mb-1">Partner</label>
                  <input
                    type="text"
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-mat-500 mb-1">Rounds</label>
                  <input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm focus:outline-none focus:ring-2 focus:ring-gi-500/50"
                  />
                </div>
              </div>

              {/* Expandable: subs, caught, positions */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs text-mat-500 hover:text-mat-300 mb-3 transition-colors"
              >
                <svg className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Tag submissions & positions
              </button>

              {showAdvanced && (
                <div className="space-y-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-medium text-mat-500 mb-1.5">Submissions Hit</label>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_SUBS.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => toggleItem(submissions, setSubmissions, sub)}
                          className={`px-2 py-1 rounded-md text-[10px] transition-all ${
                            submissions.includes(sub)
                              ? "bg-green-500/15 text-green-400 border border-green-500/30"
                              : "bg-mat-800/30 text-mat-500 border border-mat-700/20"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-mat-500 mb-1.5">Caught In</label>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_SUBS.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => toggleItem(caughtIn, setCaughtIn, sub)}
                          className={`px-2 py-1 rounded-md text-[10px] transition-all ${
                            caughtIn.includes(sub)
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-mat-800/30 text-mat-500 border border-mat-700/20"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-mat-500 mb-1.5">Positions</label>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_POSITIONS.map((pos) => (
                        <button
                          key={pos}
                          onClick={() => toggleItem(positions, setPositions, pos)}
                          className={`px-2 py-1 rounded-md text-[10px] transition-all ${
                            positions.includes(pos)
                              ? "bg-nogi-500/15 text-nogi-400 border border-nogi-500/30"
                              : "bg-mat-800/30 text-mat-500 border border-mat-700/20"
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("mood"); setMood(""); }}
                  className="btn-ghost text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Done state */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">👊</div>
              <p className="text-sm font-medium text-mat-200">Logged!</p>
            </div>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-gi-400">{logs.length}</div>
          <div className="text-[10px] text-mat-500">Sessions</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-nogi-400">{totalRounds}</div>
          <div className="text-[10px] text-mat-500">Rounds</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-mat-300">{uniquePartners}</div>
          <div className="text-[10px] text-mat-500">Partners</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-green-400">{allSubs.length}</div>
          <div className="text-[9px] text-mat-500">Subs</div>
          <div className="text-base font-bold text-red-400">{allCaught.length}</div>
          <div className="text-[9px] text-mat-500">Caught</div>
        </div>
      </div>

      {/* Roll history */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-mat-500 text-sm">No sparring sessions logged yet.</p>
            <button
              onClick={() => setStep("mood")}
              className="mt-3 text-gi-400 text-sm hover:underline"
            >
              Log your first roll
            </button>
          </div>
        ) : (
          logs.map((log) => {
            const subs = parseJson(log.submissions);
            const caught = parseJson(log.caughtIn);
            const pos = parseJson(log.positions);
            const moodEmoji = MOODS.find((m) => m.key === log.mood)?.emoji;

            return (
              <div key={log.id} className="card p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {moodEmoji && <span className="text-base">{moodEmoji}</span>}
                    <span className="text-sm font-medium text-mat-200">{log.partner}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {subs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400">
                        {subs.length} sub{subs.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {caught.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400">
                        {caught.length} caught
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-mat-500">
                  {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {" · "}{log.rounds}r
                  {log.duration ? ` · ${log.duration}min` : ""}
                </div>
                {(subs.length > 0 || caught.length > 0 || pos.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {subs.map((s, i) => <span key={`s-${i}`} className="px-1.5 py-0.5 rounded text-[9px] bg-green-500/10 text-green-400">{s}</span>)}
                    {caught.map((c, i) => <span key={`c-${i}`} className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/10 text-red-400">{c}</span>)}
                    {pos.map((p, i) => <span key={`p-${i}`} className="px-1.5 py-0.5 rounded text-[9px] bg-nogi-500/10 text-nogi-400">{p}</span>)}
                  </div>
                )}
                {log.notes && <p className="text-[10px] text-mat-400 mt-1.5 italic">{log.notes}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
