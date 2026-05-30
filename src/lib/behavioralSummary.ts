import { SphereId } from "@/types/spheres";
import { SphereIntelligence, MetricReading } from "@/lib/sphereIntelligence";

export interface LivePattern {
  name: string;
  description: string;
  timeScale: string;
  /** dynamic status line derived from live metrics */
  status: string;
  /** 0..1 intensity used for the on-screen bar */
  intensity: number;
  /** linked metric keys (used for the live value chips) */
  metricKeys: string[];
}

export interface LiveBehavior {
  summary: string;
  patterns: LivePattern[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const fmt = (r: MetricReading) =>
  `${r.value.toFixed(r.spec.precision ?? 2)} ${r.spec.unit}`.trim();
const signed = (n: number, digits = 1) =>
  `${n >= 0 ? "+" : ""}${n.toFixed(digits)}`;

function regime(score: number): { tag: string; tone: string } {
  if (score >= 78) return { tag: "nominal", tone: "balanced operating envelope" };
  if (score >= 62) return { tag: "guarded", tone: "mild deviation from baseline" };
  if (score >= 45) return { tag: "elevated", tone: "active forcing on the system" };
  return { tag: "strained", tone: "sustained anomalous forcing" };
}

function trendPhrase(trend: number): string {
  if (trend > 1.5) return "strengthening";
  if (trend > 0.4) return "easing";
  if (trend < -1.5) return "rapidly degrading";
  if (trend < -0.4) return "softening";
  return "holding steady";
}

function pick(metrics: MetricReading[], key: string): MetricReading | undefined {
  return metrics.find((m) => m.spec.key === key);
}

function intensityFrom(metrics: MetricReading[], keys: string[]): number {
  const zs = keys
    .map((k) => pick(metrics, k))
    .filter((m): m is MetricReading => !!m)
    .map((m) => Math.abs(m.z));
  if (!zs.length) return 0.3;
  const avg = zs.reduce((a, b) => a + b, 0) / zs.length;
  // map |z|: 0 → 0.15, 2σ → 0.85
  return clamp01(0.15 + avg * 0.35);
}

// ─── per-sphere builders ─────────────────────────────────────────────────────

type Builder = (intel: SphereIntelligence) => LiveBehavior;

const BUILDERS: Record<SphereId, Builder> = {
  hydrosphere: (intel) => {
    const m = intel.metrics;
    const ohc = pick(m, "ohc");
    const sst = pick(m, "sst");
    const amoc = pick(m, "amoc");
    const r = regime(intel.score);
    const summary =
      `Hydrosphere coherence at ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)} over the last cycle. ` +
      (ohc ? `Ocean Heat Content is ${fmt(ohc)} (${signed(ohc.deltaPct)}% vs baseline), ` : "") +
      (sst ? `SST anomaly ${fmt(sst)}, ` : "") +
      (amoc ? `AMOC transport ${fmt(amoc)}. ` : "") +
      `Conveyor is currently in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        {
          name: "Ocean Heat Redistribution",
          description: "Surface and thermohaline currents transport equatorial heat poleward, regulating regional climate and marine ecosystems.",
          timeScale: "Days → Decades",
          status: ohc ? `Heat reservoir ${fmt(ohc)} · drift ${signed(ohc.deltaPct)}%` : "—",
          intensity: intensityFrom(m, ["ohc", "amoc"]),
          metricKeys: ["ohc", "amoc"],
        },
        {
          name: "Hydrological Cycling",
          description: "Evaporation, condensation, precipitation, and runoff continuously transfer water between reservoirs.",
          timeScale: "Hours → Years",
          status: sst ? `Surface forcing ${fmt(sst)} (${signed(sst.z, 2)}σ)` : "—",
          intensity: intensityFrom(m, ["sst"]),
          metricKeys: ["sst"],
        },
        {
          name: "Sea Level Variability",
          description: "Steric expansion, ice mass loss, and ocean basin redistribution drive measurable global mean sea level change.",
          timeScale: "Months → Decades",
          status: ohc ? `Steric component tracking OHC ${signed(ohc.deltaPct)}%` : "—",
          intensity: intensityFrom(m, ["ohc", "sst"]),
          metricKeys: ["ohc", "sst"],
        },
        {
          name: "Salinity & Density Drift",
          description: "Freshwater input from ice melt and precipitation modulates ocean stratification and circulation strength.",
          timeScale: "Years → Centuries",
          status: amoc ? `AMOC ${fmt(amoc)} · ${trendPhrase(intel.trend)}` : "—",
          intensity: intensityFrom(m, ["amoc"]),
          metricKeys: ["amoc"],
        },
      ],
    };
  },

  geosphere: (intel) => {
    const m = intel.metrics;
    const seismic = pick(m, "seismic");
    const quakes = pick(m, "quakes");
    const volcanic = pick(m, "volcanic");
    const r = regime(intel.score);
    const summary =
      `Geosphere activity index ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (seismic ? `Seismic release ${fmt(seismic)}, ` : "") +
      (quakes ? `~${Math.round(quakes.value)} M2.5+ quakes/day, ` : "") +
      (volcanic ? `volcanic index ${fmt(volcanic)}. ` : "") +
      `Crustal system is in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Seismic Pulse Sequences", description: "Earthquake swarms, mainshock–aftershock cascades, and triggered seismicity propagating along fault networks.", timeScale: "Seconds → Weeks",
          status: quakes ? `Rate ${Math.round(quakes.value)}/day · ${signed(quakes.z, 1)}σ` : "—",
          intensity: intensityFrom(m, ["quakes", "seismic"]), metricKeys: ["quakes", "seismic"] },
        { name: "Crustal Deformation Drift", description: "Slow displacement accumulation measured by GNSS — plate convergence, rift extension, and volcanic inflation/deflation cycles.", timeScale: "Months → Years",
          status: seismic ? `Energy release ${fmt(seismic)}` : "—",
          intensity: intensityFrom(m, ["seismic"]), metricKeys: ["seismic"] },
        { name: "Stress Accumulation & Release", description: "Elastic strain loading on locked faults followed by coseismic rupture and postseismic relaxation.", timeScale: "Years → Decades",
          status: seismic ? `Loading ${signed(seismic.deltaPct)}% vs baseline` : "—",
          intensity: intensityFrom(m, ["seismic", "quakes"]), metricKeys: ["seismic"] },
        { name: "Regional Activity Propagation", description: "Stress transfer between adjacent fault segments triggering cascading seismic activity across regions.", timeScale: "Days → Months",
          status: volcanic ? `Volcanic coupling ${fmt(volcanic)}` : "—",
          intensity: intensityFrom(m, ["volcanic"]), metricKeys: ["volcanic"] },
      ],
    };
  },

  biosphere: (intel) => {
    const m = intel.metrics;
    const ndvi = pick(m, "ndvi");
    const carbon = pick(m, "carbon");
    const npp = pick(m, "productivity");
    const r = regime(intel.score);
    const summary =
      `Biosphere vitality ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (ndvi ? `NDVI ${fmt(ndvi)} (${signed(ndvi.deltaPct)}%), ` : "") +
      (carbon ? `carbon uptake ${fmt(carbon)}, ` : "") +
      (npp ? `NPP ${fmt(npp)}. ` : "") +
      `Living envelope shows ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Seasonal Expansion / Contraction", description: "Hemispherical vegetation cycles producing a measurable planetary respiration signal in NDVI, carbon flux, and atmospheric CO₂.", timeScale: "Months (seasonal)",
          status: ndvi ? `NDVI ${fmt(ndvi)} · ${signed(ndvi.z, 2)}σ` : "—",
          intensity: intensityFrom(m, ["ndvi"]), metricKeys: ["ndvi"] },
        { name: "Bloom & Migration Cycles", description: "Phytoplankton blooms, bird migrations, marine mammal movements — periodic ecological pulses driven by solar and thermal cues.", timeScale: "Weeks → Months",
          status: npp ? `Productivity ${fmt(npp)}` : "—",
          intensity: intensityFrom(m, ["productivity"]), metricKeys: ["productivity"] },
        { name: "Ecological Intensification / Decline", description: "Shifting biomass density, ecosystem stress indicators, and biodiversity trends under climate and anthropogenic pressure.", timeScale: "Years → Decades",
          status: carbon ? `Carbon flux ${fmt(carbon)} (${signed(carbon.deltaPct)}%)` : "—",
          intensity: intensityFrom(m, ["carbon"]), metricKeys: ["carbon"] },
        { name: "Regional Adaptation Patterns", description: "Local ecosystem responses to disturbance — fire recovery, flood adaptation, drought resilience, invasive species dynamics.", timeScale: "Months → Years",
          status: `System ${trendPhrase(intel.trend)}`,
          intensity: intensityFrom(m, ["ndvi", "carbon", "productivity"]), metricKeys: ["ndvi"] },
      ],
    };
  },

  magnetosphere: (intel) => {
    const m = intel.metrics;
    const kp = pick(m, "kp");
    const wind = pick(m, "wind");
    const schumann = pick(m, "schumann");
    const geomag = pick(m, "geomag");
    const r = regime(intel.score);
    const stormy = kp ? kp.value >= 5 : false;
    const summary =
      `Magnetosphere coherence ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (kp ? `Kp ${kp.value.toFixed(1)} (${stormy ? "storm" : kp.value >= 4 ? "active" : "quiet"}), ` : "") +
      (wind ? `solar wind ${fmt(wind)}, ` : "") +
      (schumann ? `Schumann ${fmt(schumann)}, ` : "") +
      (geomag ? `geomag ${fmt(geomag)}. ` : "") +
      `Field is in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Field-Line Motion", description: "Continuous reconfiguration of magnetic topology — dayside compression, nightside stretching, and reconnection-driven dynamics.", timeScale: "Minutes → Hours",
          status: geomag ? `Geomag activity ${fmt(geomag)}` : "—",
          intensity: intensityFrom(m, ["geomag", "kp"]), metricKeys: ["geomag"] },
        { name: "Magnetotail Extension", description: "Elongation of the nightside tail during energy loading phases, followed by explosive energy release during substorms.", timeScale: "Hours",
          status: wind ? `Wind pressure ${fmt(wind)} (${signed(wind.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["wind"]), metricKeys: ["wind"] },
        { name: "Compression / Expansion Cycles", description: "Magnetopause standoff distance oscillation driven by solar wind dynamic pressure variations.", timeScale: "Minutes → Days",
          status: kp ? `Kp ${kp.value.toFixed(1)} · ${stormy ? "storm" : "quiet"}` : "—",
          intensity: intensityFrom(m, ["kp", "wind"]), metricKeys: ["kp"] },
        { name: "Auroral Activation", description: "Energetic particle precipitation into the polar ionosphere producing visible aurorae and ionospheric disturbance.", timeScale: "Minutes → Hours",
          status: schumann ? `Schumann ${fmt(schumann)}` : "—",
          intensity: intensityFrom(m, ["schumann", "kp"]), metricKeys: ["schumann"] },
      ],
    };
  },

  ionosphere: (intel) => {
    const m = intel.metrics;
    const grid = pick(m, "grid");
    const uptime = pick(m, "uptime");
    const sats = pick(m, "sats");
    const r = regime(intel.score);
    const summary =
      `Ionosphere/technosphere stability ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (grid ? `Grid load ${fmt(grid)}, ` : "") +
      (uptime ? `network uptime ${fmt(uptime)}, ` : "") +
      (sats ? `${fmt(sats)} active satellites. ` : "") +
      `Infrastructure showing ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Shell Rippling", description: "Traveling ionospheric disturbances (TIDs) — wave perturbations in electron density propagating horizontally through the plasma.", timeScale: "Minutes → Hours",
          status: grid ? `Load ${fmt(grid)} (${signed(grid.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["grid"]), metricKeys: ["grid"] },
        { name: "Polar Activation", description: "Auroral zone ionization surges driven by magnetospheric particle precipitation and field-aligned currents.", timeScale: "Minutes → Hours",
          status: uptime ? `Uptime ${fmt(uptime)}` : "—",
          intensity: intensityFrom(m, ["uptime"]), metricKeys: ["uptime"] },
        { name: "Atmospheric-Electric Disturbance", description: "Ionospheric storms producing enhanced TEC gradients, scintillation, and disruption of radio propagation.", timeScale: "Hours → Days",
          status: sats ? `Sats ${fmt(sats)}` : "—",
          intensity: intensityFrom(m, ["sats", "grid"]), metricKeys: ["sats"] },
        { name: "Diurnal Cycling", description: "Solar-driven photochemical ionization/recombination cycle producing day-night electron density asymmetry.", timeScale: "24h cycle",
          status: `System ${trendPhrase(intel.trend)}`,
          intensity: intensityFrom(m, ["grid", "uptime"]), metricKeys: ["uptime"] },
      ],
    };
  },

  noosphere: (intel) => {
    const m = intel.metrics;
    const flow = pick(m, "flow");
    const snr = pick(m, "snr");
    const att = pick(m, "attention");
    const r = regime(intel.score);
    const summary =
      `Noosphere coherence ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (flow ? `Information flow ${fmt(flow)}, ` : "") +
      (snr ? `S/N ${fmt(snr)}, ` : "") +
      (att ? `collective attention ${fmt(att)}. ` : "") +
      `Collective field is in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Node Activation Waves", description: "Diurnal activation of communication hubs following the terminator line — cities come online and go quiet in sequence.", timeScale: "24h cycle",
          status: flow ? `Flow ${fmt(flow)} (${signed(flow.deltaPct)}%)` : "—",
          intensity: intensityFrom(m, ["flow"]), metricKeys: ["flow"] },
        { name: "Arc Emergence", description: "New high-bandwidth connections forming between previously weakly-linked network nodes during crisis or coordination events.", timeScale: "Hours → Days",
          status: snr ? `S/N ${fmt(snr)}` : "—",
          intensity: intensityFrom(m, ["snr"]), metricKeys: ["snr"] },
        { name: "Clustering Shifts", description: "Reconfiguration of semantic attention clusters — topic emergence, viral propagation, and collective focus migration.", timeScale: "Hours → Weeks",
          status: att ? `Attention ${fmt(att)} (${signed(att.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["attention"]), metricKeys: ["attention"] },
        { name: "Surge Patterns", description: "Explosive growth in information flow during global events — natural disasters, political events, cultural moments.", timeScale: "Minutes → Days",
          status: `${trendPhrase(intel.trend)} · ${intel.anomalies.length} anomalies`,
          intensity: intensityFrom(m, ["flow", "attention"]), metricKeys: ["flow"] },
      ],
    };
  },

