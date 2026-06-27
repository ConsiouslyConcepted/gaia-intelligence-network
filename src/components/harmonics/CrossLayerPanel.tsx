import { useMemo } from "react";
import { DATASETS, SCOPES, datasetsByScope, getDataset, type Dataset } from "@/lib/harmonics/datasets";
import { compareLayers, SUGGESTED_PAIRINGS } from "@/lib/harmonics/crossLayer";

const PANEL_BG = "hsla(225,40%,8%,0.6)";

function MiniOverlay({ zA, zB }: { zA: number[]; zB: number[] }) {
  const W = 640, H = 200;
  const N = Math.min(zA.length, zB.length);
  if (!N) return null;
  const stepX = W / Math.max(N - 1, 1);
  const all = [...zA.slice(0, N), ...zB.slice(0, N)];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const toPath = (s: number[]) =>
    s.slice(0, N).map((v, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(2)} ${(H - ((v - min) / range) * H).toFixed(2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <rect width={W} height={H} fill={PANEL_BG} />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="hsla(220,30%,55%,0.1)" />
      ))}
      <path d={toPath(zA)} fill="none" stroke="hsla(190,90%,65%,0.95)" strokeWidth={1.3} />
      <path d={toPath(zB)} fill="none" stroke="hsla(45,100%,70%,0.95)" strokeWidth={1.3} />
      <text x={8} y={14} fontSize={9} fontFamily="monospace" fill="hsla(190,90%,80%,0.95)">A (z-scored)</text>
      <text x={8} y={26} fontSize={9} fontFamily="monospace" fill="hsla(45,100%,80%,0.95)">B (z-scored)</text>
    </svg>
  );
}

function CCPlot({ values, bestLag, bestR }: { values: number[]; bestLag: number; bestR: number }) {
  const W = 640, H = 180;
  const stepX = W / values.length;
  const yMid = H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <rect width={W} height={H} fill={PANEL_BG} />
      <line x1={0} x2={W} y1={yMid} y2={yMid} stroke="hsla(220,30%,55%,0.25)" />
      {values.map((v, i) => {
        const h = v * (H / 2 - 12);
        return (
          <rect
            key={i}
            x={i * stepX}
            y={yMid - Math.max(h, 0)}
            width={Math.max(stepX * 0.8, 1)}
            height={Math.abs(h)}
            fill={v >= 0 ? "hsla(170,80%,60%,0.7)" : "hsla(0,75%,65%,0.7)"}
          />
        );
      })}
      <text x={8} y={14} fontSize={9} fontFamily="monospace" fill="hsla(45,100%,80%,0.9)">
        best lag {bestLag} · r {bestR.toFixed(3)}
      </text>
    </svg>
  );
}

const EVIDENCE_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  measured:    { bg: "hsla(170,70%,30%,0.25)", border: "hsla(170,70%,55%,0.6)", color: "hsla(170,80%,80%,0.95)", label: "Measured" },
  statistical: { bg: "hsla(45,80%,30%,0.25)",  border: "hsla(45,90%,60%,0.6)",  color: "hsla(45,100%,85%,0.95)", label: "Statistical" },
  exploratory: { bg: "hsla(280,40%,30%,0.25)", border: "hsla(280,50%,65%,0.5)", color: "hsla(280,70%,85%,0.95)", label: "Exploratory" },
};

interface Props {
  aId: string;
  bId: string;
  onChange: (a: string, b: string) => void;
}

