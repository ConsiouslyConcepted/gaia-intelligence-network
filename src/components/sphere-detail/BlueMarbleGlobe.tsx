import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { SphereId } from "@/types/spheres";
import { QuakePoint } from "@/lib/liveOverlays";
import { buildBasinMaskTexture, basinAtLatLng } from "@/lib/basinMasks";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

const OVERLAY_SETTINGS: Record<string, { opacity: number; blending: THREE.Blending }> = {
  geosphere: { opacity: 0.7, blending: THREE.AdditiveBlending },
  hydrosphere: { opacity: 0.75, blending: THREE.AdditiveBlending },
  cryosphere: { opacity: 0.85, blending: THREE.AdditiveBlending },
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

  return (
    <mesh
      ref={meshRef}
      onClick={onPickLatLng ? (e) => {
        e.stopPropagation();
        if (!meshRef.current) return;
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

// ─── Basin highlight (lights up the actual ocean shape) ───

function BasinHighlight({ basinId, color }: { basinId: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const { texture } = useMemo(() => buildBasinMaskTexture(basinId, color), [basinId, color]);
  useEffect(() => () => { texture.dispose(); }, [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) meshRef.current.rotation.y = t * 0.08;
    // Very subtle breathing so it feels alive but natural
    if (matRef.current) matRef.current.opacity = 0.62 + Math.sin(t * 0.8) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.808, 128, 128]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0.65}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Main component ───

interface BlueMarbleGlobeProps {
  height?: number;
  sphereId?: SphereId;
  overlayUrl?: string;
  quakes?: QuakePoint[];
  basins?: BasinMarker[];
  selectedBasinId?: string;
  onSelectBasin?: (id: string) => void;
  /** Tint color used for the basin highlight shell */
  selectedBasinColor?: string;
}

export const BlueMarbleGlobe = ({
  height = 340,
  sphereId,
  overlayUrl,
  quakes,
  basins,
  selectedBasinId,
  onSelectBasin,
  selectedBasinColor,
}: BlueMarbleGlobeProps) => {
  const accentColor = sphereId ? SPHERE_COLORS[sphereId] || "#4488cc" : "#4488cc";
  const showBasinHighlight =
    selectedBasinId && selectedBasinId !== "global" && selectedBasinColor;

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
        <GlobeMesh />
        {sphereId && overlayUrl && (
          <DynamicOverlay sphereId={sphereId} textureUrl={overlayUrl} />
        )}
        {quakes && quakes.length > 0 && <QuakePoints quakes={quakes} />}
        {showBasinHighlight && (
          <BasinHighlight basinId={selectedBasinId!} color={selectedBasinColor!} />
        )}
        {basins && basins.length > 0 && onSelectBasin && (
          <BasinMarkers markers={basins} selectedId={selectedBasinId} onSelect={onSelectBasin} />
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
