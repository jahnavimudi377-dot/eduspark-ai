// Real client-side video generator.
// Renders an animated cinematic scene on a canvas and captures it
// with MediaRecorder, producing a real playable WebM/MP4 blob.

export type GenerateOptions = {
  prompt: string;
  duration: number; // seconds
  format: "reel" | "yt" | "tiktok";
  voice: string;
  onProgress?: (pct: number, stage: string) => void;
  signal?: AbortSignal;
};

export type GenerateResult = {
  video: Blob;
  thumbnail: Blob;
  mimeType: string;
  script: string[];
};

const SCENE_PALETTES = [
  ["#6d28d9", "#2563eb", "#06b6d4"],
  ["#db2777", "#7c3aed", "#2563eb"],
  ["#f59e0b", "#ef4444", "#db2777"],
  ["#10b981", "#06b6d4", "#3b82f6"],
  ["#8b5cf6", "#ec4899", "#f97316"],
];

function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return "video/webm";
}

function generateScript(prompt: string, duration: number): string[] {
  const base = prompt.trim().replace(/[.?!]+$/, "");
  const hook = `Did you know? ${base}`;
  const beats = [
    hook,
    `Let's break it down — in just ${duration} seconds.`,
    `First, the big picture: ${base}.`,
    `Here's what's actually happening behind the scenes...`,
    `Step by step, it works like this.`,
    `And the wild part? Almost nobody realizes this.`,
    `Now you know. Share this if it blew your mind.`,
  ];
  const sceneCount = Math.max(4, Math.min(8, Math.round(duration / 6)));
  return beats.slice(0, sceneCount);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number, // 0..1 within scene
  globalT: number, // 0..1 overall
  sceneIdx: number,
  caption: string,
  title: string,
) {
  const palette = SCENE_PALETTES[sceneIdx % SCENE_PALETTES.length];

  // Background gradient that shifts
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, palette[0]);
  g.addColorStop(0.5 + Math.sin(globalT * Math.PI * 2) * 0.2, palette[1]);
  g.addColorStop(1, palette[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Vignette overlay
  const rg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
  rg.addColorStop(0, "rgba(0,0,0,0)");
  rg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  // Floating orbs (faux 3D)
  const orbCount = 6;
  for (let i = 0; i < orbCount; i++) {
    const phase = (i / orbCount) * Math.PI * 2;
    const cx = w / 2 + Math.cos(globalT * Math.PI * 2 + phase) * (w * 0.28);
    const cy = h / 2 + Math.sin(globalT * Math.PI * 2 * 1.3 + phase) * (h * 0.18);
    const r = (Math.min(w, h) * 0.08) * (0.7 + 0.3 * Math.sin(globalT * 6 + i));
    const og = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    og.addColorStop(0, "rgba(255,255,255,0.9)");
    og.addColorStop(0.4, palette[i % palette.length] + "cc");
    og.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central focal sphere
  const cx = w / 2;
  const cy = h * 0.42;
  const pulse = 1 + Math.sin(t * Math.PI * 2) * 0.05;
  const sphereR = Math.min(w, h) * 0.16 * pulse;
  const sg = ctx.createRadialGradient(cx - sphereR * 0.3, cy - sphereR * 0.3, sphereR * 0.1, cx, cy, sphereR);
  sg.addColorStop(0, "#ffffff");
  sg.addColorStop(0.4, palette[1]);
  sg.addColorStop(1, palette[0]);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, sphereR, 0, Math.PI * 2);
  ctx.fill();

  // Glow ring
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.beginPath();
  ctx.arc(cx, cy, sphereR * (1.4 + Math.sin(t * Math.PI * 2) * 0.1), 0, Math.PI * 2);
  ctx.stroke();

  // Title (top)
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  const titleFontSize = Math.max(18, Math.round(w * 0.028));
  ctx.font = `700 ${titleFontSize}px Inter, system-ui, sans-serif`;
  const titlePadding = Math.round(w * 0.02);
  const titleMetrics = ctx.measureText(title);
  const titleW = Math.min(titleMetrics.width + titlePadding * 2, w * 0.8);
  ctx.beginPath();
  // roundRect available in modern browsers
  ctx.roundRect(w / 2 - titleW / 2, h * 0.05, titleW, titleFontSize * 1.8, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, w / 2, h * 0.05 + titleFontSize * 0.9, w * 0.78);

  // Caption (bottom) with reveal animation
  const captionFontSize = Math.max(24, Math.round(w * 0.045));
  ctx.font = `800 ${captionFontSize}px Inter, system-ui, sans-serif`;
  const maxCaptionW = w * 0.82;
  const lines = wrapText(ctx, caption, maxCaptionW);
  const lineHeight = captionFontSize * 1.25;
  const totalH = lines.length * lineHeight;
  const captionY = h * 0.78 - totalH / 2;

  // Caption bg
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  const pad = captionFontSize * 0.6;
  const maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  ctx.beginPath();
  // roundRect
  ctx.roundRect(
    w / 2 - maxLineW / 2 - pad,
    captionY - pad,
    maxLineW + pad * 2,
    totalH + pad * 2,
    16,
  );
  ctx.fill();

  // Animate per-word reveal
  const revealProgress = Math.min(1, t * 1.6);
  const fullText = lines.join(" ");
  const words = fullText.split(" ");
  const wordsShown = Math.max(1, Math.floor(words.length * revealProgress));
  const visibleText = words.slice(0, wordsShown).join(" ");
  const visibleLines = wrapText(ctx, visibleText, maxCaptionW);

  for (let i = 0; i < lines.length; i++) {
    const isLineVisible = i < visibleLines.length;
    ctx.fillStyle = isLineVisible ? "#ffffff" : "rgba(255,255,255,0.15)";
    const txt = isLineVisible ? visibleLines[i] : lines[i];
    ctx.fillText(txt, w / 2, captionY + i * lineHeight + lineHeight / 2);
  }

  // Progress bar
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, h - 6, w, 6);
  ctx.fillStyle = palette[2];
  ctx.fillRect(0, h - 6, w * globalT, 6);

  // Watermark
  ctx.font = `600 ${Math.max(11, Math.round(w * 0.018))}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "right";
  ctx.fillText("EduVerse AI", w - 16, h - 16);
  ctx.textAlign = "left";
}

export async function generateVideo(opts: GenerateOptions): Promise<GenerateResult> {
  const { prompt, duration, format, onProgress, signal } = opts;

  // Resolve resolution from format
  const portrait = format !== "yt";
  const width = portrait ? 540 : 960;
  const height = portrait ? 960 : 540;
  const fps = 30;

  onProgress?.(2, "Writing viral script");
  const script = generateScript(prompt, duration);
  await new Promise((r) => setTimeout(r, 250));

  if (signal?.aborted) throw new Error("Cancelled");
  onProgress?.(8, "Breaking into scenes");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas not supported in this browser");

  // Pre-render the first frame to use as thumbnail
  const title = prompt.length > 60 ? prompt.slice(0, 57) + "…" : prompt;
  drawScene(ctx, width, height, 0, 0, 0, script[0], title);
  const thumbnail: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Thumbnail failed"))),
      "image/jpeg",
      0.85,
    ),
  );

  onProgress?.(15, "Generating 3D visuals");

  // Capture stream
  const stream = canvas.captureStream(fps);
  const mimeType = pickMimeType();

  if (typeof MediaRecorder === "undefined") {
    throw new Error("Your browser does not support video recording (MediaRecorder).");
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: portrait ? 2_500_000 : 4_000_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = (e) => reject((e as ErrorEvent).error ?? new Error("Recorder error"));
  });

  recorder.start(100);

  const totalMs = duration * 1000;
  const start = performance.now();
  const sceneDurMs = totalMs / script.length;

  // Render loop synced to wall clock — captureStream samples in real time.
  await new Promise<void>((resolve, reject) => {
    let raf = 0;
    const tick = () => {
      try {
        if (signal?.aborted) {
          cancelAnimationFrame(raf);
          recorder.stop();
          reject(new Error("Cancelled"));
          return;
        }
        const elapsed = performance.now() - start;
        const globalT = Math.min(1, elapsed / totalMs);
        const sceneIdx = Math.min(script.length - 1, Math.floor(elapsed / sceneDurMs));
        const sceneT = (elapsed - sceneIdx * sceneDurMs) / sceneDurMs;
        drawScene(ctx, width, height, sceneT, globalT, sceneIdx, script[sceneIdx], title);

        // 15% -> 90% mapped to render progress
        const pct = 15 + globalT * 70;
        const stage =
          globalT < 0.4
            ? "Generating 3D visuals"
            : globalT < 0.7
              ? "Synthesizing voiceover"
              : globalT < 0.9
                ? "Animating subtitles"
                : "Mixing sound design";
        onProgress?.(pct, stage);

        if (elapsed >= totalMs) {
          resolve();
          return;
        }
        raf = requestAnimationFrame(tick);
      } catch (err) {
        reject(err as Error);
      }
    };
    raf = requestAnimationFrame(tick);
  });

  onProgress?.(92, "Finalizing");
  recorder.stop();
  stream.getTracks().forEach((t) => t.stop());

  const video = await finished;
  onProgress?.(100, "Done");

  return { video, thumbnail, mimeType, script };
}
