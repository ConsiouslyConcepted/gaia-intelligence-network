import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, GitCompareArrows, AlertTriangle, FileText, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { HudPanel } from "./MissionShell";

interface Surface {
  key: string;
  label: string;
  caption: string;
  description: string;
  icon: LucideIcon;
  route: string;
  status: string;
}

const SURFACES: Surface[] = [
  {
    key: "single",
    label: "Single-Layer Analysis",
    caption: "FFT · Spectrum · Autocorrelation",
    description:
      "Decompose any single dataset into harmonics, identify dominant periods, and map peaks onto orbital intervals and musical ratios.",
    icon: Activity,
    route: "/harmonics?mode=single",
    status: "Ready",
  },
  {
    key: "cross",
    label: "Cross-Layer Comparison",
    caption: "Coupling · Cross-correlation",
    description:
      "Compare two datasets across scales. Z-score overlay, best-lag cross-correlation, period-ratio detection, and automatic evidence classification.",
    icon: GitCompareArrows,
    route: "/harmonics?mode=cross",
    status: "Live",
  },
  {
    key: "spherical",
    label: "Spherical Harmonics",
    caption: "Yₗᵐ · Multipole geometry",
    description:
      "Visualize the spherical harmonic basis (Yₗᵐ) that underlies CMB anisotropy, planetary fields, and 3D wave structure.",
    icon: Waves,
    route: "/harmonics?mode=single",
    status: "Ready",
  },
  {
    key: "events",
    label: "Events & Anomalies",
    caption: "Z-score · Drift · Alerts",
    description:
      "Automated anomaly detection across every registered dataset. Z-score outliers, trend drift, and severity-tagged alerts.",
    icon: AlertTriangle,
    route: "/harmonics?mode=events",
    status: "Auto-scan",
  },
  {
    key: "reports",
    label: "Reports Archive",
    caption: "Daily · Weekly · Monthly",
    description:
      "Persisted Daily, Weekly, and Monthly intelligence briefings synthesized from spectra, comparisons, and anomalies.",
    icon: FileText,
    route: "/harmonics?mode=reports",
    status: "Archived",
  },
];

const HarmonicWorkspace = () => {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto pb-4">
        <HudPanel className="p-5 mb-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
              Workspace 04
            </div>
            <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
              Harmonic Intelligence
            </h2>
            <p className="text-[11px] text-muted-foreground/75 mt-1.5 max-w-2xl leading-relaxed">
              The GaiaSphere analytical engine. Decompose, compare, and detect across every intelligence
              layer. Each surface launches the full Harmonics Engine in the matching mode.
            </p>
          </div>
        </HudPanel>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SURFACES.map((s) => {
            const Icon = s.icon;
            return (
              <HudPanel key={s.key} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "hsla(210,50%,18%,0.55)",
                        border: "1px solid hsla(200,60%,65%,0.35)",
                        boxShadow: "0 0 16px hsla(210,70%,60%,0.18)",
                      }}
                    >
                      <Icon size={18} style={{ color: "hsla(200,80%,82%,0.9)" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-foreground/90">
                        {s.label}
                      </div>
                      <div className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground/55 mt-0.5">
                        {s.caption}
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] tracking-[0.18em] uppercase font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "hsla(150,60%,30%,0.18)",
                      color: "hsla(150,70%,80%,0.95)",
                      border: "1px solid hsla(150,70%,65%,0.3)",
                    }}>
                    {s.status}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground/85">
                  {s.description}
                </p>

                <button
                  onClick={() => navigate(s.route)}
                  className="mt-auto flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all duration-300 hover:bg-foreground/[0.04]"
                  style={{
                    background: "hsla(240,25%,8%,0.5)",
                    borderColor: "hsla(220,30%,55%,0.35)",
                  }}
                >
                  <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-foreground/85">
                    Launch
                  </span>
                  <ArrowRight size={14} className="text-foreground/70" />
                </button>
              </HudPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HarmonicWorkspace;
