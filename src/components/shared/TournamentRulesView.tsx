"use client";

import { useState } from "react";
import { TOURNAMENT_RULES, IBJJF_LEGAL_SUBS } from "@/lib/data/tournament-rules";
import type { Ruleset } from "@/lib/data/tournament-rules";

const FORMAT_BADGE: Record<string, string> = {
  Gi: "bg-gi-500/15 text-gi-400 border-gi-500/30",
  "No-Gi": "bg-nogi-500/15 text-nogi-400 border-nogi-500/30",
  Both: "bg-wrestling-500/15 text-wrestling-400 border-wrestling-500/30",
};

const BELT_COLORS: Record<string, string> = {
  white: "bg-mat-200",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  brown: "bg-amber-700",
  black: "bg-mat-950 border border-mat-400",
};

function RulesetCard({ ruleset, isExpanded, onToggle }: { ruleset: Ruleset; isExpanded: boolean; onToggle: () => void }) {
  const [tab, setTab] = useState<"scoring" | "subs" | "times" | "penalties">("scoring");

  return (
    <div className="card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 lg:p-5 flex items-start justify-between gap-4 hover:bg-mat-800/20 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-mat-100">{ruleset.shortName}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${FORMAT_BADGE[ruleset.format]}`}>
              {ruleset.format}
            </span>
          </div>
          <p className="text-xs text-mat-400 leading-relaxed">{ruleset.description}</p>
        </div>
        <svg
          className={`w-5 h-5 text-mat-500 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-mat-800/50">
          {/* Tabs */}
          <div className="flex border-b border-mat-800/50 px-4 overflow-x-auto">
            {(["scoring", "subs", "times", "penalties"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t
                    ? "border-gi-500 text-gi-400"
                    : "border-transparent text-mat-500 hover:text-mat-300"
                }`}
              >
                {t === "scoring" ? "Point System" : t === "subs" ? "Submissions" : t === "times" ? "Match Times" : "Penalties"}
              </button>
            ))}
          </div>

          <div className="p-4 lg:p-5">
            {/* Scoring Tab */}
            {tab === "scoring" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-mat-500 uppercase tracking-wider">
                        <th className="pb-2 pr-4">Action</th>
                        <th className="pb-2 pr-4 text-center">Points</th>
                        <th className="pb-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mat-800/30">
                      {ruleset.scoring.map((s) => (
                        <tr key={s.action}>
                          <td className="py-2 pr-4 text-mat-200 font-medium">{s.action}</td>
                          <td className="py-2 pr-4 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gi-500/10 text-gi-400 font-bold text-sm">
                              {s.points}
                            </span>
                          </td>
                          <td className="py-2 text-mat-400 text-xs">{s.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Win conditions */}
                <div className="mt-4 pt-4 border-t border-mat-800/30">
                  <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2">Win Conditions (priority order)</div>
                  <ol className="space-y-1">
                    {ruleset.winConditions.map((w, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-mat-300">
                        <span className="w-5 h-5 rounded-full bg-mat-800 flex items-center justify-center text-[10px] text-mat-500 font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        {w}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Advantages */}
                {ruleset.advantages && (
                  <div className="mt-4 p-3 rounded-lg bg-mat-800/30 border border-mat-700/20">
                    <div className="text-xs font-medium text-mat-400 mb-1">Advantages</div>
                    <p className="text-xs text-mat-400 leading-relaxed">{ruleset.advantages}</p>
                  </div>
                )}

                {/* Key rules */}
                <div className="mt-4 pt-4 border-t border-mat-800/30">
                  <div className="text-xs font-medium text-mat-500 uppercase tracking-wider mb-2">Key Rules</div>
                  <ul className="space-y-1.5">
                    {ruleset.keyRules.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-mat-300">
                        <span className="text-gi-500 mt-0.5">&#8226;</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Submissions Tab */}
            {tab === "subs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Legal
                  </div>
                  <ul className="space-y-1">
                    {ruleset.submissions.allowed.map((s, i) => (
                      <li key={i} className="text-xs text-mat-300 flex items-start gap-2">
                        <span className="text-green-500/50 mt-0.5">&#8226;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Banned / Restricted
                  </div>
                  <ul className="space-y-1">
                    {ruleset.submissions.banned.map((s, i) => (
                      <li key={i} className="text-xs text-mat-400 flex items-start gap-2">
                        <span className="text-red-500/50 mt-0.5">&#8226;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Match Times Tab */}
            {tab === "times" && (
              <div className="space-y-2">
                {ruleset.matchTimes.map((t) => (
                  <div
                    key={t.division}
                    className="flex items-center justify-between p-3 rounded-lg bg-mat-800/20 border border-mat-800/30"
                  >
                    <span className="text-sm text-mat-200">{t.division}</span>
                    <span className="text-sm font-bold text-gi-400 font-mono">{t.time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Penalties Tab */}
            {tab === "penalties" && (
              <div className="space-y-2">
                {ruleset.penalties.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-mat-800/20 border border-mat-800/30"
                  >
                    <div className="text-sm text-mat-200 font-medium">{p.infraction}</div>
                    <div className="text-xs text-red-400 mt-0.5">{p.consequence}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TournamentRulesView() {
  const [expanded, setExpanded] = useState<string>("ibjjf-gi");
  const [showLegalMatrix, setShowLegalMatrix] = useState(false);

  const belts = ["white", "blue", "purple", "brown", "black"];
  const subs = Object.keys(IBJJF_LEGAL_SUBS);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Tournament Rules</h1>
        <p className="text-mat-400 text-sm mt-1">
          Point systems, legal submissions, and match rules for major grappling organizations
        </p>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TOURNAMENT_RULES.map((r) => (
          <button
            key={r.id}
            onClick={() => setExpanded(expanded === r.id ? "" : r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              expanded === r.id
                ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                : "bg-mat-800/50 text-mat-400 border border-mat-700/30 hover:text-mat-200"
            }`}
          >
            {r.shortName}
          </button>
        ))}
      </div>

      {/* IBJJF Legal Submissions Matrix */}
      <div className="card mb-6 overflow-hidden">
        <button
          onClick={() => setShowLegalMatrix(!showLegalMatrix)}
          className="w-full text-left p-4 flex items-center justify-between hover:bg-mat-800/20 transition-colors"
        >
          <div>
            <h3 className="text-sm font-bold text-mat-100">IBJJF Legal Submissions by Belt</h3>
            <p className="text-xs text-mat-500 mt-0.5">Quick reference chart for what&apos;s legal at your belt level</p>
          </div>
          <svg
            className={`w-5 h-5 text-mat-500 transition-transform ${showLegalMatrix ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showLegalMatrix && (
          <div className="border-t border-mat-800/50 p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-mat-500 pb-2 pr-4 uppercase tracking-wider">Submission</th>
                  {belts.map((b) => (
                    <th key={b} className="pb-2 px-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`w-4 h-4 rounded-full ${BELT_COLORS[b]}`} />
                        <span className="text-mat-400 capitalize text-[10px]">{b}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-mat-800/20">
                {subs.map((sub) => (
                  <tr key={sub}>
                    <td className="py-2 pr-4 text-mat-300 font-medium whitespace-nowrap">{sub}</td>
                    {belts.map((belt) => {
                      const legal = IBJJF_LEGAL_SUBS[sub][belt];
                      return (
                        <td key={belt} className="py-2 px-2 text-center">
                          {legal ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 text-green-400">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-500">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ruleset Cards */}
      <div className="space-y-3">
        {TOURNAMENT_RULES.map((ruleset) => (
          <RulesetCard
            key={ruleset.id}
            ruleset={ruleset}
            isExpanded={expanded === ruleset.id}
            onToggle={() => setExpanded(expanded === ruleset.id ? "" : ruleset.id)}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 rounded-lg bg-mat-800/20 border border-mat-700/20">
        <p className="text-[11px] text-mat-500 leading-relaxed">
          Rules are summarized for quick reference. Always check the official rulebook of each organization
          before competing, as rules may change between events. When in doubt, ask the referee before your match.
        </p>
      </div>
    </div>
  );
}
