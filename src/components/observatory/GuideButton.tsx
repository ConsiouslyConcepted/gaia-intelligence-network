import { Telescope } from "lucide-react";

/**
 * Small chat-bubble launcher placed in dashboard top HUDs next to the Commons icon.
 * Dispatches a global event picked up by ObservatoryGuide to open the assistant drawer.
 */
export function GuideButton({ size = 18 }: { size?: number }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("observatory-guide:open"))}
      className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:bg-foreground/[0.06]"
      style={{
        color: "hsla(0,0%,100%,0.75)",
        border: "1px solid hsla(220,30%,55%,0.35)",
        background: "hsla(240,25%,8%,0.5)",
        boxShadow:
          "inset 0 1px 0 hsla(200,60%,78%,0.18), inset 0 0 6px hsla(210,50%,60%,0.08), 0 0 14px -4px hsla(210,60%,65%,0.2)",
      }}
      title="Observatory Guide"
      aria-label="Open Observatory Guide"
    >
      <Telescope size={size} strokeWidth={1.7} />
    </button>
  );
}
