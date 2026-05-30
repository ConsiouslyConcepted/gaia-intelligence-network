import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { SphereId } from "@/types/spheres";
import { QuakePoint } from "@/lib/liveOverlays";
import { buildRegionMaskTexture, regionAtLatLng, Surface, RegionDef } from "@/lib/basinMasks";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

const OVERLAY_SETTINGS: Record<string, { opacity: number; blending: THREE.Blending }> = {
  geosphere: { opacity: 0.7, blending: THREE.AdditiveBlending },
  hydrosphere: { opacity: 0.75, blending: THREE.AdditiveBlending },
  cryosphere: { opacity: 0.85, blending: THREE.AdditiveBlending },
  atmosphere: { opacity: 0.7, blending: THREE.AdditiveBlending },
  biosphere: { opacity: 0.7, blending: THREE.AdditiveBlending },
  noosphere: { opacity: 0.9, blending: THREE.AdditiveBlending },
  magnetosphere: { opacity: 0.8, blending: THREE.AdditiveBlending },
  ionosphere: { opacity: 0.65, blending: THREE.AdditiveBlending },
  crystalsphere: { opacity: 0.7, blending: THREE.AdditiveBlending },
};

const SPHERE_COLORS: Record<string, string> = {
  geosphere: "#cc5533",
  hydrosphere: "#2d7fb8",
  cryosphere: "#bcdfe8",
  atmosphere: "#a8c8dd",
  biosphere: "#7ecbcb",
  noosphere: "#d4a56a",
  magnetosphere: "#4466dd",
  ionosphere: "#4488cc",
  crystalsphere: "#e8c86a",
};

// ─── Base Earth mesh ───

function GlobeMesh({ onPickLatLng }: { onPickLatLng?: (lat: number, lng: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  // Track pointerdown screen pos so drags (orbit controls) don't fire as clicks
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const DRAG_THRESHOLD = 5; // px

  return (
    <mesh
      ref={meshRef}
      onPointerDown={onPickLatLng ? (e) => {
        downPos.current = { x: e.clientX, y: e.clientY };
      } : undefined}
      onPointerUp={onPickLatLng ? (e) => {
        const start = downPos.current;
        downPos.current = null;
        if (!start || !meshRef.current) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD) return; // it was a drag, ignore
        e.stopPropagation();
        const local = meshRef.current.worldToLocal(e.point.clone());
        const r = local.length();
        const lat = 90 - (Math.acos(local.y / r) * 180) / Math.PI;
        const lng = (Math.atan2(local.z, -local.x) * 180) / Math.PI - 180;
        const normLng = ((lng + 540) % 360) - 180;
        onPickLatLng(lat, normLng);
      } : undefined}
      onPointerOver={onPickLatLng ? () => { document.body.style.cursor = "pointer"; } : undefined}
      onPointerOut={onPickLatLng ? () => { document.body.style.cursor = "default"; } : undefined}
    >
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshPhongMaterial
        map={earthMap}
        bumpMap={bumpMap}
        bumpScale={0.03}
        specular={new THREE.Color("#334466")}
        shininess={8}
      />
    </mesh>
  );
}

// ─── Dynamic overlay sphere (loads texture from URL) ───

function DynamicOverlay({ sphereId, textureUrl }: { sphereId: SphereId; textureUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const settings = OVERLAY_SETTINGS[sphereId];

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      textureUrl,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);
      },
      undefined,
      () => setTexture(null)
    );

    return () => {
      if (texture) texture.dispose();
    };
  }, [textureUrl]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.805, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={settings.opacity}
        blending={settings.blending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Earthquake points (Geosphere) ───

function QuakePoints({ quakes }: { quakes: QuakePoint[] }) {
  const groupRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    return quakes.map((q) => {
      const phi = (90 - q.lat) * (Math.PI / 180);
      const theta = (q.lng + 180) * (Math.PI / 180);
      const r = 1.82;
      return {
        position: new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        ),
        size: Math.max(0.01, q.magnitude * 0.008),
        color: q.magnitude >= 5 ? "#ff3333" : q.magnitude >= 4 ? "#ff8833" : "#ffcc33",
      };
    });
  }, [quakes]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Atmosphere glow ───

