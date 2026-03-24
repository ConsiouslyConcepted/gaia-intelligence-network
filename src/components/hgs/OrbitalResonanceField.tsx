import { useEffect, useRef } from "react";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";

interface OrbitalResonanceFieldProps {
  selectedPlanet?: string | null;
}

/**
 * Cymatic orbital resonance visualization of our solar system.
 * When selectedPlanet is set, only resonance pairs involving that planet are shown.
 */
export const OrbitalResonanceField = ({ selectedPlanet }: OrbitalResonanceFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef<string | null>(null);

  // Keep ref in sync so the animation loop reads the latest value
  useEffect(() => {
    selectedRef.current = selectedPlanet ?? null;
  }, [selectedPlanet]);

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

    // Preload planet images
    const planetImages: Record<string, HTMLImageElement> = {};

    SOLAR_PLANETS.forEach((p) => {
      const img = new Image();
      img.src = p.image;
      planetImages[p.id] = img;
    });

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
        planet1Id: p1.id,
        planet2Id: p2.id,
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
      time += 0.003;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.45;
      const cy = h * 0.5;
      const scale = Math.min(w, h) * 0.48;
      const sel = selectedRef.current;

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
      const globalRotation = time * 0.15;
      const cos = Math.cos(globalRotation);
      const sin = Math.sin(globalRotation);

      // Breathing pulse for life-like feel
      const pulse = 0.7 + Math.sin(time * 1.2) * 0.3;
      const waveSweep = time * 2.5;

      for (const pp of pairPatterns) {
        const involved = !sel || pp.planet1Id === sel || pp.planet2Id === sel;
        if (!involved) continue;

        const mr = (pp.rgb1[0] + pp.rgb2[0]) / 2;
        const mg = (pp.rgb1[1] + pp.rgb2[1]) / 2;
        const mb = (pp.rgb1[2] + pp.rgb2[2]) / 2;

        const alphaBoost = sel ? 2.2 : 1.0;

        ctx.lineWidth = sel ? 0.6 : 0.35;
        const skip = sel ? 2 : 3;

        // Animate a visible "window" that sweeps through the pattern
        const totalPts = pp.points.length;
        const windowSize = totalPts * 0.7;
        const sweepPos = ((waveSweep * 0.3 + pp.a * 0.5) % 1.0) * totalPts;

        for (let s = 0; s < totalPts; s += skip) {
          const p = pp.points[s];
          const x1 = cx + (p.x1 * cos - p.y1 * sin) * scale;
          const y1 = cy + (p.x1 * sin + p.y1 * cos) * scale;
          const x2 = cx + (p.x2 * cos - p.y2 * sin) * scale;
          const y2 = cy + (p.x2 * sin + p.y2 * cos) * scale;

          // Distance from sweep position for traveling wave effect
          let dist = Math.abs(s - sweepPos);
          if (dist > totalPts / 2) dist = totalPts - dist;
          const waveFactor = Math.max(0, 1 - dist / (windowSize * 0.5));
          const waveAlpha = waveFactor * waveFactor;

          // Combine static base + animated wave + breathing pulse
          const baseAlpha = sel ? 0.09 : 0.05;
          const variation = Math.sin(s * 0.008) * 0.02;
          const dynamicAlpha = baseAlpha + variation + waveAlpha * 0.08 * pulse;
          const alpha = dynamicAlpha * alphaBoost;

          // Shift color slightly along the wave
          const colorShift = waveAlpha * 40;
          const cr = Math.min(255, mr + colorShift);
          const cg = Math.min(255, mg + colorShift * 0.5);

          ctx.strokeStyle = `rgba(${cr},${cg},${mb},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Orbital rings — hide non-relevant when a planet is selected
      for (const p of planetData) {
        if (sel && p.id !== sel) continue;
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
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

      // Planet bodies — only show selected (or all if none selected)
      for (const p of planetData) {
        if (sel && p.id !== sel) continue;

        const angle = time * p.speed * 6 + p.orbitRadius * 20;
        const sx = cx + Math.cos(angle) * p.orbitRadius * scale;
        const sy = cy + Math.sin(angle) * p.orbitRadius * scale;
        const r = p.size;
        const drawSize = r * (sel ? 3.0 : 2.5);

        // Soft glow behind planet
        const glowGrad = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 3.5);
        glowGrad.addColorStop(0, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.2)`);
        glowGrad.addColorStop(0.5, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.05)`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        const img = planetImages[p.id];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, sx - drawSize, sy - drawSize, drawSize * 2, drawSize * 2);
        } else {
          ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0.9)`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
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