  cryosphere: (intel) => {
    const m = intel.metrics;
    const arctic = pick(m, "arctic");
    const antarctic = pick(m, "antarctic");
    const snow = pick(m, "snow");
    const r = regime(intel.score);
    const summary =
      `Cryosphere stability ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (arctic ? `Arctic ice ${fmt(arctic)}, ` : "") +
      (antarctic ? `Antarctic ice ${fmt(antarctic)}, ` : "") +
      (snow ? `snow cover ${fmt(snow)}. ` : "") +
      `Cryosphere reflects ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Seasonal Ice Cycling", description: "Hemispheric sea ice expansion and retreat producing the strongest annual albedo signal on the planet.", timeScale: "Months (seasonal)",
          status: arctic ? `Arctic ${fmt(arctic)} (${signed(arctic.deltaPct)}%)` : "—",
          intensity: intensityFrom(m, ["arctic", "antarctic"]), metricKeys: ["arctic"] },
        { name: "Glacier Mass Balance", description: "Accumulation vs. ablation across mountain glaciers and ice sheets — net mass loss accelerating worldwide.", timeScale: "Years → Decades",
          status: antarctic ? `Antarctic ${fmt(antarctic)}` : "—",
          intensity: intensityFrom(m, ["antarctic"]), metricKeys: ["antarctic"] },
        { name: "Permafrost Thaw", description: "Progressive warming of frozen ground releasing methane and CO₂, destabilizing infrastructure and ecosystems.", timeScale: "Years → Centuries",
          status: snow ? `Snow cover ${fmt(snow)} (${signed(snow.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["snow"]), metricKeys: ["snow"] },
        { name: "Ice Shelf Dynamics", description: "Calving, basal melt, and grounding-line retreat at Antarctic and Greenland margins driving sea level rise.", timeScale: "Days → Decades",
          status: `${trendPhrase(intel.trend)} · ${intel.anomalies.length} anomalies`,
          intensity: intensityFrom(m, ["arctic", "antarctic", "snow"]), metricKeys: ["antarctic"] },
      ],
    };
  },

  atmosphere: (intel) => {
    const m = intel.metrics;
    const co2 = pick(m, "co2");
    const ozone = pick(m, "ozone");
    const aerosol = pick(m, "aerosol");
    const tempAnom = pick(m, "tempAnom");
    const r = regime(intel.score);
    const summary =
      `Atmospheric stability ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (co2 ? `CO₂ ${fmt(co2)}, ` : "") +
      (ozone ? `ozone column ${fmt(ozone)}, ` : "") +
      (tempAnom ? `surface anomaly ${fmt(tempAnom)}. ` : "") +
      `Gaseous envelope in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Greenhouse Forcing", description: "Long-lived greenhouse gases (CO₂, CH₄, N₂O) trap outgoing longwave radiation, raising the equilibrium surface temperature.", timeScale: "Decades → Centuries",
          status: co2 ? `CO₂ ${fmt(co2)} (${signed(co2.deltaPct)}%)` : "—",
          intensity: intensityFrom(m, ["co2", "tempAnom"]), metricKeys: ["co2"] },
        { name: "Stratospheric Ozone Cycle", description: "Photochemical balance between ozone production and destruction in the stratosphere shields the surface from UV-B radiation.", timeScale: "Months → Years",
          status: ozone ? `Column ${fmt(ozone)}` : "—",
          intensity: intensityFrom(m, ["ozone"]), metricKeys: ["ozone"] },
        { name: "Aerosol Loading", description: "Natural and anthropogenic aerosols scatter sunlight and seed cloud condensation, exerting a net cooling effect with strong regional variability.", timeScale: "Days → Years",
          status: aerosol ? `AOD ${fmt(aerosol)} (${signed(aerosol.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["aerosol"]), metricKeys: ["aerosol"] },
        { name: "Weather & Climate Variability", description: "Synoptic systems and large-scale oscillations (ENSO, NAO, MJO) redistribute heat, moisture, and momentum across the atmosphere.", timeScale: "Days → Years",
          status: tempAnom ? `ΔT ${fmt(tempAnom)} (${signed(tempAnom.z, 1)}σ)` : `${trendPhrase(intel.trend)}`,
          intensity: intensityFrom(m, ["tempAnom"]), metricKeys: ["tempAnom"] },
      ],
    };
  },
    const m = intel.metrics;
    const lattice = pick(m, "lattice");
    const lock = pick(m, "phaseLock");
    const coupling = pick(m, "coupling");
    const r = regime(intel.score);
    const summary =
      `Crystalsphere resonance ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (lattice ? `Lattice symmetry ${fmt(lattice)}, ` : "") +
      (lock ? `phase lock ${fmt(lock)}, ` : "") +
      (coupling ? `coupling ${fmt(coupling)}. ` : "") +
      `Harmonic scaffold in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Lattice Activation", description: "Coherence peaks at specific nodal points of the geometric resonance grid, triggered by external field inputs.", timeScale: "Variable",
          status: lattice ? `Symmetry ${fmt(lattice)} (${signed(lattice.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["lattice"]), metricKeys: ["lattice"] },
        { name: "Frequency-Linked Modulation", description: "Resonance intensity changes correlated with Schumann mode amplitude, solar activity, and geomagnetic pulsations.", timeScale: "Seconds → Days",
          status: coupling ? `Coupling ${fmt(coupling)}` : "—",
          intensity: intensityFrom(m, ["coupling"]), metricKeys: ["coupling"] },
        { name: "Symmetry Intensification", description: "Periods of enhanced geometric coherence in the harmonic scaffold — alignment of multiple resonance modes.", timeScale: "Hours → Weeks",
          status: lock ? `Phase lock ${fmt(lock)}` : "—",
          intensity: intensityFrom(m, ["phaseLock"]), metricKeys: ["phaseLock"] },
        { name: "Planetary Resonance Coupling", description: "Dynamic interaction between Crystalsphere patterns and measurable planetary field signals (Schumann, geomagnetic, tidal).", timeScale: "Minutes → Months",
          status: `${trendPhrase(intel.trend)} · ${intel.anomalies.length} anomalies`,
          intensity: intensityFrom(m, ["coupling", "phaseLock", "lattice"]), metricKeys: ["coupling"] },
      ],
    };
  },
};

export function buildLiveBehavior(intel: SphereIntelligence): LiveBehavior {
  return BUILDERS[intel.id](intel);
}
