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

/* ── Scoring card (replaces table) ─────────────────────────────────── */
function ScoringList({ ruleset }: { ruleset: Ruleset }) {
  return (
    <div>
      <div className="space-y-2">
        {ruleset.scoring.map((s) => (
          <div
            key={s.action}
            className="flex items-center gap-3 p-3 rounded-lg bg-mat-800/20 border border-mat-800/30"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gi-500/10 text-gi-400 font-bold text-base flex-shrink-0">
              {s.points}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-mat-200">{s.action}</div>
              {s.notes && (
                <div className="text-[11px] text-mat-500 leading-snug mt-0.5">{s.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Win conditions */}
      <div className="mt-4 pt-4 border-t border-mat-800/30">
        <div className="text-[10px] font-medium text-mat-500 uppercase tracking-wider mb-2">
          Win Conditions (priority order)
        </div>
        <ol className="space-y-1.5">
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
          <div className="text-[10px] font-medium text-mat-400 uppercase tracking-wider mb-1">
            Advantages
          </div>
          <p className="text-xs text-mat-400 leading-relaxed">{ruleset.advantages}</p>
        </div>
      )}

      {/* Key rules */}
      <div className="mt-4 pt-4 border-t border-mat-800/30">
        <div className="text-[10px] font-medium text-mat-500 uppercase tracking-wider mb-2">
          Key Rules
        </div>
        <ul className="space-y-1.5">
          {ruleset.keyRules.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-mat-300 leading-relaxed">
              <span className="text-gi-500 mt-0.5 flex-shrink-0">&#8226;</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Ruleset Card ──────────────────────────────────────────────────── */
function RulesetCard({
  ruleset,
  isExpanded,
  onToggle,
}: {
  ruleset: Ruleset;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<"scoring" | "subs" | "times" | "penalties">("scoring");

  const tabs = [
    { key: "scoring" as const, label: "Points" },
    { key: "subs" as const, label: "Subs" },
    { key: "times" as const, label: "Times" },
    { key: "penalties" as const, label: "Fouls" },
  ];

  return (
    <div className="card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start justify-between gap-3 active:bg-mat-800/30 lg:hover:bg-mat-800/20 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-mat-100">{ruleset.shortName}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${FORMAT_BADGE[ruleset.format]}`}
            >
              {ruleset.format}
            </span>
          </div>
          <p className="text-[11px] text-mat-400 leading-relaxed line-clamp-2 lg:line-clamp-none">
            {ruleset.description}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-mat-500 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-mat-800/50">
          {/* Tabs — equal width grid on mobile */}
          <div className="grid grid-cols-4 border-b border-mat-800/50">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`py-2.5 text-[11px] lg:text-xs font-medium border-b-2 transition-colors text-center ${
                  tab === t.key
                    ? "border-gi-500 text-gi-400"
                    : "border-transparent text-mat-500 active:text-mat-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Scoring Tab */}
            {tab === "scoring" && <ScoringList ruleset={ruleset} />}

            {/* Submissions Tab */}
            {tab === "subs" && (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-medium text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Legal
                  </div>
                  <ul className="space-y-1">
                    {ruleset.submissions.allowed.map((s, i) => (
                      <li key={i} className="text-xs text-mat-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-green-500/50 mt-0.5 flex-shrink-0">&#8226;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t border-mat-800/30">
                  <div className="text-[10px] font-medium text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Banned / Restricted
                  </div>
                  <ul className="space-y-1">
                    {ruleset.submissions.banned.map((s, i) => (
                      <li key={i} className="text-xs text-mat-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-red-500/50 mt-0.5 flex-shrink-0">&#8226;</span>
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
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-mat-800/20 border border-mat-800/30"
                  >
                    <span className="text-xs text-mat-200 min-w-0">{t.division}</span>
                    <span className="text-xs font-bold text-gi-400 font-mono whitespace-nowrap flex-shrink-0">
                      {t.time}
                    </span>
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
                    <div className="text-xs text-mat-200 font-medium">{p.infraction}</div>
                    <div className="text-[11px] text-red-400 mt-0.5">{p.consequence}</div>
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

/* ── Belt Matrix (mobile-friendly) ─────────────────────────────────── */
function BeltMatrix() {
  const [showMatrix, setShowMatrix] = useState(false);
  const belts = ["white", "blue", "purple", "brown", "black"] as const;
  const subs = Object.keys(IBJJF_LEGAL_SUBS);

  return (
    <div className="card mb-4 overflow-hidden">
      <button
        onClick={() => setShowMatrix(!showMatrix)}
        className="w-full text-left p-4 flex items-center justify-between gap-3 active:bg-mat-800/30 lg:hover:bg-mat-800/20 transition-colors"
      >
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-mat-100">IBJJF Legal Subs by Belt</h3>
          <p className="text-[11px] text-mat-500 mt-0.5">
            Quick reference for what&apos;s legal at each belt
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-mat-500 flex-shrink-0 transition-transform ${showMatrix ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMatrix && (
        <div className="border-t border-mat-800/50 p-4">
          {/* Mobile: each submission as a card row */}
          <div className="space-y-2">
            {subs.map((sub) => {
              const beltData = IBJJF_LEGAL_SUBS[sub];
              const allLegal = belts.every((b) => beltData[b]);
              const noneLegal = belts.every((b) => !beltData[b]);

              return (
                <div
                  key={sub}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-mat-800/20 border border-mat-800/30"
                >
                  <span className="text-xs font-medium text-mat-200 min-w-0">{sub}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {allLegal ? (
                      <span className="text-[10px] text-green-400 font-medium px-2 py-0.5 rounded-full bg-green-500/10">
                        All belts
                      </span>
                    ) : noneLegal ? (
                      <span className="text-[10px] text-red-400 font-medium px-2 py-0.5 rounded-full bg-red-500/10">
                        Banned
                      </span>
                    ) : (
                      belts.map((belt) => (
                        <span
                          key={belt}
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            beltData[belt]
                              ? "bg-green-500/15"
                              : "bg-mat-800/50"
                          }`}
                          title={`${belt}: ${beltData[belt] ? "Legal" : "Banned"}`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full ${BELT_COLORS[belt]} ${
                              !beltData[belt] ? "opacity-20" : ""
                            }`}
                          />
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Belt color legend */}
          <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-mat-800/30">
            {belts.map((b) => (
              <div key={b} className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${BELT_COLORS[b]}`} />
                <span className="text-[10px] text-mat-500 capitalize">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main View ─────────────────────────────────────────────────────── */
export default function TournamentRulesView() {
  const [expanded, setExpanded] = useState<string>("ibjjf-gi");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-mat-100">Tournament Rules</h1>
        <p className="text-mat-400 text-sm mt-1">
          Point systems, legal submissions, and match rules for major grappling organizations
        </p>
      </div>

      {/* Quick nav — horizontal scroll on mobile */}
      <div className="-mx-4 px-4 lg:mx-0 lg:px-0 mb-4 lg:mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:flex-wrap lg:overflow-visible lg:pb-0">
          {TOURNAMENT_RULES.map((r) => (
            <button
              key={r.id}
              onClick={() => setExpanded(expanded === r.id ? "" : r.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] lg:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                expanded === r.id
                  ? "bg-gi-500/15 text-gi-400 border border-gi-500/30"
                  : "bg-mat-800/50 text-mat-400 border border-mat-700/30 active:text-mat-200"
              }`}
            >
              {r.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* IBJJF Belt Matrix */}
      <BeltMatrix />

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
      <div className="mt-4 lg:mt-6 p-3 lg:p-4 rounded-lg bg-mat-800/20 border border-mat-700/20">
        <p className="text-[11px] text-mat-500 leading-relaxed">
          Rules are summarized for quick reference. Always check the official rulebook of each
          organization before competing, as rules may change between events. When in doubt, ask the
          referee before your match.
        </p>
      </div>
    </div>
  );
}
