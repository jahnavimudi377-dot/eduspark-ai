import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Play,
  MoreVertical,
  Eye,
  Share2,
  Download,
  Trash2,
  Plus,
  X,
  Link as LinkIcon,
  Film,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { listProjects, deleteProject, type ProjectMeta } from "@/lib/videoStorage";

export const Route = createFileRoute("/projects")({
  validateSearch: (s: Record<string, unknown>) => ({
    v: typeof s.v === "string" ? s.v : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Projects — EduVerse AI" },
      {
        name: "description",
        content: "All your AI-generated educational videos in one place.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { v } = useSearch({ from: "/projects" });
  const [projects, setProjects] = useState<ProjectMeta[] | null>(null);
  const [active, setActive] = useState<ProjectMeta | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listProjects();
      setProjects(list);
      if (v) {
        const found = list.find((p) => p.id === v);
        if (found) setActive(found);
      }
    } catch (err) {
      console.error("[projects]", err);
      toast.error("Couldn't load projects");
      setProjects([]);
    }
  }, [v]);

  useEffect(() => {
    refresh();
    return () => {
      // Revoke URLs on unmount
      projects?.forEach((p) => {
        URL.revokeObjectURL(p.videoUrl);
        URL.revokeObjectURL(p.thumbnailUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      setBusy(id);
      try {
        await deleteProject(id);
        toast.success("Project deleted");
        if (active?.id === id) setActive(null);
        await refresh();
      } catch {
        toast.error("Couldn't delete");
      } finally {
        setBusy(null);
      }
    },
    [refresh, active],
  );

  const handleDownload = useCallback((p: ProjectMeta) => {
    const ext = p.mimeType.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = p.videoUrl;
    a.download = `${p.title.replace(/[^\w-]+/g, "_").slice(0, 40)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Download started");
  }, []);

  const handleShare = useCallback(async (p: ProjectMeta) => {
    const link = `${window.location.origin}/projects?v=${p.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: p.title, url: link });
      } else {
        await navigator.clipboard.writeText(link);
        toast.success("Link copied");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Sharing failed");
    }
  }, []);

  const handleCopyLink = useCallback(async (p: ProjectMeta) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects?v=${p.id}`);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {projects === null
                ? "Loading…"
                : `${projects.length} video${projects.length === 1 ? "" : "s"} saved locally`}
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> New Video
          </Link>
        </div>

        {projects && projects.length === 0 && (
          <div className="rounded-2xl glass-strong p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No videos yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate your first AI explainer to see it here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" /> Create your first video
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-2xl glass-strong transition hover:shadow-glow"
              >
                <button
                  type="button"
                  onClick={() => setActive(p)}
                  className="relative block aspect-[9/16] w-full overflow-hidden bg-black"
                  aria-label={`Play ${p.title}`}
                >
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 backdrop-blur shadow-glow transition group-hover:scale-110">
                      <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                    </div>
                  </div>
                  <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                    {p.format === "yt" ? "16:9" : "9:16"} · {p.duration}s
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="text-sm font-bold text-white drop-shadow line-clamp-2">
                      {p.title}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-white/80">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                      <span>{(p.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center justify-between gap-1 p-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(p)}
                    title="Download"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(p)}
                    title="Share"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(p)}
                    title="Copy link"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={busy === p.id}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="More"
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    onClick={() => setActive(p)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl glass-strong"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid gap-0 md:grid-cols-[1fr_320px]">
              <video
                key={active.id}
                src={active.videoUrl}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] w-full bg-black md:aspect-auto md:h-[70vh]"
              />
              <div className="space-y-4 p-6">
                <div>
                  <h2 className="text-lg font-bold">{active.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(active.createdAt).toLocaleString()} ·{" "}
                    {(active.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                    {active.mimeType.split(";")[0]}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Script
                  </div>
                  {active.script.map((s, i) => (
                    <div key={i} className="text-xs leading-relaxed text-foreground/80">
                      <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                      {s}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(active)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground shadow-glow"
                  >
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(active)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 py-2 text-sm"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(active)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/30 py-2 text-sm"
                  >
                    <LinkIcon className="h-4 w-4" /> Copy link
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(active.id)}
                    disabled={busy === active.id}
                    className="flex items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 py-2 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
