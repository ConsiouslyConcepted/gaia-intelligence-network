import { useEffect, useMemo, useState } from "react";
import { SphereId } from "@/types/spheres";
import { SPHERE_INTEL, computeIntelligence, SphereIntelligence } from "@/lib/sphereIntelligence";

/**
 * Returns the live Intelligence reading for a single sphere.
 * Strictly read-only — derives all values deterministically from a tick clock.
 */
export function useSphereIntelligence(id: SphereId, intervalMs = 2000): SphereIntelligence {
  const [tick, setTick] = useState(() => Math.floor(Date.now() / intervalMs));

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(iv);
  }, [intervalMs]);

  return useMemo(() => computeIntelligence(SPHERE_INTEL[id], tick), [id, tick]);
}
