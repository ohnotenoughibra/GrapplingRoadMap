"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppShellProps {
  role: "coach" | "student";
  items: NavItem[];
  children: React.ReactNode;
}

export default function AppShell({ role, items, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-mat-950 flex flex-col">
      {/* Top bar — mobile only */}
      <header className="sticky top-0 z-40 bg-mat-950/90 backdrop-blur-md border-b border-mat-800/50 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <div>
              <div className="font-semibold text-sm text-mat-100 leading-none">
                The Mat
              </div>
              <div className="text-[9px] text-mat-500 uppercase tracking-wider">
                {role === "coach" ? "Coach" : "Student"}
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-mat-950 border-r border-mat-800/50 flex-col z-40">
        <Link href="/" className="px-6 py-5 border-b border-mat-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gi-500 via-nogi-500 to-wrestling-500 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <div className="font-semibold text-sm text-mat-100">The Mat</div>
              <div className="text-[10px] text-mat-500 uppercase tracking-wider">
                {role === "coach" ? "Coach Portal" : "Student Portal"}
              </div>
            </div>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-mat-800/70 text-mat-100 font-medium"
                    : "text-mat-400 hover:text-mat-200 hover:bg-mat-800/30"
                }`}
              >
                <span className={isActive ? "text-gi-400" : "text-mat-500"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-mat-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-mat-700 flex items-center justify-center text-sm font-medium text-mat-300">
              {role === "coach" ? "C" : "S"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-mat-200 truncate">
                {role === "coach" ? "Coach" : "Student"}
              </div>
              <div className="text-xs text-mat-500 capitalize">{role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content — padded for desktop sidebar, full-width on mobile */}
      <main className="flex-1 lg:ml-64 px-4 py-5 pb-24 lg:px-8 lg:py-8 lg:pb-8">
        {children}
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-mat-950/95 backdrop-blur-md border-t border-mat-800/50 lg:hidden safe-bottom">
        <div className="flex items-stretch justify-around">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 min-h-[56px] transition-colors ${
                  isActive ? "text-gi-400" : "text-mat-500 active:text-mat-300"
                }`}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] leading-none ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
