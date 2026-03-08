"use client";

interface TimelineSession {
  id: string;
  date: string;
  discipline: string;
  title: string | null;
  notes: string | null;
  techniques: {
    id: string;
    name: string;
    position?: string;
    notes?: string | null;
  }[];
  duration?: number | null;
}

interface SessionTimelineProps {
  sessions: TimelineSession[];
  emptyMessage?: string;
}

const discDot: Record<string, string> = {
  gi: "bg-gi-500",
  nogi: "bg-nogi-500",
  wrestling: "bg-wrestling-500",
};

const discBadge: Record<string, string> = {
  gi: "text-gi-400 bg-gi-500/10",
  nogi: "text-nogi-400 bg-nogi-500/10",
  wrestling: "text-wrestling-400 bg-wrestling-500/10",
};

export default function SessionTimeline({
  sessions,
  emptyMessage = "No sessions yet",
}: SessionTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-mat-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {sessions.map((session, idx) => {
        const d = new Date(session.date);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const hasStruggle = session.techniques.some((t) => t.notes?.trim());

        // Compute gap to next session
        let gapDays = 0;
        if (idx < sessions.length - 1) {
          const next = new Date(sessions[idx + 1].date);
          gapDays = Math.round(
            (next.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return (
          <div key={session.id}>
            <div className="flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center w-10 flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                    discDot[session.discipline] || "bg-mat-500"
                  }`}
                />
                {idx < sessions.length - 1 && (
                  <div className="flex-1 w-px bg-mat-700/50 my-1" />
                )}
              </div>

              {/* Date column */}
              <div className="w-16 flex-shrink-0 pt-0.5">
                <div className="text-[10px] text-mat-500 uppercase">
                  {dayName}
                </div>
                <div className="text-sm font-medium text-mat-300">
                  {dateStr}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-5 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      discBadge[session.discipline] || "text-mat-400 bg-mat-800"
                    }`}
                  >
                    {session.discipline === "nogi"
                      ? "No-Gi"
                      : session.discipline}
                  </span>
                  <span className="text-sm font-medium text-mat-200 truncate">
                    {session.title || "Untitled"}
                  </span>
                  {session.duration && (
                    <span className="text-[10px] text-mat-500 ml-auto flex-shrink-0">
                      {session.duration}min
                    </span>
                  )}
                </div>

                {/* Techniques */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {session.techniques.map((t) => (
                    <span
                      key={t.id}
                      className={`px-2 py-0.5 rounded text-[11px] border ${
                        t.notes?.trim()
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-mat-800/50 border-mat-700/30 text-mat-400"
                      }`}
                    >
                      {t.name}
                      {t.notes?.trim() && (
                        <span className="ml-1 text-amber-500">*</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Struggle notes */}
                {hasStruggle && (
                  <div className="mt-2 text-[11px] text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1">
                    {session.techniques
                      .filter((t) => t.notes?.trim())
                      .map((t) => (
                        <div key={t.id}>
                          <span className="font-medium">{t.name}:</span>{" "}
                          {t.notes}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gap indicator */}
            {gapDays > 3 && idx < sessions.length - 1 && (
              <div className="flex gap-4 py-2">
                <div className="flex flex-col items-center w-10 flex-shrink-0">
                  <div className="flex-1 w-px border-l border-dashed border-mat-600/50" />
                </div>
                <div className="w-16 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] text-mat-600 italic">
                    {gapDays} day gap
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
