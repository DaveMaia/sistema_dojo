'use client';

interface RadarStat {
  label: string;
  value: number;
}

interface RadarChartProps {
  stats: RadarStat[];
}

export function RadarChart({ stats }: RadarChartProps) {
  const size = 240;
  const center = size / 2;
  const radius = size / 2 - 20;
  const angleStep = (Math.PI * 2) / stats.length;

  const points = stats
    .map((stat, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const valueRadius = radius * (stat.value / 100);
      const x = center + valueRadius * Math.cos(angle);
      const y = center + valueRadius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Radar de atributos">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle key={scale} cx={center} cy={center} r={radius * scale} stroke="#1f2937" fill="none" />
        ))}
        {stats.map((stat, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <g key={stat.label}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#1f2937" />
              <text
                x={center + (radius + 10) * Math.cos(angle)}
                y={center + (radius + 10) * Math.sin(angle)}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                {stat.label}
              </text>
            </g>
          );
        })}
        <polygon points={points} fill="rgba(16,185,129,0.25)" stroke="#34d399" strokeWidth="2" />
      </svg>
      <div className="grid w-full grid-cols-2 gap-2 text-xs text-slate-400">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between rounded-lg bg-slate-900/60 px-3 py-2">
            <span>{stat.label}</span>
            <span className="font-semibold text-slate-200">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
