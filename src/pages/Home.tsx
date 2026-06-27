import { useEffect, useRef, useState } from "react";
import ObservatoryScene from "@/components/observatory/ObservatoryScene";
import StationOverlay from "@/components/observatory/StationOverlay";
import { STATIONS } from "@/components/observatory/stations";

/**
 * Intelligence Observatory — the GaiaSphere homepage.
 *
 * A single immersive WebGL scene the user travels through, from Earth out
 * to the Observable Universe. Each "station" doubles as a gateway into one
 * of the existing intelligence dashboards.
 */
export default function Home() {
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // wheel + keyboard navigation
  useEffect(() => {
    const MAX = STATIONS.length - 1;
    let wheelAccum = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    const clampTarget = (v: number) => Math.max(0, Math.min(MAX, v));

    const snapToNearest = () => {
      targetRef.current = clampTarget(Math.round(targetRef.current));
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelAccum += e.deltaY;
      // 1 station per ~220px of scroll
      const step = wheelAccum / 220;
      if (Math.abs(step) >= 0.05) {
        targetRef.current = clampTarget(targetRef.current + step);
        wheelAccum = 0;
      }
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(snapToNearest, 180);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        targetRef.current = clampTarget(Math.round(targetRef.current) + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        targetRef.current = clampTarget(Math.round(targetRef.current) - 1);
      } else if (e.key === "Home") {
        targetRef.current = 0;
      } else if (e.key === "End") {
        targetRef.current = MAX;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, []);

  const jumpTo = (idx: number) => {
    targetRef.current = Math.max(0, Math.min(STATIONS.length - 1, idx));
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#05060f] text-foreground">
      <ObservatoryScene
        progressRef={progressRef}
        targetRef={targetRef}
        onActiveStationChange={setActiveIndex}
      />

      {/* vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsla(228,60%,2%,0.55) 100%)",
        }}
      />

      <StationOverlay activeIndex={activeIndex} onJumpTo={jumpTo} />
    </div>
  );
}
