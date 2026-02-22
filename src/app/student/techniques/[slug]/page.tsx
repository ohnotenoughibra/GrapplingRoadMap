"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SKILL_LEVEL_CONFIG, type SkillLevel } from "@/types";

interface TechniqueDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  discipline: string;
  category: string;
  difficulty: string;
  videoUrl: string | null;
  position: { name: string; slug: string };
  skill?: { level: SkillLevel; updatedAt: string } | null;
  relatedTechniques: { id: string; name: string; slug: string; category: string }[];
  classHistory: { date: string; title: string | null }[];
}

export default function TechniqueDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tech, setTech] = useState<TechniqueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/techniques?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => setTech(data.technique || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-mat-800 rounded" />
          <div className="h-48 bg-mat-800/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-mat-400 mb-3">Technique not found</p>
          <Link href="/student/techniques" className="text-gi-400 text-sm hover:underline">
            Back to library
          </Link>
        </div>
      </div>
    );
  }

  const levelConfig = tech.skill?.level ? SKILL_LEVEL_CONFIG[tech.skill.level] : null;

  const disciplineLabel =
    tech.discipline === "nogi" ? "No-Gi" :
    tech.discipline === "all" ? "Universal" :
    tech.discipline.charAt(0).toUpperCase() + tech.discipline.slice(1);

  const categoryLabel = tech.category.charAt(0).toUpperCase() + tech.category.slice(1);
  const difficultyLabel = tech.difficulty.charAt(0).toUpperCase() + tech.difficulty.slice(1);

  const disciplineBadge =
    tech.discipline === "gi" ? "badge-gi" :
    tech.discipline === "nogi" ? "badge-nogi" :
    tech.discipline === "wrestling" ? "badge-wrestling" :
    "bg-mat-700/30 text-mat-300 border border-mat-600/20 text-xs px-2.5 py-0.5 rounded-full inline-flex items-center font-medium";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-mat-500 mb-4">
        <Link href="/student/techniques" className="hover:text-mat-300 transition-colors">Techniques</Link>
        <span>/</span>
        <span className="text-mat-400">{tech.position.name}</span>
        <span>/</span>
        <span className="text-mat-300">{tech.name}</span>
      </div>

      {/* Hero card */}
      <div className="card overflow-hidden mb-4">
        {/* Video placeholder / header */}
        {tech.videoUrl ? (
          <div className="relative bg-mat-800 aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-mat-900 to-transparent" />
            <a
              href={tech.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 w-16 h-16 rounded-full bg-gi-500/20 border-2 border-gi-500/50 flex items-center justify-center hover:bg-gi-500/30 transition-colors"
            >
              <svg className="w-8 h-8 text-gi-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-mat-900 to-mat-800 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">🥋</div>
              <p className="text-xs text-mat-500">No video yet</p>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Title + badges */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-mat-100">{tech.name}</h1>
              <p className="text-sm text-mat-400 mt-0.5">{tech.position.name}</p>
            </div>
            {levelConfig && (
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                tech.skill?.level === "proficient" ? "bg-green-500/10 text-green-400" :
                tech.skill?.level === "sparring" ? "bg-gi-500/10 text-gi-400" :
                tech.skill?.level === "drilling" ? "bg-yellow-500/10 text-yellow-400" :
                "bg-mat-700/30 text-mat-400"
              }`}>
                {levelConfig.label}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={disciplineBadge}>{disciplineLabel}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-mat-800/50 text-mat-400 border border-mat-700/30">
              {categoryLabel}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
              tech.difficulty === "fundamental" ? "bg-green-500/5 text-green-400 border-green-500/20" :
              tech.difficulty === "intermediate" ? "bg-yellow-500/5 text-yellow-400 border-yellow-500/20" :
              "bg-red-500/5 text-red-400 border-red-500/20"
            }`}>
              {difficultyLabel}
            </span>
          </div>

          {/* Description */}
          {tech.description && (
            <p className="text-sm text-mat-300 leading-relaxed mb-4">{tech.description}</p>
          )}

          {/* Your progress */}
          {tech.skill && (
            <div className="p-3 rounded-lg bg-mat-800/30 border border-mat-800/30 mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-mat-500 mb-2">
                Your Progress
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${levelConfig?.color || "text-mat-400"}`}>
                  {levelConfig?.label || "Not tracked"}
                </span>
                <span className="text-[10px] text-mat-500">
                  Last updated: {new Date(tech.skill.updatedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric"
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class history */}
      {tech.classHistory && tech.classHistory.length > 0 && (
        <div className="card p-4 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-mat-500 mb-3">
            Seen In Class
          </h2>
          <div className="space-y-2">
            {tech.classHistory.slice(0, 5).map((cls, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-mat-300">{cls.title || "Training Session"}</span>
                <span className="text-[10px] text-mat-500">
                  {new Date(cls.date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric"
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related techniques */}
      {tech.relatedTechniques && tech.relatedTechniques.length > 0 && (
        <div className="card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-mat-500 mb-3">
            Related Techniques
          </h2>
          <div className="space-y-1.5">
            {tech.relatedTechniques.map((rel) => (
              <Link
                key={rel.id}
                href={`/student/techniques/${rel.slug}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-mat-800/20 hover:bg-mat-800/40 transition-colors"
              >
                <span className="text-sm text-mat-300">{rel.name}</span>
                <span className="text-[10px] text-mat-500">{rel.category}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
