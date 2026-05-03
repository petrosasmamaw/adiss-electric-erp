"use client";

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({ values = [], colors = [], size = 140, inner = 40 }) {
  const total = values.reduce((s, v) => s + Math.max(0, v), 0) || 1;
  let angle = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - 10) / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {values.map((v, i) => {
        const from = angle;
        const slice = (v / total) * 360;
        angle += slice;
        const to = angle;
        const d = describeArc(cx, cy, r, from, to);
        const color = colors[i] || ['#06b6d4', '#60a5fa', '#f59e0b', '#ef4444'][i % 4];
        return <path key={i} d={d} stroke={color} strokeWidth={20} fill="none" strokeLinecap="butt" />;
      })}
      <circle cx={cx} cy={cy} r={inner} fill="#fff" />
    </svg>
  );
}
