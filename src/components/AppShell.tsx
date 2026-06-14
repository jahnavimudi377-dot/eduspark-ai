import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Sparkles,
  Wand2,
  FolderOpen,
  Mic2,
  LayoutTemplate,
  Library,
  BarChart3,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Create Video", icon: Wand2 },
  { to: "/projects", label: "My Projects", icon: FolderOpen },
  { to: "/voice", label: "Voice Studio", icon: Mic2 },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/assets", label: "Asset Library", icon: Library },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-sidebar/60 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">EduVerse</div>
            <div className="-mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI Studio
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl glass-strong p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neon-purple">
            <Zap className="h-3.5 w-3.5" /> PRO PLAN
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            4K renders, unlimited voices, priority queue.
          </div>
          <button className="mt-3 w-full rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/60 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold">Welcome back, Creator</div>
              <div className="text-xs text-muted-foreground">
                Turn ideas into viral 3D videos in seconds
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden h-8 items-center gap-2 rounded-full glass px-3 text-xs text-muted-foreground sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              AI engines online
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-primary shadow-glow-blue" />
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-10">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}
