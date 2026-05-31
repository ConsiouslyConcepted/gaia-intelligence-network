import { Stars } from "@react-three/drei";
import * as THREE from "three";

export const PLANETARY_STARFIELD_CAMERA = {
  position: [0, 0, 7.5] as [number, number, number],
  fov: 50,
};

export const PLANETARY_STARFIELD_GL = {
  antialias: true,
  alpha: true,
  toneMapping: THREE.ACESFilmicToneMapping,
};

export const configurePlanetaryStarfieldRenderer = (gl: THREE.WebGLRenderer) => {
  gl.toneMappingExposure = 1.2;
};

export const PlanetaryStars = () => (
  <Stars
    radius={80}
    depth={60}
    count={2000}
    factor={3}
    saturation={0.1}
    fade
    speed={0.5}
  />
);