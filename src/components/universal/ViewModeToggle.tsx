import { Orbit, Sparkles } from "lucide-react";

export type UniversalViewMode = "harmonic" | "living";

export const ViewModeToggle = ({
  mode,
  onChange,
}: {
  mode: UniversalViewMode;
  onChange: (m: UniversalViewMode) => void;
}) => {
  const Btn = ({ value, label, Icon }: { value: UniversalViewMode; label: string; Icon: typeof Orbit }) => {
    const active = mode === value;
    return (
      <button
        onClick={() => onChange(value)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
        style={
          active
            ? {
                background: "linear-gradient(180deg, hsla(0,0%,100%,0.10) 0%, hsla(0,0%,100%,0.04) 100%)",
                color: "hsla(0,0%,100%,0.95)",
                border: "1px solid hsla(0,0%,100%,0.14)",
                boxShadow:
                  "inset 0 1px 0 hsla(0,0%,100%,0.12), 0 4px 14px rgba(0,0,0,0.45), 0 0 20px hsla(38,40%,60%,0.08)",
              }
            : { color: "hsla(0,0%,100%,0.45)", border: "1px solid transparent" }
        }
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    );
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div
        className="flex gap-1.5 rounded-2xl p-1.5 backdrop-blur-2xl"
        style={{
          background: "hsla(240,25%,8%,0.78)",
          boxShadow:
            "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.03), 0 12px 36px rgba(0,0,0,0.6)",
          border: "1px solid hsla(0,0%,100%,0.08)",
        }}
      >
        <Btn value="harmonic" label="Harmonic 2D" Icon={Sparkles} />
        <Btn value="living" label="Living 3D" Icon={Orbit} />
      </div>
    </div>
  );
};
