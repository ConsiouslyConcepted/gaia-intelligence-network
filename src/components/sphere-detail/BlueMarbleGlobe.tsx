import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { SphereId } from "@/types/spheres";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";
const NIGHT_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg";

// ─── Procedural overlay shaders per sphere ───

const OVERLAY_SHADERS: Record<string, { vertex: string; fragment: string }> = {
  geosphere: {
    vertex: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float uTime;
      uniform sampler2D uOverlay;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec4 topo = texture2D(uOverlay, vUv);
        float elevation = topo.r;
        // Tectonic heat: highlight ridges and trenches
        vec3 hot = vec3(1.0, 0.3, 0.1);
        vec3 warm = vec3(0.9, 0.6, 0.2);
        vec3 cool = vec3(0.2, 0.1, 0.05);
        vec3 color = mix(cool, warm, elevation);
        // Seismic pulse rings
        float dist = length(vPosition.xz);
        float pulse = sin(dist * 12.0 - uTime * 3.0) * 0.5 + 0.5;
        pulse = smoothstep(0.7, 1.0, pulse);
        color = mix(color, hot, pulse * 0.3 * elevation);
        float alpha = 0.35 + elevation * 0.2 + pulse * 0.1;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  },
  biosphere: {
    vertex: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float uTime;
      uniform sampler2D uOverlay;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vec4 topo = texture2D(uOverlay, vUv);
        float land = topo.r;
        // Green vegetation gradient
        vec3 lush = vec3(0.1, 0.9, 0.3);
        vec3 sparse = vec3(0.0, 0.4, 0.15);
        vec3 ocean = vec3(0.0, 0.15, 0.3);
        vec3 color = mix(ocean, mix(sparse, lush, land), smoothstep(0.1, 0.4, land));
        // Breathing animation
        float breath = sin(uTime * 0.8) * 0.5 + 0.5;
        color += lush * breath * 0.08 * land;
        // Bio-luminescent shimmer
        float shimmer = sin(vUv.x * 40.0 + uTime * 2.0) * sin(vUv.y * 40.0 + uTime * 1.5);
        color += vec3(0.0, 0.3, 0.1) * max(shimmer, 0.0) * 0.15 * land;
        float alpha = 0.3 + land * 0.25;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  },
  noosphere: {
    vertex: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float uTime;
      uniform sampler2D uOverlay;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vec4 nightTex = texture2D(uOverlay, vUv);
        float lights = max(nightTex.r, max(nightTex.g, nightTex.b));
        // Warm golden glow for city networks
        vec3 gold = vec3(1.0, 0.8, 0.3);
        vec3 white = vec3(1.0, 0.95, 0.9);
        vec3 color = mix(gold, white, lights);
        // Pulsing network activity
        float pulse = sin(uTime * 2.0 + lights * 6.28) * 0.5 + 0.5;
        color += gold * pulse * 0.2 * lights;
        float alpha = lights * 0.7 + pulse * 0.1 * lights;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  },
  magnetosphere: {
    vertex: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        // Magnetic field lines flowing pole to pole
        float lat = vUv.y * 3.14159 - 1.5708;
        float lon = vUv.x * 6.28318;
        // Field line pattern
        float fieldLines = sin(lon * 8.0 + sin(lat * 3.0) * 2.0 + uTime * 0.5);
        fieldLines = smoothstep(0.6, 0.9, abs(fieldLines));
        // Polar intensity (stronger at poles)
        float polarStrength = pow(abs(sin(lat)), 0.5);
        // Flow animation along field lines
        float flow = sin(lat * 20.0 - uTime * 4.0) * 0.5 + 0.5;
        vec3 blue = vec3(0.2, 0.4, 1.0);
        vec3 cyan = vec3(0.3, 0.8, 1.0);
        vec3 color = mix(blue, cyan, flow);
        float alpha = fieldLines * (0.2 + polarStrength * 0.4) + flow * polarStrength * 0.15;
        gl_FragColor = vec4(color, alpha * 0.6);
      }
    `,
  },
  ionosphere: {
    vertex: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float uTime;
      uniform sampler2D uOverlay;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float lat = vUv.y * 3.14159 - 1.5708;
        // Aurora bands near poles
        float auroral = smoothstep(0.85, 1.0, abs(sin(lat))) + smoothstep(0.6, 0.8, abs(sin(lat))) * 0.3;
        // Rippling TEC waves
        float wave1 = sin(vUv.x * 30.0 + uTime * 1.5) * sin(vUv.y * 20.0 + uTime * 1.0);
        float wave2 = sin(vUv.x * 15.0 - uTime * 0.8 + vUv.y * 25.0);
        float waves = (wave1 + wave2) * 0.5;
        // Color mixing
        vec3 aurora = vec3(0.1, 1.0, 0.5);
        vec3 plasma = vec3(0.3, 0.6, 1.0);
        vec3 purple = vec3(0.6, 0.2, 1.0);
        vec3 color = mix(plasma, aurora, auroral);
        color = mix(color, purple, max(waves, 0.0) * 0.3);
        // Night lights underneath
        vec4 nightTex = texture2D(uOverlay, vUv);
        float lights = max(nightTex.r, max(nightTex.g, nightTex.b));
        color += vec3(0.3, 0.5, 1.0) * lights * 0.3;
        float alpha = auroral * 0.5 + abs(waves) * 0.15 + lights * 0.15;
        gl_FragColor = vec4(color, alpha * 0.5);
      }
    `,
  },
  crystalsphere: {
    vertex: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        // Geometric crystalline grid
        float lon = vUv.x * 6.28318;
        float lat = vUv.y * 3.14159;
        // Hexagonal-like grid
        float grid1 = abs(sin(lon * 12.0)) * abs(sin(lat * 8.0));
        float grid2 = abs(sin((lon + lat) * 10.0 + uTime * 0.3));
        float grid3 = abs(sin((lon - lat) * 10.0 - uTime * 0.2));
        float grid = smoothstep(0.92, 1.0, max(grid1, max(grid2, grid3)));
        // Nodal points where grid lines intersect
        float nodes = smoothstep(0.95, 1.0, grid1 * grid2);
        // Resonance pulse
        float pulse = sin(uTime * 1.5) * 0.5 + 0.5;
        vec3 gold = vec3(1.0, 0.85, 0.3);
        vec3 white = vec3(1.0, 1.0, 0.9);
        vec3 color = mix(gold, white, nodes);
        color += gold * pulse * 0.2 * grid;
        float alpha = grid * 0.5 + nodes * 0.6 + pulse * grid * 0.15;
        gl_FragColor = vec4(color, alpha * 0.5);
      }
    `,
  },
};

// ─── Overlay mesh component ───

function SphereOverlay({ sphereId }: { sphereId: SphereId }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shader = OVERLAY_SHADERS[sphereId];

  // Load overlay texture (topology for geo/bio, night lights for noosphere/ionosphere)
  const needsTexture = ["geosphere", "biosphere", "noosphere", "ionosphere"].includes(sphereId);
  const texUrl =
    sphereId === "noosphere" || sphereId === "ionosphere" ? NIGHT_TEX : BUMP_TEX;
  const overlayTex = useLoader(TextureLoader, texUrl);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOverlay: { value: overlayTex },
    }),
    [overlayTex]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  if (!shader) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.82, 64, 64]} />
      <shaderMaterial
        vertexShader={shader.vertex}
        fragmentShader={shader.fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Atmosphere glow per sphere ───

function AtmosphereGlow({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
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

// ─── Base Earth mesh ───

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
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

// ─── Sphere-specific accent colors ───

const SPHERE_COLORS: Record<string, string> = {
  geosphere: "#cc5533",
  biosphere: "#7ecbcb",
  noosphere: "#d4a56a",
  magnetosphere: "#4466dd",
  ionosphere: "#4488cc",
  crystalsphere: "#e8c86a",
};

// ─── Main component ───

interface BlueMarbleGlobeProps {
  height?: number;
  sphereId?: SphereId;
}

export const BlueMarbleGlobe = ({ height = 340, sphereId }: BlueMarbleGlobeProps) => {
  const accentColor = sphereId ? SPHERE_COLORS[sphereId] || "#4488cc" : "#4488cc";

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
        {sphereId && <SphereOverlay sphereId={sphereId} />}
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
