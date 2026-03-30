import { useState, useEffect, useCallback } from "react";
import { SphereId } from "@/types/spheres";
import {
  SPHERE_LIVE_CONFIG,
  fetchQuakeData,
  fetchKpIndex,
  QuakePoint,
} from "@/lib/liveOverlays";

interface LiveOverlayState {
  /** URL to use as the globe overlay texture */
  textureUrl: string;
  /** Whether we're using live data vs static fallback */
  isLive: boolean;
  /** Data source label */
  source: string;
  /** Description of what's shown */
  description: string;
  /** Earthquake data (geosphere only) */
  quakes: QuakePoint[];
  /** Current Kp index (magnetosphere context) */
  kpIndex: number | null;
  /** Loading state */
  loading: boolean;
  /** Error message if live failed */
  error: string | null;
  /** Force refresh */
  refresh: () => void;
}

/**
 * Hook that provides live overlay data for a sphere.
 * Attempts NASA GIBS first, falls back to static overlays.
 * Refreshes every 5 minutes.
 */
export function useLiveOverlay(sphereId: SphereId): LiveOverlayState {
  const config = SPHERE_LIVE_CONFIG[sphereId];
  const [textureUrl, setTextureUrl] = useState(config.fallbackUrl);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quakes, setQuakes] = useState<QuakePoint[]>([]);
  const [kpIndex, setKpIndex] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveData() {
      setLoading(true);
      setError(null);

      // Try loading the GIBS texture
      if (config.textureUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";

          const loaded = await new Promise<boolean>((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = config.textureUrl!;
          });

          if (!cancelled && loaded) {
            setTextureUrl(config.textureUrl!);
            setIsLive(true);
          }
        } catch {
          if (!cancelled) {
            setError("GIBS texture failed to load");
            setTextureUrl(config.fallbackUrl);
            setIsLive(false);
          }
        }
      }

      // Fetch supplementary data
      if (sphereId === "geosphere" && !cancelled) {
        const q = await fetchQuakeData();
        if (!cancelled) setQuakes(q);
      }

      if (sphereId === "magnetosphere" && !cancelled) {
        const kp = await fetchKpIndex();
        if (!cancelled) setKpIndex(kp);
      }

      if (!cancelled) setLoading(false);
    }

    loadLiveData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadLiveData, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sphereId, refreshKey, config.textureUrl, config.fallbackUrl]);

  return {
    textureUrl,
    isLive,
    source: config.source,
    description: config.description,
    quakes,
    kpIndex,
    loading,
    error,
    refresh,
  };
}
