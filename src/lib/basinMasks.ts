import * as THREE from "three";

export interface BasinBounds {
  /** rectangular regions in [latMin, latMax, lngMin, lngMax]; multiple boxes support antimeridian-crossing basins */
  boxes: [number, number, number, number][];
}

export const BASIN_BOUNDS: Record<string, BasinBounds> = {
  pacific: {
    boxes: [
      [-60, 65, -180, -70],
      [-60, 65, 120, 180],
    ],
  },
  atlantic: {
    boxes: [[-60, 70, -75, 20]],
  },
  indian: {
    boxes: [[-60, 30, 20, 120]],
  },
  southern: {
    boxes: [[-90, -55, -180, 180]],
  },
  arctic: {
    boxes: [[66, 90, -180, 180]],
  },
};

/**
 * Build a soft equirectangular alpha mask for a basin and return it as a THREE texture.
 * The canvas is W×H; for each pixel we compute lat/lng and a soft-falloff distance to the
 * nearest box. The mask is then tinted with `color` on render via material.color.
 */
export function buildBasinMaskTexture(
  basinId: string,
  color: string,
  width = 1024,
  height = 512,
): THREE.Texture {
  const bounds = BASIN_BOUNDS[basinId];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(width, height);
  const data = img.data;

  const rgb = hexToRgb(color);

  if (bounds) {
    for (let y = 0; y < height; y++) {
      const lat = 90 - (y / height) * 180;
      for (let x = 0; x < width; x++) {
        const lng = (x / width) * 360 - 180;
        // distance "inside" the nearest box: positive inside, negative outside (degrees)
        let best = -Infinity;
        for (const [latMin, latMax, lngMin, lngMax] of bounds.boxes) {
          const dLat = Math.min(lat - latMin, latMax - lat);
          const dLng = Math.min(lng - lngMin, lngMax - lng);
          const d = Math.min(dLat, dLng);
          if (d > best) best = d;
        }
        // Soft falloff: inside → full, outside → fades over ~10°
        let alpha = 0;
        if (best >= 0) {
          // strong inside, slightly softer near edges (within 8°)
          const edgeSoft = Math.min(1, best / 8);
          alpha = 0.55 + edgeSoft * 0.45;
        } else if (best > -10) {
          alpha = (10 + best) / 10 * 0.4;
        }
        const i = (y * width + x) * 4;
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
        data[i + 3] = Math.round(alpha * 255);
      }
    }
  }

  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
