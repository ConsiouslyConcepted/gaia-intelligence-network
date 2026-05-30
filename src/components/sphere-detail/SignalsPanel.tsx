import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sphere, SphereId } from "@/types/spheres";
import { BarChart3 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

interface Props {
  sphere: Sphere;
  accent: string;
}

interface SignalDef {
  key: string;
  label: string;
  unit: string;
  baseline: number;
  amplitude: number;
  frequency: number;
  color: string;
}

const SIGNALS: Record<SphereId, SignalDef[]> = {
  geosphere: [
    { key: "seismic", label: "Seismic Energy Release", unit: "J/s", baseline: 4.2, amplitude: 1.8, frequency: 0.07, color: "#cc5533" },
    { key: "strain", label: "Crustal Strain Rate", unit: "nε/yr", baseline: 12.5, amplitude: 3.2, frequency: 0.04, color: "#e8a84c" },
    { key: "thermal", label: "Geothermal Flux", unit: "mW/m²", baseline: 65, amplitude: 8, frequency: 0.02, color: "#d4654a" },
    { key: "volcanic", label: "Volcanic SO₂ Emission", unit: "kt/d", baseline: 18, amplitude: 6, frequency: 0.05, color: "#b84c2e" },
  ],
  biosphere: [
    { key: "ndvi", label: "Global NDVI", unit: "index", baseline: 0.42, amplitude: 0.08, frequency: 0.03, color: "#4caf50" },
    { key: "npp", label: "Net Primary Productivity", unit: "gC/m²/d", baseline: 3.8, amplitude: 0.9, frequency: 0.04, color: "#66bb6a" },
    { key: "biodiv", label: "Biodiversity Pressure Index", unit: "BPI", baseline: 0.68, amplitude: 0.12, frequency: 0.02, color: "#a5d6a7" },
    { key: "ocean", label: "Ocean Chlorophyll-a", unit: "mg/m³", baseline: 0.35, amplitude: 0.1, frequency: 0.05, color: "#2e7d32" },
  ],
  magnetosphere: [
    { key: "dst", label: "Dst Index", unit: "nT", baseline: -18, amplitude: 25, frequency: 0.06, color: "#4466dd" },
    { key: "bz", label: "IMF Bz Component", unit: "nT", baseline: 0.5, amplitude: 4.5, frequency: 0.08, color: "#5c7cfa" },
    { key: "proton", label: "Proton Density", unit: "p/cm³", baseline: 6, amplitude: 3, frequency: 0.05, color: "#748ffc" },
    { key: "pressure", label: "Solar Wind Pressure", unit: "nPa", baseline: 2.1, amplitude: 1.4, frequency: 0.07, color: "#91a7ff" },
  ],
  ionosphere: [
    { key: "grid", label: "Global Grid Load", unit: "TW", baseline: 28.4, amplitude: 1.8, frequency: 0.06, color: "#e8c47a" },
    { key: "dc_energy", label: "Data Center Energy", unit: "TWh/yr", baseline: 460, amplitude: 22, frequency: 0.04, color: "#9bd1ff" },
    { key: "traffic", label: "Internet Traffic", unit: "Pb/s", baseline: 1.2, amplitude: 0.12, frequency: 0.05, color: "#7ec9c7" },
    { key: "satellites", label: "Active Satellites", unit: "k", baseline: 10.2, amplitude: 0.4, frequency: 0.03, color: "#bfa6ff" },
  ],
  noosphere: [
    { key: "dataflow", label: "Global Data Flow", unit: "Tb/s", baseline: 840, amplitude: 120, frequency: 0.03, color: "#ab47bc" },
    { key: "emrf", label: "EM-RF Density", unit: "W/m²", baseline: 0.008, amplitude: 0.003, frequency: 0.05, color: "#ce93d8" },
    { key: "thermal", label: "Urban Heat Signature", unit: "ΔK", baseline: 2.4, amplitude: 0.8, frequency: 0.04, color: "#9c27b0" },
    { key: "coord", label: "Coordination Index", unit: "CI", baseline: 0.62, amplitude: 0.1, frequency: 0.02, color: "#ba68c8" },
  ],
  hydrosphere: [
    { key: "sst", label: "Global Sea Surface Temp", unit: "°C", baseline: 18.2, amplitude: 0.8, frequency: 0.02, color: "#2d7fb8" },
    { key: "salinity", label: "Surface Salinity", unit: "PSU", baseline: 34.7, amplitude: 0.4, frequency: 0.03, color: "#3a9bd9" },
    { key: "amoc", label: "AMOC Strength", unit: "Sv", baseline: 17, amplitude: 2.5, frequency: 0.015, color: "#1a5d8a" },
    { key: "precip", label: "Global Precipitation", unit: "mm/d", baseline: 2.7, amplitude: 0.6, frequency: 0.05, color: "#5dade2" },
  ],
  cryosphere: [
    { key: "seaice", label: "Arctic Sea Ice Extent", unit: "Mkm²", baseline: 10.5, amplitude: 4.2, frequency: 0.018, color: "#bcdfe8" },
    { key: "albedo", label: "Polar Albedo", unit: "α", baseline: 0.78, amplitude: 0.05, frequency: 0.03, color: "#e0f0f5" },
    { key: "glacier", label: "Glacier Mass Balance", unit: "Gt/yr", baseline: -280, amplitude: 60, frequency: 0.02, color: "#a0c8d4" },
    { key: "permafrost", label: "Permafrost Temp", unit: "°C", baseline: -3.2, amplitude: 0.3, frequency: 0.025, color: "#88b8c5" },
  ],
  crystalsphere: [
    { key: "schumann", label: "Schumann Resonance", unit: "Hz", baseline: 7.83, amplitude: 0.15, frequency: 0.03, color: "#d4a56a" },
    { key: "tidal", label: "Tidal Harmonic Amplitude", unit: "cm", baseline: 42, amplitude: 12, frequency: 0.02, color: "#e8c86a" },
    { key: "piezo", label: "Piezoelectric Signal", unit: "μV", baseline: 120, amplitude: 35, frequency: 0.06, color: "#c49a44" },
    { key: "coherence", label: "Field Coherence", unit: "%", baseline: 72, amplitude: 10, frequency: 0.04, color: "#daa520" },
  ],
  atmosphere: [
    { key: "co2", label: "Atmospheric CO₂", unit: "ppm", baseline: 424, amplitude: 2.5, frequency: 0.015, color: "#a8c8dd" },
    { key: "ozone", label: "Ozone Column", unit: "DU", baseline: 298, amplitude: 18, frequency: 0.04, color: "#88b4d4" },
    { key: "aod", label: "Aerosol Optical Depth", unit: "AOD", baseline: 0.16, amplitude: 0.05, frequency: 0.06, color: "#6f9cc4" },
    { key: "tempAnom", label: "Surface Temp Anomaly", unit: "°C", baseline: 1.18, amplitude: 0.15, frequency: 0.025, color: "#c0d8e8" },
  ],
};

function generateTimeSeries(signal: SignalDef, tick: number) {
  return Array.from({ length: 60 }, (_, i) => {
    const t = tick - 59 + i;
    const value = signal.baseline +
      signal.amplitude * Math.sin(t * signal.frequency) +
      signal.amplitude * 0.3 * Math.sin(t * signal.frequency * 2.7 + 1.3) +
      signal.amplitude * 0.15 * Math.cos(t * signal.frequency * 0.4 + 2.1) +
      (Math.random() - 0.5) * signal.amplitude * 0.2;
    return {
      t: i,
      value: Math.round(value * 1000) / 1000,
    };
  });
}

export function SignalsPanel({ sphere, accent }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(iv);
  }, []);

  const signals = SIGNALS[sphere.id] || SIGNALS.geosphere;

  const chartData = useMemo(() => {
    return signals.map(sig => ({
      ...sig,
      data: generateTimeSeries(sig, tick),
      current: (() => {
        const t = tick;
        return Math.round((sig.baseline +
          sig.amplitude * Math.sin(t * sig.frequency) +
          sig.amplitude * 0.3 * Math.sin(t * sig.frequency * 2.7 + 1.3)) * 1000) / 1000;
      })(),
    }));
  }, [signals, tick]);

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <BarChart3 className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Signals — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Time-series feeds · Key indicators · Trend analysis
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">Streaming</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {chartData.map(sig => (
          <Card key={sig.key} className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground/80">{sig.label}</h4>
                <span className="text-[9px] text-muted-foreground/35 uppercase tracking-wider">{sig.unit}</span>
              </div>
              <span className="text-lg font-mono font-bold tabular-nums" style={{ color: sig.color }}>
                {sig.current}
              </span>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sig.data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id={`grad-${sig.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sig.color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={sig.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.04)" />
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsla(240,20%,10%,0.95)",
                      border: "1px solid hsla(0,0%,100%,0.1)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "hsla(0,0%,100%,0.7)",
                    }}
                    formatter={(value: number) => [`${value} ${sig.unit}`, sig.label]}
                    labelFormatter={() => ""}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sig.color}
                    strokeWidth={1.5}
                    fill={`url(#grad-${sig.key})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
