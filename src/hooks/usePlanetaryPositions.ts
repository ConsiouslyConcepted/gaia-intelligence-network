import { useEffect, useRef, useState } from "react";
import { computeAllStates, PlanetState } from "@/lib/orbitalMechanics";

/**
 * Returns current heliocentric planet states, updated on an rAF loop.
 * `timeScale` lets us advance simulated time faster than real-time (1 = real).
 */
export function usePlanetaryPositions(timeScale = 1, intervalMs = 100) {
  const [states, setStates] = useState<PlanetState[]>(() => computeAllStates(new Date()));
  const baseRealRef = useRef<number>(Date.now());
  const baseSimRef = useRef<number>(Date.now());

  useEffect(() => {
    let frame: number;
    let last = 0;
    const tick = (t: number) => {
      if (t - last >= intervalMs) {
        last = t;
        const elapsed = Date.now() - baseRealRef.current;
        const simNow = new Date(baseSimRef.current + elapsed * timeScale);
        setStates(computeAllStates(simNow));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timeScale, intervalMs]);

  return states;
}
