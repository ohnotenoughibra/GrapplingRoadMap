"use client";

import { Discipline, DISCIPLINE_CONFIG } from "@/types";

interface DisciplineToggleProps {
  selected: Discipline | "all";
  onChange: (d: Discipline | "all") => void;
  showAll?: boolean;
}

export default function DisciplineToggle({
  selected,
  onChange,
  showAll = true,
}: DisciplineToggleProps) {
  const options: (Discipline | "all")[] = showAll
    ? ["all", "gi", "nogi", "wrestling"]
    : ["gi", "nogi", "wrestling"];

  return (
    <div className="inline-flex rounded-lg bg-mat-800/50 border border-mat-700/30 p-1">
      {options.map((d) => {
        const isActive = selected === d;
        const config = d === "all" ? null : DISCIPLINE_CONFIG[d];
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              isActive
                ? d === "all"
                  ? "bg-mat-700 text-mat-100"
                  : d === "gi"
                    ? "bg-gi-500/20 text-gi-400"
                    : d === "nogi"
                      ? "bg-nogi-500/20 text-nogi-400"
                      : "bg-wrestling-500/20 text-wrestling-400"
                : "text-mat-400 hover:text-mat-200"
            }`}
          >
            {d === "all" ? "All" : config?.label}
          </button>
        );
      })}
    </div>
  );
}
