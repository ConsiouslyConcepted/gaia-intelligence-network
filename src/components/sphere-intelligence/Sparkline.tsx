interface Props {
  data: number[];
  color: string;
  height?: number;
  strokeWidth?: number;
}

export function Sparkline({ data, color, height = 20, strokeWidth = 1 }: Props) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `0,${height} ${points} ${w},${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full h-full">
      <polyline points={area} fill={`${color}10`} stroke="none" />
      <polyline points={points} fill="none" stroke={`${color}aa`} strokeWidth={strokeWidth} />
    </svg>
  );
}
