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
  atlantic: { boxes: [[-60, 70, -75, 20]] },
  indian: { boxes: [[-60, 30, 20, 120]] },
  southern: { boxes: [[-90, -55, -180, 180]] },
  arctic: { boxes: [[66, 90, -180, 180]] },
};

const MASK_W = 2048;
const MASK_H = 1024;
const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";

/** Cached ocean mask: 1 = ocean, 0 = land. */
let oceanMaskPromise: Promise<Float32Array> | null = null;

function loadOceanMask(): Promise<Float32Array> {
  if (oceanMaskPromise) return oceanMaskPromise;
  oceanMaskPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = MASK_W;
      canvas.height = MASK_H;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, MASK_W, MASK_H);
      const { data } = ctx.getImageData(0, 0, MASK_W, MASK_H);
      const mask = new Float32Array(MASK_W * MASK_H);
      // Blue Marble: ocean pixels are blue-dominant + relatively dark.
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const lum = (r + g + b) / 3;
        const blueness = b - (r + g) / 2;
        mask[j] = blueness > 6 && lum < 130 ? 1 : 0;
      }
      resolve(mask);
    };
    img.onerror = () => reject(new Error("ocean mask load failed"));
    img.src = EARTH_TEX;
  });
  return oceanMaskPromise;
}

/** Build an equirectangular RGBA texture that lights up only the ocean pixels inside the basin. */
export function buildBasinMaskTexture(
  basinId: string,
  color: string,
): { texture: THREE.CanvasTexture; ready: Promise<void> } {
  const bounds = BASIN_BOUNDS[basinId];
  const canvas = document.createElement("canvas");
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, MASK_W, MASK_H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const rgb = hexToRgb(color);

  const ready = (async () => {
    if (!bounds) return;
    let oceanMask: Float32Array;
    try {
      oceanMask = await loadOceanMask();
    } catch {
      return;
    }

    const img = ctx.createImageData(MASK_W, MASK_H);
    const data = img.data;

    for (let y = 0; y < MASK_H; y++) {
      const lat = 90 - (y / MASK_H) * 180;
      for (let x = 0; x < MASK_W; x++) {
        const lng = (x / MASK_W) * 360 - 180;

        // Signed distance to nearest box (positive inside, negative outside; degrees).
        let best = -Infinity;
        for (const [latMin, latMax, lngMin, lngMax] of bounds.boxes) {
          const dLat = Math.min(lat - latMin, latMax - lat);
          const dLng = Math.min(lng - lngMin, lngMax - lng);
          const d = Math.min(dLat, dLng);
          if (d > best) best = d;
        }

        // Bounds gating: full inside, soft 6° feather outside
        let regionAlpha = 0;
        if (best >= 0) regionAlpha = 1;
        else if (best > -6) regionAlpha = (6 + best) / 6;
        if (regionAlpha <= 0) continue;

        const idx = y * MASK_W + x;
        const ocean = oceanMask[idx];
        if (ocean <= 0) continue;

        const i = idx * 4;
        const alpha = Math.round(ocean * regionAlpha * 235);
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
        data[i + 3] = alpha;
      }
    }

    ctx.putImageData(img, 0, 0);
    texture.needsUpdate = true;
  })();

  return { texture, ready };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
