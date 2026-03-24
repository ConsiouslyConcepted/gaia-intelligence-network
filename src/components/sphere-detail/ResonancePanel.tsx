import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Waves } from "lucide-react";

interface Props {
  sphere: Sphere;
  accent: string;
}

const RESONANCE_DATA: Record<string, { frequencies: { name: string; value: string; unit: string }[]; description: string }> = {
  geosphere: {
    frequencies: [
      { name: "Schumann Fundamental", value: "7.83", unit: "Hz" },
      { name: "Seismic Hum", value: "2.9-4.5", unit: "mHz" },
      { name: "Tidal Harmonics", value: "12.42", unit: "h period" },
    ],
    description: "Earth's solid body resonances interact with the electromagnetic cavity. Seismic free oscillations couple with Schumann modes during large events.",
  },
  biosphere: {
    frequencies: [
      { name: "Schumann Fundamental", value: "7.83", unit: "Hz" },
      { name: "Circadian Rhythm", value: "~24", unit: "h cycle" },
      { name: "Alpha Brain Wave", value: "8-12", unit: "Hz" },
    ],
    description: "Biological systems exhibit frequency-locking with planetary electromagnetic resonances. Circadian rhythms correlate with Schumann mode amplitude.",
  },
  magnetosphere: {
    frequencies: [
      { name: "Pc5 Pulsations", value: "1.7-6.7", unit: "mHz" },
      { name: "Pc3 Pulsations", value: "22-100", unit: "mHz" },
      { name: "Solar Cycle", value: "~11", unit: "yr" },
    ],
    description: "Geomagnetic pulsations are standing waves on magnetic field lines. Their frequencies are determined by magnetospheric cavity geometry.",
  },
  ionosphere: {
    frequencies: [
      { name: "Schumann Resonances", value: "7.83, 14.3, 20.8", unit: "Hz" },
      { name: "Ionospheric Alfvén", value: "0.5-5", unit: "Hz" },
      { name: "Plasma Frequency", value: "~5-12", unit: "MHz" },
    ],
    description: "The ionosphere forms the upper boundary of the Schumann cavity. Plasma density variations modulate resonance frequencies.",
  },
  noosphere: {
    frequencies: [
      { name: "Information Pulse", value: "~ms", unit: "latency" },
      { name: "Network Oscillation", value: "diurnal", unit: "cycle" },
      { name: "Attention Rhythm", value: "~90", unit: "min" },
    ],
    description: "Collective activity patterns show measurable periodicities. Network traffic and information flow exhibit resonance-like behavior.",
  },
  crystalsphere: {
    frequencies: [
      { name: "Piezoelectric", value: "32.768", unit: "kHz" },
      { name: "Lattice Phonons", value: "THz", unit: "range" },
      { name: "EM Coupling", value: "variable", unit: "" },
    ],
    description: "Crystalline structures act as natural transducers between mechanical and electromagnetic domains. Mineral lattices store and transmit resonance patterns.",
  },
};

export function ResonancePanel({ sphere, accent }: Props) {
  const resonance = RESONANCE_DATA[sphere.id] || RESONANCE_DATA.geosphere;

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Waves className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Resonance Overlay — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Frequency spectrum · Phase relationships · Field interactions
            </p>
          </div>
        </div>
      </Card>

      {/* Key Frequencies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {resonance.frequencies.map((freq, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{freq.name}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono" style={{ color: accent }}>{freq.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{freq.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Description */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Resonance Context</h3>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          {resonance.description}
        </p>
      </Card>

      {/* FFT Placeholder */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Frequency Spectrum (FFT)</h3>
        <div className="h-48 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <div className="text-center space-y-1.5">
            <Waves className="w-10 h-10 mx-auto" style={{ color: `${accent}30` }} />
            <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">
              Frequency domain analysis
            </p>
            <p className="text-[9px] text-muted-foreground/20">
              Amplitude over time · Phase relationships
            </p>
          </div>
        </div>
      </Card>

      {/* Phase Relationships */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Phase Coherence</h3>
        <div className="h-32 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">
            Cross-frequency phase coupling
          </p>
        </div>
      </Card>
    </div>
  );
}
