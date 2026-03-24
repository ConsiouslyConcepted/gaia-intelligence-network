import { useEffect, useRef } from "react";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";

/**
 * Cymatic orbital resonance visualization of our solar system.
 * Draws lines connecting planet positions at each time step,
 * producing real geometric rose patterns from their harmonic ratios.
 */
export const OrbitalResonanceField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const hexToRgb = (hex: string): [number, number, number] => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];

    const planetData = SOLAR_PLANETS.map((p) => ({
      ...p,
      rgb: hexToRgb(p.color),
    }));

    // Precompute cymatic thread patterns for each resonance pair
    const gcd = (a: number, b: number): number => {
      while (b) { const t = b; b = a % b; a = t; }
      return a;
    };

    const pairPatterns = PLANET_RESONANCE_PAIRS.map((pair) => {
      const p1 = planetData[pair.i];
      const p2 = planetData[pair.j];
      const speedA = pair.a;
      const speedB = pair.b;
      const lcm = (speedA * speedB) / gcd(speedA, speedB);
      const totalAngle = Math.PI * 2 * (lcm / speedA);
      const steps = 3000;

      const points: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      for (let s = 0; s < steps; s++) {
        const t = (s / steps) * totalAngle;
        points.push({
          x1: Math.cos(t * speedA) * p1.orbitRadius,
          y1: Math.sin(t * speedA) * p1.orbitRadius,
          x2: Math.cos(t * speedB) * p2.orbitRadius,
          y2: Math.sin(t * speedB) * p2.orbitRadius,
        });
      }

      return {
        ...pair,
        points,
        rgb1: p1.rgb,
        rgb2: p2.rgb,
      };
    });

    // Stars
    const stars: Array<{ x: number; y: number; s: number; b: number }> = [];
    for (let k = 0; k < 500; k++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        s: Math.random() * 1.0 + 0.2,
        b: Math.random() * 0.3 + 0.05,
      });
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      time += 0.0015;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.45;
      const cy = h * 0.5;
      const scale = Math.min(w, h) * 0.48;

      ctx.fillStyle = "rgb(4, 4, 14)";
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const star of stars) {
        const twinkle = star.b + Math.sin(time * 5 + star.x * 80) * 0.03;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, twinkle)})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cymatic resonance thread patterns
      const globalRotation = time * 0.06;
      const cos = Math.cos(globalRotation);
      const sin = Math.sin(globalRotation);

      for (const pp of pairPatterns) {
        const mr = (pp.rgb1[0] + pp.rgb2[0]) / 2;
        const mg = (pp.rgb1[1] + pp.rgb2[1]) / 2;
        const mb = (pp.rgb1[2] + pp.rgb2[2]) / 2;

        ctx.lineWidth = 0.35;
        const skip = 3;

        for (let s = 0; s < pp.points.length; s += skip) {
          const p = pp.points[s];
          const x1 = cx + (p.x1 * cos - p.y1 * sin) * scale;
          const y1 = cy + (p.x1 * sin + p.y1 * cos) * scale;
          const x2 = cx + (p.x2 * cos - p.y2 * sin) * scale;
          const y2 = cy + (p.x2 * sin + p.y2 * cos) * scale;

          const alpha = 0.06 + Math.sin(s * 0.008) * 0.025;
          ctx.strokeStyle = `rgba(${mr},${mg},${mb},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Orbital rings
      for (const p of planetData) {
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, p.orbitRadius * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sun glow
      for (let gr = 45; gr > 0; gr--) {
        const t = gr / 45;
        ctx.fillStyle = `rgba(255,${Math.floor(160 + (1 - t) * 80)},${Math.floor((1 - t) * 40)},${0.008 + (1 - t) * 0.1})`;
        ctx.beginPath();
        ctx.arc(cx, cy, gr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,250,235,0.95)";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Planet bodies — photorealistic sphere rendering
      for (const p of planetData) {
        const angle = time * p.speed * 6 + p.orbitRadius * 20;
        const sx = cx + Math.cos(angle) * p.orbitRadius * scale;
        const sy = cy + Math.sin(angle) * p.orbitRadius * scale;
        const r = p.size;
        const brighten = (c: number, amt: number) => Math.min(255, c + amt);
        const darken = (c: number, f: number) => Math.floor(c * f);

        // Soft outer atmospheric haze
        const atmosGrad = ctx.createRadialGradient(sx, sy, r * 0.8, sx, sy, r * 5);
        atmosGrad.addColorStop(0, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.12)`);
        atmosGrad.addColorStop(0.4, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.03)`);
        atmosGrad.addColorStop(1, "transparent");
        ctx.fillStyle = atmosGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 5, 0, Math.PI * 2);
        ctx.fill();

        // Base sphere — dark side first (terminator shadow)
        const baseGrad = ctx.createRadialGradient(
          sx - r * 0.45, sy - r * 0.45, r * 0.05,
          sx + r * 0.15, sy + r * 0.15, r * 1.1
        );
        baseGrad.addColorStop(0, `rgba(${brighten(p.rgb[0],80)},${brighten(p.rgb[1],80)},${brighten(p.rgb[2],80)},1)`);
        baseGrad.addColorStop(0.35, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},1)`);
        baseGrad.addColorStop(0.7, `rgba(${darken(p.rgb[0],0.5)},${darken(p.rgb[1],0.5)},${darken(p.rgb[2],0.5)},1)`);
        baseGrad.addColorStop(1, `rgba(${darken(p.rgb[0],0.15)},${darken(p.rgb[1],0.15)},${darken(p.rgb[2],0.15)},1)`);
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Surface texture — noise-like banding for gas giants / rocky texture
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.clip();
        const bands = r > 8 ? 6 : 3; // more bands for larger planets
        for (let b = 0; b < bands; b++) {
          const by = sy - r + (2 * r * (b + 0.5)) / bands;
          const bandWidth = (2 * r) / bands;
          const variation = Math.sin(b * 2.7 + p.orbitRadius * 30) * 0.08;
          ctx.fillStyle = `rgba(${darken(p.rgb[0], 0.7)},${darken(p.rgb[1], 0.7)},${darken(p.rgb[2], 0.7)},${0.06 + Math.abs(variation)})`;
          ctx.fillRect(sx - r, by - bandWidth * 0.3, r * 2, bandWidth * 0.6);
        }
        ctx.restore();

        // Primary specular highlight — crisp, off-center
        const specGrad = ctx.createRadialGradient(
          sx - r * 0.35, sy - r * 0.35, 0,
          sx - r * 0.35, sy - r * 0.35, r * 0.55
        );
        specGrad.addColorStop(0, "rgba(255,255,255,0.65)");
        specGrad.addColorStop(0.3, "rgba(255,255,255,0.2)");
        specGrad.addColorStop(0.7, "rgba(255,255,255,0.03)");
        specGrad.addColorStop(1, "transparent");
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Secondary specular — tiny bright pinpoint
        const pinGrad = ctx.createRadialGradient(
          sx - r * 0.28, sy - r * 0.32, 0,
          sx - r * 0.28, sy - r * 0.32, r * 0.18
        );
        pinGrad.addColorStop(0, "rgba(255,255,255,0.8)");
        pinGrad.addColorStop(1, "transparent");
        ctx.fillStyle = pinGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Rim/fresnel light — thin bright edge catching sunlight
        ctx.lineWidth = r > 8 ? 1.2 : 0.8;
        const rimArc = ctx.createLinearGradient(sx - r, sy, sx + r, sy);
        rimArc.addColorStop(0, `rgba(${brighten(p.rgb[0],100)},${brighten(p.rgb[1],100)},${brighten(p.rgb[2],100)},0.35)`);
        rimArc.addColorStop(0.5, "transparent");
        rimArc.addColorStop(1, `rgba(${brighten(p.rgb[0],60)},${brighten(p.rgb[1],60)},${brighten(p.rgb[2],60)},0.12)`);
        ctx.strokeStyle = rimArc;
        ctx.beginPath();
        ctx.arc(sx, sy, r - 0.5, -Math.PI * 0.7, Math.PI * 0.3);
        ctx.stroke();

        // Terminator shadow overlay — crescent darkness on right side
        const termGrad = ctx.createLinearGradient(sx - r * 0.3, sy, sx + r * 1.2, sy);
        termGrad.addColorStop(0, "transparent");
        termGrad.addColorStop(0.5, "transparent");
        termGrad.addColorStop(0.85, "rgba(0,0,0,0.3)");
        termGrad.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = termGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
};
