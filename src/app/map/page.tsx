import { POSITIONS, TECHNIQUES } from "@/lib/data/taxonomy";
import PositionMap from "@/components/PositionMap";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Position Map — The Mat",
  description:
    "Interactive 2D map of grappling positions, techniques, and transitions. Explore the entire grappling universe.",
};

export default function MapPage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-mat-50 dark:bg-mat-950">
      {/* Floating nav */}
      <nav className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-mat-900/80 dark:bg-mat-900/80 backdrop-blur-md border border-mat-700/40 shadow-lg">
        <Link
          href="/"
          className="text-sm font-semibold bg-gradient-to-r from-gi-400 via-nogi-400 to-wrestling-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          The Mat
        </Link>
        <span className="text-mat-600 text-xs">/</span>
        <span className="text-sm text-mat-300">Map</span>
        <div className="w-px h-4 bg-mat-700/50 mx-1" />
        <Link
          href="/library"
          className="text-xs text-mat-400 hover:text-mat-200 transition-colors"
        >
          Library
        </Link>
        <Link
          href="/cla"
          className="text-xs text-mat-400 hover:text-mat-200 transition-colors"
        >
          CLA
        </Link>
      </nav>
      <PositionMap positions={POSITIONS} techniques={TECHNIQUES} />
    </main>
  );
}
