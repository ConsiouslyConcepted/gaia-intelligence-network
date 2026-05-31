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
    const dc = pick(m, "dc_energy");
    const traffic = pick(m, "traffic");
    const sats = pick(m, "satellites");
    const r = regime(intel.score);
    const summary =
      `Technosphere stability ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (grid ? `Grid load ${fmt(grid)}, ` : "") +
      (dc ? `data-center energy ${fmt(dc)}, ` : "") +
      (traffic ? `traffic ${fmt(traffic)}, ` : "") +
      (sats ? `${fmt(sats)} active satellites. ` : "") +
      `Built infrastructure showing ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Electrification Load Growth", description: "EVs, heat pumps, and AI compute are accelerating electricity demand faster than transmission and generation capacity in many regions.", timeScale: "Years → Decades",
          status: grid ? `Load ${fmt(grid)} (${signed(grid.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["grid"]), metricKeys: ["grid"] },
        { name: "AI Compute Surge", description: "Hyperscale training clusters and inference workloads are driving data-center electricity demand toward ~3–4% of global supply by 2030.", timeScale: "Months → Years",
          status: dc ? `${fmt(dc)} (${signed(dc.deltaPct)}%)` : "—",
          intensity: intensityFrom(m, ["dc_energy"]), metricKeys: ["dc_energy"] },
        { name: "Submarine Cable Throughput", description: "Intercontinental fiber backbone carries ~99% of international internet traffic; routing, latency, and cut-risk shape global connectivity.", timeScale: "Milliseconds → Years",
          status: traffic ? `Traffic ${fmt(traffic)}` : "—",
          intensity: intensityFrom(m, ["traffic"]), metricKeys: ["traffic"] },
        { name: "Orbital Congestion", description: "LEO mega-constellations have pushed the active satellite population past 10,000, increasing conjunction events and Kessler-syndrome tail risk.", timeScale: "Days → Decades",
          status: sats ? `${fmt(sats)} active` : "—",
          intensity: intensityFrom(m, ["satellites"]), metricKeys: ["satellites"] },
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

  crystalsphere: (intel) => {
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

  heliosphere: (intel) => {
    const m = intel.metrics;
    const ssn = pick(m, "sunspots");
    const sw = pick(m, "solarWind");
    const xray = pick(m, "xray");
    const imf = pick(m, "imf");
    const cme = pick(m, "cme");
    const hai = pick(m, "hai");
    const r = regime(intel.score);
    const summary =
      `Heliospheric activity ${intel.score} (${r.tag}) — ${trendPhrase(intel.trend)}. ` +
      (ssn ? `SSN ${fmt(ssn)}, ` : "") +
      (sw ? `solar wind ${fmt(sw)}, ` : "") +
      (xray ? `X-ray flux ${fmt(xray)}, ` : "") +
      (imf ? `IMF ${fmt(imf)}. ` : "") +
      `Solar transmission layer in a ${r.tone}.`;
    return {
      summary,
      patterns: [
        { name: "Solar Cycle Phase", description: "11-year sunspot cycle modulates baseline solar output, UV flux, and the frequency of energetic events.", timeScale: "Years → Decades",
          status: ssn ? `SSN ${fmt(ssn)} (${signed(ssn.deltaPct)}%)` : "—",
          intensity: intensityFrom(m, ["sunspots"]), metricKeys: ["sunspots"] },
        { name: "Solar Wind & IMF Transport", description: "Continuous plasma flow carries the interplanetary magnetic field outward, coupling the Sun to the magnetosphere.", timeScale: "Hours → Days",
          status: sw ? `Wind ${fmt(sw)} · IMF ${imf ? fmt(imf) : "—"}` : "—",
          intensity: intensityFrom(m, ["solarWind", "imf"]), metricKeys: ["solarWind", "imf"] },
        { name: "Flare & X-Ray Activity", description: "Sudden bursts of electromagnetic radiation ionize the dayside upper atmosphere and disrupt HF radio.", timeScale: "Minutes → Hours",
          status: xray ? `Flux ${fmt(xray)} (${signed(xray.z, 1)}σ)` : "—",
          intensity: intensityFrom(m, ["xray"]), metricKeys: ["xray"] },
        { name: "CME Propagation", description: "Coronal mass ejections inject magnetized plasma into the heliosphere, driving the strongest geomagnetic storms.", timeScale: "Hours → Days",
          status: cme ? `CME index ${fmt(cme)}` : "—",
          intensity: intensityFrom(m, ["cme"]), metricKeys: ["cme"] },
        { name: "Heliospheric Activity Index", description: "Composite metric tracking total solar forcing transmitted to Earth's outer envelope.",
          timeScale: "Hours → Months",
          status: hai ? `HAI ${fmt(hai)} · ${trendPhrase(intel.trend)}` : "—",
          intensity: intensityFrom(m, ["hai"]), metricKeys: ["hai"] },
      ],
    };
  },
};

export function buildLiveBehavior(intel: SphereIntelligence): LiveBehavior {
  return BUILDERS[intel.id](intel);
}
