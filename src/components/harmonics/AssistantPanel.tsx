import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  /** Compact snapshot of the user's current analysis state. */
  context: Record<string, unknown>;
}

const QUICK_PROMPTS: { label: string; prompt: string }[] = [
  { label: "Explain current pattern", prompt: "Explain the harmonic pattern in the current selection. Lead with the answer, classify by evidence tier (Measured / Statistical / Exploratory), keep it under 200 words." },
  { label: "Summarize this layer", prompt: "Summarize the current dynamics of the selected intelligence layer using evidence tiers." },
  { label: "Find anomalies", prompt: "Identify anomalies or drift in the loaded datasets. For each, state the signal, the deviation, and the evidence tier." },
  { label: "Compare both layers", prompt: "Compare the two selected layers and highlight any meaningful coupling. Use evidence tiers." },
  { label: "Daily report", prompt: "Generate a daily intelligence report. Sections: Conditions, Notable Events, Cross-Layer Notes, Watch List. Under 250 words. Use evidence tiers." },
  { label: "Recommend investigations", prompt: "Recommend two cross-layer pairings worth investigating next, why each matters, and which dataset ids to load. Mark each as Statistical or Exploratory." },
  { label: "Weekly report", prompt: "Generate a weekly harmonic intelligence report using evidence tiers." },
  { label: "Suggest datasets", prompt: "Recommend additional datasets in the registry I should investigate next." },
];

export function AssistantPanel({ context }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => { taRef.current?.focus(); }, []);

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
        body: { mode: "analyst", messages: next, context: { surface: "harmonics-engine", ...context } },
      });
      if (fnErr) throw new Error(fnErr.message);
      const reply = (data as { reply?: string; error?: string })?.reply;
      if (!reply) {
        const msg = (data as { error?: string })?.error ?? "No response from the assistant.";
        throw new Error(msg);
      }
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => taRef.current?.focus());
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Intelligence Assistant</div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(null); }}
            className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-foreground/80 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> reset
          </button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="text-[10px] leading-relaxed text-muted-foreground/70 mb-3">
          Ask the assistant to interpret the current analysis, compare layers, or generate a report. Every answer is grounded in the loaded series and labelled by evidence tier.
        </div>
      )}

      <div ref={scrollerRef} className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-[11px] leading-relaxed rounded-lg px-3 py-2 border ${
              m.role === "user"
                ? "bg-foreground/[0.04] border-border/30 text-foreground/85"
                : "bg-background/40 border-border/40 text-foreground/90"
            }`}
          >
            <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">
              {m.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="text-[10px] text-muted-foreground/70 italic">Thinking…</div>
        )}
        {error && (
          <div className="text-[10px] text-red-400/80 border border-red-400/30 rounded-md px-2 py-1.5">{error}</div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-border/30">
        <div className="flex flex-wrap gap-1 mb-2">
          {QUICK_PROMPTS.slice(0, messages.length === 0 ? 4 : 8).map((q) => (
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
            placeholder="Ask about harmonics, couplings, anomalies…"
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
  );
}
