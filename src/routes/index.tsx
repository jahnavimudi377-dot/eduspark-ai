import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Mic2,
  Captions,
  Music2,
  Film,
  Loader2,
  Play,
  Download,
  Share2,
  Smartphone,
  Monitor,
  Zap,
  Brain,
  Rocket,
  Globe2,
  Atom,
  Code2,
  Dna,
  Landmark,
  Coins,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Create Video — EduVerse AI" },
      {
        name: "description",
        content:
          "Turn any topic into a cinematic 3D animated educational video with AI script, voiceover, captions and music.",
      },
      { property: "og:title", content: "Create Video — EduVerse AI" },
      {
        property: "og:description",
        content: "Viral educational 3D videos from a single prompt.",
      },
    ],
  }),
  component: CreatePage,
});

const SAMPLE_PROMPTS = [
  "Explain how the internet works in a way a 10-year-old can understand.",
  "How do black holes bend space and time?",
  "What actually happens inside a CPU when you click a button?",
  "How does mRNA teach our cells to fight viruses?",
];

const TOPICS = [
  { label: "AI", icon: Brain },
  { label: "Space", icon: Rocket },
  { label: "Programming", icon: Code2 },
  { label: "Biology", icon: Dna },
  { label: "Physics", icon: Atom },
  { label: "History", icon: Landmark },
  { label: "Finance", icon: Coins },
  { label: "Technology", icon: Globe2 },
];

const VOICES = [
  { id: "doc", name: "Documentary", desc: "Cinematic male", color: "from-blue-500 to-indigo-500" },
  { id: "fem", name: "Narrator", desc: "Warm female", color: "from-pink-500 to-purple-500" },
  { id: "kid", name: "Curious Kid", desc: "Playful child", color: "from-amber-400 to-orange-500" },
  { id: "epic", name: "Epic", desc: "Trailer voice", color: "from-violet-500 to-fuchsia-500" },
];

const FORMATS = [
  { id: "reel", label: "Reels / Shorts", ratio: "9:16", icon: Smartphone },
  { id: "yt", label: "YouTube", ratio: "16:9", icon: Monitor },
  { id: "tiktok", label: "TikTok", ratio: "9:16", icon: Smartphone },
];

const SUBTITLE_STYLES = [
  { id: "reel", label: "Reel Pop", desc: "Bold word-by-word" },
  { id: "tiktok", label: "TikTok", desc: "Highlighted active word" },
  { id: "doc", label: "Cinematic", desc: "Lower-third caption" },
];

type Stage = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STAGES: Stage[] = [
  { key: "script", label: "Writing viral script", icon: Wand2 },
  { key: "scenes", label: "Breaking into scenes", icon: Film },
  { key: "3d", label: "Generating 3D visuals", icon: Sparkles },
  { key: "voice", label: "Synthesizing voiceover", icon: Mic2 },
  { key: "subs", label: "Animating subtitles", icon: Captions },
  { key: "sfx", label: "Mixing sound design", icon: Music2 },
];

