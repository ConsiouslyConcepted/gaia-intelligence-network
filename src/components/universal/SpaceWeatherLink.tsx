import { ArrowUpRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SpaceWeatherLink = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/sphere/magnetosphere")}
      className="absolute bottom-6 right-[284px] z-10 pointer-events-auto rounded-xl backdrop-blur-2xl px-4 py-3 text-left transition-all duration-300 hover:scale-[1.02]"
      style={{
        background:
          "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 100%)",
        border: "1px solid hsla(0,0%,100%,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        width: 220,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/55 flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Space Weather
        </span>
        <ArrowUpRight className="w-3.5 h-3.5 text-foreground/55" />
      </div>
      <div className="text-[12px] font-semibold text-foreground/85">Solar Flares · CMEs</div>
      <div className="text-[9px] tracking-wider text-muted-foreground/45 mt-0.5">
        View in Magnetosphere
      </div>
    </button>
  );
};
