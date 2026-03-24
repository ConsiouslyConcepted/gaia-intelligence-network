import { Card } from "@/components/ui/card";
import { Sphere, SphereId } from "@/types/spheres";
import { Scan } from "lucide-react";

interface Props {
  sphere: Sphere;
  accent: string;
}

interface StructureElement {
  name: string;
  description: string;
}

const ANATOMY_DATA: Record<SphereId, { overview: string; elements: StructureElement[] }> = {
  geosphere: {
    overview: "The solid Earth system — a layered domain of tectonic plates, crustal fracture networks, volcanic systems, subduction zones, and deep mantle plume dynamics. Structure is defined by boundary geometries, stress fields, and compositional heterogeneity.",
    elements: [
      { name: "Tectonic Boundaries", description: "Convergent, divergent, and transform plate margins defining the primary structural geometry of crustal interaction." },
      { name: "Crustal Fracture Networks", description: "Fault systems, rift zones, and shear networks that distribute and concentrate tectonic stress across regional domains." },
      { name: "Volcanic Systems", description: "Magmatic plumbing architecture — chambers, conduits, and surface vents linked to subduction and hotspot dynamics." },
      { name: "Subduction Zones", description: "Descending slab geometries where oceanic crust recycles into the mantle, driving deep seismicity and arc volcanism." },
      { name: "Mantle Plume Regions", description: "Deep thermal anomalies producing hotspot volcanism, lithospheric uplift, and localized heat flow signatures." },
    ],
  },
  biosphere: {
    overview: "The living systems layer — a continuous web of bioregions, ecosystem zones, ocean productivity areas, biodiversity distributions, and migratory corridors. Structure is defined by habitat connectivity, trophic organization, and biogeochemical cycling.",
    elements: [
      { name: "Bioregions", description: "Continental-scale ecological zones defined by climate, vegetation type, and biotic community composition." },
      { name: "Ecosystem Zones", description: "Functional habitat units — forests, grasslands, wetlands, coral reefs — each with distinct energy flow and nutrient cycling." },
      { name: "Ocean Productivity Zones", description: "Upwelling regions, photic zone gradients, and pelagic/benthic coupling areas driving marine biomass production." },
      { name: "Biodiversity Distributions", description: "Species richness gradients, endemism hotspots, and functional diversity patterns across latitudinal and altitudinal ranges." },
      { name: "Migration Corridors", description: "Seasonal movement pathways for terrestrial, marine, and avian species connecting breeding, feeding, and overwintering habitats." },
    ],
  },
  magnetosphere: {
    overview: "The planetary electromagnetic shield — a dynamic cavity shaped by Earth's dipole field interacting with the solar wind. Structure is defined by field topology, boundary surfaces, and trapped particle populations.",
    elements: [
      { name: "Dipole Field Lines", description: "The primary magnetic architecture — closed field lines mapping from pole to pole, defining the inner magnetosphere geometry." },
      { name: "Magnetopause", description: "The pressure-balance boundary where Earth's magnetic field meets the solar wind, defining the dayside extent of the cavity." },
      { name: "Bow Shock", description: "The upstream standing shock wave where supersonic solar wind decelerates and heats before flowing around the magnetosphere." },
      { name: "Magnetotail", description: "The elongated nightside extension of the magnetosphere, containing the plasma sheet and reconnection regions driving substorms." },
      { name: "Radiation Belts", description: "Toroidal zones of trapped energetic particles (Van Allen belts) organized by magnetic field geometry and particle energy." },
      { name: "Solar Wind Interface", description: "The deformation layer where external solar wind pressure compresses, stretches, and reshapes the magnetospheric cavity in real time." },
    ],
  },
  ionosphere: {
    overview: "The charged atmospheric shell — a vertically stratified plasma layer extending from ~60 km to ~1000 km altitude. Structure is defined by electron density profiles, photochemical equilibria, and magnetic field coupling.",
    elements: [
      { name: "D/E/F Layer Stack", description: "Vertically stratified ionization regions with distinct density, composition, and solar-dependence characteristics." },
      { name: "Auroral Belts", description: "Oval-shaped zones of intense particle precipitation around the magnetic poles, driven by magnetospheric dynamics." },
      { name: "Polar Cap Ionization", description: "High-latitude ionization structures driven by solar wind–magnetosphere coupling and open magnetic field lines." },
      { name: "Equatorial Anomaly", description: "The Appleton anomaly — dual crests of enhanced electron density flanking the magnetic equator, driven by E×B drift." },
      { name: "Sporadic-E Patches", description: "Thin, dense ionization layers at ~100 km altitude caused by wind shears concentrating metallic ions." },
    ],
  },
  noosphere: {
    overview: "The collective activity layer — a planetary-scale network of communication, knowledge production, and coordinated human action. Structure is defined by network topology, information flow pathways, and semantic density distributions.",
    elements: [
      { name: "Network Topology", description: "The graph structure of global communications — hub-spoke, mesh, and hierarchical architectures connecting nodes of human activity." },
      { name: "Signal Nodes", description: "Major centers of information generation and routing — data centers, research hubs, media clusters, financial exchanges." },
      { name: "Communication Corridors", description: "High-bandwidth pathways linking continental networks — submarine cables, satellite constellations, fiber trunk lines." },
      { name: "Semantic Density Regions", description: "Areas of concentrated knowledge production — research clusters, university networks, innovation ecosystems." },
      { name: "Infrastructure Activity Zones", description: "Urban-industrial complexes where energy use, transportation, and digital activity produce measurable planetary-scale signals." },
    ],
  },
  crystalsphere: {
    overview: "The harmonic resonance layer — a modeled domain representing crystalline lattice structures, standing-wave geometries, and frequency-coherent spatial organization across the planetary system.",
    elements: [
      { name: "Resonance Lattice", description: "Geometric frameworks derived from planetary harmonic relationships — Schumann modes, tidal harmonics, and orbital resonances." },
      { name: "Nodal Grid", description: "Intersection points of standing-wave patterns where constructive interference produces coherence maxima." },
      { name: "Standing-Wave Organization", description: "Spatially fixed wave patterns arising from cavity resonances in the Earth-ionosphere system and solid-body oscillations." },
      { name: "Harmonic Symmetry Scaffolds", description: "Higher-order geometric structures (icosahedral, tetrahedral) reflecting symmetry relationships in planetary field organization." },
      { name: "Piezoelectric Transduction Zones", description: "Regions where crystalline mineral structures convert between mechanical stress and electromagnetic signals." },
    ],
  },
};

export function AnatomyPanel({ sphere, accent }: Props) {
  const anatomy = ANATOMY_DATA[sphere.id];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Scan className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Anatomy — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Structural model · Domain architecture · System elements
            </p>
          </div>
        </div>
      </Card>

      {/* Overview */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Structural Overview</h3>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">{anatomy.overview}</p>
      </Card>

      {/* Structural Elements */}
      <div className="space-y-3">
        {anatomy.elements.map((el, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5"
                style={{ backgroundColor: `${accent}12`, color: accent }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground/85">{el.name}</h4>
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-1">{el.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
