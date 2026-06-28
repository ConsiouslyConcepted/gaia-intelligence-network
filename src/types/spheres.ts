export type SphereId = 
  | "geosphere" 
  | "hydrosphere"
  | "cryosphere"
  | "atmosphere"
  | "biosphere" 
  | "noosphere" 
  | "magnetosphere" 
  | "ionosphere" 
  | "crystalsphere"
  | "heliosphere";

export interface Sphere {
  id: SphereId;
  name: string;
  description: string;
  color: string;
  radius: number;
  opacity: number;
  orderIndex: number;
  hasMapLayers: boolean;
  hasStellarLayers: boolean;
}

export const SPHERES: Record<SphereId, Sphere> = {
  geosphere: {
    id: "geosphere",
    name: "Lithosphere",
    description: "Rigid outer shell — seismic, tectonic, volcanic, crustal systems",
    color: "#e8632c",
    radius: 1,
    opacity: 1,
    orderIndex: 1,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  hydrosphere: {
    id: "hydrosphere",
    name: "Hydrosphere",
    description: "Planetary water — oceans, rivers, groundwater, atmospheric moisture",
    color: "#2d7fb8",
    radius: 1.07,
    opacity: 0.4,
    orderIndex: 2,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  cryosphere: {
    id: "cryosphere",
    name: "Cryosphere",
    description: "Frozen systems — sea ice, glaciers, ice sheets, permafrost",
    color: "#b8e3ee",
    radius: 1.1,
    opacity: 0.3,
    orderIndex: 3,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  biosphere: {
    id: "biosphere",
    name: "Biosphere",
    description: "Earth's living envelope — ecosystems, biomes, biogeochemical cycles",
    color: "#1aa893",
    radius: 1.15,
    opacity: 0.25,
    orderIndex: 4,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  atmosphere: {
    id: "atmosphere",
    name: "Atmosphere",
    description: "Gaseous envelope — troposphere to stratosphere, weather, climate, chemistry",
    color: "#6cc8e0",
    radius: 1.22,
    opacity: 0.22,
    orderIndex: 5,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  noosphere: {
    id: "noosphere",
    name: "Noosphere",
    description: "Reflective consciousness — human thought, culture, collective awareness",
    color: "#1f4d8a",
    radius: 1.3,
    opacity: 0.2,
    orderIndex: 6,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  magnetosphere: {
    id: "magnetosphere",
    name: "Magnetosphere",
    description: "Earth's magnetic shield — dipole field, solar wind interaction, auroral zones",
    color: "#f0294a",
    radius: 1.6,
    opacity: 0.15,
    orderIndex: 7,
    hasMapLayers: true,
    hasStellarLayers: true,
  },
  ionosphere: {
    id: "ionosphere",
    name: "Technosphere",
    description: "Human-built infrastructure — power grids, data centers, networks, satellites, supply chains",
    color: "#36c5e8",
    radius: 1.75,
    opacity: 0.2,
    orderIndex: 8,
    hasMapLayers: true,
    hasStellarLayers: true,
  },
  crystalsphere: {
    id: "crystalsphere",
    name: "Crystalsphere",
    description: "Harmonic memory field — crystalline grids, coherence patterns",
    color: "#f5c542",
    radius: 1.9,
    opacity: 0.1,
    orderIndex: 9,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  heliosphere: {
    id: "heliosphere",
    name: "Heliosphere",
    description: "Solar transmission layer — sunspots, solar wind, CMEs, IMF; primary driver of downstream space-weather influence on Earth",
    color: "#ff7a3a",
    radius: 2.15,
    opacity: 0.12,
    orderIndex: 10,
    hasMapLayers: false,
    hasStellarLayers: true,
  },
};

export const SPHERE_ARRAY = Object.values(SPHERES)
  .sort((a, b) => a.orderIndex - b.orderIndex);
