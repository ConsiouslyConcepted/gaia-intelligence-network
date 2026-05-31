import { SphereId } from "@/types/spheres";

/**
 * NASA GIBS WMS layers and public APIs for each sphere.
 * All endpoints are CORS-enabled and require no API keys.
 */

const GIBS_BASE = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const USGS_QUAKES = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
const NOAA_KP = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

/** Get a recent date string for GIBS (3 days ago to ensure data is available) */
function getGibsDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 3);
  return d.toISOString().slice(0, 10);
}

/** Build a NASA GIBS WMS GetMap URL */
function gibsUrl(layer: string, width = 2048, height = 1024, format = "image/png"): string {
  const time = getGibsDate();
  return `${GIBS_BASE}?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0` +
    `&LAYERS=${layer}&CRS=EPSG:4326&BBOX=-90,-180,90,180` +
    `&WIDTH=${width}&HEIGHT=${height}&FORMAT=${encodeURIComponent(format)}&TIME=${time}`;
}

export interface LiveOverlayConfig {
  /** Dynamic texture URL from NASA GIBS or null if data-driven */
  textureUrl: string | null;
  /** Static fallback texture in /public/overlays/ */
  fallbackUrl: string;
  /** Label for the data source */
  source: string;
  /** Human-readable description */
  description: string;
  /** GIBS layer name (if applicable) */
  gibsLayer?: string;
}

/**
 * GIBS layer mapping per sphere:
 * - Geosphere: Blue Marble base + seismic data points (from USGS API)
 * - Biosphere: MODIS NDVI (vegetation index)
 * - Noosphere: VIIRS Night Lights (Black Marble)
 * - Magnetosphere: MODIS Active Fires
 * - Ionosphere: AIRS Total Precipitable Water Vapor
 * - Crystalsphere: MODIS Sea Surface Temperature
 */
export const SPHERE_LIVE_CONFIG: Record<SphereId, LiveOverlayConfig> = {
  geosphere: {
    textureUrl: gibsUrl("BlueMarble_ShadedRelief_Bathymetry"),
    fallbackUrl: "/overlays/geosphere-overlay.jpg",
    source: "USGS + NASA GIBS",
    description: "Shaded relief bathymetry with live seismic events",
    gibsLayer: "BlueMarble_ShadedRelief_Bathymetry",
  },
  biosphere: {
    textureUrl: gibsUrl("MODIS_Terra_NDVI_8Day"),
    fallbackUrl: "/overlays/biosphere-overlay.jpg",
    source: "NASA MODIS Terra",
    description: "8-day composite Normalized Difference Vegetation Index",
    gibsLayer: "MODIS_Terra_NDVI_8Day",
  },
  noosphere: {
    textureUrl: gibsUrl("VIIRS_SNPP_DayNightBand_AtSensor_M15"),
    fallbackUrl: "/overlays/noosphere-overlay.jpg",
    source: "NASA VIIRS Suomi NPP",
    description: "Day/Night Band radiance — city lights and human activity",
    gibsLayer: "VIIRS_SNPP_DayNightBand_AtSensor_M15",
  },
  magnetosphere: {
    textureUrl: gibsUrl("MODIS_Terra_Thermal_Anomalies_Day"),
    fallbackUrl: "/overlays/magnetosphere-overlay.jpg",
    source: "NASA MODIS + NOAA SWPC",
    description: "Thermal anomalies and active fire detections",
    gibsLayer: "MODIS_Terra_Thermal_Anomalies_Day",
  },
  ionosphere: {
    textureUrl: gibsUrl("AIRS_L3_Water_Vapor_H2O_Daily_Day"),
    fallbackUrl: "/overlays/ionosphere-overlay.jpg",
    source: "NASA AIRS Aqua",
    description: "Daily atmospheric water vapor (H₂O mixing ratio)",
    gibsLayer: "AIRS_L3_Water_Vapor_H2O_Daily_Day",
  },
  hydrosphere: {
    textureUrl: gibsUrl("GHRSST_L4_MUR_Sea_Surface_Temperature"),
    fallbackUrl: "/overlays/crystalsphere-overlay.jpg",
    source: "NASA MUR SST",
    description: "Sea surface temperature — global ocean thermal field",
    gibsLayer: "GHRSST_L4_MUR_Sea_Surface_Temperature",
  },
  cryosphere: {
    textureUrl: gibsUrl("MODIS_Terra_NDSI_Snow_Cover"),
    fallbackUrl: "/overlays/biosphere-overlay.jpg",
    source: "NASA MODIS Terra",
    description: "Normalized Difference Snow Index — snow and ice cover",
    gibsLayer: "MODIS_Terra_NDSI_Snow_Cover",
  },
  atmosphere: {
    textureUrl: gibsUrl("AIRS_L3_Surface_Air_Temperature_Daily_Day"),
    fallbackUrl: "/overlays/biosphere-overlay.jpg",
    source: "NASA AIRS Aqua",
    description: "Daily surface air temperature — atmospheric thermal field",
    gibsLayer: "AIRS_L3_Surface_Air_Temperature_Daily_Day",
  },
  crystalsphere: {
    textureUrl: gibsUrl("MODIS_Terra_L3_SST_Thermal_4Day_Day"),
    fallbackUrl: "/overlays/crystalsphere-overlay.jpg",
    source: "NASA MODIS Terra",
    description: "4-day sea surface temperature composite",
    gibsLayer: "MODIS_Terra_L3_SST_Thermal_4Day_Day",
  },
  heliosphere: {
    textureUrl: null,
    fallbackUrl: "/overlays/magnetosphere-overlay.jpg",
    source: "NOAA SWPC · NASA SDO",
    description: "Solar activity transmission — sunspots, wind, CMEs, IMF",
  },
};

/** Earthquake data point from USGS */
export interface QuakePoint {
  lat: number;
  lng: number;
  magnitude: number;
  depth: number;
  place: string;
  time: number;
}

/** Fetch live earthquake data from USGS */
export async function fetchQuakeData(): Promise<QuakePoint[]> {
  try {
    const res = await fetch(USGS_QUAKES);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      magnitude: f.properties.mag,
      depth: f.geometry.coordinates[2],
      place: f.properties.place,
      time: f.properties.time,
    }));
  } catch {
    return [];
  }
}

/** Fetch current Kp index from NOAA SWPC */
export async function fetchKpIndex(): Promise<number | null> {
  try {
    const res = await fetch(NOAA_KP);
    if (!res.ok) return null;
    const data = await res.json();
    // Last entry, 2nd element is Kp value
    const last = data[data.length - 1];
    return parseFloat(last[1]);
  } catch {
    return null;
  }
}
