import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Magnetic field lines, solar wind compression, particle trajectories */
function FieldLines() {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
    if (groupRef.current) groupRef.current.rotation.z = Math.sin(Date.now() * 0.0003) * 0.05;
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

    float fieldLine(vec2 uv, float offset, float curvature) {
      vec2 center = vec2(0.5, 0.5);
      vec2 d = uv - center;
      float angle = atan(d.y, d.x) + offset;
      float r = length(d);
      
      // Dipole field shape
      float fieldR = 0.15 + curvature * pow(abs(sin(angle)), 2.0);
      float line = smoothstep(0.008, 0.0, abs(r - fieldR));
      
      // Flow animation along field line
      float flow = sin(angle * 8.0 - uTime * 3.0 + r * 20.0) * 0.5 + 0.5;
      
      return line * (0.4 + flow * 0.6);
    }

    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 d = vUv - center;
      float r = length(d);
      float angle = atan(d.y, d.x);
      
      // Solar wind compression (left side compressed, right side extended)
      float compression = 1.0 + d.x * 0.6 + sin(uTime * 0.5) * 0.1;
      
      // Multiple field lines at different distances
      float lines = 0.0;
      for (float i = 1.0; i < 7.0; i++) {
        float curv = i * 0.08 * compression;
        lines += fieldLine(vUv, i * 0.3, curv);
      }
      
      // Magnetopause boundary
      float mpDist = 0.35 - d.x * 0.1 + sin(uTime * 0.7 + angle * 2.0) * 0.02;
      float magnetopause = smoothstep(0.01, 0.0, abs(r - mpDist)) * 0.5;
      
      // Bow shock
      float bsDist = mpDist + 0.06 + sin(angle * 3.0 + uTime) * 0.01;
      float bowshock = smoothstep(0.015, 0.0, abs(r - bsDist)) * 0.3;
      
      // Radiation belt glow
      float belt1 = exp(-pow((r - 0.12) * 15.0, 2.0)) * 0.3;
      float belt2 = exp(-pow((r - 0.2) * 12.0, 2.0)) * 0.2;
      
      // Particle flow (solar wind from left)
      float particles = 0.0;
      if (d.x < -mpDist * 0.8) {
        float py = mod(vUv.y * 20.0 + uTime * 2.0, 1.0);
        particles = smoothstep(0.4, 0.5, py) * smoothstep(0.6, 0.5, py) * 0.3;
      }
      
      // Magnetotail extension
      float tail = 0.0;
      if (d.x > 0.05) {
        float tailWidth = 0.08 + d.x * 0.15;
        tail = exp(-pow(d.y / tailWidth, 2.0) * 3.0) * smoothstep(0.0, 0.1, d.x) * 0.2;
        tail *= (sin(d.x * 30.0 - uTime * 4.0) * 0.5 + 0.5);
      }
      
      vec3 fieldColor = vec3(0.27, 0.4, 0.87) * lines;
      vec3 mpColor = vec3(0.4, 0.6, 1.0) * magnetopause;
      vec3 bsColor = vec3(0.6, 0.7, 1.0) * bowshock;
      vec3 beltColor = vec3(0.5, 0.3, 0.9) * (belt1 + belt2);
      vec3 particleColor = vec3(1.0, 0.8, 0.3) * particles;
      vec3 tailColor = vec3(0.2, 0.3, 0.7) * tail;
      
      // Earth core
      float earth = smoothstep(0.04, 0.03, r);
      vec3 earthColor = vec3(0.2, 0.5, 0.8) * earth;
      
      vec3 finalColor = fieldColor + mpColor + bsColor + beltColor + particleColor + tailColor + earthColor;
      float alpha = max(max(lines, magnetopause + bowshock), max(belt1 + belt2, max(particles + tail, earth)));
      alpha = 0.3 + alpha * 0.7;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <group ref={groupRef}>
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
    </group>
  );
}

export function MagnetosphereSim() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/10 bg-background/30" style={{ aspectRatio: "16/9" }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }} dpr={[1, 2]}>
        <FieldLines />
      </Canvas>
      <div className="absolute bottom-2 left-3">
        <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/40">
          Field lines · Solar wind compression · Particle flow · Radiation belts
        </span>
      </div>
    </div>
  );
}
