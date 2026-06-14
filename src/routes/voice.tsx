import { createFileRoute } from "@tanstack/react-router";
import { Mic2, Play, Globe, Square } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice Studio — EduVerse AI" },
      {
        name: "description",
        content: "Preview and clone AI voices for your educational videos.",
      },
    ],
  }),
  component: VoicePage,
});

const VOICES = [
  { name: "Atlas", style: "Cinematic male", lang: "English · US", color: "from-blue-500 to-indigo-600", sample: "Welcome to a universe of ideas." },
  { name: "Nova", style: "Warm female", lang: "English · UK", color: "from-pink-500 to-purple-600", sample: "Let me tell you something incredible." },
  { name: "Pixel", style: "Curious kid", lang: "English · US", color: "from-amber-400 to-orange-500", sample: "Wait — did you know this?" },
  { name: "Echo", style: "Trailer voice", lang: "English · US", color: "from-violet-500 to-fuchsia-600", sample: "In a world powered by curiosity..." },
  { name: "Lumen", style: "Soft narrator", lang: "Spanish · ES", color: "from-emerald-500 to-teal-500", sample: "Hola, exploremos el cosmos juntos." },
  { name: "Onyx", style: "Documentary", lang: "Hindi · IN", color: "from-rose-500 to-red-600", sample: "नमस्ते, आज हम कुछ अद्भुत सीखेंगे।" },
];

function VoicePage() {
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePreview = useCallback(
    (name: string, sample: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        toast.error("Voice preview not supported in this browser");
        return;
      }
      if (playing === name) {
        window.speechSynthesis.cancel();
        setPlaying(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(sample);
      utter.rate = 1;
      utter.pitch = 1;
      utter.onend = () => setPlaying(null);
      utter.onerror = () => {
        setPlaying(null);
        toast.error("Preview failed");
      };
      window.speechSynthesis.speak(utter);
      setPlaying(name);
    },
    [playing],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Human-like AI voices in 30+ languages. Tap to preview.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VOICES.map((v) => {
            const isPlaying = playing === v.name;
            return (
              <div key={v.name} className="relative overflow-hidden rounded-2xl glass-strong p-5">
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-30 blur-2xl ${v.color}`}
                />
                <div className="relative flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.color}`}
                  >
                    <Mic2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.style}</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Globe className="h-3 w-3" /> {v.lang}
                    </div>
                  </div>
                </div>
                <div className="relative mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(v.name, v.sample)}
                    aria-label={isPlaying ? `Stop ${v.name}` : `Preview ${v.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition hover:scale-105"
                  >
                    {isPlaying ? (
                      <Square className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 translate-x-0.5 fill-current" />
                    )}
                  </button>
                  <div className="flex h-9 flex-1 items-center gap-0.5 rounded-full bg-background/40 px-3">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full bg-foreground/40 transition-all"
                        style={{
                          height: `${20 + Math.abs(Math.sin(i + (isPlaying ? Date.now() / 200 : 0))) * 60}%`,
                          opacity: isPlaying ? 1 : 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
