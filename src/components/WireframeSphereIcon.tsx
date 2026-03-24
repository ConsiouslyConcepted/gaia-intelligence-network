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
        <radialGradient id={`wf-glow-${color.replace('#', '')}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="22" cy="22" r="19" fill={`url(#wf-glow-${color.replace('#', '')})`} />

      {/* Outer circle */}
      <circle
        cx="22"
        cy="22"
        r="18"
        fill="none"
        stroke={color}
        strokeWidth="0.4"
        opacity="0.3"
      />

      {/* Latitude lines */}
      {latPaths.map((d, i) => (
        <path
          key={`lat-${i}`}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="0.3"
          opacity={0.12 + (i % 3 === 0 ? 0.06 : 0)}
        />
      ))}

      {/* Longitude lines */}
      {lonPaths.map((d, i) => (
        <path
          key={`lon-${i}`}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="0.3"
          opacity={0.12 + (i % 4 === 0 ? 0.08 : 0)}
        />
      ))}
    </svg>
  );
};
