"use client";

import { useState, useEffect } from "react";

interface BadgeData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earnedAt: string | null;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/student/badges")
      .then((r) => r.json())
      .then((data) => setBadges(data.badges || []));
  }, []);

  const categories = ["all", "mat_time", "skills", "milestone", "social"];
  const categoryLabels: Record<string, string> = {
    all: "All",
    mat_time: "Mat Time",
    skills: "Skills",
    milestone: "Milestones",
    social: "Social",
  };

  const filtered =
    filter === "all" ? badges : badges.filter((b) => b.category === filter);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mat-100">Badges</h1>
        <p className="text-mat-400 text-sm mt-1">
          {earnedCount} of {badges.length} earned. Keep showing up.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === cat
                ? "bg-mat-700 text-mat-100"
                : "text-mat-400 hover:text-mat-200 hover:bg-mat-800/50"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((badge) => (
          <div
            key={badge.id}
            className={`card p-5 text-center transition-all duration-200 ${
              badge.earned
                ? "border-gi-500/20 bg-gi-500/5"
                : "opacity-40 grayscale"
            }`}
          >
            <div className="text-4xl mb-3">{badge.icon}</div>
            <div className="font-medium text-sm text-mat-200 mb-1">
              {badge.name}
            </div>
            <div className="text-xs text-mat-500 leading-relaxed">
              {badge.description}
            </div>
            {badge.earned && badge.earnedAt && (
              <div className="text-[10px] text-gi-400 mt-2">
                Earned{" "}
                {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
