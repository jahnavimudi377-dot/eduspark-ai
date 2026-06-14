import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TrendingUp, Eye, Heart, Share2 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — EduVerse AI" },
      { name: "description", content: "Track views, engagement and viral velocity across platforms." },
    ],
  }),
  component: AnalyticsPage,
});

const STATS = [
  { label: "Total Views", value: "8.1M", trend: "+24%", icon: Eye },
  { label: "Likes", value: "639K", trend: "+18%", icon: Heart },
  { label: "Shares", value: "92K", trend: "+31%", icon: Share2 },
  { label: "Viral Score", value: "94", trend: "+6", icon: TrendingUp },
];

function AnalyticsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last 30 days across all platforms.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl glass-strong p-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs uppercase tracking-widest">{s.label}</span>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-3xl font-bold">{s.value}</div>
                <div className="mt-1 text-xs font-semibold text-emerald-400">{s.trend} vs last month</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl glass-strong p-6">
          <div className="text-sm font-semibold">Views over time</div>
          <div className="mt-6 flex h-48 items-end gap-1.5">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 30 + Math.abs(Math.sin(i / 2) * 60) + (i > 18 ? 20 : 0);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-neon-purple/80 shadow-glow"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
