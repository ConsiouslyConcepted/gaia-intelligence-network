import { useMemo } from "react";

interface WireframeSphereIconProps {
  color: string;
  size?: number;
  segments?: number;
  className?: string;
}

/**
 * Generates a 2D projected wireframe sphere matching the 3D visualization style.
 * Projects 3D wireframe vertices onto 2D to create the dense geometric mesh.
 */
export const WireframeSphereIcon = ({
  color,
  size = 44,
  segments = 16,
  className = "",
}: WireframeSphereIconProps) => {
  const paths = useMemo(() => {
    const r = 18;
    const cx = 22;
    const cy = 22;
    const lines: string[] = [];

    // Generate latitude lines (horizontal rings at different heights)
    const latCount = segments;
    for (let i = 1; i < latCount; i++) {
      const phi = (Math.PI * i) / latCount;
      const ringR = r * Math.sin(phi);
      const ringY = r * Math.cos(phi);
      // Project: y offset scaled, ring becomes ellipse
      const projY = cy - ringY * 0.85;
      const projRx = ringR;
      const projRy = ringR * 0.25; // foreshortening
      lines.push(
        `M ${cx - projRx} ${projY} A ${projRx} ${projRy} 0 0 1 ${cx + projRx} ${projY} A ${projRx} ${projRy} 0 0 1 ${cx - projRx} ${projY}`
      );
    }

    // Generate longitude lines (vertical meridians at different rotations)
    const lonCount = segments;
    for (let i = 0; i < lonCount; i++) {
      const theta = (Math.PI * i) / lonCount;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      // Each meridian is an ellipse rotated by theta
      const rx = Math.abs(r * sinT);
      const ry = r;
      if (rx < 0.5) {
        // Nearly edge-on, draw as line
        lines.push(`M ${cx} ${cy - r} L ${cx} ${cy + r}`);
      } else {
        // Ellipse tilted
        const angle = (theta * 180) / Math.PI;
        lines.push(
          `M ${cx - rx} ${cy} A ${rx} ${ry} ${0} 0 1 ${cx + rx} ${cy} A ${rx} ${ry} ${0} 0 1 ${cx - rx} ${cy}`
        );
      }
    }

    return lines;
  }, [segments]);

  // Split into longitude and latitude for different opacities
  const latCount = segments - 1;
  const latPaths = paths.slice(0, latCount);
  const lonPaths = paths.slice(latCount);

  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        {/* Solid 3D sphere body with off-center highlight */}
        <radialGradient id={`wf-body-${color.replace('#', '')}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1a2540" stopOpacity="1" />
          <stop offset="45%" stopColor="#0d1424" stopOpacity="1" />
          <stop offset="100%" stopColor="#03060d" stopOpacity="1" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id={`wf-spec-${color.replace('#', '')}`} cx="32%" cy="26%" r="32%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* Bottom rim color glow */}
        <radialGradient id={`wf-rim-${color.replace('#', '')}`} cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="60%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* Soft outer glow */}
        <radialGradient id={`wf-glow-${color.replace('#', '')}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={color} stopOpacity="0" />
          <stop offset="85%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer atmospheric glow */}
      <circle cx="22" cy="22" r="21" fill={`url(#wf-glow-${color.replace('#', '')})`} />

      {/* Solid sphere body */}
      <circle cx="22" cy="22" r="18" fill={`url(#wf-body-${color.replace('#', '')})`} />

      {/* Bottom color rim */}
      <circle cx="22" cy="22" r="18" fill={`url(#wf-rim-${color.replace('#', '')})`} />

      {/* Specular highlight */}
      <circle cx="22" cy="22" r="18" fill={`url(#wf-spec-${color.replace('#', '')})`} />

      {/* Outer ring */}
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.7"
      />


      {/* Latitude lines */}
      {latPaths.map((d, i) => (
        <path
          key={`lat-${i}`}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="0.35"
          opacity={0.22 + (i % 3 === 0 ? 0.1 : 0)}
        />
      ))}

      {/* Longitude lines */}
      {lonPaths.map((d, i) => (
        <path
          key={`lon-${i}`}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="0.35"
          opacity={0.22 + (i % 4 === 0 ? 0.12 : 0)}
        />
      ))}
    </svg>
  );
};
