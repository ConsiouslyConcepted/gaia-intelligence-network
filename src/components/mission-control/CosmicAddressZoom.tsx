import { useEffect, useRef } from "react";
import ObservatoryScene from "@/components/observatory/ObservatoryScene";
import { STATIONS } from "@/components/observatory/stations";

interface Props {
  /** Station index 0..STATIONS.length-1 to zoom to. */
  stationIndex: number;
  /** Notified when the camera settles on a new station (user interacted via wheel). */
  onStationChange?: (idx: number) => void;
}

/**
 * Compact, embeddable nested-scale zoom (the same engine used on the homepage Observatory),
 * driven externally by `stationIndex`.
 */
export default function CosmicAddressZoom({ stationIndex, onStationChange }: Props) {
  const progressRef = useRef(0);
  const targetRef = useRef(stationIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external active node → camera target.
  useEffect(() => {
    targetRef.current = Math.max(0, Math.min(STATIONS.length - 1, stationIndex));
  }, [stationIndex]);

  // Allow wheel-to-zoom only when the cursor is over this panel.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const MAX = STATIONS.length - 1;
    let accum = 0;
    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    const snap = () => {
      targetRef.current = Math.max(0, Math.min(MAX, Math.round(targetRef.current)));
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      accum += e.deltaY;
      const step = accum / 260;
      if (Math.abs(step) >= 0.05) {
        targetRef.current = Math.max(0, Math.min(MAX, targetRef.current + step));
        accum = 0;
      }
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 180);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-border/30"
      style={{
        height: 360,
        background: "radial-gradient(ellipse at center, hsla(228,40%,6%,1) 0%, #05060f 100%)",
      }}
    >
      <ObservatoryScene
        progressRef={progressRef}
        targetRef={targetRef}
        onActiveStationChange={(idx) => onStationChange?.(idx)}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, hsla(228,60%,2%,0.6) 100%)",
        }}
      />
      <div className="absolute bottom-2 right-3 text-[8px] tracking-[0.22em] uppercase text-foreground/45 pointer-events-none">
        Scroll inside frame to zoom · select a tier below
      </div>
    </div>
  );
}
