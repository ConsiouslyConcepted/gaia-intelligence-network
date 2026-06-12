import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function legendreP(l: number, m: number, x: number): number {
  const am = Math.abs(m);
  let pmm = 1;
  if (am > 0) {
    const somx2 = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
    let fact = 1;
    for (let i = 1; i <= am; i++) { pmm *= -fact * somx2; fact += 2; }
  }
  if (l === am) return pmm;
  let pmmp1 = x * (2 * am + 1) * pmm;
  if (l === am + 1) return pmmp1;
  let pll = 0;
  for (let ll = am + 2; ll <= l; ll++) {
    pll = ((2 * ll - 1) * x * pmmp1 - (ll + am - 1) * pmm) / (ll - am);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pll;
}
function Ylm(l: number, m: number, theta: number, phi: number): number {
  const p = legendreP(l, Math.abs(m), Math.cos(theta));
  if (m === 0) return p;
  if (m > 0) return p * Math.cos(m * phi);
  return p * Math.sin(-m * phi);
}

const HarmonicMesh = ({ l, m }: { l: number; m: number }) => {
  const group = useRef<THREE.Group>(null);

  const { geometry, signColors } = useMemo(() => {
    const widthSeg = 128;
    const heightSeg = 96;
    const geo = new THREE.SphereGeometry(1, widthSeg, heightSeg);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];

    let maxAbs = 1e-6;
    const samples: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + y * y + z * z);
      const theta = Math.acos(y / r);
      const phi = Math.atan2(z, x);
      const v = Ylm(l, m, theta, phi);
      samples.push(v);
      const a = Math.abs(v);
      if (a > maxAbs) maxAbs = a;
    }

    const warm = new THREE.Color("#f3c97a");
    const cool = new THREE.Color("#74b6e8");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const r = Math.sqrt(x * x + y * y + z * z);
      const v = samples[i];
      const norm = Math.abs(v) / maxAbs;
      const scale = 0.35 + 0.95 * norm;
      pos.setXYZ(i, (x / r) * scale, (y / r) * scale, (z / r) * scale);

      const c = v >= 0 ? warm.clone() : cool.clone();
      const t = 0.35 + 0.65 * norm;
      c.multiplyScalar(t);
      colors.push(c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return { geometry: geo, signColors: colors };
  }, [l, m]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          roughness={0.55}
          metalness={0.15}
          flatShading={false}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

export const SphericalHarmonics3D = ({ l, m }: { l: number; m: number }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#f5e3c0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#7faedd" />
      <HarmonicMesh l={l} m={m} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={1.8}
        maxDistance={6}
        rotateSpeed={0.7}
        zoomSpeed={0.6}
      />
    </Canvas>
  );
};
