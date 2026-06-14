import { createFileRoute } from "@tanstack/react-router";
import { Play, MoreVertical, Eye, Heart, Share2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "My Projects — EduVerse AI" },
      { name: "description", content: "All your AI-generated educational videos in one place." },
    ],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  { title: "How the Internet Works", topic: "Technology", views: "2.4M", likes: "184K", gradient: "from-blue-500 via-indigo-500 to-purple-600" },
  { title: "Inside a Black Hole", topic: "Space", views: "1.1M", likes: "92K", gradient: "from-purple-600 via-fuchsia-600 to-pink-500" },
  { title: "What is mRNA?", topic: "Biology", views: "780K", likes: "61K", gradient: "from-emerald-500 via-teal-500 to-cyan-500" },
  { title: "How GPUs Power AI", topic: "AI", views: "1.6M", likes: "120K", gradient: "from-orange-500 via-rose-500 to-pink-600" },
  { title: "The Big Bang Explained", topic: "Physics", views: "950K", likes: "78K", gradient: "from-amber-500 via-orange-500 to-red-500" },
  { title: "How Bitcoin Works", topic: "Finance", views: "1.3M", likes: "104K", gradient: "from-yellow-500 via-amber-500 to-orange-600" },
];

function ProjectsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {PROJECTS.length} videos · 8.1M total views
            </p>
          </div>
          <button className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            + New Video
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <div key={p.title} className="group overflow-hidden rounded-2xl glass-strong transition hover:shadow-glow">
              <div className={`relative aspect-[9/16] bg-gradient-to-br ${p.gradient}`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur opacity-0 transition group-hover:opacity-100">
                    <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                  </div>
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                  {p.topic}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-base font-bold text-white drop-shadow">{p.title}</div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-white/80">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
