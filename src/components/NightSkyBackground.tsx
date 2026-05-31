import { useMemo } from "react";

/**
 * Global fixed night-sky background with slowly drifting stars.
 * Pure CSS/SVG — lightweight, mounts once at the app root.
 */
export const NightSkyBackground = () => {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; r: number; o: number; d: number }[] = [];
    for (let i = 0; i < 220; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 1.1 + 0.3,
        o: Math.random() * 0.7 + 0.25,
        d: Math.random() * 6 + 3,
      });
    }
    return arr;
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: -1,
        background:
          "radial-gradient(ellipse at 50% 40%, hsl(225 50% 8%) 0%, hsl(228 55% 5%) 55%, hsl(230 60% 3%) 100%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 58%, hsla(200,80%,40%,0.12) 0%, hsla(260,55%,30%,0.06) 42%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ animation: "nightsky-drift 240s linear infinite" }}
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="white"
              opacity={s.o}
            >
              <animate
                attributeName="opacity"
                values={`${s.o};${s.o * 0.3};${s.o}`}
                dur={`${s.d}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 26%, hsla(240,30%,3%,0.55) 72%, hsla(240,30%,3%,0.96) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.75'/></svg>\")",
        }}
      />
      <style>{`
        @keyframes nightsky-drift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-4%, 2%, 0); }
        }
      `}</style>
    </div>
  );
};
