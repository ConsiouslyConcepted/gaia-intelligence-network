import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SphereId } from "@/types/spheres";
import { Map, Layers, Eye } from "lucide-react";

interface Props {
  sphereId: SphereId;
  accent: string;
}

// NASA GIBS tile layer configs per sphere
const GIBS_LAYERS: Record<SphereId, { id: string; label: string; date?: string }[]> = {
  geosphere: [
    { id: "ASTER_GDEM_Color_Shaded_Relief", label: "Terrain Relief" },
    { id: "MODIS_Terra_CorrectedReflectance_TrueColor", label: "True Color" },
  ],
  biosphere: [
    { id: "MODIS_Terra_NDVI_8Day", label: "Vegetation (NDVI)" },
    { id: "MODIS_Terra_CorrectedReflectance_TrueColor", label: "True Color" },
  ],
  magnetosphere: [
    { id: "MODIS_Terra_CorrectedReflectance_TrueColor", label: "True Color" },
    { id: "BlueMarble_NextGeneration", label: "Blue Marble" },
  ],
  ionosphere: [
    { id: "MODIS_Terra_CorrectedReflectance_TrueColor", label: "True Color" },
    { id: "VIIRS_SNPP_DayNightBand_ENCC", label: "Day/Night Band" },
  ],
  noosphere: [
    { id: "VIIRS_SNPP_DayNightBand_ENCC", label: "City Lights" },
    { id: "BlueMarble_NextGeneration", label: "Blue Marble" },
  ],
  crystalsphere: [
    { id: "BlueMarble_NextGeneration", label: "Blue Marble" },
    { id: "ASTER_GDEM_Color_Shaded_Relief", label: "Terrain Relief" },
  ],
};

const SPHERE_MAP_DESCRIPTIONS: Record<SphereId, string> = {
  geosphere: "Fault lines · Volcanic regions · Thermal anomalies · Plate boundaries",
  biosphere: "Vegetation density · Land cover classification · Ocean productivity",
  magnetosphere: "Auroral oval · Field line geometry · Magnetopause boundary",
  ionosphere: "Electron density maps · Aurora overlays · Signal disruption zones",
  noosphere: "Urban infrastructure · Communication density · City light distribution",
  crystalsphere: "Geological composition · Mineral distribution · EM coupling regions",
};

function getGIBSTileUrl(layerId: string) {
  const today = new Date();
  today.setDate(today.getDate() - 2); // GIBS often has a 1-2 day lag
  const dateStr = today.toISOString().split("T")[0];
  // GIBS WMTS static tile for preview (zoom 3, center tile)
  return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layerId}/default/${dateStr}/250m/3/3/4.jpg`;
}

export function ImageryPanel({ sphereId, accent }: Props) {
  const layers = GIBS_LAYERS[sphereId];
  const [activeLayer, setActiveLayer] = useState(0);
  const [imageError, setImageError] = useState(false);
  const description = SPHERE_MAP_DESCRIPTIONS[sphereId];

  const currentLayer = layers[activeLayer];
  const tileUrl = getGIBSTileUrl(currentLayer.id);

  return (
    <Card className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <Map className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Satellite Imagery</h3>
            <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {layers.map((layer, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveLayer(idx); setImageError(false); }}
              className={`px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all ${
                idx === activeLayer
                  ? "bg-muted/30 text-foreground/80"
                  : "text-muted-foreground/40 hover:text-muted-foreground/60"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Satellite Image Tile */}
      <div className="relative rounded-lg overflow-hidden bg-muted/5 border border-border/10" style={{ aspectRatio: "16/9" }}>
        {!imageError ? (
          <img
            src={tileUrl}
            alt={`${currentLayer.label} satellite imagery`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Eye className="w-8 h-8 mx-auto" style={{ color: `${accent}30` }} />
              <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">
                {currentLayer.label} — NASA GIBS
              </p>
              <p className="text-[9px] text-muted-foreground/20">
                Tile may be unavailable for current date
              </p>
            </div>
          </div>
        )}
        {/* Layer label overlay */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-background/70 backdrop-blur-sm">
          <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
            {currentLayer.label} · NASA GIBS WMTS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Layers className="w-3 h-3 text-muted-foreground/30" />
        <span className="text-[9px] text-muted-foreground/30 font-mono">
          MODIS · VIIRS · Blue Marble · ASTER GDEM
        </span>
      </div>
    </Card>
  );
}
