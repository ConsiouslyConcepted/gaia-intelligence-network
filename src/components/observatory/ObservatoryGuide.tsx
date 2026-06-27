import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, RotateCcw, X } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "What is GaiaSphere?", prompt: "In 3-4 sentences, introduce GaiaSphere and its nested intelligence architecture." },
  { label: "Explain this layer", prompt: "Briefly explain the intelligence layer I'm currently viewing and what I can do with it." },
  { label: "Walk my Cosmic Address", prompt: "Walk me through my Cosmic Address from Earth out to the Observable Universe in a short list." },
  { label: "Recommend a dashboard", prompt: "Recommend which dashboard I should explore next and why." },
];

const ROUTE_LAYER: Record<string, string> = {
  "/": "Observatory home — Cosmic Address navigation",
  "/planetary": "Planetary Intelligence — Earth's living systems",
  "/stellar": "Stellar Intelligence — nearby stars",
  "/galactic": "Galactic Intelligence — Milky Way position",
  "/universal": "Universal Intelligence — integrated systems view",
  "/cosmological": "Cosmological Intelligence — observable universe",
  "/harmonics": "Universal Intelligence — Harmonic Analysis Engine",
  "/commons": "Planetary Commons — dataset registry",
};

export default function ObservatoryGuide() {
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => { if (open) taRef.current?.focus(); }, [open]);

  const currentLayer =
    pathname === "/planetary" && search.includes("hgs")
      ? "Solar Intelligence — heliosphere, orbits, transits"
      : ROUTE_LAYER[pathname] ?? "GaiaSphere";

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("harmonic-assistant", {
        body: {
          mode: "guide",
          messages: next,
          context: { route: pathname + search, currentLayer },
        },
      });
      if (fnErr) throw new Error(fnErr.message);
      const reply = (data as { reply?: string; error?: string })?.reply;
      if (!reply) throw new Error((data as { error?: string })?.error ?? "No response.");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => taRef.current?.focus());
    }
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full transition-all hover:scale-[1.03]"
          style={{
            background: "linear-gradient(145deg, hsla(225,45%,11%,0.95), hsla(228,55%,5%,0.95))",
            border: "1.5px solid hsla(220,35%,60%,0.55)",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,75%,62%,0.32), 0 8px 24px rgba(0,0,0,0.55)",
            color: "hsla(0,0%,100%,0.92)",
          }}
          aria-label="Open Observatory Guide"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Observatory Guide</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-[60] w-[min(380px,calc(100vw-32px))] h-[min(560px,calc(100vh-40px))] rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsla(225,45%,11%,0.97), hsla(228,55%,5%,0.97))",
            border: "1.5px solid hsla(220,35%,60%,0.55)",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 16px 48px rgba(0,0,0,0.65)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60">GaiaSphere</div>
              <div className="text-[13px] font-semibold tracking-[0.1em] uppercase text-foreground/95">Observatory Guide</div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); setError(null); }}
                  className="p-1.5 rounded text-muted-foreground/60 hover:text-foreground/90"
                  aria-label="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded text-muted-foreground/60 hover:text-foreground/90"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55 border-b border-border/20">
            Context · {currentLayer}
          </div>

          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-0">
            {messages.length === 0 && (
              <div
                className="rounded-xl p-3.5 border"
                style={{
                  background: "linear-gradient(145deg, hsla(225,40%,12%,0.55) 0%, hsla(225,45%,8%,0.45) 100%)",
                  borderColor: "hsla(220,35%,60%,0.35)",
                  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.06), 0 4px 18px rgba(0,0,0,0.35)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/70 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
                    Observatory Mission
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-foreground/85">
                  Explore the nested systems of organization that shape Earth, the Solar System, the Milky Way, and the observable universe through real-time scientific data, systems intelligence, and AI-assisted analysis.
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-border/20 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-tighter">
                    Ask about any layer, your Cosmic Address, or where to explore next.
                  </span>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-2 bg-foreground/20" />
                    <div className="w-1 h-2 bg-foreground/40" />
                    <div className="w-1 h-2 bg-foreground/60" />
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-[11px] leading-relaxed rounded-lg px-3 py-2 border ${
                  m.role === "user"
                    ? "bg-foreground/[0.04] border-border/30 text-foreground/85"
                    : "bg-background/40 border-border/40 text-foreground/95"
                }`}
              >
                <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">
                  {m.role === "user" ? "You" : "Guide"}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {loading && <div className="text-[10px] text-muted-foreground/70 italic">Thinking…</div>}
            {error && (
              <div className="text-[10px] text-red-400/80 border border-red-400/30 rounded-md px-2 py-1.5">{error}</div>
            )}
          </div>

          <div className="px-4 pb-3 pt-2 border-t border-border/30">
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.prompt)}
                  disabled={loading}
                  className="text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded-md border border-border/30 bg-background/40 text-muted-foreground/80 hover:bg-foreground/[0.06] hover:text-foreground/90 disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <textarea
                ref={taRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Ask about a layer, your address, what to explore…"
                disabled={loading}
                className="flex-1 resize-none bg-background/60 border border-border/40 rounded-md px-2 py-1.5 text-[11px] text-foreground/95 placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="px-2 rounded-md border border-border/40 bg-foreground/[0.06] text-foreground/85 hover:bg-foreground/[0.12] disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
