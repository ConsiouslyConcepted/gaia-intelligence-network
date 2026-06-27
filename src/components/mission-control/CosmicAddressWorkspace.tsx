import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

import { HudPanel } from "./MissionShell";

interface AddressNode {
  key: string;
  label: string;
  scale: string;
  diameter: string;
  caption: string;
  description: string;
  dashboard?: { route: string; label: string };
  related?: string[]; // dashboards that reference this node
}

const NODES: AddressNode[] = [
  {
    key: "earth",
    label: "Earth",
    scale: "10⁷ m",
    diameter: "12,742 km",
    caption: "Home planet · 8 coupled spheres",
    description:
      "The reference frame for every dashboard. Eight interacting spheres — biosphere, atmosphere, hydrosphere, cryosphere, lithosphere, magnetosphere, noosphere, technosphere — generate the planetary intelligence layer.",
    dashboard: { route: "/planetary", label: "Open Planetary Intelligence" },
  },
  {
    key: "solar",
    label: "Solar System",
    scale: "10¹³ m",
    diameter: "~287 AU (heliopause)",
    caption: "Sun · 8 planets · heliosphere",
    description:
      "The Sun's gravitational and magnetic domain. Solar Cycle 25 modulates space weather, geomagnetic activity, and planetary harmonics. Orbital ratios feed the harmonic intelligence engine.",
    dashboard: { route: "/planetary?view=hgs", label: "Open Solar Intelligence" },
  },
  {
    key: "orion-spur",
    label: "Orion Spur",
    scale: "10¹⁹ m",
    diameter: "~3,500 ly",
    caption: "Minor spiral structure",
    description:
      "A short spiral spur between the Sagittarius and Perseus arms. The Solar System orbits the galactic center at ~220 km/s within this local stellar neighborhood, surrounded by the Local Bubble.",
    dashboard: { route: "/stellar", label: "Open Stellar Intelligence" },
  },
  {
    key: "milky-way",
    label: "Milky Way",
    scale: "10²¹ m",
    diameter: "~100,000 ly",
    caption: "Barred spiral galaxy",
    description:
      "Our home galaxy. ~200 billion stars, supermassive black hole Sgr A* at the center, structured magnetic field, and cosmic ray flux that modulates Earth's atmosphere and biosphere.",
    dashboard: { route: "/galactic", label: "Open Galactic Intelligence" },
  },
  {
    key: "local-group",
    label: "Local Group",
    scale: "10²² m",
    diameter: "~10 Mly",
    caption: "Gravitationally bound cluster",
    description:
      "~80 galaxies bound by mutual gravity. Dominated by the Milky Way and Andromeda (M31), which will merge in ~4.5 Gyr. The smallest unit of cosmological structure.",
    dashboard: { route: "/cosmological", label: "Open Cosmological Intelligence" },
  },
  {
    key: "virgo",
    label: "Virgo Cluster",
    scale: "10²³ m",
    diameter: "~110 Mly",
    caption: "~1,300 galaxies",
    description:
      "The nearest large galaxy cluster, centered ~54 Mly away. The Local Group is a peripheral member, gravitationally infalling toward the cluster's mass concentration.",
    dashboard: { route: "/cosmological", label: "Open Cosmological Intelligence" },
  },
  {
    key: "laniakea",
    label: "Laniakea Supercluster",
    scale: "10²⁴ m",
    diameter: "~520 Mly",
    caption: "~100,000 galaxies",
    description:
      "Our home supercluster, defined in 2014 by velocity flows toward the Great Attractor. Contains the Virgo Cluster, the Hydra-Centaurus Supercluster, and the Milky Way.",
    dashboard: { route: "/cosmological", label: "Open Cosmological Intelligence" },
  },
  {
    key: "universe",
    label: "Observable Universe",
    scale: "10²⁶ m",
    diameter: "~93 Bly",
    caption: "Cosmological horizon",
    description:
      "The sphere of spacetime from which light has had time to reach us since the Big Bang. Filled with the cosmic microwave background, large-scale filamentary structure, and accelerating expansion.",
    dashboard: { route: "/cosmological", label: "Open Cosmological Intelligence" },
  },
];

