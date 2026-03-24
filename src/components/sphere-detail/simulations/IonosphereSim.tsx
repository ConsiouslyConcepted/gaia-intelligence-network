import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Electron density, TEC gradients, ionospheric storms, wave propagation */
function PlasmaField() {
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

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x),
        mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * smoothNoise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Day/night boundary (terminator)
      float terminator = smoothstep(0.4, 0.6, vUv.x + sin(uTime * 0.15) * 0.15);
      
      // Electron density (TEC) — higher on dayside
      float tec = fbm(vUv * 6.0 + uTime * 0.08);
      tec *= mix(0.3, 1.0, terminator);
      
      // Equatorial anomaly (Appleton)
      float eqDist = abs(vUv.y - 0.5);
      float anomaly = exp(-pow((eqDist - 0.12) * 10.0, 2.0)) * terminator * 0.6;
      
      // Auroral belts (polar regions)
      float northAurora = exp(-pow((vUv.y - 0.85) * 8.0, 2.0));
      float southAurora = exp(-pow((vUv.y - 0.15) * 8.0, 2.0));
      float auroralPulse = sin(uTime * 2.0 + vUv.x * 15.0) * 0.5 + 0.5;
      float aurora = (northAurora + southAurora) * auroralPulse * 0.7;
      
      // Ionospheric storm (traveling disturbance)
      float stormPhase = mod(uTime * 0.3, 6.28);
      float storm = exp(-pow(vUv.x - fract(uTime * 0.1), 2.0) * 20.0) * 0.4;
      storm *= sin(vUv.y * 30.0 + uTime * 5.0) * 0.5 + 0.5;
      
      // Wave propagation (radio signal distortion)
      float wave = sin(vUv.x * 40.0 + vUv.y * 20.0 - uTime * 3.0);
      wave *= smoothstep(0.5, 0.7, tec) * 0.15;
      
      // Layer stack visualization (D/E/F layers as horizontal bands)
      float dLayer = exp(-pow((vUv.y - 0.25) * 15.0, 2.0)) * 0.1 * terminator;
      float eLayer = exp(-pow((vUv.y - 0.45) * 12.0, 2.0)) * 0.15 * terminator;
      float fLayer = exp(-pow((vUv.y - 0.7) * 10.0, 2.0)) * 0.2;
      
      // Color composition
      vec3 tecColor = vec3(0.27, 0.53, 0.8) * tec;
      vec3 anomalyColor = vec3(0.4, 0.7, 1.0) * anomaly;
      vec3 auroraColor = vec3(0.2, 0.9, 0.5) * aurora;
      vec3 stormColor = vec3(0.8, 0.4, 0.2) * storm;
      vec3 waveColor = vec3(0.5, 0.5, 0.8) * max(0.0, wave);
      vec3 layerColor = vec3(0.3, 0.4, 0.6) * (dLayer + eLayer + fLayer);
      
      vec3 bg = vec3(0.03, 0.05, 0.1);
      vec3 finalColor = bg + tecColor + anomalyColor + auroraColor + stormColor + waveColor + layerColor;
      
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

export function IonosphereSim() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/10 bg-background/30" style={{ aspectRatio: "16/9" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={[1, 2]}>
        <PlasmaField />
      </Canvas>
      <div className="absolute bottom-2 left-3">
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
          Electron density (TEC) · Auroral coupling · Storm propagation · D/E/F layers
        </span>
      </div>
    </div>
  );
}
