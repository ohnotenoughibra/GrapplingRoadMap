import { POSITIONS, TECHNIQUES } from "@/lib/data/taxonomy";
import PositionMap from "@/components/PositionMap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Position Map — The Mat",
  description:
    "Interactive 2D map of grappling positions, techniques, and transitions. Explore the entire grappling universe.",
};

export default function MapPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-mat-50 dark:bg-mat-950">
      <PositionMap positions={POSITIONS} techniques={TECHNIQUES} />
    </main>
  );
}
