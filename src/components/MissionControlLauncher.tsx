import { useLocation, useNavigate } from "react-router-dom";
import { Radar } from "lucide-react";

export default function MissionControlLauncher() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname.startsWith("/mission-control")) return null;

  return (
    <button
      onClick={() => navigate("/mission-control")}
      className="fixed bottom-5 right-[230px] z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full transition-all hover:scale-[1.03]"
      style={{
        background: "linear-gradient(145deg, hsla(225,45%,11%,0.95), hsla(228,55%,5%,0.95))",
        border: "1.5px solid hsla(220,35%,60%,0.55)",
        boxShadow:
          "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,75%,62%,0.32), 0 8px 24px rgba(0,0,0,0.55)",
        color: "hsla(0,0%,100%,0.92)",
      }}
      aria-label="Open Mission Control"
    >
      <Radar className="w-4 h-4" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Mission Control</span>
    </button>
  );
}
