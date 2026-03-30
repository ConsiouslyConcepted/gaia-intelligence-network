import { Card } from "@/components/ui/card";
import { Sphere, SphereId } from "@/types/spheres";
import { Activity, RefreshCw, Satellite } from "lucide-react";
import { BlueMarbleGlobe } from "./BlueMarbleGlobe";
import { useLiveOverlay } from "@/hooks/useLiveOverlay";

interface Props {
  sphere: Sphere;
  accent: string;
}

interface BehaviorPattern {
  name: string;
  description: string;
  timeScale: string;
}


const BEHAVIOR_DATA: Record<SphereId, { summary: string; patterns: BehaviorPattern[] }> = {
  geosphere: {
    summary: "The Geosphere exhibits pulsed, episodic behavior punctuated by continuous slow deformation. Seismic energy accumulates along fault systems and releases in discrete events, while plate motion produces measurable surface displacement over longer time scales.",
    patterns: [
      { name: "Seismic Pulse Sequences", description: "Earthquake swarms, mainshock-aftershock cascades, and triggered seismicity propagating along fault networks.", timeScale: "Seconds → Weeks" },
      { name: "Crustal Deformation Drift", description: "Slow displacement accumulation measured by GNSS — plate convergence, rift extension, and volcanic inflation/deflation cycles.", timeScale: "Months → Years" },
      { name: "Stress Accumulation & Release", description: "Elastic strain loading on locked faults followed by coseismic rupture and postseismic relaxation.", timeScale: "Years → Decades" },
      { name: "Regional Activity Propagation", description: "Stress transfer between adjacent fault segments triggering cascading seismic activity across regions.", timeScale: "Days → Months" },
    ],
  },
  biosphere: {
    summary: "The Biosphere behaves as a rhythmically breathing system — expanding and contracting with seasonal photosynthetic cycles, punctuated by ecological events like blooms, migrations, and disturbance responses.",
    patterns: [
      { name: "Seasonal Expansion / Contraction", description: "Hemispherical vegetation cycles producing a measurable planetary respiration signal in NDVI, carbon flux, and atmospheric CO₂.", timeScale: "Months (seasonal)" },
      { name: "Bloom & Migration Cycles", description: "Phytoplankton blooms, bird migrations, marine mammal movements — periodic ecological pulses driven by solar and thermal cues.", timeScale: "Weeks → Months" },
      { name: "Ecological Intensification / Decline", description: "Shifting biomass density, ecosystem stress indicators, and biodiversity trends under climate and anthropogenic pressure.", timeScale: "Years → Decades" },
      { name: "Regional Adaptation Patterns", description: "Local ecosystem responses to disturbance — fire recovery, flood adaptation, drought resilience, invasive species dynamics.", timeScale: "Months → Years" },
    ],
  },
  magnetosphere: {
    summary: "The Magnetosphere is in constant dynamic equilibrium with the solar wind. It compresses under pressure, extends during quiet periods, and undergoes dramatic reconfiguration during geomagnetic storms and substorms.",
    patterns: [
      { name: "Field-Line Motion", description: "Continuous reconfiguration of magnetic topology — dayside compression, nightside stretching, and reconnection-driven dynamics.", timeScale: "Minutes → Hours" },
      { name: "Magnetotail Extension", description: "Elongation of the nightside tail during energy loading phases, followed by explosive energy release during substorms.", timeScale: "Hours" },
      { name: "Compression / Expansion Cycles", description: "Magnetopause standoff distance oscillation driven by solar wind dynamic pressure variations.", timeScale: "Minutes → Days" },
      { name: "Auroral Activation", description: "Energetic particle precipitation into the polar ionosphere producing visible aurorae and ionospheric disturbance.", timeScale: "Minutes → Hours" },
    ],
  },
  ionosphere: {
    summary: "The Ionosphere exhibits continuous wave-like behavior — plasma density ripples, polar activation during geomagnetic events, and diurnal photochemical cycling between day and night hemispheres.",
    patterns: [
      { name: "Shell Rippling", description: "Traveling ionospheric disturbances (TIDs) — wave perturbations in electron density propagating horizontally through the plasma.", timeScale: "Minutes → Hours" },
      { name: "Polar Activation", description: "Auroral zone ionization surges driven by magnetospheric particle precipitation and field-aligned currents.", timeScale: "Minutes → Hours" },
      { name: "Atmospheric-Electric Disturbance", description: "Ionospheric storms producing enhanced TEC gradients, scintillation, and disruption of radio propagation.", timeScale: "Hours → Days" },
      { name: "Diurnal Cycling", description: "Solar-driven photochemical ionization/recombination cycle producing day-night electron density asymmetry.", timeScale: "24h cycle" },
    ],
  },
  noosphere: {
    summary: "The Noosphere pulses with collective human activity — network nodes activate and deactivate on diurnal cycles, attention surges cluster around events, and the global communication topology continuously reconfigures.",
    patterns: [
      { name: "Node Activation Waves", description: "Diurnal activation of communication hubs following the terminator line — cities come online and go quiet in sequence.", timeScale: "24h cycle" },
      { name: "Arc Emergence", description: "New high-bandwidth connections forming between previously weakly-linked network nodes during crisis or coordination events.", timeScale: "Hours → Days" },
      { name: "Clustering Shifts", description: "Reconfiguration of semantic attention clusters — topic emergence, viral propagation, and collective focus migration.", timeScale: "Hours → Weeks" },
      { name: "Surge Patterns", description: "Explosive growth in information flow during global events — natural disasters, political events, cultural moments.", timeScale: "Minutes → Days" },
    ],
  },
  crystalsphere: {
    summary: "The Crystalsphere represents modeled harmonic behavior — lattice activation patterns, frequency-linked modulation of resonance intensity, and symmetry shifts in the geometric scaffold responding to planetary field dynamics.",
    patterns: [
      { name: "Lattice Activation", description: "Coherence peaks at specific nodal points of the geometric resonance grid, triggered by external field inputs.", timeScale: "Variable" },
      { name: "Frequency-Linked Modulation", description: "Resonance intensity changes correlated with Schumann mode amplitude, solar activity, and geomagnetic pulsations.", timeScale: "Seconds → Days" },
      { name: "Symmetry Intensification", description: "Periods of enhanced geometric coherence in the harmonic scaffold — alignment of multiple resonance modes.", timeScale: "Hours → Weeks" },
      { name: "Planetary Resonance Coupling", description: "Dynamic interaction between Crystalsphere patterns and measurable planetary field signals (Schumann, geomagnetic, tidal).", timeScale: "Minutes → Months" },
    ],
  },
};

