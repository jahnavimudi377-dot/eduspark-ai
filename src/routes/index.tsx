import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
  RotateCcw,
  CheckCircle2,
  Link as LinkIcon,
  AlertTriangle,
  X,
  FolderOpen,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { generateVideo } from "@/lib/videoGenerator";
import { saveProject } from "@/lib/videoStorage";

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
] as const;

const SUBTITLE_STYLES = [
  { id: "reel", label: "Reel Pop", desc: "Bold word-by-word" },
  { id: "tiktok", label: "TikTok", desc: "Highlighted active word" },
  { id: "doc", label: "Cinematic", desc: "Lower-third caption" },
];

type Stage = { key: string; label: string; icon: React.ComponentType<{ className?: string }> };

const STAGES: Stage[] = [
  { key: "script", label: "Writing viral script", icon: Wand2 },
  { key: "scenes", label: "Breaking into scenes", icon: Film },
  { key: "3d", label: "Generating 3D visuals", icon: Sparkles },
  { key: "voice", label: "Synthesizing voiceover", icon: Mic2 },
  { key: "subs", label: "Animating subtitles", icon: Captions },
  { key: "sfx", label: "Mixing sound design", icon: Music2 },
];

type GenState = "idle" | "running" | "done" | "error";

function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [voice, setVoice] = useState("doc");
  const [format, setFormat] = useState<(typeof FORMATS)[number]["id"]>("reel");
  const [subs, setSubs] = useState("reel");
  const [duration, setDuration] = useState(20);
  const [state, setState] = useState<GenState>("idle");
  const [progress, setProgress] = useState(0);
  const [activeStageLabel, setActiveStageLabel] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMime, setVideoMime] = useState<string>("video/webm");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef<number>(0);

  // Cleanup blob URLs on unmount / regeneration
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // Pick up a template prompt forwarded from /templates
  useEffect(() => {
    try {
      const pre = sessionStorage.getItem("eduverse.prefill");
      if (pre) {
        setPrompt(pre);
        sessionStorage.removeItem("eduverse.prefill");
      }
    } catch {
      // ignore
    }
  }, []);

  const activeStageIdx = useMemo(() => {
    if (state !== "running") return -1;
    if (progress < 8) return 0;
    if (progress < 15) return 1;
    if (progress < 50) return 2;
    if (progress < 75) return 3;
    if (progress < 90) return 4;
    return 5;
  }, [progress, state]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Add a topic prompt to get started.");
      return;
    }
    if (state === "running") return;

    // Reset previous output
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setProjectId(null);
    setError(null);
    setProgress(0);
    setState("running");
    startRef.current = performance.now();
    setEta(Math.max(8, duration + 4));

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const toastId = toast.loading("Generating your viral video…", {
      description: "Hold tight — rendering in your browser.",
    });

    try {
      const result = await generateVideo({
        prompt,
        duration,
        format,
        voice,
        signal: ctrl.signal,
        onProgress: (pct, stage) => {
          setProgress(Math.round(pct));
          setActiveStageLabel(stage);
          const elapsed = (performance.now() - startRef.current) / 1000;
          const total = pct > 5 ? (elapsed / pct) * 100 : duration + 4;
          setEta(Math.max(1, Math.round(total - elapsed)));
        },
      });

      const url = URL.createObjectURL(result.video);
      const id = crypto.randomUUID();
      setVideoUrl(url);
      setVideoMime(result.mimeType);
      setProjectId(id);
      setState("done");
      setProgress(100);

      await saveProject({
        id,
        title: prompt.length > 70 ? prompt.slice(0, 67) + "…" : prompt,
        prompt,
        topic: "Custom",
        format,
        duration,
        voice,
        createdAt: Date.now(),
        mimeType: result.mimeType,
        size: result.video.size,
        video: result.video,
        thumbnail: result.thumbnail,
        script: result.script,
      });

      toast.success("Video ready!", {
        id: toastId,
        description: "Saved to My Projects.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      if (msg === "Cancelled") {
        toast.dismiss(toastId);
        setState("idle");
        setProgress(0);
        return;
      }
      console.error("[generate]", err);
      setError(msg);
      setState("error");
      toast.error("Generation failed", { id: toastId, description: msg });
    } finally {
      abortRef.current = null;
    }
  }, [prompt, duration, format, voice, state, videoUrl]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setState("idle");
    setProgress(0);
    handleGenerate();
  }, [handleGenerate]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const ext = videoMime.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `eduverse-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Download started");
  }, [videoUrl, videoMime]);

  const handleCopyLink = useCallback(async () => {
    if (!projectId) return;
    const link = `${window.location.origin}/projects?v=${projectId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
  }, [projectId]);

  const handleShare = useCallback(async () => {
    if (!videoUrl) return;
    const link = projectId
      ? `${window.location.origin}/projects?v=${projectId}`
      : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My EduVerse AI video",
          text: prompt,
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(link);
        toast.success("Link copied — share anywhere");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  }, [videoUrl, projectId, prompt]);

  const portrait = format !== "yt";

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
              <label htmlFor="prompt" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Explain how WiFi reaches your phone like magic..."
                rows={4}
                disabled={state === "running"}
                className="mt-3 w-full resize-none rounded-xl border border-border/60 bg-background/40 p-4 text-base outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPrompt(p)}
                    disabled={state === "running"}
                    className="rounded-full border border-border/60 bg-background/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
                          type="button"
                          key={f.id}
                          onClick={() => setFormat(f.id)}
                          disabled={state === "running"}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition disabled:cursor-not-allowed disabled:opacity-60",
                            active
                              ? "border-primary/70 bg-gradient-primary/15 text-foreground shadow-glow"
                              : "border-border/60 bg-background/30 text-muted-foreground hover:text-foreground",
                          )}
                          aria-pressed={active}
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
                    min={10}
                    max={60}
                    step={5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={state === "running"}
                    className="mt-4 w-full accent-[color:var(--primary)]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    <span>10s hook</span>
                    <span>30s explainer</span>
                    <span>60s deep dive</span>
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
                        type="button"
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        disabled={state === "running"}
                        aria-pressed={active}
                        className={cn(
                          "group relative overflow-hidden rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
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
                        type="button"
                        key={s.id}
                        onClick={() => setSubs(s.id)}
                        disabled={state === "running"}
                        aria-pressed={active}
                        className={cn(
                          "rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
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

              {state === "running" ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 px-6 py-4 text-base font-semibold text-destructive-foreground transition hover:bg-destructive/20"
                >
                  <X className="h-5 w-5" />
                  Cancel generation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:shadow-glow-blue disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Wand2 className="h-5 w-5" />
                  {state === "done" ? "Generate another" : "Generate Video"}
                  <Sparkles className="h-4 w-4 opacity-70 transition group-hover:rotate-12" />
                </button>
              )}

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                  <div className="flex-1">
                    <div className="font-semibold">Generation failed</div>
                    <div className="text-xs text-muted-foreground">{error}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-1 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
                  >
                    <RotateCcw className="h-3 w-3" /> Retry
                  </button>
                </div>
              )}
            </section>

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
                      type="button"
                      key={t.label}
                      onClick={() =>
                        setPrompt(`Explain ${t.label} in a captivating 30-second 3D video.`)
                      }
                      disabled={state === "running"}
                      className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/30 px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="text-sm font-semibold">
                  {state === "done" ? "Your video" : "Live preview"}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {portrait ? "9 : 16" : "16 : 9"}
                </div>
              </div>

              <div
                className={cn(
                  "relative mx-auto mt-4 overflow-hidden rounded-2xl border border-border/50 bg-black",
                  portrait ? "aspect-[9/16] max-w-[260px]" : "aspect-video w-full",
                )}
              >
                {videoUrl && state === "done" ? (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="h-full w-full bg-black"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 20%, oklch(0.45 0.22 290 / 60%), transparent 60%), radial-gradient(ellipse at 80% 90%, oklch(0.50 0.22 240 / 60%), transparent 60%), oklch(0.12 0.04 270)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-32 w-32">
                        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-gradient-primary opacity-60 blur-2xl" />
                        <div className="absolute inset-2 animate-float rounded-full border-2 border-white/20" />
                        <div className="absolute inset-6 rounded-full bg-gradient-primary shadow-glow" />
                      </div>
                    </div>
                    <div className="absolute left-3 right-3 top-3">
                      <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            state === "running"
                              ? "animate-pulse bg-red-500"
                              : "bg-white/60",
                          )}
                        />
                        {state === "running" ? "RENDERING" : "PREVIEW"}
                      </div>
                    </div>
                    <div className="absolute inset-x-3 bottom-4 text-center">
                      <div className="inline-block rounded-lg bg-black/60 px-3 py-1.5 text-sm font-bold backdrop-blur">
                        {prompt.trim()
                          ? prompt.length > 40
                            ? prompt.slice(0, 37) + "…"
                            : prompt
                          : "Your message travels…"}
                      </div>
                    </div>
                    {state === "running" && (
                      <div className="absolute inset-x-0 bottom-0 h-1 shimmer" />
                    )}
                  </div>
                )}
              </div>

              {state === "running" && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{activeStageLabel || "Starting…"}</span>
                    <span className="text-muted-foreground">
                      {progress}% · ~{eta}s left
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-background/40">
                    <div
                      className="h-full rounded-full bg-gradient-primary shadow-glow transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {state === "done" && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Saved to My Projects
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground shadow-glow"
                    >
                      <Download className="h-4 w-4" /> Download
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 py-2 text-sm"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 py-2 text-sm"
                    >
                      <LinkIcon className="h-4 w-4" /> Copy link
                    </button>
                    <Link
                      to="/projects"
                      className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 py-2 text-sm"
                    >
                      <FolderOpen className="h-4 w-4" /> Open project
                    </Link>
                  </div>
                </div>
              )}

              {state === "idle" && !videoUrl && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4" /> Render preview
                </button>
              )}
            </section>

            <section className="rounded-2xl glass p-6">
              <div className="text-sm font-semibold">Generation pipeline</div>
              <div className="mt-4 space-y-3">
                {STAGES.map((s, i) => {
                  const Icon = s.icon;
                  const active = state === "running" && activeStageIdx === i;
                  const complete =
                    state === "done" || (state === "running" && i < activeStageIdx);
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
                          complete || active
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-muted/60 text-muted-foreground",
                        )}
                      >
                        {active ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : complete ? (
                          <CheckCircle2 className="h-4 w-4" />
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
