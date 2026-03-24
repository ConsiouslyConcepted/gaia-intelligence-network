import { useQuery } from "@tanstack/react-query";

// USGS Earthquake API (free, no key)
export function useUSGSEarthquakes(period = "day", minMagnitude = 2.5) {
  return useQuery({
    queryKey: ["usgs-earthquakes", period, minMagnitude],
    queryFn: async () => {
      const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMagnitude}_${period}.geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("USGS API error");
      const data = await res.json();
      return data.features.slice(0, 20).map((f: any) => ({
        id: f.id,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: new Date(f.properties.time).toISOString(),
        depth: f.geometry.coordinates[2],
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        tsunami: f.properties.tsunami === 1,
        type: f.properties.type,
      }));
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: string;
  depth: number;
  lat: number;
  lng: number;
  tsunami: boolean;
  type: string;
}

// NOAA Space Weather - Kp Index
export function useNOAAKpIndex() {
  return useQuery({
    queryKey: ["noaa-kp"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");
      if (!res.ok) throw new Error("NOAA Kp API error");
      const data: string[][] = await res.json();
      // Skip header row
      return data.slice(1).slice(-24).map((row) => ({
        time: row[0],
        kp: parseFloat(row[1]),
        kpFraction: parseFloat(row[2]),
        observed: row[3],
      }));
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

// NOAA Space Weather - Solar Wind
export function useNOAASolarWind() {
  return useQuery({
    queryKey: ["noaa-solar-wind"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json");
      if (!res.ok) throw new Error("NOAA Solar Wind API error");
      const data: string[][] = await res.json();
      return data.slice(1).slice(-48).map((row) => ({
        time: row[0],
        density: parseFloat(row[1]) || 0,
        speed: parseFloat(row[2]) || 0,
        temperature: parseFloat(row[3]) || 0,
      }));
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

// NOAA Space Weather - Magnetic Field
export function useNOAAMagField() {
  return useQuery({
    queryKey: ["noaa-mag-field"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json");
      if (!res.ok) throw new Error("NOAA Mag Field API error");
      const data: string[][] = await res.json();
      return data.slice(1).slice(-48).map((row) => ({
        time: row[0],
        bx: parseFloat(row[1]) || 0,
        by: parseFloat(row[2]) || 0,
        bz: parseFloat(row[3]) || 0,
        bt: parseFloat(row[6]) || 0,
      }));
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

// NOAA Dst Index (geomagnetic storm indicator)
export function useNOAADst() {
  return useQuery({
    queryKey: ["noaa-dst"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/products/kyoto-dst.json");
      if (!res.ok) throw new Error("NOAA Dst API error");
      const data: string[][] = await res.json();
      return data.slice(1).slice(-24).map((row) => ({
        time: row[0],
        dst: parseFloat(row[1]) || 0,
      }));
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

// NASA EONET - Natural Events (Biosphere)
export function useNASAEONET() {
  return useQuery({
    queryKey: ["nasa-eonet"],
    queryFn: async () => {
      const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20");
      if (!res.ok) throw new Error("NASA EONET API error");
      const data = await res.json();
      return data.events.map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.categories?.[0]?.title || "Unknown",
        source: e.sources?.[0]?.id || "NASA",
        date: e.geometry?.[0]?.date || "",
        lat: e.geometry?.[0]?.coordinates?.[1] || 0,
        lng: e.geometry?.[0]?.coordinates?.[0] || 0,
      }));
    },
    refetchInterval: 600000,
    staleTime: 300000,
  });
}

// NOAA X-Ray Flux (Solar / Ionosphere proxy)
export function useNOAAXRayFlux() {
  return useQuery({
    queryKey: ["noaa-xray"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json");
      if (!res.ok) throw new Error("NOAA X-Ray API error");
      const data = await res.json();
      return data.slice(0, 20).map((f: any) => ({
        beginTime: f.begin_time,
        maxTime: f.max_time,
        endTime: f.end_time,
        classType: f.max_class || "—",
        currentFlux: f.max_xray_flux || 0,
      }));
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

// NOAA Solar Flare Alerts (Ionosphere)
export function useNOAAAlerts() {
  return useQuery({
    queryKey: ["noaa-alerts"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/products/alerts.json");
      if (!res.ok) throw new Error("NOAA Alerts API error");
      const data = await res.json();
      return data.slice(0, 15).map((a: any) => ({
        productId: a.product_id,
        issueTime: a.issue_datetime,
        message: a.message?.substring(0, 200) || "",
      }));
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}

// Wikipedia Pageviews - Top articles (Noosphere proxy)
export function useWikipediaTopPages() {
  return useQuery({
    queryKey: ["wikipedia-top"],
    queryFn: async () => {
      const yesterday = new Date(Date.now() - 86400000);
      const y = yesterday.getFullYear();
      const m = String(yesterday.getMonth() + 1).padStart(2, "0");
      const d = String(yesterday.getDate()).padStart(2, "0");
      const res = await fetch(
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${y}/${m}/${d}`,
        { headers: { "Api-User-Agent": "GaiaObservatory/1.0" } }
      );
      if (!res.ok) throw new Error("Wikipedia API error");
      const data = await res.json();
      const articles = data.items?.[0]?.articles || [];
      return articles
        .filter((a: any) => !a.article.startsWith("Special:") && a.article !== "Main_Page")
        .slice(0, 20)
        .map((a: any) => ({
          title: a.article.replace(/_/g, " "),
          views: a.views,
          rank: a.rank,
        }));
    },
    refetchInterval: 3600000,
    staleTime: 1800000,
  });
}

// NASA JPL SBDB - Close Approach (Crystalsphere orbital data)
export function useNASACloseApproach() {
  return useQuery({
    queryKey: ["nasa-close-approach"],
    queryFn: async () => {
      const res = await fetch(
        "https://ssd-api.jpl.nasa.gov/cad.api?date_min=now&date_max=%2B30&dist-max=0.2&sort=dist"
      );
      if (!res.ok) throw new Error("NASA JPL API error");
      const data = await res.json();
      const fields = data.fields as string[];
      return (data.data || []).slice(0, 15).map((row: string[]) => {
        const obj: Record<string, string> = {};
        fields.forEach((f, i) => (obj[f] = row[i]));
        return {
          designation: obj.des,
          closeApproachDate: obj.cd,
          distanceAU: parseFloat(obj.dist) || 0,
          distanceLD: parseFloat(obj.dist) * 389.17 || 0,
          velocity: parseFloat(obj.v_rel) || 0,
          hMag: parseFloat(obj.h) || 0,
        };
      });
    },
    refetchInterval: 3600000,
    staleTime: 1800000,
  });
}

// NOAA Solar Cycle Progression (Crystalsphere)
export function useNOAASolarCycle() {
  return useQuery({
    queryKey: ["noaa-solar-cycle"],
    queryFn: async () => {
      const res = await fetch("https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json");
      if (!res.ok) throw new Error("NOAA Solar Cycle API error");
      const data = await res.json();
      return data.slice(-36).map((d: any) => ({
        time: d["time-tag"],
        ssn: d.ssn || 0,
        smoothedSSN: d["smoothed_ssn"] || 0,
        f107: d.f10_7 || 0,
      }));
    },
    refetchInterval: 86400000,
    staleTime: 3600000,
  });
}
