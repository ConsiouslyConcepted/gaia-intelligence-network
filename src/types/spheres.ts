export type SphereId = 
  | "geosphere" 
  | "biosphere" 
  | "noosphere" 
  | "magnetosphere" 
  | "ionosphere" 
  | "crystalsphere";

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
    name: "Geosphere",
    description: "Structural intelligence — seismic, tectonic, volcanic systems",
    color: "#ff8800",
    radius: 1,
    opacity: 1,
    orderIndex: 1,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  biosphere: {
    id: "biosphere",
    name: "Biosphere",
    description: "Biological intelligence — ecosystems, biodiversity, life networks",
    color: "#44ff44",
    radius: 1.15,
    opacity: 0.25,
    orderIndex: 2,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  noosphere: {
    id: "noosphere",
    name: "Noosphere",
    description: "Reflective consciousness — human thought, culture, collective awareness",
    color: "#aa44ff",
    radius: 1.3,
    opacity: 0.2,
    orderIndex: 3,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  technosphere: {
    id: "technosphere",
    name: "Technosphere",
    description: "Synthetic cognition — digital networks, AI, technological infrastructure",
    color: "#00ffff",
    radius: 1.45,
    opacity: 0.15,
    orderIndex: 4,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
  magnetosphere: {
    id: "magnetosphere",
    name: "Magnetosphere",
    description: "Planetary EM field — geomagnetic dynamics, solar wind interactions",
    color: "#ff00ff",
    radius: 1.6,
    opacity: 0.15,
    orderIndex: 5,
    hasMapLayers: true,
    hasStellarLayers: true,
  },
  ionosphere: {
    id: "ionosphere",
    name: "Ionosphere",
    description: "Charged atmospheric layer — TEC, radio propagation, auroral activity",
    color: "#88ccff",
    radius: 1.75,
    opacity: 0.2,
    orderIndex: 6,
    hasMapLayers: true,
    hasStellarLayers: true,
  },
  crystalsphere: {
    id: "crystalsphere",
    name: "Crystalsphere",
    description: "Harmonic memory field — crystalline grids, coherence patterns",
    color: "#ffdd00",
    radius: 1.9,
    opacity: 0.1,
    orderIndex: 7,
    hasMapLayers: true,
    hasStellarLayers: false,
  },
};

export const SPHERE_ARRAY = Object.values(SPHERES).sort((a, b) => a.orderIndex - b.orderIndex);