export function CrossLayerPanel({ aId, bId, onChange }: Props) {
  const a = getDataset(aId) ?? DATASETS[0];
  const b = getDataset(bId) ?? DATASETS[1];
  const result = useMemo(() => compareLayers(a, b), [a, b]);
  const ev = EVIDENCE_STYLE[result.evidence];

  return (
    <div className="flex flex-col gap-3">
      {/* Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DatasetPicker label="Layer A" value={aId} color="hsla(190,90%,65%,0.95)" onChange={(v) => onChange(v, bId)} />
        <DatasetPicker label="Layer B" value={bId} color="hsla(45,100%,70%,0.95)" onChange={(v) => onChange(aId, v)} />
      </div>

      {/* Suggested pairings — HUD telemetry chips */}
      <div>
        <div className="flex items-center gap-3 mb-4 opacity-70">
          <div className="w-4 h-px bg-sky-500/70" />
          <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-sky-400/85 font-mono">
            Suggested Cross-Layer Pairings
          </div>
        </div>

        <div className="space-y-5">
          {(() => {
            // Per-layer hue (matches the rest of the platform's cross-layer color system)
            const LAYER_HUE: Record<string, { ring: string; text: string; hover: string }> = {
              Planetary:    { ring: "bg-emerald-500/45", text: "group-hover:text-emerald-400", hover: "hover:border-emerald-500/50 hover:bg-emerald-500/[0.05]" },
              Solar:        { ring: "bg-amber-500/45",   text: "group-hover:text-amber-400",   hover: "hover:border-amber-500/50 hover:bg-amber-500/[0.05]" },
              Stellar:      { ring: "bg-indigo-500/45",  text: "group-hover:text-indigo-300",  hover: "hover:border-indigo-500/50 hover:bg-indigo-500/[0.05]" },
              Galactic:     { ring: "bg-cyan-500/45",    text: "group-hover:text-cyan-300",    hover: "hover:border-cyan-500/50 hover:bg-cyan-500/[0.05]" },
              Cosmological: { ring: "bg-orange-500/45",  text: "group-hover:text-orange-300",  hover: "hover:border-orange-500/50 hover:bg-orange-500/[0.05]" },
              Harmonic:     { ring: "bg-sky-500/45",     text: "group-hover:text-sky-300",     hover: "hover:border-sky-500/50 hover:bg-sky-500/[0.05]" },
            };
            const CATCODE: Record<string, string> = {
              "Planetary ↔ Solar":       "CAT_01·ALPHA",
              "Solar ↔ Stellar":         "CAT_02·DELTA",
              "Stellar ↔ Galactic":      "CAT_03·SIGMA",
              "Galactic ↔ Cosmological": "CAT_04·OMEGA",
              "Harmonic & Mathematical": "CAT_05·LAMBDA",
            };
            const splitGroup = (g: string): [string, string] => {
              if (g.includes("↔")) {
                const [a, b] = g.split("↔").map((s) => s.trim());
                return [a, b];
              }
              return ["Harmonic", "Harmonic"];
            };

            return Array.from(new Set(SUGGESTED_PAIRINGS.map((p) => p.group))).map((group) => {
              const [layerA, layerB] = splitGroup(group);
              const a = LAYER_HUE[layerA] ?? LAYER_HUE.Harmonic;
              const b = LAYER_HUE[layerB] ?? LAYER_HUE.Harmonic;
              return (
                <section key={group}>
                  <header className="flex items-center justify-between mb-2.5 border-b border-border/25 pb-1.5">
                    <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground/65 font-mono">
                      {layerA} <span className="text-muted-foreground/30 mx-0.5">/</span> {layerB}
                    </span>
                    <span className="text-[8px] text-muted-foreground/35 font-mono tracking-wider">
                      {CATCODE[group] ?? ""}
                    </span>
                  </header>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PAIRINGS.filter((p) => p.group === group).map((p) => {
                      const isActive = aId === p.a && bId === p.b;
                      return (
                        <button
                          key={p.label}
                          onClick={() => onChange(p.a, p.b)}
                          title={`${p.note}  ·  expected: ${p.expected}`}
                          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded border bg-background/30 transition-all cursor-pointer ${
                            isActive
                              ? "border-foreground/40 bg-foreground/[0.04]"
                              : `border-border/40 ${a.hover}`
                          }`}
                        >
                          <div className={`w-[3px] h-3 rounded-full ${a.ring} ${isActive ? "!bg-foreground/70" : ""}`} />
                          <span className={`text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/85 transition-colors ${isActive ? "text-foreground/95" : a.text}`}>
                            {p.label.split(/[↔→]/)[0].trim()}
                          </span>
                          <span className="text-muted-foreground/35 text-[10px]">
                            {p.label.includes("→") ? "→" : "↔"}
                          </span>
                          <span className={`text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/85 transition-colors ${isActive ? "text-foreground/95" : b.text}`}>
                            {p.label.split(/[↔→]/)[1]?.trim() ?? ""}
                          </span>
                          <div className={`w-[3px] h-3 rounded-full ${b.ring} ${isActive ? "!bg-foreground/70" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            });
          })()}
        </div>
      </div>



      {/* Evidence badge */}
      <div className="flex items-start gap-2 rounded-md border px-3 py-2"
           style={{ background: ev.bg, borderColor: ev.border }}>
        <div className="text-[9px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap" style={{ color: ev.color }}>
          {ev.label}
        </div>
        <div className="text-[10px] leading-relaxed text-muted-foreground">{result.evidenceNote}</div>
      </div>

      {/* Overlay chart */}
      <div className="rounded-md overflow-hidden border border-border/30">
        <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 border-b border-border/30 bg-background/40">
          Normalized time series overlay
        </div>
        <div className="h-[220px]"><MiniOverlay zA={result.zA} zB={result.zB} /></div>
      </div>

      {/* Cross-correlation */}
      <div className="rounded-md overflow-hidden border border-border/30">
        <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 border-b border-border/30 bg-background/40">
          Cross-correlation across lag
        </div>
        <div className="h-[180px]">
          <CCPlot values={result.correlation.values} bestLag={result.correlation.bestLag} bestR={result.correlation.bestR} />
        </div>
      </div>

      {/* Period ratios */}
      <div className="rounded-md border border-border/30 p-3">
        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-2">Shared period structure</div>
        {result.sharedPeriods.length === 0 ? (
          <div className="text-[10px] text-muted-foreground/70">No small-integer period ratios detected between the top peaks of A and B.</div>
        ) : (
          <table className="w-full text-[11px] font-mono">
            <thead className="text-muted-foreground/55 text-left">
              <tr>
                <th>Period A ({a.unit})</th>
                <th>Period B ({b.unit})</th>
                <th>Ratio</th>
                <th>Interval</th>
                <th>Cents</th>
              </tr>
            </thead>
            <tbody>
              {result.sharedPeriods.map((row, i) => (
                <tr key={i} className="border-t border-border/20 text-foreground/85">
                  <td className="py-1">{row.periodA.toFixed(2)}</td>
                  <td>{row.periodB.toFixed(2)}</td>
                  <td>{row.ratio}</td>
                  <td>{row.interval}</td>
                  <td>{row.cents.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Peaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PeaksCard title={`Top peaks · ${a.label}`} peaks={result.topPeaksA} unit={a.unit} color="hsla(190,90%,80%,0.95)" />
        <PeaksCard title={`Top peaks · ${b.label}`} peaks={result.topPeaksB} unit={b.unit} color="hsla(45,100%,80%,0.95)" />
      </div>
    </div>
  );
}

function PeaksCard({ title, peaks, unit, color }: { title: string; peaks: { period: number; power: number }[]; unit: string; color: string }) {
  return (
    <div className="rounded-md border border-border/30 p-3">
      <div className="text-[9px] uppercase tracking-[0.18em] mb-1.5" style={{ color }}>{title}</div>
      {peaks.length === 0 ? (
        <div className="text-[10px] text-muted-foreground/60">No significant peaks.</div>
      ) : (
        <ul className="text-[10px] text-muted-foreground/80 space-y-0.5 font-mono">
          {peaks.map((p, i) => (
            <li key={i}>· {p.period < 100 ? p.period.toFixed(2) : p.period.toFixed(0)} {unit} · power {p.power.toExponential(1)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DatasetPicker({ label, value, color, onChange }: { label: string; value: string; color: string; onChange: (v: string) => void }) {
  const ds = getDataset(value);
  return (
    <div className="rounded-md border border-border/30 p-3 bg-background/30">
      <div className="text-[9px] uppercase tracking-[0.18em] mb-1" style={{ color }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/60 border border-border/40 rounded px-2 py-1 text-[11px] text-foreground/95 mb-1.5"
      >
        {SCOPES.map((s) => (
          <optgroup key={s.id} label={s.label}>
            {datasetsByScope(s.id).map((d: Dataset) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {ds && (
        <div className="text-[10px] leading-relaxed text-muted-foreground/70">
          <span className="uppercase tracking-[0.15em] text-[8px] text-muted-foreground/50 mr-1">{ds.provenance}</span>
          {ds.description}
        </div>
      )}
    </div>
  );
}
