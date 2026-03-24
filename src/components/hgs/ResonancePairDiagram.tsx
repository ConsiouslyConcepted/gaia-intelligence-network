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
 * Spirographic hypotrochoid diagram showing the harmonic resonance
 * ratio between two adjacent spheres.
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
    const outerR = size / 2 - 4;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const mr = (r1 + r2) / 2;
    const mg = (g1 + g2) / 2;
    const mb = (b1 + b2) / 2;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Inner glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR * 0.7);
    grad.addColorStop(0, `rgba(${mr},${mg},${mb},0.12)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring
    ctx.strokeStyle = `rgba(${mr},${mg},${mb},0.35)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // Radiating spokes
    const spokeCount = ratioA * ratioB * 2;
    for (let s = 0; s < spokeCount; s++) {
      const a = (s / spokeCount) * Math.PI * 2;
      ctx.strokeStyle = `rgba(${mr},${mg},${mb},0.1)`;
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3);
      ctx.lineTo(cx + Math.cos(a) * outerR * 0.6, cy + Math.sin(a) * outerR * 0.6);
      ctx.stroke();
    }

    // Hypotrochoid
    const R = outerR * 0.78;
    const ri = (R * ratioB) / ratioA;
    const d = ri * 0.85;
    const steps = 800;

    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * Math.PI * 2 * ratioA;
      const px = (R - ri) * Math.cos(t) + d * Math.cos(((R - ri) / ri) * t);
      const py = (R - ri) * Math.sin(t) + d * Math.sin(((R - ri) / ri) * t);
      if (s === 0) ctx.moveTo(cx + px, cy + py);
      else ctx.lineTo(cx + px, cy + py);
    }
    ctx.strokeStyle = `rgba(${mr},${mg},${mb},0.8)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
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
