"use client";

export default function LineChart({ data = [], width = 500, height = 160, stroke = "#2563eb" }) {
  if (!data || data.length === 0) {
    data = [0, 0, 0, 0, 0, 0, 0];
  }

  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - (v / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1 || 1)) * width;
        const y = height - (v / max) * height;
        return <circle key={i} cx={x} cy={y} r="3" fill={stroke} />;
      })}
    </svg>
  );
}
