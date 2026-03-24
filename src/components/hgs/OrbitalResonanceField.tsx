import { useEffect, useRef } from "react";
import { SPHERE_ARRAY } from "@/types/spheres";

/**
 * Cymatic orbital resonance visualization.
 * Draws real geometric patterns created by plotting lines between
 * orbiting sphere positions over time — like the Dance of Venus pentagram
 * or the TRAPPIST-1 resonance chain visualizations.
 *
 * Each adjacent sphere pair produces a unique rose/spirograph pattern
 * based on their harmonic ratio, layered together into a dense web.
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

    const hexToRgb = (hex: string): [number, number, number] => {
      return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ];
    };

    // Orbital config — radii normalized 0-1, speeds as angular velocities
    // Speed ratios encode the harmonic relationships (like 5:8 for Venus-Earth)
    const spheres = SPHERE_ARRAY.map((s, i) => ({
      ...s,
      orbitRadius: 0.14 + i * 0.12,
      // Each sphere orbits at a speed related to harmonic ratios
      // Outer = slower, inner = faster (Kepler's third law inspired)
      speed: 1.0 / (1 + i * 0.618),
      size: 7 - i * 0.4,
      rgb: hexToRgb(s.color),
    }));

    // Resonance pairs — adjacent spheres whose orbital dance creates geometry
    const pairs = [
      { i: 0, j: 1, ratio: "3:2", steps: 3000 },
      { i: 1, j: 2, ratio: "5:3", steps: 3000 },
      { i: 2, j: 3, ratio: "4:3", steps: 3000 },
      { i: 3, j: 4, ratio: "5:4", steps: 3000 },
      { i: 4, j: 5, ratio: "8:5", steps: 4000 },
    ];

    // Stars
    const stars: Array<{ x: number; y: number; s: number; b: number }> = [];
    for (let k = 0; k < 500; k++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 1.0 + 0.2,
        b: Math.random() * 0.35 + 0.06,
      });
    }

    // Precompute the cymatic thread patterns (static geometry, rotated over time)
    // For each pair, we compute positions of both spheres at many time steps
    // and draw lines between them — this creates the resonance rose patterns
    const precomputePattern = (
      r1: number,
      speed1: number,
      r2: number,
      speed2: number,
      steps: number
    ) => {
      const points: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const totalAngle = Math.PI * 2 * Math.max(
        Math.ceil(speed1 / gcd(speed1, speed2)),
        8
      );
      for (let s = 0; s < steps; s++) {
        const t = (s / steps) * totalAngle;
        points.push({
          x1: Math.cos(t * speed1) * r1,
          y1: Math.sin(t * speed1) * r1,
          x2: Math.cos(t * speed2) * r2,
          y2: Math.sin(t * speed2) * r2,
        });
      }
      return points;
    };

    const gcd = (a: number, b: number): number => {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b > 0.001) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a;
    };

    // Precompute all pair patterns
    const pairPatterns = pairs.map((pair) => {
      const s1 = spheres[pair.i];
      const s2 = spheres[pair.j];
      return {
        ...pair,
        pattern: precomputePattern(
          s1.orbitRadius,
          s1.speed,
          s2.orbitRadius,
          s2.speed,
          pair.steps
        ),
        rgb1: s1.rgb,
        rgb2: s2.rgb,
      };
    });

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
      time += 0.002;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.45;
      const cy = h * 0.5;
      const scale = Math.min(w, h) * 0.48;

      // Clear to deep space
      ctx.fillStyle = "rgb(4, 4, 14)";
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const star of stars) {
        const twinkle = star.b + Math.sin(time * 4 + star.x * 80) * 0.04;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, twinkle)})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cymatic resonance patterns — the actual orbital geometry
      // These are lines connecting the positions of two orbiting bodies
      // at each time step, creating rose/spirograph patterns
      const globalRotation = time * 0.08;

      for (const pp of pairPatterns) {
        const mr = (pp.rgb1[0] + pp.rgb2[0]) / 2;
        const mg = (pp.rgb1[1] + pp.rgb2[1]) / 2;
        const mb = (pp.rgb1[2] + pp.rgb2[2]) / 2;

        // Draw every Nth line for performance, with slight alpha
        const skip = 3;
        ctx.lineWidth = 0.35;

        for (let s = 0; s < pp.pattern.length; s += skip) {
          const p = pp.pattern[s];

          // Apply global rotation
          const cos = Math.cos(globalRotation);
          const sin = Math.sin(globalRotation);

          const x1 = cx + (p.x1 * cos - p.y1 * sin) * scale;
          const y1 = cy + (p.x1 * sin + p.y1 * cos) * scale;
          const x2 = cx + (p.x2 * cos - p.y2 * sin) * scale;
          const y2 = cy + (p.x2 * sin + p.y2 * cos) * scale;

          // Alpha varies slightly for depth
          const alpha = 0.08 + Math.sin(s * 0.01) * 0.03;
          ctx.strokeStyle = `rgba(${mr},${mg},${mb},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Draw orbital rings (subtle)
      for (const s of spheres) {
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, s.orbitRadius * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central sun glow
      for (let gr = 50; gr > 0; gr--) {
        const t = gr / 50;
        ctx.fillStyle = `rgba(255,${Math.floor(150 + (1 - t) * 90)},${Math.floor((1 - t) * 40)},${0.008 + (1 - t) * 0.1})`;
        ctx.beginPath();
        ctx.arc(cx, cy, gr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,248,235,0.92)";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting sphere bodies (current positions)
      for (const s of spheres) {
        const angle = time * s.speed * 8 + s.orderIndex;
        const sx = cx + Math.cos(angle) * s.orbitRadius * scale;
        const sy = cy + Math.sin(angle) * s.orbitRadius * scale;
        const [cr, cg, cb] = s.rgb;

        // Glow
        for (let gr = Math.floor(s.size * 3.5); gr > 0; gr--) {
          const gt = gr / (s.size * 3.5);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.008 + (1 - gt) * 0.07})`;
          ctx.beginPath();
          ctx.arc(sx, sy, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Body
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.95)`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(sx - s.size * 0.2, sy + s.size * 0.2, s.size * 0.28, 0, Math.PI * 2);
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
