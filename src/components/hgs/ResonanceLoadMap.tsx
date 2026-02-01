import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";
import { Radio } from "lucide-react";

const statusItems = [
  { label: "Capacity Stress Emerging", badge: "Exchange Pacing Sensitive", badgeColor: "bg-coherence-medium/20 text-coherence-medium" },
  { label: "Latent Capacity Available", badge: "Hrs 3-9 dB", badgeColor: "bg-primary/20 text-primary" },
  { label: "Interference Pattern Forming", badge: "Readiness revves in 1.5 hrs", badgeColor: "bg-muted/20 text-muted-foreground" },
];

export const ResonanceLoadMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Create nodes
    const nodes: Array<{ x: number; y: number; size: number; color: string; pulse: number }> = [];
    for (let i = 0; i < 25; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 4 + 2,
        color: ["#00ffff", "#ff00ff", "#ffff00", "#00ff88"][Math.floor(Math.random() * 4)],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    let animationId: number;

    const animate = () => {
      time += 0.02;

      ctx.fillStyle = "rgba(10, 15, 25, 0.1)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw connections
      ctx.strokeStyle = "rgba(100, 150, 255, 0.15)";
      ctx.lineWidth = 0.5;
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((other) => {
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pulseSize = node.size + Math.sin(time * 2 + node.pulse) * 1.5;

        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize * 4);
        gradient.addColorStop(0, node.color + "40");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated wave rings
      for (let ring = 0; ring < 3; ring++) {
        const radius = ((time * 30 + ring * 40) % 150);
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 - radius / 500})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(canvas.offsetWidth / 2, canvas.offsetHeight / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <Card className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold">Resonance & Load Map</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[140px] rounded-lg"
      />

      <div className="space-y-2 text-xs">
        {statusItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">{item.label}</span>
            <Badge variant="outline" className={`text-[10px] ${item.badgeColor}`}>
              {item.badge}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
