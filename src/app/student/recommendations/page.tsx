"use client";

import { useState, useEffect } from "react";

interface Recommendation {
  type: string;
  title: string;
  description: string;
  techniques?: Array<{ name: string; position: string }>;
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [milestone, setMilestone] = useState<{ name: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/recommendations")
      .then((r) => r.json())
      .then((d) => {
        setRecs(d.recommendations || []);
        setMilestone(d.milestone || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const typeIcon = (t: string) => {
    switch (t) {
      case "milestone_close": return "🎯";
      case "milestone_new": return "🧭";
      case "weak_position": return "💡";
      case "review": return "📖";
      case "streak": return "🔥";
      default: return "⚡";
    }
  };

  const typeColor = (t: string) => {
    switch (t) {
      case "milestone_close": return "border-green-500/30 bg-green-500/5";
      case "milestone_new": return "border-gi-500/30 bg-gi-500/5";
      case "weak_position": return "border-yellow-500/30 bg-yellow-500/5";
      case "review": return "border-nogi-500/30 bg-nogi-500/5";
      case "streak": return "border-orange-500/30 bg-orange-500/5";
      default: return "border-mat-700/30 bg-mat-800/30";
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-mat-800 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-mat-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mat-100">What to Work On</h1>
        <p className="text-sm text-mat-500 mt-1">
          Personalized training focus based on your progress
          {milestone && (
            <span className="text-gi-400"> &middot; {milestone.name} stage</span>
          )}
        </p>
      </div>

      {recs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🧠</div>
          <div className="text-mat-400 font-medium">No recommendations yet</div>
          <div className="text-sm text-mat-500 mt-1">Track some skills and attend classes to get personalized tips</div>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, i) => (
            <div key={i} className={`rounded-xl border p-5 ${typeColor(rec.type)}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcon(rec.type)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-mat-100 text-sm">{rec.title}</h3>
                  <p className="text-sm text-mat-400 mt-1">{rec.description}</p>

                  {rec.techniques && rec.techniques.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {rec.techniques.map((t, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-mat-500" />
                          <span className="text-mat-300">{t.name}</span>
                          <span className="text-[10px] text-mat-600">{t.position}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
