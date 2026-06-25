import safeLocation from "@/assets/a-safe-location.jpg.asset.json";

/**
 * Cosmic Address — National Geographic "A Safe Location" plate.
 * Static reference image for now.
 */
export default function CosmicAddress3D() {
  return (
    <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden bg-black">
      <img
        src={safeLocation.url}
        alt="A Safe Location — the Milky Way, showing the Solar System's position on the Orion Spur"
        className="max-w-full max-h-full w-auto h-auto object-contain"
      />
    </div>
  );
}
