import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Box, Music, Image, Sparkles } from "lucide-react";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Asset Library — EduVerse AI" },
      { name: "description", content: "3D models, sound effects, music, and visual assets." },
    ],
  }),
  component: AssetsPage,
});

const CATS = [
  { name: "3D Models", count: "12,400", icon: Box, color: "from-blue-500 to-indigo-600" },
  { name: "Sound Effects", count: "8,200", icon: Sparkles, color: "from-pink-500 to-purple-600" },
  { name: "Background Music", count: "1,800", icon: Music, color: "from-emerald-500 to-teal-500" },
  { name: "Textures & HDRIs", count: "3,600", icon: Image, color: "from-orange-500 to-red-600" },
];

function AssetsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Production-ready assets used by EduVerse to compose your scenes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.name} className="relative overflow-hidden rounded-2xl glass-strong p-5">
                <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-30 blur-2xl ${c.color}`} />
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="relative mt-4 text-lg font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.count} items</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 shadow-glow"
              style={{ filter: `hue-rotate(${i * 30}deg)` }}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
