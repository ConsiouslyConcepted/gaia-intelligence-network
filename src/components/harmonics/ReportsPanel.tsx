import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, FileText, Sparkles } from "lucide-react";
import {
  loadReports,
  saveReport,
  deleteReport,
  REPORT_KIND_LABEL,
  REPORT_PROMPTS,
  type ReportKind,
  type SavedReport,
} from "@/lib/harmonics/reports";

interface Props {
  /** Snapshot of the active analysis context, forwarded to the assistant. */
  context: Record<string, unknown>;
}

const KINDS: ReportKind[] = ["daily", "weekly", "monthly", "custom"];

export function ReportsPanel({ context }: Props) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [generating, setGenerating] = useState<ReportKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  async function generate(kind: ReportKind) {
    if (generating) return;
    setGenerating(kind);
    setError(null);
    try {
      const prompt = REPORT_PROMPTS[kind];
      const { data, error: fnErr } = await supabase.functions.invoke("harmonic-assistant", {
        body: { messages: [{ role: "user", content: prompt }], context },
      });
      if (fnErr) throw new Error(fnErr.message);
      const reply = (data as { reply?: string; error?: string })?.reply;
      if (!reply) throw new Error((data as { error?: string })?.error ?? "Empty response from assistant.");
      const title = `${REPORT_KIND_LABEL[kind]} Intelligence Report · ${new Date().toLocaleDateString()}`;
      const saved = saveReport({ kind, title, body: reply, context });
      const next = loadReports();
      setReports(next);
      setSelectedId(saved.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(null);
    }
  }

  function remove(id: string) {
    deleteReport(id);
    setReports(loadReports());
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55">
            Intelligence Reports
          </div>
          <div className="text-[13px] font-semibold tracking-[0.1em] uppercase text-foreground/95">
            Generate & archive
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => generate(k)}
              disabled={generating !== null}
              className="px-2.5 py-1 rounded-md text-[9px] tracking-[0.14em] uppercase border border-border/40 bg-foreground/[0.05] text-foreground/85 hover:bg-foreground/[0.12] disabled:opacity-40 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {generating === k ? "Drafting…" : REPORT_KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-[10px] text-red-400/80 border border-red-400/30 rounded-md px-2 py-1.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3">
        {/* Archive list */}
        <div className="rounded-md border border-border/30 bg-background/30 max-h-[420px] overflow-y-auto">
          {reports.length === 0 ? (
            <div className="text-[10px] text-muted-foreground/70 p-3">
              No saved reports yet. Generate one to start the archive.
            </div>
          ) : (
            <ul>
              {reports.map((r) => {
                const active = r.id === selectedId;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelectedId(r.id)}
                      className="w-full text-left px-3 py-2 border-b border-border/20 transition-colors"
                      style={{
                        background: active ? "hsla(210,50%,18%,0.6)" : "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">
                          {REPORT_KIND_LABEL[r.kind]}
                        </div>
                        <div className="text-[9px] font-mono text-muted-foreground/55">
                          {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <div className="text-[10px] text-foreground/90 mt-0.5 line-clamp-2">{r.title}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="rounded-md border border-border/30 bg-background/30 p-3 min-h-[280px]">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-border/30">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55">
                    {REPORT_KIND_LABEL[selected.kind]} · {new Date(selected.createdAt).toLocaleString()}
                  </div>
                  <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/95 mt-0.5">
                    {selected.title}
                  </div>
                </div>
                <button
                  onClick={() => remove(selected.id)}
                  className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-red-400/80 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> delete
                </button>
              </div>
              <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/85 font-mono">
                {selected.body}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 h-full text-center text-muted-foreground/60">
              <FileText className="w-5 h-5" />
              <div className="text-[10px] leading-relaxed max-w-[260px]">
                Select a saved report from the archive, or generate a new one. Reports are stored in this browser.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
