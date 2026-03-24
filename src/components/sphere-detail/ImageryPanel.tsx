import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SphereId } from "@/types/spheres";
import { Map, Layers, Eye, ExternalLink } from "lucide-react";

interface Props {
  sphereId: SphereId;
  accent: string;
}

interface ImagerySource {
  id: string;
  label: string;
  description: string;
  getUrl: () => string;
  attribution: string;
  link?: string;
}

function gibsUrl(layer: string, date?: string, resolution = "250m", zoom = 3, row = 2, col = 3) {
  const d = date || (() => {
    const t = new Date();
    t.setDate(t.getDate() - 2);
    return t.toISOString().split("T")[0];
  })();
  return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layer}/default/${d}/${resolution}/${zoom}/${row}/${col}.jpg`;
}

function gibsPngUrl(layer: string, date?: string, resolution = "250m", zoom = 3, row = 2, col = 3) {
  const d = date || (() => {
    const t = new Date();
    t.setDate(t.getDate() - 2);
    return t.toISOString().split("T")[0];
  })();
  return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layer}/default/${d}/${resolution}/${zoom}/${row}/${col}.png`;
}

const IMAGERY_SOURCES: Record<SphereId, ImagerySource[]> = {
  geosphere: [
    {
      id: "terra-truecolor",
      label: "Terra True Color",
      description: "MODIS Terra corrected reflectance — real-time surface observation",
      getUrl: () => gibsUrl("MODIS_Terra_CorrectedReflectance_TrueColor"),
      attribution: "NASA MODIS Terra",
      link: "https://worldview.earthdata.nasa.gov/",
    },
    {
      id: "terrain-relief",
      label: "Terrain Relief",
      description: "ASTER GDEM color shaded relief — topographic elevation model",
      getUrl: () => gibsUrl("ASTER_GDEM_Color_Shaded_Relief", "2015-01-01"),
      attribution: "NASA ASTER GDEM",
    },
    {
      id: "aqua-truecolor",
      label: "Aqua True Color",
      description: "MODIS Aqua corrected reflectance — afternoon pass observation",
      getUrl: () => gibsUrl("MODIS_Aqua_CorrectedReflectance_TrueColor"),
      attribution: "NASA MODIS Aqua",
    },
  ],
  biosphere: [
    {
      id: "ndvi",
      label: "Vegetation NDVI",
      description: "8-day composite vegetation index — photosynthetic activity",
      getUrl: () => gibsPngUrl("MODIS_Terra_NDVI_8Day", undefined, "1km", 3, 2, 3),
      attribution: "NASA MODIS NDVI",
      link: "https://worldview.earthdata.nasa.gov/",
    },
    {
      id: "terra-truecolor",
      label: "True Color",
      description: "MODIS Terra corrected reflectance — land/ocean surface",
      getUrl: () => gibsUrl("MODIS_Terra_CorrectedReflectance_TrueColor"),
      attribution: "NASA MODIS Terra",
    },
    {
      id: "land-surface-temp",
      label: "Land Surface Temp",
      description: "MODIS land surface temperature — thermal infrared measurement",
      getUrl: () => gibsPngUrl("MODIS_Terra_Land_Surface_Temp_Day", undefined, "1km", 3, 2, 3),
      attribution: "NASA MODIS LST",
    },
  ],
  magnetosphere: [
    {
      id: "blue-marble",
      label: "Blue Marble",
      description: "Next-generation Blue Marble composite — baseline reference",
      getUrl: () => gibsUrl("BlueMarble_NextGeneration", "2004-08-01", "500m"),
      attribution: "NASA Blue Marble",
    },
    {
      id: "terra-truecolor",
      label: "True Color",
      description: "MODIS Terra latest pass — current geomagnetic context",
      getUrl: () => gibsUrl("MODIS_Terra_CorrectedReflectance_TrueColor"),
      attribution: "NASA MODIS Terra",
    },
    {
      id: "sdo-aia",
      label: "Solar Disk (SDO)",
      description: "SDO AIA 193Å — solar corona ultraviolet, source of geomagnetic input",
      getUrl: () => "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_256_0193.jpg",
      attribution: "NASA SDO/AIA",
      link: "https://sdo.gsfc.nasa.gov/",
    },
  ],
  ionosphere: [
    {
      id: "daynight",
      label: "Day/Night Band",
      description: "VIIRS SNPP day-night band — ionospheric luminance proxy",
      getUrl: () => gibsPngUrl("VIIRS_SNPP_DayNightBand_ENCC", undefined, "500m", 3, 2, 3),
      attribution: "NASA VIIRS SNPP",
      link: "https://worldview.earthdata.nasa.gov/",
    },
    {
      id: "terra-truecolor",
      label: "True Color",
      description: "MODIS Terra latest — atmospheric/cloud context",
      getUrl: () => gibsUrl("MODIS_Terra_CorrectedReflectance_TrueColor"),
      attribution: "NASA MODIS Terra",
    },
    {
      id: "sdo-304",
      label: "Solar EUV (SDO)",
      description: "SDO AIA 304Å — extreme ultraviolet, ionization driver",
      getUrl: () => "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_256_0304.jpg",
      attribution: "NASA SDO/AIA",
      link: "https://sdo.gsfc.nasa.gov/",
    },
  ],
  noosphere: [
    {
      id: "city-lights",
      label: "City Lights",
      description: "VIIRS SNPP day-night band — urban infrastructure density",
      getUrl: () => gibsPngUrl("VIIRS_SNPP_DayNightBand_ENCC", undefined, "500m", 3, 2, 3),
      attribution: "NASA VIIRS SNPP",
    },
    {
      id: "blue-marble",
      label: "Blue Marble",
      description: "Baseline planetary surface — geographic reference layer",
      getUrl: () => gibsUrl("BlueMarble_NextGeneration", "2004-08-01", "500m"),
      attribution: "NASA Blue Marble",
    },
    {
      id: "terra-truecolor",
      label: "True Color",
      description: "MODIS Terra — current atmospheric and surface state",
      getUrl: () => gibsUrl("MODIS_Terra_CorrectedReflectance_TrueColor"),
      attribution: "NASA MODIS Terra",
    },
  ],
  crystalsphere: [
    {
      id: "terrain",
      label: "Terrain Relief",
      description: "ASTER GDEM shaded relief — geological composition proxy",
      getUrl: () => gibsUrl("ASTER_GDEM_Color_Shaded_Relief", "2015-01-01"),
      attribution: "NASA ASTER GDEM",
    },
    {
      id: "blue-marble",
      label: "Blue Marble",
      description: "Next-generation composite — planetary baseline",
      getUrl: () => gibsUrl("BlueMarble_NextGeneration", "2004-08-01", "500m"),
      attribution: "NASA Blue Marble",
    },
    {
      id: "sdo-hmi",
      label: "Solar Magnetogram",
      description: "SDO HMI magnetogram — solar magnetic field structure",
      getUrl: () => "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_256_HMIIC.jpg",
      attribution: "NASA SDO/HMI",
      link: "https://sdo.gsfc.nasa.gov/",
    },
  ],
};

