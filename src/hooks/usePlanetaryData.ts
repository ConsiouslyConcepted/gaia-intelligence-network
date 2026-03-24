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
