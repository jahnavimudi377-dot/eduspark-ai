import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — EduVerse AI" },
      {
        name: "description",
        content: "Viral-ready video templates for every educational niche.",
      },
    ],
  }),
  component: TemplatesPage,
});

const T = [
  { name: "Did You Know?", desc: "Hook-driven facts reel", gradient: "from-blue-500 to-purple-600", prompt: "Did you know? Share a mind-blowing fact about science in a 20-second viral video." },
  { name: "Explain Like I'm 10", desc: "Simple visual breakdown", gradient: "from-emerald-500 to-teal-500", prompt: "Explain quantum physics like I'm 10 years old, in a fun 30-second video." },
  { name: "How It Works", desc: "Step-by-step 3D explainer", gradient: "from-orange-500 to-pink-600", prompt: "How does the internet actually work? Step-by-step in 30 seconds." },
  { name: "Mind-Blowing Science", desc: "Cinematic awe moments", gradient: "from-violet-500 to-fuchsia-600", prompt: "Reveal a mind-blowing scientific phenomenon in a cinematic 30-second 3D video." },
  { name: "History Decoded", desc: "Animated timeline", gradient: "from-amber-500 to-red-600", prompt: "Decode a fascinating moment in history in a 30-second animated timeline." },
  { name: "Tech in 60s", desc: "Fast snappy cuts", gradient: "from-cyan-500 to-blue-600", prompt: "Explain a cutting-edge technology in fast snappy cuts under 60 seconds." },
];

function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Proven viral structures — pick one and we'll prefill your prompt.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {T.map((t) => (
            <button
              type="button"
              key={t.name}
              onClick={() =>
                navigate({ to: "/", search: { template: t.prompt } as never })
              }
              className="group cursor-pointer overflow-hidden rounded-2xl glass-strong text-left transition hover:shadow-glow"
            >
              <div className={`relative aspect-video bg-gradient-to-br ${t.gradient}`}>
                <Sparkles className="absolute right-3 top-3 h-4 w-4 text-white/80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-black text-white drop-shadow-lg">{t.name}</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
