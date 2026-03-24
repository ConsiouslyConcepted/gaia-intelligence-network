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

      // Planet bodies
      for (const p of planetData) {
        const angle = time * p.speed * 6 + p.orbitRadius * 20;
        const sx = cx + Math.cos(angle) * p.orbitRadius * scale;
        const sy = cy + Math.sin(angle) * p.orbitRadius * scale;

        // Glow
        for (let gr = Math.floor(p.size * 3); gr > 0; gr--) {
          const gt = gr / (p.size * 3);
          ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${0.006 + (1 - gt) * 0.06})`;
          ctx.beginPath();
          ctx.arc(sx, sy, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Body
        ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.95)`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.arc(sx - p.size * 0.2, sy + p.size * 0.2, p.size * 0.25, 0, Math.PI * 2);
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