function AtmosphereGlow({ color }: { color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[1.92, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Basin markers (clickable pins) ───

export interface BasinMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tint: string;
}

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function BasinMarkers({
  markers,
  selectedId,
  onSelect,
}: {
  markers: BasinMarker[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {markers.map((m) => {
        const pos = latLngToVec3(m.lat, m.lng, 1.86);
        const isSel = selectedId === m.id;
        return (
          <group key={m.id} position={pos}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelect(m.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "default";
              }}
            >
              <sphereGeometry args={[isSel ? 0.06 : 0.04, 16, 16]} />
              <meshBasicMaterial color={isSel ? "#e8f1f7" : "#b8cdd9"} transparent opacity={isSel ? 1 : 0.8} />
            </mesh>
            <mesh>
              <sphereGeometry args={[isSel ? 0.11 : 0.08, 16, 16]} />
              <meshBasicMaterial color={isSel ? "#cfe0ec" : "#8fa9b8"} transparent opacity={isSel ? 0.3 : 0.15} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Region highlight: layered fill + rim outline + traveling shimmer ───

/** Shader for a traveling shimmer band across the region using the fill mask. */
const shimmerVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const shimmerFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec4 m = texture2D(uMap, vUv);
    float mask = m.a;
    if (mask < 0.01) discard;
    // Diagonal traveling wave in lat/lng space
    float wave = sin((vUv.x * 14.0 + vUv.y * 4.0) - uTime * 1.8) * 0.5 + 0.5;
    // Sharpen into a soft band
    float band = smoothstep(0.55, 0.95, wave);
    float a = mask * (0.35 + band * 0.75) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

function hexToVec3(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function RegionHighlight({
  boxes,
  surface,
  color,
}: {
  boxes: [number, number, number, number][];
  surface: Surface;
  color: string;
}) {
  const fillRef = useRef<THREE.Mesh>(null);
  const rimRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const shimmerRef = useRef<THREE.Mesh>(null);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null);
  const rimMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const shimmerMat = useRef<THREE.ShaderMaterial>(null);

  const { texture, edgeTexture } = useMemo(
    () => buildRegionMaskTexture(boxes, color, surface),
    [boxes, color, surface],
  );
  useEffect(() => () => {
    texture.dispose();
    edgeTexture.dispose();
  }, [texture, edgeTexture]);

  const shimmerUniforms = useMemo(() => ({
    uMap: { value: texture },
    uTime: { value: 0 },
    uOpacity: { value: 0.9 },
    uColor: { value: hexToVec3(color) },
  }), [texture, color]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const rot = t * 0.08;
    if (fillRef.current) fillRef.current.rotation.y = rot;
    if (rimRef.current) rimRef.current.rotation.y = rot;
    if (haloRef.current) haloRef.current.rotation.y = rot;
    if (shimmerRef.current) shimmerRef.current.rotation.y = rot;

    // Phase-offset breathing for parallax depth
    const slow = 0.55 + Math.sin(t * 0.9) * 0.12;
    const med = 0.85 + Math.sin(t * 1.4 + 0.6) * 0.12;
    const fast = 0.9 + Math.sin(t * 2.1 + 1.2) * 0.08;

    if (fillMat.current) fillMat.current.opacity = slow * 0.55;
    if (rimMat.current) rimMat.current.opacity = fast * 1.15;
    if (haloMat.current) haloMat.current.opacity = slow * 0.32;
    if (shimmerMat.current) {
      shimmerMat.current.uniforms.uTime.value = t;
      shimmerMat.current.uniforms.uOpacity.value = med * 0.55;
    }
  });

  return (
    <group>
      {/* Soft fill — gentle wash inside the region */}
      <mesh ref={fillRef}>
        <sphereGeometry args={[1.811, 128, 128]} />
        <meshBasicMaterial
          ref={fillMat}
          map={texture}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Traveling shimmer band — gives the region a live, flowing feel */}
      <mesh ref={shimmerRef}>
        <sphereGeometry args={[1.814, 128, 128]} />
        <shaderMaterial
          ref={shimmerMat}
          vertexShader={shimmerVertex}
          fragmentShader={shimmerFragment}
          uniforms={shimmerUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Rim outline — traces the coastline/border, the most defining element */}
      <mesh ref={rimRef}>
        <sphereGeometry args={[1.818, 128, 128]} />
        <meshBasicMaterial
          ref={rimMat}
          map={edgeTexture}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Soft outer halo — atmospheric bloom hint */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.86, 128, 128]} />
        <meshBasicMaterial
          ref={haloMat}
          map={texture}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Crystalsphere overlays: planetary grid (icosahedral) or ley lines ───

const LEY_SITES: { name: string; lat: number; lng: number }[] = [
  { name: "Giza", lat: 29.9792, lng: 31.1342 },
  { name: "Stonehenge", lat: 51.1789, lng: -1.8262 },
  { name: "Nazca", lat: -14.739, lng: -75.13 },
  { name: "Easter Island", lat: -27.1127, lng: -109.3497 },
  { name: "Machu Picchu", lat: -13.1631, lng: -72.545 },
  { name: "Angkor Wat", lat: 13.4125, lng: 103.866 },
  { name: "Uluru", lat: -25.3444, lng: 131.0369 },
  { name: "Kailash", lat: 31.0672, lng: 81.3119 },
  { name: "Sedona", lat: 34.8697, lng: -111.761 },
  { name: "Lake Titicaca", lat: -15.7587, lng: -69.6512 },
  { name: "Mt Shasta", lat: 41.4099, lng: -122.1949 },
  { name: "Delphi", lat: 38.4824, lng: 22.5009 },
  { name: "Glastonbury", lat: 51.1452, lng: -2.7148 },
];

function latLngToVec3Sphere(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/** Build a great-circle arc between two unit vectors with N segments. */
function greatCircle(a: THREE.Vector3, b: THREE.Vector3, segments: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const omega = Math.acos(Math.min(1, Math.max(-1, a.clone().normalize().dot(b.clone().normalize()))));
  const sinO = Math.sin(omega);
  if (sinO < 1e-6) return [a.clone(), b.clone()];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const s1 = Math.sin((1 - t) * omega) / sinO;
    const s2 = Math.sin(t * omega) / sinO;
    const p = a.clone().multiplyScalar(s1).add(b.clone().multiplyScalar(s2));
    p.normalize().multiplyScalar(radius);
    pts.push(p);
  }
  return pts;
}

function CrystalOverlay({ mode, color }: { mode: "ley" | "grid"; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const RADIUS = 1.83;

  const { lineGeoms, nodes } = useMemo(() => {
    const geoms: THREE.BufferGeometry[] = [];
    let nodes: THREE.Vector3[] = [];

    if (mode === "ley") {
      const pts = LEY_SITES.map((s) => latLngToVec3Sphere(s.lat, s.lng, RADIUS));
      nodes = pts;
      // Connect each site to its 3 nearest neighbors via great circles.
      for (let i = 0; i < pts.length; i++) {
        const dists = pts
          .map((p, j) => ({ j, d: pts[i].distanceTo(p) }))
          .filter((x) => x.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 3);
        for (const { j } of dists) {
          if (j <= i) continue;
          const arc = greatCircle(pts[i], pts[j], 48, RADIUS);
          const g = new THREE.BufferGeometry().setFromPoints(arc);
          geoms.push(g);
        }
      }
    } else {
      // Icosahedral planetary grid.
      const ico = new THREE.IcosahedronGeometry(RADIUS, 1);
      const pos = ico.attributes.position;
      const seen = new Set<string>();
      const verts: THREE.Vector3[] = [];
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize().multiplyScalar(RADIUS);
        const k = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
        if (!seen.has(k)) {
          seen.add(k);
          verts.push(v);
        }
      }
      nodes = verts;
      // Build edges from triangles
      const edgeSet = new Set<string>();
      for (let i = 0; i < pos.count; i += 3) {
        const idxs = [i, i + 1, i + 2].map((k) => {
          const v = new THREE.Vector3().fromBufferAttribute(pos, k).normalize().multiplyScalar(RADIUS);
          return `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
        });
        for (let a = 0; a < 3; a++) {
          const b = (a + 1) % 3;
          const key = [idxs[a], idxs[b]].sort().join("|");
          if (edgeSet.has(key)) continue;
          edgeSet.add(key);
          const [ka, kb] = key.split("|");
          const pa = new THREE.Vector3(...ka.split(",").map(Number));
          const pb = new THREE.Vector3(...kb.split(",").map(Number));
          const arc = greatCircle(pa, pb, 36, RADIUS);
          const g = new THREE.BufferGeometry().setFromPoints(arc);
          geoms.push(g);
        }
      }
      ico.dispose();
    }
    return { lineGeoms: geoms, nodes };
  }, [mode]);

  useEffect(() => () => lineGeoms.forEach((g) => g.dispose()), [lineGeoms]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y = t * 0.08;
    if (matRef.current) matRef.current.opacity = 0.55 + Math.sin(t * 1.2) * 0.18;
  });

  return (
    <group ref={groupRef}>
      {lineGeoms.map((g, i) => (
        <line key={i}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial
            ref={i === 0 ? matRef : undefined}
            color={color}
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </line>
      ))}
      {nodes.map((p, i) => (
        <mesh key={`n${i}`} position={p}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main component ───


interface BlueMarbleGlobeProps {
  height?: number;
  sphereId?: SphereId;
  overlayUrl?: string;
  quakes?: QuakePoint[];
  basins?: BasinMarker[];
  /** Generic clickable regions (oceans, ice fields, biomes). */
  regions?: RegionDef[];
  selectedRegionId?: string;
  onSelectRegion?: (id: string) => void;
  /** Tint color used for the highlighted region's glow */
  selectedRegionColor?: string;
  /** Crystalsphere overlay: planetary grid (icosahedral) or ley line network */
  crystalOverlay?: "ley" | "grid" | null;
}

export const BlueMarbleGlobe = ({
  height = 340,
  sphereId,
  overlayUrl,
  quakes,
  regions,
  selectedRegionId,
  onSelectRegion,
  selectedRegionColor,
  crystalOverlay,
}: BlueMarbleGlobeProps) => {
  const accentColor = sphereId ? SPHERE_COLORS[sphereId] || "#4488cc" : "#4488cc";

  const selectedRegion = useMemo(
    () => regions?.find((r) => r.id === selectedRegionId),
    [regions, selectedRegionId],
  );
  const showHighlight =
    selectedRegion && selectedRegionId !== "global" && selectedRegionColor;

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.6;
        }}
      >
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-3, -2, -4]} intensity={0.6} color="#88aaff" />
        <pointLight position={[0, 4, 3]} intensity={0.5} color="#ffffff" />
        <GlobeMesh
          onPickLatLng={onSelectRegion && regions ? (lat, lng) => {
            const id = regionAtLatLng(regions.filter((r) => r.id !== "global"), lat, lng);
            onSelectRegion(id ?? "global");
          } : undefined}
        />
        {sphereId && overlayUrl && (
          <DynamicOverlay sphereId={sphereId} textureUrl={overlayUrl} />
        )}
        {quakes && quakes.length > 0 && <QuakePoints quakes={quakes} />}
        {showHighlight && (
          <RegionHighlight
            boxes={selectedRegion!.boxes}
            surface={selectedRegion!.surface}
            color={selectedRegionColor!}
          />
        )}
        {crystalOverlay && (
          <CrystalOverlay mode={crystalOverlay} color={selectedRegionColor || "#e8c86a"} />
        )}
        <AtmosphereGlow color={accentColor} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
};
