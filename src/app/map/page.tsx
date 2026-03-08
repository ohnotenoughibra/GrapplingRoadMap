import { POSITIONS, TECHNIQUES } from "@/lib/data/taxonomy";
import ConstellationMap from "@/components/ConstellationMap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grappling Universe — The Mat",
  description:
    "Explore the entire grappling universe. Interactive 3D map of positions, techniques, and transitions.",
};

export default function MapPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <ConstellationMap positions={POSITIONS} techniques={TECHNIQUES} />
    </main>
  );
}
