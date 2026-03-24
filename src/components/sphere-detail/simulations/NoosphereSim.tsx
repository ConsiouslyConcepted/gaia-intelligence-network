import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Network flow, cluster formation, activity surges, semantic evolution */
function NetworkField() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    // Voronoi for network nodes
    vec2 voronoi(vec2 uv, float scale) {
      vec2 id = floor(uv * scale);
      vec2 f = fract(uv * scale);
      float minDist = 1.0;
      vec2 minPoint = vec2(0.0);
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = vec2(hash(id + neighbor), hash(id + neighbor + 31.0));
          point = 0.5 + 0.3 * sin(uTime * 0.5 + 6.28 * point);
          vec2 diff = neighbor + point - f;
          float d = length(diff);
          if (d < minDist) {
            minDist = d;
            minPoint = id + neighbor + point;
          }
        }
      }
      return vec2(minDist, hash(minPoint));
    }

    void main() {
      // Network nodes via voronoi
      vec2 v1 = voronoi(vUv, 6.0);
      vec2 v2 = voronoi(vUv, 12.0);
      
      // Node points (hubs)
      float nodes = smoothstep(0.12, 0.05, v1.x) * 0.8;
      float subNodes = smoothstep(0.1, 0.04, v2.x) * 0.3;
      
      // Connection arcs (edges) — glow along cell boundaries
      float edges = smoothstep(0.03, 0.0, abs(v1.x - 0.5) - 0.48) * 0.15;
      
      // Signal flow along edges
      float flow = sin(v1.y * 50.0 - uTime * 4.0) * 0.5 + 0.5;
      float signalFlow = edges * flow * 2.0;
      
      // Activity surge (diurnal wave)
      float diurnal = sin(vUv.x * 6.28 - uTime * 0.5) * 0.5 + 0.5;
      float surge = smoothstep(0.6, 0.9, diurnal) * 0.4;
      
      // Cluster density
      float cluster = smoothstep(0.3, 0.0, v1.x) * v1.y;
      
      // Semantic density (topic hotspots)
      float semantic = sin(vUv.x * 8.0 + uTime * 0.3) * sin(vUv.y * 6.0 - uTime * 0.2);
      semantic = smoothstep(0.3, 0.8, semantic) * 0.2;
      
      // Color composition
      vec3 bgColor = vec3(0.04, 0.03, 0.06);
      vec3 nodeColor = vec3(0.83, 0.65, 0.42) * (nodes + subNodes);
      vec3 edgeColor = vec3(0.6, 0.5, 0.3) * edges;
      vec3 flowColor = vec3(1.0, 0.8, 0.4) * signalFlow;
      vec3 surgeColor = vec3(1.0, 0.6, 0.2) * surge * nodes;
      vec3 semanticColor = vec3(0.5, 0.4, 0.7) * semantic;
      
      vec3 finalColor = bgColor + nodeColor + edgeColor + flowColor + surgeColor + semanticColor;
      
      gl_FragColor = vec4(finalColor, 0.85);
    }
  `;

  return (
    <mesh>
      <planeGeometry args={[4, 2.25, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export function NoosphereSim() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/10 bg-background/30" style={{ aspectRatio: "16/9" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={[1, 2]}>
        <NetworkField />
      </Canvas>
      <div className="absolute bottom-2 left-3">
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
          Network flow · Cluster formation · Activity surges · Semantic density
        </span>
      </div>
    </div>
  );
}
