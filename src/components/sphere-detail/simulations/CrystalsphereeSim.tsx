import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Wave interference, harmonic resonance, lattice activation, field coupling */
function ResonanceLattice() {
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
    
    #define PI 3.14159265

    void main() {
      vec2 c = vUv - 0.5;
      
      // Multiple wave sources for interference
      float w1 = sin(length(c - vec2(-0.2, 0.0)) * 40.0 - uTime * 3.0);
      float w2 = sin(length(c - vec2(0.2, 0.0)) * 40.0 - uTime * 3.0);
      float w3 = sin(length(c - vec2(0.0, 0.15)) * 35.0 - uTime * 2.5);
      
      // Interference pattern (standing waves)
      float interference = (w1 + w2 + w3) / 3.0;
      float standing = interference * interference;
      
      // Nodal points (destructive interference)
      float nodal = 1.0 - smoothstep(0.0, 0.02, abs(interference));
      
      // Geometric lattice grid
      vec2 grid = fract(vUv * 8.0) - 0.5;
      float lattice = smoothstep(0.02, 0.0, min(abs(grid.x), abs(grid.y)));
      
      // Lattice activation (nodes light up with resonance)
      vec2 gridId = floor(vUv * 8.0);
      float activation = sin(gridId.x * 2.0 + gridId.y * 3.0 + uTime * 1.5) * 0.5 + 0.5;
      float nodeGlow = smoothstep(0.15, 0.0, length(grid)) * activation;
      
      // Harmonic resonance rings
      float r = length(c);
      float harmonic1 = exp(-pow((r - 0.1 - sin(uTime * 0.7) * 0.02) * 20.0, 2.0));
      float harmonic2 = exp(-pow((r - 0.2 - sin(uTime * 0.5) * 0.03) * 15.0, 2.0));
      float harmonic3 = exp(-pow((r - 0.35 - sin(uTime * 0.3) * 0.02) * 12.0, 2.0));
      float harmonics = (harmonic1 + harmonic2 + harmonic3) * 0.5;
      
      // Hexagonal symmetry overlay
      float angle = atan(c.y, c.x);
      float hex = abs(sin(angle * 3.0 + uTime * 0.4));
      float hexGrid = smoothstep(0.98, 1.0, hex) * smoothstep(0.05, 0.15, r) * 0.3;
      
      // Color composition
      vec3 standingColor = vec3(0.9, 0.78, 0.42) * standing * 0.5;
      vec3 nodalColor = vec3(1.0, 0.9, 0.6) * nodal * 0.4;
      vec3 latticeColor = vec3(0.4, 0.35, 0.25) * lattice * 0.3;
      vec3 glowColor = vec3(0.9, 0.75, 0.4) * nodeGlow * 0.6;
      vec3 harmonicColor = vec3(0.7, 0.6, 0.3) * harmonics;
      vec3 hexColor = vec3(0.6, 0.5, 0.3) * hexGrid;
      
      vec3 bg = vec3(0.04, 0.035, 0.025);
      vec3 finalColor = bg + standingColor + nodalColor + latticeColor + glowColor + harmonicColor + hexColor;
      
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

export function CrystalsphereeSim() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/10 bg-background/30" style={{ aspectRatio: "16/9" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={[1, 2]}>
        <ResonanceLattice />
      </Canvas>
      <div className="absolute bottom-2 left-3">
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
          Wave interference · Harmonic resonance · Lattice activation · Nodal geometry
        </span>
      </div>
    </div>
  );
}
