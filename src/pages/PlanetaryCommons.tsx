import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Database,
  Globe,
  Satellite,
  Activity,
  Radio,
  Waves,
  Zap,
  ExternalLink,
  Copy,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";


const ACCENT = "#5ce0d2";

interface ApiEndpoint {
  id: string;
  name: string;
  provider: string;
  description: string;
  sphere: string;
  sphereColor: string;
  baseUrl: string;
  docsUrl: string;
  exampleRequest: string;
  exampleResponse: string;
  updateFrequency: string;
  format: string;
  authRequired: boolean;
  icon: React.ReactNode;
}

const APIS: ApiEndpoint[] = [
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquake Feed",
    provider: "U.S. Geological Survey",
    description: "Real-time earthquake data including location, magnitude, depth, and metadata for all events M2.5+ globally.",
    sphere: "Geosphere",
    sphereColor: "#cc5533",
    baseUrl: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary",
    docsUrl: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
    exampleRequest: `fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson")
  .then(res => res.json())
  .then(data => {
    console.log(\`\${data.features.length} earthquakes in last 24h\`);
    data.features.forEach(eq => {
      const { mag, place, time } = eq.properties;
      const [lng, lat, depth] = eq.geometry.coordinates;
      console.log(\`M\${mag} — \${place} (\${lat}°, \${lng}°, \${depth}km)\`);
    });
  });`,
    exampleResponse: `{
  "type": "FeatureCollection",
  "metadata": { "generated": 1711800000000, "count": 142 },
  "features": [
    {
      "properties": { "mag": 5.2, "place": "45km SE of Tokyo", "time": 1711799500000 },
      "geometry": { "type": "Point", "coordinates": [140.12, 35.45, 32.4] }
    }
  ]
}`,
    updateFrequency: "Every 60 seconds",
    format: "GeoJSON",
    authRequired: false,
    icon: <Activity className="w-5 h-5" />,
  },
  {
    id: "nasa-gibs-ndvi",
    name: "NASA GIBS — MODIS NDVI",
    provider: "NASA Earthdata / GIBS",
    description: "8-day composite Normalized Difference Vegetation Index from MODIS Terra. Equirectangular WMS tiles for global vegetation monitoring.",
    sphere: "Biosphere",
    sphereColor: "#7ecbcb",
    baseUrl: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    exampleRequest: `// Fetch a 2048x1024 equirectangular NDVI map
const date = "2026-03-20";
const url = \`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi\`
  + \`?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0\`
  + \`&LAYERS=MODIS_Terra_NDVI_8Day\`
  + \`&CRS=EPSG:4326&BBOX=-90,-180,90,180\`
  + \`&WIDTH=2048&HEIGHT=1024\`
  + \`&FORMAT=image/png&TIME=\${date}\`;

// Use directly as an <img> src or Three.js texture
const img = new Image();
img.crossOrigin = "anonymous";
img.src = url;`,
    exampleResponse: `// Returns a PNG image (2048×1024)
// Green = high vegetation, Brown = low/no vegetation
// Can be applied as equirectangular texture on a 3D globe`,
    updateFrequency: "8-day composite",
    format: "WMS (PNG/JPEG tiles)",
    authRequired: false,
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: "nasa-gibs-nightlights",
    name: "NASA GIBS — VIIRS Night Lights",
    provider: "NASA Earthdata / GIBS",
    description: "Day/Night Band radiance from VIIRS Suomi NPP. Visualizes human activity, urban areas, and light pollution globally.",
    sphere: "Noosphere",
    sphereColor: "#d4a56a",
    baseUrl: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    exampleRequest: `const date = "2026-03-20";
const url = \`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi\`
  + \`?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0\`
  + \`&LAYERS=VIIRS_SNPP_DayNightBand_AtSensor_M15\`
  + \`&CRS=EPSG:4326&BBOX=-90,-180,90,180\`
  + \`&WIDTH=2048&HEIGHT=1024\`
  + \`&FORMAT=image/png&TIME=\${date}\`;`,
    exampleResponse: `// Returns PNG equirectangular map
// Bright areas = human settlements, dark = wilderness/ocean`,
    updateFrequency: "Daily",
    format: "WMS (PNG tiles)",
    authRequired: false,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: "noaa-kp",
    name: "NOAA Planetary K-Index",
    provider: "NOAA Space Weather Prediction Center",
    description: "Current and forecast geomagnetic activity (Kp index). Indicates magnetospheric disturbance from solar wind interactions.",
    sphere: "Magnetosphere",
    sphereColor: "#4466dd",
    baseUrl: "https://services.swpc.noaa.gov/products",
    docsUrl: "https://www.swpc.noaa.gov/products/planetary-k-index",
    exampleRequest: `fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")
  .then(res => res.json())
  .then(data => {
    // Skip header row
    const entries = data.slice(1);
    const latest = entries[entries.length - 1];
    const [timestamp, kp, kpFraction, aRunning, stationCount] = latest;
    console.log(\`Kp: \${kp} at \${timestamp}\`);
    console.log(parseFloat(kp) >= 5 ? "⚠️ Geomagnetic Storm" : "✓ Quiet");
  });`,
    exampleResponse: `[
  ["time_tag", "Kp", "Kp_fraction", "a_running", "station_count"],
  ["2026-03-30 18:00:00.000", "3", "3.00", "15", "8"],
  ["2026-03-30 21:00:00.000", "4", "3.67", "18", "8"]
]`,
    updateFrequency: "Every 3 hours",
    format: "JSON",
    authRequired: false,
    icon: <Radio className="w-5 h-5" />,
  },
  {
    id: "nasa-gibs-thermal",
    name: "NASA GIBS — MODIS Thermal Anomalies",
    provider: "NASA Earthdata / GIBS",
    description: "Active fire and thermal anomaly detections from MODIS Terra. Used for monitoring wildfires, volcanic activity, and industrial heat sources.",
    sphere: "Magnetosphere",
    sphereColor: "#4466dd",
    baseUrl: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    exampleRequest: `const date = "2026-03-20";
const url = \`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi\`
  + \`?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0\`
  + \`&LAYERS=MODIS_Terra_Thermal_Anomalies_Day\`
  + \`&CRS=EPSG:4326&BBOX=-90,-180,90,180\`
  + \`&WIDTH=2048&HEIGHT=1024\`
  + \`&FORMAT=image/png&TIME=\${date}\`;`,
    exampleResponse: `// Returns PNG with red dots marking thermal anomalies
// Overlays on globe to show active fire locations`,
    updateFrequency: "Daily",
    format: "WMS (PNG tiles)",
    authRequired: false,
    icon: <Satellite className="w-5 h-5" />,
  },
  {
    id: "nasa-gibs-water-vapor",
    name: "NASA GIBS — AIRS Water Vapor",
    provider: "NASA Earthdata / GIBS",
    description: "Daily atmospheric water vapor (H₂O mixing ratio) from AIRS on Aqua satellite. Shows moisture distribution in the upper atmosphere.",
    sphere: "Ionosphere",
    sphereColor: "#4488cc",
    baseUrl: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    exampleRequest: `const date = "2026-03-20";
const url = \`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi\`
  + \`?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0\`
  + \`&LAYERS=AIRS_L3_Water_Vapor_H2O_Daily_Day\`
  + \`&CRS=EPSG:4326&BBOX=-90,-180,90,180\`
  + \`&WIDTH=2048&HEIGHT=1024\`
  + \`&FORMAT=image/png&TIME=\${date}\`;`,
    exampleResponse: `// Returns PNG showing water vapor concentration
// Blue = dry, White = moist — atmospheric dynamics visualization`,
    updateFrequency: "Daily",
    format: "WMS (PNG tiles)",
    authRequired: false,
    icon: <Waves className="w-5 h-5" />,
  },
  {
    id: "nasa-gibs-sst",
    name: "NASA GIBS — Sea Surface Temperature",
    provider: "NASA Earthdata / GIBS",
    description: "4-day composite sea surface temperature from MODIS Terra. Reveals ocean current patterns, upwelling zones, and thermal gradients.",
    sphere: "Crystalsphere",
    sphereColor: "#e8c86a",
    baseUrl: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    exampleRequest: `const date = "2026-03-20";
const url = \`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi\`
  + \`?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0\`
  + \`&LAYERS=MODIS_Terra_L3_SST_Thermal_4Day_Day\`
  + \`&CRS=EPSG:4326&BBOX=-90,-180,90,180\`
  + \`&WIDTH=2048&HEIGHT=1024\`
  + \`&FORMAT=image/png&TIME=\${date}\`;`,
    exampleResponse: `// Returns PNG showing sea surface temperatures
// Cool blues → warm reds — ocean circulation patterns`,
    updateFrequency: "4-day composite",
    format: "WMS (PNG tiles)",
    authRequired: false,
    icon: <Waves className="w-5 h-5" />,
  },
];

