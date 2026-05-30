import { useEffect, useMemo, useState } from "react";
import { SphereId } from "@/types/spheres";
import { computeCouplings, CouplingResult } from "@/lib/sphereCoupling";

export function useSphereCouplings(id: SphereId, intervalMs = 2000): CouplingResult[] {
  const [tick, setTick] = useState(() => Math.floor(Date.now() / intervalMs));
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(iv);
  }, [intervalMs]);
  return useMemo(() => computeCouplings(id, tick), [id, tick]);
}
