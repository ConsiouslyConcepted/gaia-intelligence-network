import { useEffect, useRef } from "react";
import { SPHERE_ARRAY } from "@/types/spheres";

/**
 * Full-screen canvas visualization of planetary harmonic resonance.
 * Shows concentric orbital rings, sphere bodies, and dense harmonic thread webs
 * representing gravitational/resonance relationships between spheres.
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

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Precompute star positions
    const stars: Array<{ x: number; y: number; s: number; b: number }> = [];
    for (let i = 0; i < 600; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 1.2 + 0.2,
        b: Math.random() * 0.4 + 0.08,
      });
    }

    // Precompute thread endpoints (normalized to max_r=1)
    const threadSets = [
      { color: [200, 50, 50], count: 400, maxR: 1.0, alpha: 0.14 },
      { color: [50, 180, 80], count: 280, maxR: 0.9, alpha: 0.11 },
      { color: [70, 70, 200], count: 180, maxR: 0.85, alpha: 0.09 },
      { color: [200, 160, 30], count: 120, maxR: 0.75, alpha: 0.07 },
      { color: [180, 60, 180], count: 80, maxR: 0.65, alpha: 0.06 },
    ];

    const preThreads = threadSets.map((set) => {
      const threads: Array<{ a1: number; r1: number; a2: number; r2: number; a: number }> = [];
      for (let i = 0; i < set.count; i++) {
        threads.push({
          a1: Math.random() * Math.PI * 2,
          r1: Math.random() * set.maxR * 0.92 + set.maxR * 0.08,
          a2: Math.random() * Math.PI * 2,
          r2: Math.random() * set.maxR * 0.92 + set.maxR * 0.08,
          a: Math.random() * set.alpha * 0.6 + set.alpha * 0.4,
        });
      }
      return { ...set, threads };
    });

    // Sphere orbital data
    const orbitRadii = [0.17, 0.27, 0.38, 0.49, 0.6, 0.73, 0.88];
    const sphereAngles = SPHERE_ARRAY.map((_, i) => {
      // Golden angle spacing for aesthetic distribution
      return (i * Math.PI * 2 * 0.618033988749895) % (Math.PI * 2);
    });
    const sphereSizes = [8, 7, 9, 7, 6, 8, 7];

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const animate = () => {
      time += 0.003;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.42;
      const cy = h * 0.5;
      const maxOrbitPx = Math.min(w, h) * 0.46;

      // Clear
      ctx.fillStyle = "rgb(5, 5, 16)";
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const star of stars) {
        const twinkle = star.b + Math.sin(time * 3 + star.x * 100) * 0.05;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Harmonic thread web
      for (const set of preThreads) {
        for (const t of set.threads) {
          // Slowly rotate threads
          const drift = time * 0.15;
          const x1 = cx + Math.cos(t.a1 + drift) * t.r1 * maxOrbitPx;
          const y1 = cy + Math.sin(t.a1 + drift) * t.r1 * maxOrbitPx;
          const x2 = cx + Math.cos(t.a2 + drift * 0.7) * t.r2 * maxOrbitPx;
          const y2 = cy + Math.sin(t.a2 + drift * 0.7) * t.r2 * maxOrbitPx;
          ctx.strokeStyle = `rgba(${set.color[0]},${set.color[1]},${set.color[2]},${t.a})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Orbital rings
      for (const r of orbitRadii) {
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, r * maxOrbitPx, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central glow
      for (let gr = 55; gr > 0; gr--) {
        const t = gr / 55;
        ctx.fillStyle = `rgba(255,${Math.floor(140 + (1 - t) * 100)},${Math.floor((1 - t) * 30)},${0.01 + (1 - t) * 0.12})`;
        ctx.beginPath();
        ctx.arc(cx, cy, gr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,245,230,0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Sphere bodies orbiting slowly
      SPHERE_ARRAY.forEach((sphere, i) => {
        const angle = sphereAngles[i] + time * (0.3 + i * 0.05);
        const r = orbitRadii[i] * maxOrbitPx;
        const sx = cx + Math.cos(angle) * r;
        const sy = cy + Math.sin(angle) * r;
        const size = sphereSizes[i];
        const [cr, cg, cb] = hexToRgb(sphere.color);

        // Glow
        for (let gr = size * 4; gr > 0; gr--) {
          const t = gr / (size * 4);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.01 + (1 - t) * 0.08})`;
          ctx.beginPath();
          ctx.arc(sx, sy, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Body
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.95)`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(sx - size * 0.2, sy + size * 0.2, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

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
