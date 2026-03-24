import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Seismic wavefronts expanding from epicenters + deformation field */
function SeismicWaves() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#cc5533") },
  }), []);

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
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
    uniform vec3 uColor;
    varying vec2 vUv;

    float wave(vec2 center, vec2 uv, float t, float speed) {
      float d = distance(uv, center);
      float ripple = sin((d - t * speed) * 30.0) * 0.5 + 0.5;
      float decay = exp(-d * 3.0) * exp(-max(0.0, t * speed - d) * 2.0);
      float front = smoothstep(t * speed - 0.02, t * speed, d) * (1.0 - smoothstep(t * speed, t * speed + 0.15, d));
      return ripple * decay * 0.3 + front * 0.7;
    }

    void main() {
      float t = mod(uTime, 8.0);
      
      // Multiple epicenters
      float w1 = wave(vec2(0.3, 0.6), vUv, t, 0.12);
      float w2 = wave(vec2(0.7, 0.3), vUv, mod(t + 3.0, 8.0), 0.1);
      float w3 = wave(vec2(0.5, 0.8), vUv, mod(t + 5.5, 8.0), 0.08);
      
      float combined = max(max(w1, w2), w3);
      
      // Deformation field (slow strain)
      float strain = sin(vUv.x * 6.0 + uTime * 0.3) * sin(vUv.y * 4.0 + uTime * 0.2) * 0.15;
      
      // Thermal base
      float thermal = sin(vUv.x * 3.0 + uTime * 0.1) * sin(vUv.y * 5.0 - uTime * 0.15) * 0.1 + 0.05;
      
      vec3 baseColor = uColor * 0.15;
      vec3 waveColor = uColor * combined;
      vec3 strainColor = vec3(0.8, 0.4, 0.2) * max(0.0, strain);
      vec3 thermalColor = vec3(1.0, 0.3, 0.1) * thermal;
      
      vec3 finalColor = baseColor + waveColor + strainColor + thermalColor;
      float alpha = 0.6 + combined * 0.4;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <mesh ref={meshRef}>
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

export function GeosphereSim() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/10 bg-background/30" style={{ aspectRatio: "16/9" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={[1, 2]}>
        <SeismicWaves />
      </Canvas>
      <div className="absolute bottom-2 left-3 flex items-center gap-2">
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
          Seismic propagation · Crustal deformation · Thermal anomalies
        </span>
      </div>
    </div>
  );
}
