"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "coach" | "student";
  items: NavItem[];
  user?: { name: string; avatar?: string };
}

export default function Sidebar({ role, items, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-mat-950 border-r border-mat-800/50 flex flex-col z-40">
      {/* Logo */}
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

      {/* Navigation */}
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

      {/* User */}
      <div className="px-4 py-4 border-t border-mat-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-mat-700 flex items-center justify-center text-sm font-medium text-mat-300">
            {user?.name?.charAt(0) ?? (role === "coach" ? "C" : "S")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-mat-200 truncate">
              {user?.name ?? (role === "coach" ? "Coach" : "Student")}
            </div>
            <div className="text-xs text-mat-500 capitalize">{role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
