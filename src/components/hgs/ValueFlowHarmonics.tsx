import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";
import { RefreshCw, Zap, Shield, Activity } from "lucide-react";

const indicators = [
  { icon: RefreshCw, label: "Regenerative Loops Forming", color: "text-coherence-high" },
  { icon: Zap, label: "Phase Delay Detected", color: "text-coherence-medium" },
  { icon: Shield, label: "Value Integrity", value: "Stable", color: "text-coherence-high" },
  { icon: Activity, label: "Morlance", value: "Cooperation swift & timeless", color: "text-muted-foreground" },
];

export const ValueFlowHarmonics = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    let time = 0;
    let animationId: number;

    const domains = [
      { label: "Strategic", angle: -30, color: "rgba(0, 255, 255, 0.6)" },
      { label: "Operational", angle: 30, color: "rgba(100, 255, 150, 0.6)" },
      { label: "Relational", angle: 0, color: "rgba(255, 200, 100, 0.5)" },
    ];

    const animate = () => {
      time += 0.02;

      ctx.fillStyle = "rgba(10, 15, 25, 0.15)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;

      // Draw flowing curves for each domain
      domains.forEach((domain, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = domain.color;
        ctx.lineWidth = 2;

        for (let t = 0; t < Math.PI * 2; t += 0.05) {
          const r = 40 + Math.sin(t * 3 + time + idx) * 30 + idx * 20;
          const x = centerX + Math.cos(t + time * 0.3 + idx * 0.5) * r;
          const y = centerY + Math.sin(t + time * 0.3 + idx * 0.5) * r * 0.6;

          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Add glow
        ctx.shadowColor = domain.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw domain labels
      ctx.font = "11px system-ui";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText("Strategic", centerX + 60, centerY + 50);
      ctx.fillText("Operational", centerX + 40, centerY - 30);

      // Particles along paths
      for (let i = 0; i < 20; i++) {
        const t = (time + i * 0.3) % (Math.PI * 2);
        const r = 50 + Math.sin(t * 3 + time) * 30;
        const x = centerX + Math.cos(t + time * 0.3) * r;
        const y = centerY + Math.sin(t + time * 0.3) * r * 0.6;

        ctx.beginPath();
        ctx.fillStyle = `rgba(100, 255, 200, ${0.3 + Math.sin(time + i) * 0.3})`;
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
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
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Value Flow Harmonics</span>
        </div>
        <Badge variant="outline" className="text-xs bg-muted/20">CLASSIC</Badge>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[140px] rounded-lg"
      />

      <div className="grid grid-cols-2 gap-2 text-xs">
        {indicators.map((ind, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <ind.icon className={`w-3 h-3 ${ind.color}`} />
            <span className="text-muted-foreground">{ind.label}</span>
            {ind.value && <span className={ind.color}>{ind.value}</span>}
          </div>
        ))}
      </div>
    </Card>
  );
};
