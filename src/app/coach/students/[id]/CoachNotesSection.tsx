"use client";

import { useState } from "react";

interface Note {
  id: string;
  content: string;
  coachName: string;
  createdAt: string;
}

export default function CoachNotesSection({
  studentId,
  initialNotes,
}: {
  studentId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/coach/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, content }),
    });

    if (res.ok) {
      const note = await res.json();
      setNotes([
        {
          id: note.id,
          content: note.content,
          coachName: note.coach?.name || "Coach",
          createdAt: note.createdAt,
        },
        ...notes,
      ]);
      setContent("");
    }
    setSubmitting(false);
  }

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-mat-300 uppercase tracking-wider mb-4">
        Coach Notes
      </h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Quick note about this student..."
            className="flex-1 px-3 py-2 rounded-lg bg-mat-800/50 border border-mat-700/50 text-mat-100 placeholder-mat-500 text-sm focus:outline-none focus:border-gi-500/50"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 rounded-lg bg-gi-500/20 text-gi-400 text-sm font-medium border border-gi-500/30 hover:bg-gi-500/30 disabled:opacity-50 transition-all"
          >
            {submitting ? "..." : "Add"}
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-mat-500 text-xs">No notes yet. Add one above.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="px-3 py-2.5 rounded-lg bg-mat-800/30 border border-mat-800/20">
              <p className="text-sm text-mat-300">{note.content}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-mat-500">
                <span>{note.coachName}</span>
                <span>&middot;</span>
                <span>
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
