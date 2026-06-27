/**
 * Observatory station registry.
 * Each station is a "scale" the camera flies through, from Earth out to the Observable Universe.
 */

export type StationId =
  | "earth"
  | "planetary"
  | "heliosphere"
  | "stellar"
  | "orionspur"
  | "milkyway"
  | "localgroup"
  | "virgo"
  | "laniakea"
  | "universe";

export interface Station {
  id: StationId;
  label: string;
  /** One-line scientific descriptor shown in the HUD. */
  descriptor: string;
  /** Human-readable scale string, e.g. "12,742 km" or "93 Gly". */
  scale: string;
  /** Dashboard this scale maps to, if any. */
  dashboard?: { label: string; path: string };
}

export const STATIONS: Station[] = [
  {
    id: "earth",
    label: "Earth",
    descriptor: "Home world — living planet, biosphere, magnetosphere, lithosphere.",
    scale: "12,742 km",
    dashboard: { label: "Planetary Dashboard", path: "/planetary" },
  },
  {
    id: "planetary",
    label: "Planetary System",
    descriptor: "Earth–Moon system inside Earth's magnetic and gravitational reach.",
    scale: "~770,000 km",
    dashboard: { label: "Planetary Dashboard", path: "/planetary" },
  },
  {
    id: "heliosphere",
    label: "Heliosphere",
    descriptor: "The Sun's planetary system, bounded by the heliopause.",
    scale: "~120 AU",
    dashboard: { label: "Solar Dashboard", path: "/planetary?view=hgs" },
  },
  {
    id: "stellar",
    label: "Local Stellar Neighborhood",
    descriptor: "Nearby stars within ~50 light-years of the Sun.",
    scale: "~100 ly",
    dashboard: { label: "Stellar Dashboard", path: "/stellar" },
  },
  {
    id: "orionspur",
    label: "Orion Spur",
    descriptor: "Minor spiral-arm segment of the Milky Way that contains the Sun.",
    scale: "~3,500 ly wide",
    dashboard: { label: "Galactic Dashboard", path: "/galactic" },
  },
  {
    id: "milkyway",
    label: "Milky Way Galaxy",
    descriptor: "Barred spiral galaxy — our galactic home, ~200 billion stars.",
    scale: "~100,000 ly",
    dashboard: { label: "Galactic Dashboard", path: "/galactic" },
  },
  {
    id: "localgroup",
    label: "Local Group",
    descriptor: "Gravitationally bound cluster — Milky Way, Andromeda, Triangulum + satellites.",
    scale: "~10 Mly",
    dashboard: { label: "Universal Dashboard", path: "/universal" },
  },
  {
    id: "virgo",
    label: "Virgo Supercluster",
    descriptor: "Larger structure containing the Local Group, anchored on the Virgo Cluster.",
    scale: "~110 Mly",
    dashboard: { label: "Universal Dashboard", path: "/universal" },
  },
  {
    id: "laniakea",
    label: "Laniakea Supercluster",
    descriptor: "Our home supercluster — flow lines converge on the Great Attractor.",
    scale: "~520 Mly",
    dashboard: { label: "Universal Dashboard", path: "/universal" },
  },
  {
    id: "universe",
    label: "Observable Universe",
    descriptor: "Cosmic web of filaments and voids — the full extent we can observe.",
    scale: "~93 Gly",
    dashboard: { label: "Cosmological Dashboard", path: "/cosmological" },
  },
];
