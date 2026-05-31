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
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, hsl(225 50% 8%) 0%, hsl(228 55% 5%) 55%, hsl(230 60% 3%) 100%)",
      }}
    >
      {/* Drifting star layer 1 */}
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
      {/* Subtle nebula tint */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, hsla(220,70%,40%,0.12), transparent 50%), radial-gradient(circle at 80% 20%, hsla(260,60%,40%,0.08), transparent 50%)",
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
