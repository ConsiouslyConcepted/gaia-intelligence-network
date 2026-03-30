import { useEffect, useRef } from "react";

interface LiveCymaticPatternProps {
  planetColor: string;
  planetId: string;
  isPlaying: boolean;
  getFrequencyData: () => Uint8Array | null;
  size?: number;
}

// Each planet has a unique base harmonic signature (number of nodal lines)
const PLANET_HARMONICS: Record<string, { modes: number[]; symmetry: number }> = {
  mercury: { modes: [3, 7], symmetry: 6 },
  venus: { modes: [5, 13], symmetry: 8 },
  earth: { modes: [4, 8], symmetry: 6 },
  mars: { modes: [6, 11], symmetry: 5 },
  jupiter: { modes: [3, 5], symmetry: 4 },
  saturn: { modes: [7, 14], symmetry: 7 },
  uranus: { modes: [8, 13], symmetry: 9 },
  neptune: { modes: [5, 9], symmetry: 6 },
  pluto: { modes: [11, 17], symmetry: 11 },
};

const hexToRgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/**
 * Real-time cymatic (Chladni-like) pattern renderer.
 * When audio plays, frequency data modulates the pattern.
 * When idle, a gentle ambient animation runs.
 */
export const LiveCymaticPattern = ({
  planetColor,
  planetId,
  isPlaying,
  getFrequencyData,
  size = 176,
}: LiveCymaticPatternProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 2;
    const [cr, cg, cb] = hexToRgb(planetColor);
    const harmonics = PLANET_HARMONICS[planetId] || PLANET_HARMONICS.earth;

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      ctx.clearRect(0, 0, size, size);

      // Get frequency data if playing
      const freqData = isPlaying ? getFrequencyData() : null;

      // Derive amplitude bands from frequency data
      let bassAmp = 0.4;
      let midAmp = 0.3;
      let highAmp = 0.2;
      let energy = 0.3;

      if (freqData && freqData.length > 0) {
        const len = freqData.length;
        let bassSum = 0, midSum = 0, highSum = 0;
        const bassEnd = Math.floor(len * 0.15);
        const midEnd = Math.floor(len * 0.5);

        for (let i = 0; i < bassEnd; i++) bassSum += freqData[i];
        for (let i = bassEnd; i < midEnd; i++) midSum += freqData[i];
        for (let i = midEnd; i < len; i++) highSum += freqData[i];

        bassAmp = (bassSum / (bassEnd * 255)) * 1.2;
        midAmp = (midSum / ((midEnd - bassEnd) * 255)) * 1.0;
        highAmp = (highSum / ((len - midEnd) * 255)) * 0.8;
        energy = (bassAmp + midAmp + highAmp) / 3;
      }

      // Background glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      glowGrad.addColorStop(0, `rgba(${cr},${cg},${cb},${0.12 + energy * 0.15})`);
      glowGrad.addColorStop(0.6, `rgba(${cr},${cg},${cb},${0.04 + energy * 0.06})`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // --- Cymatic / Chladni pattern ---
      // We simulate a Chladni plate pattern: cos(m*x)*cos(n*y) - cos(n*x)*cos(m*y) = 0
      // Mapped to polar coordinates on a circular plate
      const m = harmonics.modes[0] + bassAmp * 2;
      const n = harmonics.modes[1] + midAmp * 3;
      const sym = harmonics.symmetry;

      const resolution = 120;
      const step = (maxR * 2) / resolution;

      for (let px = 0; px < resolution; px++) {
        for (let py = 0; py < resolution; py++) {
          const x = (px / resolution) * 2 - 1; // -1 to 1
          const y = (py / resolution) * 2 - 1;
          const dist = Math.sqrt(x * x + y * y);

          if (dist > 0.95) continue;

          // Chladni function
          const chladni = Math.cos(m * Math.PI * x + t * 0.5) * Math.cos(n * Math.PI * y + t * 0.3)
            - Math.cos(n * Math.PI * x + t * 0.3) * Math.cos(m * Math.PI * y + t * 0.5);

          // Add rotational symmetry modulation
          const angle = Math.atan2(y, x);
          const rotMod = Math.sin(angle * sym + t * 0.8) * highAmp * 0.5;

          const val = Math.abs(chladni + rotMod);

          // Nodal lines are where val ≈ 0 — these are the bright lines
          const nodal = Math.exp(-val * val * (8 + energy * 12));

          if (nodal > 0.15) {
            const screenX = cx + x * maxR;
            const screenY = cy + y * maxR;
            const alpha = nodal * (0.5 + energy * 0.5) * (1 - dist * 0.3);

            ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
            ctx.fillRect(screenX - step / 2, screenY - step / 2, step * 0.8, step * 0.8);
          }
        }
      }

      // Bright center node
      const coreR = 3 + energy * 4;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
      coreGrad.addColorStop(0, `rgba(255,255,255,${0.6 + energy * 0.3})`);
      coreGrad.addColorStop(0.4, `rgba(${cr},${cg},${cb},${0.4 + energy * 0.3})`);
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.15 + energy * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [planetColor, planetId, isPlaying, getFrequencyData, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 20px 6px ${planetColor}50, 0 0 40px 12px ${planetColor}20`,
      }}
    />
  );
};
