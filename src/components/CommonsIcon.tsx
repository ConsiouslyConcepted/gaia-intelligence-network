interface CommonsIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const CommonsIcon = ({ size = 16, color = "#5ce0d2", className = "" }: CommonsIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top layer */}
    <path d="M12 2L3 7.5L12 13L21 7.5L12 2Z" rx="1" />
    {/* Middle layer */}
    <path d="M3 12L12 17.5L21 12L19.5 11.1L12 15.5L4.5 11.1L3 12Z" />
    {/* Bottom layer */}
    <path d="M3 16.5L12 22L21 16.5L19.5 15.6L12 20L4.5 15.6L3 16.5Z" />
  </svg>
);
