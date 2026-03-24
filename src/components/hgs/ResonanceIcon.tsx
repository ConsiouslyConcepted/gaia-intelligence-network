import { useEffect, useRef } from "react";
import { PLANET_RESONANCE_PAIRS, SOLAR_PLANETS } from "@/types/solarPlanets";

interface ResonanceIconProps {
  planetId: string;
  size?: number;
}

/**
 * Tiny animated resonance pattern icon for a planet,
 * using the first resonance pair involving that planet.
 */
export const ResonanceIcon = ({ planetId, size = 28 }: ResonanceIconProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pair = PLANET_RESONANCE_PAIRS.find((p) => {
      const p1 = SOLAR_PLANETS[p.i];
      const p2 = SOLAR_PLANETS[p.j];
      return p1.id === planetId || p2.id === planetId;
    });
    if (!pair) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 2;

    const hex = (h: string) => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ];

    const [r1, g1, b1] = hex(pair.c1);
    const [r2, g2, b2] = hex(pair.c2);
    const mr = (r1 + r2) / 2;
    const mg = (g1 + g2) / 2;
    const mb = (b1 + b2) / 2;

    const rInner = outerR * 0.35;
    const rOuter = outerR * 0.85;
    const speedA = pair.a;
    const speedB = pair.b;

    const gcd = (a: number, b: number): number => {
      while (b) { const t = b; b = a % b; a = t; }
      return a;
    };
    const lcm = (speedA * speedB) / gcd(speedA, speedB);
    const totalAngle = Math.PI * 2 * (lcm / speedA);
    const steps = 800;

    let time = 0;

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, size, size);

      // Background glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      grad.addColorStop(0, `rgba(${mr},${mg},${mb},0.12)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = `rgba(${mr},${mg},${mb},0.35)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();

      // Pattern
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

        const blend = s / steps;
        const cr = r1 + (r2 - r1) * blend;
        const cg = g1 + (g2 - g1) * blend;
        const cb = b1 + (b2 - b1) * blend;

        ctx.strokeStyle = `rgba(${Math.floor(cr)},${Math.floor(cg)},${Math.floor(cb)},0.18)`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Center dot
      ctx.fillStyle = `rgba(${mr},${mg},${mb},0.5)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 1, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [planetId, size]);

  return (
    <canvas
      ref={canvasRef}
      className="flex-shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  );
};
