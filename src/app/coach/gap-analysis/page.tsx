"use client";

import { useState, useEffect } from "react";
import DisciplineToggle from "@/components/shared/DisciplineToggle";
import { Discipline } from "@/types";

interface GapData {
  neverTaught: Array<{ id: string; name: string; position: string; category: string; discipline: string }>;
  stale: Array<{ id: string; name: string; position: string; category: string; discipline: string; lastTaught: string; daysSince: number }>;
  weakSpots: Array<{ id: string; name: string; position: string; struggleRate: number }>;
  coverage: Array<{ position: string; total: number; taught: number; percent: number }>;
  summary: { totalTechniques: number; neverTaughtCount: number; staleCount: number };
}

export default function GapAnalysisPage() {
  const [data, setData] = useState<GapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [discipline, setDiscipline] = useState<Discipline | "all">("all");
  const [tab, setTab] = useState<"coverage" | "never" | "stale" | "weak">("coverage");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/coach/gap-analysis?discipline=${discipline}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [discipline]);

  if (loading || !data) return <div className="text-center py-12 text-mat-500">Analyzing curriculum gaps...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mat-100">Gap Analysis</h1>
        <p className="text-sm text-mat-500 mt-1">Find what you&apos;re missing in your curriculum</p>
      </div>

      <div className="mb-6">
        <DisciplineToggle selected={discipline} onChange={setDiscipline} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-mat-100">{data.summary.totalTechniques}</div>
          <div className="text-xs text-mat-500">Total Techniques</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{data.summary.neverTaughtCount}</div>
          <div className="text-xs text-mat-500">Never Taught</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{data.summary.staleCount}</div>
          <div className="text-xs text-mat-500">Stale (30+ days)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-mat-800/30 border border-mat-700/30">
        {([
          { key: "coverage", label: "Position Coverage" },
          { key: "never", label: `Never Taught (${data.neverTaught.length})` },
          { key: "stale", label: `Stale (${data.stale.length})` },
          { key: "weak", label: `Weak Spots (${data.weakSpots.length})` },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              tab === t.key ? "bg-mat-700/50 text-mat-100" : "text-mat-500 hover:text-mat-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "coverage" && (
        <div className="space-y-2">
          {data.coverage.map((c) => (
            <div key={c.position} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-mat-200">{c.position}</span>
                <span className={`text-sm font-bold ${c.percent >= 75 ? "text-green-400" : c.percent >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                  {c.percent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-mat-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${c.percent >= 75 ? "bg-green-500" : c.percent >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${c.percent}%` }}
                />
              </div>
              <div className="text-xs text-mat-500 mt-1">{c.taught} of {c.total} techniques covered</div>
            </div>
          ))}
        </div>
      )}

      {tab === "never" && (
        <div className="space-y-2">
          {data.neverTaught.map((t) => (
            <div key={t.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-mat-200">{t.name}</div>
                <div className="text-xs text-mat-500">{t.position} &middot; {t.category}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${t.discipline === "gi" ? "bg-gi-500" : t.discipline === "nogi" ? "bg-nogi-500" : t.discipline === "wrestling" ? "bg-wrestling-500" : "bg-mat-400"}`} />
            </div>
          ))}
        </div>
      )}

      {tab === "stale" && (
        <div className="space-y-2">
          {data.stale.map((t) => (
            <div key={t.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-mat-200">{t.name}</div>
                <div className="text-xs text-mat-500">{t.position} &middot; {t.category}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-yellow-400">{t.daysSince}d ago</div>
                <div className="text-[10px] text-mat-500">last taught</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "weak" && (
        <div className="space-y-2">
          {data.weakSpots.map((t) => (
            <div key={t.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-mat-200">{t.name}</div>
                <div className="text-xs text-mat-500">{t.position}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-red-400">{t.struggleRate}%</div>
                <div className="text-[10px] text-mat-500">students struggling</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
