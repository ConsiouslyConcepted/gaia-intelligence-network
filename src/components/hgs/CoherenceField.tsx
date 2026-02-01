import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

const stateLabels = ["Stable", "Strained", "Saturated", "Regenerative"];

export const CoherenceField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeState, setActiveState] = useState(2); // Saturated selected
  const coherenceIndex = 82.6;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    }> = [];

    const colors = [
      "rgba(0, 255, 255, 0.8)",
      "rgba(100, 200, 255, 0.6)",
      "rgba(150, 100, 255, 0.5)",
      "rgba(255, 200, 100, 0.4)",
      "rgba(100, 255, 150, 0.5)",
    ];

    // Initialize particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random(),
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.fillStyle = "rgba(10, 15, 30, 0.1)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw flowing wave lines
      for (let wave = 0; wave < 5; wave++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${50 + wave * 40}, ${200 - wave * 20}, 255, ${0.15 - wave * 0.02})`;
        ctx.lineWidth = 1;

        for (let x = 0; x < canvas.offsetWidth; x += 5) {
          const y =
            canvas.offsetHeight / 2 +
            Math.sin(x * 0.01 + time + wave) * 30 +
            Math.sin(x * 0.02 + time * 1.5) * 20 +
            wave * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.3;
        p.y += p.vy;
        p.life += 0.005;

        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        const alpha = Math.sin(p.life * Math.PI) * 0.8;
        ctx.beginPath();
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, p.color.replace(/[\d.]+\)$/, `${alpha * 0.3})`));
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connection lines between nearby particles
      ctx.strokeStyle = "rgba(100, 200, 255, 0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <Card className="glass-panel p-0 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium">Coherence Field</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-4 text-xs">
        {stateLabels.map((label, idx) => (
          <button
            key={label}
            onClick={() => setActiveState(idx)}
            className={`transition-all ${
              idx === activeState
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-primary/60">Ed Research States</span>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[280px] bg-gradient-to-b from-background via-background/80 to-background"
      />

      {/* Bottom coherence bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Coherence Index</span>
          <span className="text-sm font-bold text-primary">{coherenceIndex}</span>
        </div>
        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
            style={{ width: `${coherenceIndex}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
