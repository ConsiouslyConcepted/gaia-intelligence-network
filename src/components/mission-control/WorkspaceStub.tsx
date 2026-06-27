import { WORKSPACES, type Workspace, HudPanel } from "./MissionShell";
import { Construction } from "lucide-react";

interface Props {
  workspace: Workspace;
}

const PHASE_NOTES: Record<Workspace, { phase: string; preview: string[] }> = {
  overview: { phase: "Phase 1", preview: ["Live now"] },
  address: {
    phase: "Phase 2",
    preview: [
      "Interactive nested hierarchy: Earth → Solar System → Stellar Neighborhood → Milky Way → Local Group → Virgo Cluster → Laniakea → Observable Universe.",
      "Each level deep-links into the matching intelligence dashboard.",
      "Existing CosmicAddress3D component will mount here.",
    ],
  },
  "cross-layer": {
    phase: "Phase 3",
    preview: [
      "Living network view: 5 layer nodes with animated edges weighted by active correlation strength.",
      "Surfaces shared patterns, temporal couplings, and active influences across Planetary ↔ Solar ↔ Stellar ↔ Galactic ↔ Cosmological.",
      "Reuses CrossLayerPanel and crossLayer.ts.",
    ],
  },
  harmonic: {
    phase: "Phase 3",
    preview: [
      "Consolidated workspace for Harmonic Cycles, Harmonic Relationships, Musical Ratios, Wave Structures, and Spherical Harmonic Analysis.",
      "Sub-tabs for each analytical module.",
      "The current /harmonics route migrates in here.",
    ],
  },
  ai: {
    phase: "Phase 4",
    preview: [
      "Observatory Guide promoted into a full Mission Analyst pane.",
      "Starter prompts: Explain conditions · Compare layers · Detect anomalies · Generate report · Recommend investigations.",
      "Continuously synthesizes across every observatory.",
    ],
  },
  reports: {
    phase: "Phase 4",
    preview: [
      "Auto-generated Daily Observatory, Weekly Summary, Planetary, Solar, Cross-Layer, and Universal reports.",
      "Each report: Current Conditions · Notable Events · Cross-System Relationships · Emerging Trends · AI Summary · Recommended Exploration.",
      "Reuses ReportsPanel.",
    ],
  },
};

const WorkspaceStub = ({ workspace }: Props) => {
  const meta = WORKSPACES.find((w) => w.key === workspace)!;
  const Icon = meta.icon;
  const notes = PHASE_NOTES[workspace];

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[900px] mx-auto pb-4">
        <HudPanel className="p-8 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "hsla(210,50%,18%,0.55)",
                border: "1px solid hsla(200,60%,65%,0.35)",
                boxShadow: "0 0 24px hsla(210,70%,60%,0.22)",
              }}
            >
              <Icon size={26} style={{ color: "hsla(200,80%,82%,0.95)" }} />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Workspace · {notes.phase}
              </div>
              <h2 className="text-[17px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
                {meta.label}
              </h2>
              <p className="text-[11px] text-muted-foreground/75 mt-1">{meta.caption}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md border w-fit"
            style={{
              background: "hsla(45,60%,30%,0.18)",
              borderColor: "hsla(45,80%,70%,0.4)",
            }}
          >
            <Construction size={13} style={{ color: "hsla(45,90%,80%,0.95)" }} />
            <span className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ color: "hsla(45,90%,85%,0.95)" }}>
              Arriving in {notes.phase}
            </span>
          </div>

          <div>
            <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-2">
              What this workspace will do
            </div>
            <ul className="space-y-2 text-[11px] leading-relaxed text-muted-foreground/90 list-disc list-inside marker:text-foreground/40">
              {notes.preview.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border/20 pt-4 text-[9px] tracking-[0.2em] uppercase text-muted-foreground/45">
            Mission Control · Phase 1 ships the shell — workspaces fill in across phases 2 – 4.
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default WorkspaceStub;