const SPHERE_DESCRIPTIONS: Record<SphereId, string> = {
  geosphere: "Surface reflectance · Topographic relief · Plate boundary context",
  biosphere: "Vegetation indices · Surface temperature · Carbon flux proxies",
  magnetosphere: "Geomagnetic context · Solar corona input · Field reference",
  ionosphere: "Atmospheric luminance · Cloud cover · Solar EUV ionization",
  noosphere: "Urban light density · Infrastructure mapping · Surface state",
  crystalsphere: "Geological composition · Planetary baseline · Solar magnetics",
};

export function ImageryPanel({ sphereId, accent }: Props) {
  const sources = IMAGERY_SOURCES[sphereId];
  const [activeIdx, setActiveIdx] = useState(0);
  const [imageError, setImageError] = useState(false);
  const description = SPHERE_DESCRIPTIONS[sphereId];

  const current = sources[activeIdx];

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
          {sources.map((src, idx) => (
            <button
              key={src.id}
              onClick={() => { setActiveIdx(idx); setImageError(false); }}
              className={`px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all ${
                idx === activeIdx
                  ? "bg-muted/30 text-foreground/80"
                  : "text-muted-foreground/40 hover:text-muted-foreground/60"
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source description */}
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{current.description}</p>

      {/* Satellite Image */}
      <div className="relative rounded-lg overflow-hidden bg-muted/5 border border-border/10" style={{ aspectRatio: "16/9" }}>
        {!imageError ? (
          <img
            src={current.getUrl()}
            alt={`${current.label} satellite imagery`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Eye className="w-8 h-8 mx-auto" style={{ color: `${accent}30` }} />
              <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">
                {current.label} — {current.attribution}
              </p>
              <p className="text-[9px] text-muted-foreground/20">
                Tile may be unavailable for current date
              </p>
            </div>
          </div>
        )}
        {/* Label overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="px-2 py-1 rounded bg-background/70 backdrop-blur-sm">
            <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
              {current.attribution}
            </span>
          </div>
          {current.link && (
            <a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded bg-background/70 backdrop-blur-sm flex items-center gap-1 hover:bg-background/90 transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50" />
              <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/50">Source</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Layers className="w-3 h-3 text-muted-foreground/30" />
        <span className="text-[9px] text-muted-foreground/30 font-mono">
          NASA GIBS · SDO · MODIS · VIIRS · ASTER
        </span>
      </div>
    </Card>
  );
}
