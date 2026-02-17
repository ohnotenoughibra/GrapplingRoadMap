import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Mat — Grappling Roadmap",
  description:
    "Track your grappling journey. Skill-based progression for Gi, No-Gi, and Wrestling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-mat-950 font-sans">{children}</body>
    </html>
  );
}
