import { useEffect, useRef } from "react";

interface ResonancePairProps {
  label: string;
  color1: string;
  color2: string;
  ratioA: number;
  ratioB: number;
  size?: number;
}

/**
 * Draws the actual cymatic orbital resonance pattern for a sphere pair —
 * lines connecting two orbiting bodies at each time step, producing
 * the real geometric rose pattern from their harmonic ratio.
 */
export const ResonancePairDiagram = ({
  label,
  color1,
  color2,
  ratioA,
  ratioB,
  size = 96,
}: ResonancePairProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 6;

    const hexToRgb = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];

    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const mr = (r1 + r2) / 2;
    const mg = (g1 + g2) / 2;
    const mb = (b1 + b2) / 2;

    // Inner and outer orbit radii within the diagram
    const rInner = outerR * 0.35;
    const rOuter = outerR * 0.85;

    // Speeds from ratio — body A orbits ratioA times while B orbits ratioB times
    const speedA = ratioA;
    const speedB = ratioB;

    // Total angle to complete the full pattern
    const lcm = (speedA * speedB) / gcd(speedA, speedB);
    const totalRevolutions = lcm / speedA;
    const totalAngle = Math.PI * 2 * totalRevolutions;
    const steps = 2000;

    function gcd(a: number, b: number): number {
      while (b) { const t = b; b = a % b; a = t; }
      return a;
    }

    let time = 0;

    const draw = () => {
      time += 0.004;
      ctx.clearRect(0, 0, size, size);

      // Subtle background glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      grad.addColorStop(0, `rgba(${mr},${mg},${mb},0.08)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = `rgba(${mr},${mg},${mb},0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();

      // Draw cymatic pattern — lines connecting two orbiting points
      const rotation = time * 0.3;
      ctx.lineWidth = 0.3;

      for (let s = 0; s < steps; s += 2) {
        const t = (s / steps) * totalAngle;
        const angleA = t * speedA + rotation;
        const angleB = t * speedB + rotation;

        const x1 = cx + Math.cos(angleA) * rInner;
        const y1 = cy + Math.sin(angleA) * rInner;
        const x2 = cx + Math.cos(angleB) * rOuter;
        const y2 = cy + Math.sin(angleB) * rOuter;

        // Color interpolates between the two sphere colors along the pattern
        const blend = (s / steps);
        const cr = r1 + (r2 - r1) * blend;
        const cg = g1 + (g2 - g1) * blend;
        const cb = b1 + (b2 - b1) * blend;

        ctx.strokeStyle = `rgba(${Math.floor(cr)},${Math.floor(cg)},${Math.floor(cb)},0.12)`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Small center dot
      ctx.fillStyle = `rgba(${mr},${mg},${mb},0.5)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [color1, color2, ratioA, ratioB, size]);

  return (
    <div className="flex items-center gap-3">
      <canvas
        ref={canvasRef}
        className="flex-shrink-0"
        style={{ width: size, height: size }}
      />
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground/90">{label}</div>
        <div className="text-xs text-muted-foreground font-mono">
          resonance {ratioA}:{ratioB}
        </div>
      </div>
    </div>
  );
};