export function LiveDynamicsPanel({ sphere, accent }: Props) {
  const behavior = BEHAVIOR_DATA[sphere.id];
  const live = useLiveOverlay(sphere.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Activity className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Live Dynamics — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Real-time simulation · Behavior patterns · Dynamic processes
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: live.isLive ? "#22c55e" : accent }}
            />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
              {live.isLive ? "Live" : "Static"}
            </span>
          </div>
        </div>
      </Card>

      {/* Blue Marble Globe with live overlay */}
      <Card className="glass-panel rounded-xl p-3 relative overflow-hidden">
        <BlueMarbleGlobe
          height={340}
          sphereId={sphere.id}
          overlayUrl={live.textureUrl}
          quakes={sphere.id === "geosphere" ? live.quakes : undefined}
        />
      </Card>

      {/* Data source info */}
      <Card className="glass-panel rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-muted-foreground/40" />
            <div>
              <span className="text-[10px] font-medium text-foreground/70">{live.source}</span>
              <p className="text-[9px] text-muted-foreground/40">{live.description}</p>
            </div>
          </div>
          <button
            onClick={live.refresh}
            className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground/40 ${live.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {sphere.id === "geosphere" && live.quakes.length > 0 && (
          <p className="text-[9px] text-muted-foreground/30 mt-1">
            {live.quakes.length} earthquakes (M2.5+) in last 24h
          </p>
        )}
        {sphere.id === "magnetosphere" && live.kpIndex !== null && (
          <p className="text-[9px] text-muted-foreground/30 mt-1">
            Current Kp index: {live.kpIndex} — {live.kpIndex >= 5 ? "Storm" : live.kpIndex >= 4 ? "Active" : "Quiet"}
          </p>
        )}
      </Card>

      {/* Behavior Summary */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Behavioral Summary</h3>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">{behavior.summary}</p>
      </Card>

      {/* Dynamic Patterns */}
      <div className="space-y-3">
        {behavior.patterns.map((pattern, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${accent}12` }}
              >
                <Activity className="w-3.5 h-3.5" style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground/85">{pattern.name}</h4>
                  <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-wider shrink-0 ml-2">
                    {pattern.timeScale}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-1">{pattern.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
