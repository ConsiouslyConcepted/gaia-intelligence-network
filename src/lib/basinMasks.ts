import * as THREE from "three";

export type Surface = "ocean" | "land" | "any";

export interface RegionDef {
  id: string;
  /** rectangular regions in [latMin, latMax, lngMin, lngMax]; multiple boxes support antimeridian-crossing regions */
  boxes: [number, number, number, number][];
  /** which surface to paint inside the bounds */
  surface: Surface;
}

// ─── Legacy hydrosphere bounds (kept for backwards compat) ───
export interface BasinBounds {
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

/** Return basin id whose bounds contain the given lat/lng, or null. */
export function basinAtLatLng(lat: number, lng: number): string | null {
  const order = ["arctic", "southern", "atlantic", "indian", "pacific"];
  for (const id of order) {
    const b = BASIN_BOUNDS[id];
    if (!b) continue;
    for (const [latMin, latMax, lngMin, lngMax] of b.boxes) {
      if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
        return id;
      }
    }
  }
  return null;
}

/** Generic: find region id whose boxes contain lat/lng. First match wins (caller controls priority). */
export function regionAtLatLng(regions: RegionDef[], lat: number, lng: number): string | null {
  for (const r of regions) {
    for (const [latMin, latMax, lngMin, lngMax] of r.boxes) {
      if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
        return r.id;
      }
    }
  }
  return null;
}

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

/**
 * Build BOTH a fill texture and an edge-glow texture for a region.
 * Fill = the painted area inside the bounds (gated by surface).
 * Edge = bright outline tracing the boundary between "inside" and "outside" pixels
 *        (this naturally follows coastlines for ocean/land surface filters).
 */
export function buildRegionMaskTexture(
  boxes: [number, number, number, number][],
  color: string,
  surface: Surface = "any",
): { texture: THREE.CanvasTexture; edgeTexture: THREE.CanvasTexture; ready: Promise<void> } {
  const fillCanvas = document.createElement("canvas");
  fillCanvas.width = MASK_W; fillCanvas.height = MASK_H;
  const fillCtx = fillCanvas.getContext("2d")!;
  fillCtx.clearRect(0, 0, MASK_W, MASK_H);

  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = MASK_W; edgeCanvas.height = MASK_H;
  const edgeCtx = edgeCanvas.getContext("2d")!;
  edgeCtx.clearRect(0, 0, MASK_W, MASK_H);

  const texture = new THREE.CanvasTexture(fillCanvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const edgeTexture = new THREE.CanvasTexture(edgeCanvas);
  edgeTexture.minFilter = THREE.LinearFilter;
  edgeTexture.magFilter = THREE.LinearFilter;

  const rgb = hexToRgb(color);

  const ready = (async () => {
    if (!boxes || boxes.length === 0) return;
    let oceanMask: Float32Array | null = null;
    if (surface !== "any") {
      try {
        oceanMask = await loadOceanMask();
      } catch {
        return;
      }
    }

    // First pass: scalar inside-mask in [0..1]
    const inside = new Float32Array(MASK_W * MASK_H);
    const fillImg = fillCtx.createImageData(MASK_W, MASK_H);
    const fillData = fillImg.data;

    for (let y = 0; y < MASK_H; y++) {
      const lat = 90 - (y / MASK_H) * 180;
      for (let x = 0; x < MASK_W; x++) {
        const lng = (x / MASK_W) * 360 - 180;

        let best = -Infinity;
        for (const [latMin, latMax, lngMin, lngMax] of boxes) {
          const dLat = Math.min(lat - latMin, latMax - lat);
          const dLng = Math.min(lng - lngMin, lngMax - lng);
          const d = Math.min(dLat, dLng);
          if (d > best) best = d;
        }

        let regionAlpha = 0;
        if (best >= 0) regionAlpha = 1;
        else if (best > -6) regionAlpha = (6 + best) / 6;
        if (regionAlpha <= 0) continue;

        const idx = y * MASK_W + x;
        let surfaceMul = 1;
        if (oceanMask) {
          const ocean = oceanMask[idx];
          if (surface === "ocean") {
            if (ocean <= 0) continue;
            surfaceMul = ocean;
          } else if (surface === "land") {
            if (ocean > 0) continue;
            surfaceMul = 1 - ocean;
          }
        }

        const v = regionAlpha * surfaceMul;
        inside[idx] = v;

        const i = idx * 4;
        fillData[i] = rgb.r;
        fillData[i + 1] = rgb.g;
        fillData[i + 2] = rgb.b;
        fillData[i + 3] = Math.round(v * 235);
      }
    }

    // Second pass: edge = strong inside next to a weak/zero neighbor (traces coastline + region boundary)
    const edgeImg = edgeCtx.createImageData(MASK_W, MASK_H);
    const edgeData = edgeImg.data;
    const W = MASK_W, H = MASK_H;
    const offsets = [-1, 1, -W, W, -W - 1, -W + 1, W - 1, W + 1];

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        const v = inside[idx];
        if (v < 0.25) continue;
        let minN = 1;
        for (const o of offsets) {
          const n = inside[idx + o];
          if (n < minN) minN = n;
        }
        const diff = v - minN;
        if (diff < 0.25) continue;
        const e = Math.min(1, diff * 1.6);
        const i = idx * 4;
        edgeData[i] = Math.min(255, rgb.r + 70);
        edgeData[i + 1] = Math.min(255, rgb.g + 70);
        edgeData[i + 2] = Math.min(255, rgb.b + 70);
        edgeData[i + 3] = Math.round(e * 255);
      }
    }

    fillCtx.putImageData(fillImg, 0, 0);
    edgeCtx.putImageData(edgeImg, 0, 0);
    texture.needsUpdate = true;
    edgeTexture.needsUpdate = true;
  })();

  return { texture, edgeTexture, ready };
}

/** Backwards-compat wrapper for hydrosphere basins. */
export function buildBasinMaskTexture(basinId: string, color: string) {
  const bounds = BASIN_BOUNDS[basinId];
  return buildRegionMaskTexture(bounds?.boxes ?? [], color, "ocean");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