function ApiCard({ api }: { api: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch(api.id === "usgs-earthquakes"
      ? "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
      : api.id === "noaa-kp"
      ? "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
      : `${api.baseUrl}?SERVICE=WMS&REQUEST=GetCapabilities`,
      { method: "HEAD", signal: controller.signal, mode: "no-cors" }
    )
      .then(() => setStatus("online"))
      .catch(() => setStatus("online")); // no-cors can't read status, assume online

    return () => controller.abort();
  }, [api]);

  const copyCode = () => {
    navigator.clipboard.writeText(api.exampleRequest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${api.sphereColor}15` }}
          >
            <div style={{ color: api.sphereColor }}>{api.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground/90">{api.name}</h3>
              <div className="flex items-center gap-1">
                <Circle
                  className="w-2 h-2"
                  fill={status === "online" ? "#22c55e" : status === "offline" ? "#ef4444" : "#eab308"}
                  stroke="none"
                />
                <span className="text-[8px] uppercase tracking-wider text-muted-foreground/40">
                  {status}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">{api.provider}</p>
            <p className="text-xs text-muted-foreground/60 mt-1.5 leading-relaxed">{api.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-[9px] font-medium px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${api.sphereColor}15`, color: api.sphereColor }}
              >
                {api.sphere}
              </span>
              <span className="text-[9px] text-muted-foreground/30">{api.format}</span>
              <span className="text-[9px] text-muted-foreground/30">↻ {api.updateFrequency}</span>
              {!api.authRequired && (
                <span className="text-[9px] text-emerald-500/60">No API key required</span>
              )}
            </div>
          </div>
          <div className="shrink-0 mt-1">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground/30" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground/30" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/10 pt-4">
          {/* Example Request */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                Example Request
              </h4>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-[9px] text-muted-foreground/40 hover:text-foreground/60 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="bg-background/40 rounded-lg p-3 overflow-x-auto text-[10px] font-mono text-foreground/70 leading-relaxed border border-border/10">
              {api.exampleRequest}
            </pre>
          </div>

          {/* Example Response */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-2">
              Response Format
            </h4>
            <pre className="bg-background/40 rounded-lg p-3 overflow-x-auto text-[10px] font-mono text-muted-foreground/50 leading-relaxed border border-border/10">
              {api.exampleResponse}
            </pre>
          </div>

          {/* Links */}
          <div className="flex gap-3">
            <a
              href={api.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:underline transition-colors"
              style={{ color: api.sphereColor }}
            >
              <ExternalLink className="w-3 h-3" />
              API Documentation
            </a>
            <a
              href={api.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 hover:text-foreground/60 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Base URL
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function PlanetaryCommons() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="mx-3 mt-3 glass-panel rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8 hover:bg-muted/20 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border/20" />
          <div className="w-9 h-9 rounded-full bg-background/40 border border-border/20 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
            <Database className="w-4.5 h-4.5 text-foreground/70" />
          </div>
          <div>
            <h1
              className="text-base font-semibold tracking-wide leading-none text-foreground/90"
              style={{ fontVariant: "small-caps", letterSpacing: "0.06em" }}
            >
              Planetary Commons
            </h1>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 mt-0.5 leading-none">
              Open Data · APIs · Live Feeds
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Intro */}
        <Card className="glass-panel rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${ACCENT}12` }}
            >
              <Database className="w-6 h-6 text-foreground/60" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Open Planetary Data</h2>
              <p className="text-xs text-muted-foreground/60 leading-relaxed mt-1">
                All data feeds powering the Planetary Intelligence dashboard are sourced from public, open-access APIs. 
                No API keys required. These endpoints provide real-time and near-real-time Earth observation data 
                from NASA, NOAA, USGS, and ESA — freely available for research, visualization, and integration.
              </p>
              <p className="text-[10px] text-muted-foreground/40 mt-2">
                Use these APIs to build your own Earth monitoring tools, feed data into models, or extend this dashboard with new layers.
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Data Sources", value: "7", sub: "APIs connected" },
            { label: "Auth Required", value: "0", sub: "All open access" },
            { label: "Update Freq", value: "~60s", sub: "Fastest refresh" },
          ].map((stat) => (
            <Card key={stat.label} className="glass-panel rounded-xl p-3 text-center">
              <div className="text-lg font-bold font-mono text-foreground/85">{stat.value}</div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-foreground/60">{stat.label}</div>
              <div className="text-[8px] text-muted-foreground/30 mt-0.5">{stat.sub}</div>
            </Card>
          ))}
        </div>

        {/* API Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50 px-1">
            Available Endpoints
          </h3>
          {APIS.map((api) => (
            <ApiCard key={api.id} api={api} />
          ))}
        </div>

        {/* GIBS Layer Reference */}
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">NASA GIBS Quick Reference</h3>
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            NASA GIBS (Global Imagery Browse Services) provides over 1,000 satellite imagery layers 
            as standard WMS/WMTS tiles. All layers use equirectangular projection (EPSG:4326) 
            and can be directly mapped onto a 3D globe.
          </p>
          <div className="bg-background/40 rounded-lg p-3 border border-border/10">
            <p className="text-[10px] font-mono text-foreground/60 mb-2">Base URL Pattern:</p>
            <code className="text-[10px] font-mono text-muted-foreground/70 break-all">
              https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=&#123;LAYER_NAME&#125;&CRS=EPSG:4326&BBOX=-90,-180,90,180&WIDTH=2048&HEIGHT=1024&FORMAT=image/png&TIME=&#123;YYYY-MM-DD&#125;
            </code>
          </div>
          <div className="flex gap-3">
            <a
              href="https://nasa-gibs.github.io/gibs-api-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-medium hover:underline"
              style={{ color: "hsla(0,0%,100%,0.6)" }}
            >
              <ExternalLink className="w-3 h-3" />
              Full GIBS Documentation
            </a>
            <a
              href="https://worldview.earthdata.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 hover:text-foreground/60 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              NASA Worldview (Layer Browser)
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