const CosmicAddressWorkspace = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<string>("earth");
  const active = NODES.find((n) => n.key === activeKey) ?? NODES[0];
  const activeIdx = NODES.findIndex((n) => n.key === active.key);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto pb-4">
        {/* Header */}
        <HudPanel className="p-5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Workspace 02
              </div>
              <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
                Cosmic Address
              </h2>
              <p className="text-[11px] text-muted-foreground/75 mt-1.5 max-w-2xl leading-relaxed">
                Earth's location within the nested architecture of the cosmos. Select any tier to inspect
                its scale, structure, and the intelligence dashboard it feeds.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40"
              style={{ background: "hsla(240,25%,8%,0.5)" }}>
              <MapPin size={12} className="text-foreground/70" />
              <span className="text-[9px] tracking-[0.18em] uppercase text-foreground/80">
                Tier {activeIdx + 1} of {NODES.length}
              </span>
            </div>
          </div>
        </HudPanel>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Hierarchy rail */}
          <HudPanel className="p-3">
            <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/55 px-2 py-2">
              Nested Hierarchy
            </div>
            <div className="flex flex-col">
              {NODES.map((node, idx) => {
                const isActive = node.key === active.key;
                const isLast = idx === NODES.length - 1;
                return (
                  <div key={node.key} className="relative">
                    <button
                      onClick={() => setActiveKey(node.key)}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
                      style={{
                        background: isActive ? "hsla(210,50%,18%,0.6)" : "transparent",
                        border: `1px solid ${isActive ? "hsla(200,60%,65%,0.35)" : "transparent"}`,
                        boxShadow: isActive ? "0 0 18px hsla(210,70%,60%,0.18)" : "none",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-[10px] font-bold tabular-nums"
                        style={{
                          background: isActive ? "hsla(200,70%,55%,0.25)" : "hsla(240,20%,12%,0.6)",
                          border: `1px solid ${isActive ? "hsla(200,70%,75%,0.5)" : "hsla(220,20%,30%,0.5)"}`,
                          color: isActive ? "hsla(200,90%,90%,0.95)" : "hsla(220,15%,65%,0.8)",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[11px] font-semibold tracking-[0.08em] truncate ${
                          isActive ? "text-foreground/95" : "text-foreground/75 group-hover:text-foreground/90"
                        }`}>
                          {node.label}
                        </div>
                        <div className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground/55 mt-0.5 truncate">
                          {node.scale} · {node.caption}
                        </div>
                      </div>
                    </button>
                    {!isLast && (
                      <div
                        className="absolute left-[26px] top-[44px] w-px h-3"
                        style={{ background: "hsla(220,30%,35%,0.4)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </HudPanel>

          {/* Detail */}
          <HudPanel className="p-6 flex flex-col gap-5">
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Tier {activeIdx + 1}
              </div>
              <h3 className="text-[22px] font-bold tracking-[0.06em] text-foreground/95 mt-1">
                {active.label}
              </h3>
              <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/65 mt-1">
                {active.caption}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3 border border-border/30"
                style={{ background: "hsla(240,20%,10%,0.5)" }}>
                <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">
                  Characteristic Scale
                </div>
                <div className="text-[14px] font-mono font-bold text-foreground/95 tabular-nums">
                  {active.scale}
                </div>
              </div>
              <div className="rounded-lg p-3 border border-border/30"
                style={{ background: "hsla(240,20%,10%,0.5)" }}>
                <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">
                  Diameter
                </div>
                <div className="text-[14px] font-mono font-bold text-foreground/95 tabular-nums">
                  {active.diameter}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-2">
                Description
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground/85">
                {active.description}
              </p>
            </div>

            {/* Containment context */}
            <div className="border-t border-border/20 pt-4">
              <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-2">
                Position in Hierarchy
              </div>
              <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
                {NODES.slice(0, activeIdx + 1).map((n, i) => (
                  <span key={n.key} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-muted-foreground/35">›</span>}
                    <button
                      onClick={() => setActiveKey(n.key)}
                      className={`px-2 py-0.5 rounded-md tracking-[0.05em] transition-colors ${
                        n.key === active.key
                          ? "text-foreground/95 font-semibold"
                          : "text-muted-foreground/65 hover:text-foreground/85"
                      }`}
                      style={
                        n.key === active.key
                          ? { background: "hsla(210,50%,18%,0.5)", border: "1px solid hsla(200,60%,65%,0.3)" }
                          : undefined
                      }
                    >
                      {n.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Dashboard deep-link */}
            {active.dashboard && (
              <button
                onClick={() => navigate(active.dashboard!.route)}
                className="mt-auto flex items-center justify-between w-full px-4 py-3 rounded-lg border transition-all duration-300 hover:bg-foreground/[0.04]"
                style={{
                  background: "hsla(240,25%,8%,0.5)",
                  borderColor: "hsla(220,30%,55%,0.4)",
                  boxShadow: "0 0 18px hsla(210,70%,60%,0.12)",
                }}
              >
                <span className="text-[11px] tracking-[0.18em] uppercase font-semibold text-foreground/90">
                  {active.dashboard.label}
                </span>
                <ArrowRight size={15} className="text-foreground/75" />
              </button>
            )}
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default CosmicAddressWorkspace;
