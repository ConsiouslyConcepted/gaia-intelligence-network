import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Vegetation dynamics, carbon flux, ocean productivity */
function VegetationField() {
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
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * smoothNoise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Seasonal breathing cycle
      float season = sin(uTime * 0.4) * 0.5 + 0.5;
      
      // NDVI-like vegetation field
      float veg = fbm(vUv * 5.0 + uTime * 0.05);
      veg = veg * (0.5 + season * 0.5);
      
      // Latitude-dependent seasonality
      float lat = abs(vUv.y - 0.5) * 2.0;
      float seasonalShift = sin(uTime * 0.4 + lat * 3.14) * 0.5 + 0.5;
      veg *= mix(0.6, 1.0, seasonalShift);
      
      // Carbon flux (respiration)
      float carbonFlux = sin(uTime * 0.8 + vUv.x * 10.0) * 0.1;
      
      // Ocean productivity (bloom pulses)
      float ocean = smoothstep(0.45, 0.55, fbm(vUv * 8.0 - uTime * 0.03));
      float bloom = ocean * (sin(uTime * 1.2 + vUv.x * 5.0) * 0.5 + 0.5) * 0.4;
      
      // Color mapping
      vec3 barren = vec3(0.15, 0.1, 0.08);
      vec3 green = vec3(0.1, 0.5, 0.3);
      vec3 lush = vec3(0.2, 0.7, 0.5);
      vec3 oceanColor = vec3(0.1, 0.4, 0.5);
      
      vec3 vegColor = mix(barren, mix(green, lush, veg), veg);
      vegColor += vec3(carbonFlux * 0.5, -carbonFlux * 0.3, 0.0);
      vegColor = mix(vegColor, oceanColor, bloom);
      
      float alpha = 0.7 + veg * 0.3;
      gl_FragColor = vec4(vegColor, alpha);
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

export function BiosphereSim() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/10 bg-background/30" style={{ aspectRatio: "16/9" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={[1, 2]}>
        <VegetationField />
      </Canvas>
      <div className="absolute bottom-2 left-3">
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
          Vegetation NDVI · Carbon flux · Ocean productivity · Seasonal cycles
        </span>
      </div>
    </div>
  );
}
