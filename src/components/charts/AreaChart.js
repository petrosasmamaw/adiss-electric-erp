"use client";

export default function AreaChart({ data = [], width = 500, height = 140, fill = "rgba(59,130,246,0.15)", stroke = "#3b82f6" }) {
  if (!data || data.length === 0) data = [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...data, 1);
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - (v / max) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const lastX = width;
  const baseY = height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={`${path} L ${lastX} ${baseY} L 0 ${baseY} Z`} fill={fill} stroke="none" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