function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState("doc");
  const [format, setFormat] = useState("reel");
  const [subs, setSubs] = useState("reel");
  const [duration, setDuration] = useState(45);
  const [generating, setGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [done, setDone] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setDone(false);
    setActiveStage(0);
    for (let i = 0; i < STAGES.length; i++) {
      setActiveStage(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 900));
    }
    setGenerating(false);
    setDone(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-elevated">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-neon-blue/30 blur-3xl animate-float" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-neon-purple" />
              One prompt. One viral video.
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Turn any topic into a{" "}
              <span className="text-gradient animate-gradient">cinematic 3D explainer</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Script, scenes, 3D animation, voiceover, captions, and sound — all generated
              automatically. Built for Reels, Shorts, TikTok and YouTube.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Composer */}
          <div className="space-y-6">
            <section className="rounded-2xl glass-strong p-6">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Explain how WiFi reaches your phone like magic..."
                rows={4}
                className="mt-3 w-full resize-none rounded-xl border border-border/60 bg-background/40 p-4 text-base outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="rounded-full border border-border/60 bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                  >
                    {p.length > 60 ? p.slice(0, 57) + "…" : p}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Format
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {FORMATS.map((f) => {
                      const Icon = f.icon;
                      const active = format === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setFormat(f.id)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition",
                            active
                              ? "border-primary/70 bg-gradient-primary/15 text-foreground shadow-glow"
                              : "border-border/60 bg-background/30 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-semibold">{f.label}</span>
                          <span className="text-[10px] opacity-70">{f.ratio}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>Duration</span>
                    <span className="text-foreground">{duration}s</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={90}
                    step={5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-4 w-full accent-[color:var(--primary)]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    <span>15s hook</span>
                    <span>45s explainer</span>
                    <span>90s deep dive</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Voice
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {VOICES.map((v) => {
                    const active = voice === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        className={cn(
                          "group relative overflow-hidden rounded-xl border p-3 text-left transition",
                          active
                            ? "border-primary/70 shadow-glow"
                            : "border-border/60 hover:border-primary/40",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-br opacity-20 transition group-hover:opacity-30",
                            v.color,
                          )}
                        />
                        <div className="relative">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Mic2 className="h-3.5 w-3.5" /> {v.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {v.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Subtitle style
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {SUBTITLE_STYLES.map((s) => {
                    const active = subs === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSubs(s.id)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition",
                          active
                            ? "border-primary/70 bg-gradient-primary/15 shadow-glow"
                            : "border-border/60 hover:border-primary/40",
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Captions className="h-3.5 w-3.5" /> {s.label}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {s.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:shadow-glow-blue disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating your viral video…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Generate Video
                    <Sparkles className="h-4 w-4 opacity-70 transition group-hover:rotate-12" />
                  </>
                )}
              </button>
            </section>

            {/* Trending topics */}
            <section className="rounded-2xl glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Trending topics</div>
                  <div className="text-xs text-muted-foreground">
                    Tap to use as inspiration
                  </div>
                </div>
                <Zap className="h-4 w-4 text-neon-purple" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TOPICS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.label}
                      onClick={() => setPrompt(`Explain ${t.label} in a captivating 60-second 3D video.`)}
                      className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/30 px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-background/50"
                    >
                      <Icon className="h-4 w-4 text-neon-blue" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Preview / Pipeline */}
          <div className="space-y-6">
            <section className="rounded-2xl glass-strong p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Live preview</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {format === "yt" ? "16 : 9" : "9 : 16"}
                </div>
              </div>

              <div
                className={cn(
                  "relative mx-auto mt-4 overflow-hidden rounded-2xl border border-border/50",
                  format === "yt" ? "aspect-video w-full" : "aspect-[9/16] max-w-[260px]",
                )}
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 20%, oklch(0.45 0.22 290 / 60%), transparent 60%), radial-gradient(ellipse at 80% 90%, oklch(0.50 0.22 240 / 60%), transparent 60%), oklch(0.12 0.04 270)",
                }}
              >
                {/* Faux 3d scene */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 animate-pulse-glow rounded-full bg-gradient-primary opacity-60 blur-2xl" />
                    <div className="absolute inset-2 animate-float rounded-full border-2 border-white/20" />
                    <div className="absolute inset-6 rounded-full bg-gradient-primary shadow-glow" />
                  </div>
                </div>

                {/* Hook text */}
                <div className="absolute left-3 right-3 top-3">
                  <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> HOOK
                  </div>
                </div>

                {/* Subtitle preview */}
                <div className="absolute inset-x-3 bottom-4 text-center">
                  <div className="inline-block rounded-lg bg-black/60 px-3 py-1.5 text-sm font-bold backdrop-blur">
                    Your <span className="text-neon-purple">message</span> travels…
                  </div>
                </div>

                {!generating && (
                  <button className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur shadow-glow">
                      <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                    </div>
                  </button>
                )}

                {generating && <div className="absolute inset-x-0 bottom-0 h-1 shimmer" />}
              </div>

              {done && (
                <div className="mt-4 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground shadow-glow">
                    <Download className="h-4 w-4" /> Export MP4
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-sm">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl glass p-6">
              <div className="text-sm font-semibold">Generation pipeline</div>
              <div className="mt-4 space-y-3">
                {STAGES.map((s, i) => {
                  const Icon = s.icon;
                  const active = generating && activeStage === i;
                  const complete = (done && i <= STAGES.length - 1) || (generating && i < activeStage);
                  return (
                    <div
                      key={s.key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-border/40 bg-background/20 p-3 transition",
                        active && "border-primary/70 shadow-glow",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          complete
                            ? "bg-gradient-primary text-primary-foreground"
                            : active
                              ? "bg-gradient-primary text-primary-foreground"
                              : "bg-muted/60 text-muted-foreground",
                        )}
                      >
                        {active ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">{s.label}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {complete ? "Done" : active ? "Running" : "Queued"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
