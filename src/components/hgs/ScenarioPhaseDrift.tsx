import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Eye } from "lucide-react";

const scenarios = [
  { name: "Stable Convergence", color: "#00ffff" },
  { name: "Saturation Spiral", color: "#ff8800" },
  { name: "Oscillatory Drift", color: "#ff00ff" },
];

export const ScenarioPhaseDrift = () => {
  const canvasRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];

  useEffect(() => {
    const animations: number[] = [];

    canvasRefs.forEach((ref, idx) => {
      const canvas = ref.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 80;

      let time = 0;

      const animate = () => {
        time += 0.03;
        ctx.fillStyle = "rgba(10, 15, 25, 0.2)";
        ctx.fillRect(0, 0, 100, 80);

        const centerX = 50;
        const centerY = 40;
        const color = scenarios[idx].color;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        if (idx === 0) {
          // Stable convergence - shrinking spiral
          for (let t = 0; t < Math.PI * 6; t += 0.1) {
            const r = 25 - t * 1.2 + Math.sin(time) * 2;
            if (r > 0) {
              const x = centerX + Math.cos(t + time) * r;
              const y = centerY + Math.sin(t + time) * r;
              if (t === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          }
        } else if (idx === 1) {
          // Saturation spiral - expanding
          for (let t = 0; t < Math.PI * 4; t += 0.1) {
            const r = 5 + t * 4 + Math.sin(time * 2) * 3;
            const x = centerX + Math.cos(t - time * 0.5) * Math.min(r, 30);
            const y = centerY + Math.sin(t - time * 0.5) * Math.min(r, 30);
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else {
          // Oscillatory drift - figure 8
          for (let t = 0; t < Math.PI * 2; t += 0.1) {
            const x = centerX + Math.sin(t * 2 + time) * 25;
            const y = centerY + Math.sin(t + time * 0.7) * 20;
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Add glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        animations[idx] = requestAnimationFrame(animate);
      };

      animate();
    });

    return () => animations.forEach(cancelAnimationFrame);
  }, []);

  return (
    <Card className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Scenario & Phase Drift Viewer</span>
        </div>
      </div>

      <div className="flex gap-2">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="flex-1 text-center space-y-1">
            <canvas
              ref={canvasRefs[idx]}
              className="w-full h-16 rounded-lg bg-background/50"
            />
            <span className="text-[10px] text-muted-foreground block">{scenario.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
