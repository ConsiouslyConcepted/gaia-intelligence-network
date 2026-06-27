import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HudPanel } from "./MissionShell";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYNTHESIS_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: "Explain current conditions",
    prompt:
      "Summarize current observatory conditions across planetary, solar, stellar, galactic, and cosmological layers. Lead with the answer, classify by evidence tier, and keep it under 200 words.",
  },
  {
    label: "Compare layers",
    prompt:
      "Compare dynamics across the loaded layers right now. Highlight where rhythms align or diverge. Use Measured / Statistical / Exploratory tiers.",
  },
  {
    label: "Detect anomalies",
    prompt:
      "Identify anomalies or drift across the active datasets. For each, state the layer, the signal, the deviation, and whether the evidence is Measured, Statistical, or Exploratory.",
  },
  {
    label: "Generate daily report",
    prompt:
      "Generate a daily intelligence report. Sections: Conditions, Notable Events, Cross-Layer Notes, Watch List. Under 250 words. Use evidence tiers.",
  },
  {
    label: "Recommend investigations",
    prompt:
      "Recommend two cross-layer pairings worth investigating next, why each matters, and which dataset ids to load. Mark each as Statistical or Exploratory.",
  },
  {
    label: "Briefing for a newcomer",
    prompt:
      "Brief a newcomer on what Mission Control shows and how to use the six workspaces (Overview, Cosmic Address, Cross-Layer, Harmonic, AI Analyst, Reports). 4–6 short bullets.",
  },
];

const AIAnalystWorkspace = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

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
          mode: "analyst",
          messages: next,
          context: { surface: "mission-control/ai-analyst" },
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
    <div className="h-full w-full overflow-hidden">
      <div className="h-full grid grid-rows-[auto_1fr] gap-3">
        <HudPanel className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Workspace · Mission Synthesis
              </div>
              <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
                AI Mission Analyst
              </h2>
              <p className="text-[10px] text-muted-foreground/75 mt-1 max-w-[640px]">
                Continuous synthesis across every observatory. Ask the Planetary Intelligence Analyst to explain conditions, compare layers, surface anomalies, generate a report, or recommend what to investigate next.
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-foreground/90 px-2 py-1 rounded border border-border/40"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </HudPanel>

        <HudPanel className="p-4 min-h-0 flex flex-col">
          <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/55 mb-2">
            Synthesis prompts
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SYNTHESIS_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => send(p.prompt)}
                disabled={loading}
                className="text-[9px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-md border border-border/40 bg-foreground/[0.04] text-foreground/85 hover:bg-foreground/[0.10] disabled:opacity-40 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                {p.label}
              </button>
            ))}
          </div>

          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto rounded-md border border-border/30 bg-background/30 p-3 space-y-2.5 min-h-0"
          >
            {messages.length === 0 && (
              <div className="text-[10px] leading-relaxed text-muted-foreground/70 max-w-[600px]">
                The Mission Analyst speaks in evidence tiers — Measured, Statistical, Exploratory — and refuses to speculate beyond the loaded data. Pick a prompt above or ask your own question.
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
                  {m.role === "user" ? "You" : "Analyst"}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="text-[10px] text-muted-foreground/70 italic">Synthesizing…</div>
            )}
            {error && (
              <div className="text-[10px] text-red-400/80 border border-red-400/30 rounded-md px-2 py-1.5">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-1.5 pt-3">
            <textarea
              ref={taRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask the analyst — comparisons, anomalies, briefings…"
              disabled={loading}
              className="flex-1 resize-none bg-background/60 border border-border/40 rounded-md px-2 py-1.5 text-[11px] text-foreground/95 placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="px-3 rounded-md border border-border/40 bg-foreground/[0.06] text-foreground/85 hover:bg-foreground/[0.12] disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default AIAnalystWorkspace;
