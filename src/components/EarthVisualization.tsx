import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

interface SphereLayer {
  name: string;
  radius: number;
  color: string;
  opacity: number;
}

const sphereLayers: SphereLayer[] = [
  { name: "Geosphere", radius: 1, color: "#ff8800", opacity: 1 },
  { name: "Hydrosphere", radius: 1.15, color: "#0088ff", opacity: 0.3 },
  { name: "Atmosphere", radius: 1.3, color: "#88ccff", opacity: 0.2 },
  { name: "Biosphere", radius: 1.45, color: "#44ff44", opacity: 0.25 },
  { name: "Noosphere", radius: 1.6, color: "#aa44ff", opacity: 0.2 },
  { name: "Technosphere", radius: 1.75, color: "#00ffff", opacity: 0.15 },
  { name: "Magnetosphere", radius: 1.9, color: "#ff00ff", opacity: 0.15 },
  { name: "Crystalsphere", radius: 2.05, color: "#ffdd00", opacity: 0.1 },
];

const InteractiveSphere = ({ 
  layer, 
  onSelect 
}: { 
  layer: SphereLayer; 
  onSelect: (name: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Sphere
      args={[layer.radius, 64, 64]}
      onClick={() => onSelect(layer.name)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhongMaterial
        color={layer.color}
        transparent
        opacity={hovered ? layer.opacity * 1.5 : layer.opacity}
        side={THREE.DoubleSide}
        emissive={layer.color}
        emissiveIntensity={hovered ? 0.3 : 0.1}
        wireframe={layer.radius > 1}
      />
      {hovered && (
        <Html position={[0, layer.radius + 0.2, 0]} center>
          <div className="glass-panel px-3 py-1 rounded-lg text-xs text-foreground whitespace-nowrap">
            {layer.name}
          </div>
        </Html>
      )}
    </Sphere>
  );
};

const StarField = () => {
  const count = 1000;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 50 + Math.random() * 50;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.6} />
    </points>
  );
};

export const EarthVisualization = ({ 
  onSphereSelect 
}: { 
  onSphereSelect: (sphere: string) => void;
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0088ff" />
        
        <StarField />
        
        {sphereLayers.map((layer) => (
          <InteractiveSphere 
            key={layer.name} 
            layer={layer} 
            onSelect={onSphereSelect}
          />
        ))}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
