'use client';

interface MetricCard {
  label: string;
  value: string;
  trend?: string;
}

interface GrowthPoint {
  month: string;
  revenue: number;
  students: number;
}

interface FinanceDashboardProps {
  metrics: MetricCard[];
  growthData: GrowthPoint[];
}

export function FinanceDashboard({ metrics, growthData }: FinanceDashboardProps) {
  const labels = growthData.map((item) => item.month);
  const maxRevenue = Math.max(...growthData.map((item) => item.revenue), 1);
  const maxStudents = Math.max(...growthData.map((item) => item.students), 1);

  const chartWidth = 600;
  const chartHeight = 220;
  const padding = 24;

  function mapToPoints(values: number[], maxValue: number) {
    return values.map((value, index) => {
      const x =
        padding +
        (index * (chartWidth - padding * 2)) / Math.max(values.length - 1, 1);
      const y =
        chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2);
      return `${x},${y}`;
    });
  }

  const revenuePoints = mapToPoints(
    growthData.map((item) => item.revenue),
    maxRevenue,
  ).join(' ');
  const studentPoints = mapToPoints(
    growthData.map((item) => item.students),
    maxStudents,
  ).join(' ');

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{metric.value}</p>
            {metric.trend ? <p className="mt-2 text-xs text-slate-400">{metric.trend}</p> : null}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold">Crescimento: alunos x faturamento</h3>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-64 w-full"
            role="img"
            aria-label="Curva de crescimento de alunos e faturamento"
          >
            <rect width={chartWidth} height={chartHeight} fill="transparent" />
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1f2937" />
            <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#1f2937" />
            <polyline points={studentPoints} fill="none" stroke="#22c55e" strokeWidth="3" />
            <polyline points={revenuePoints} fill="none" stroke="#38bdf8" strokeWidth="3" />
            {labels.map((label, index) => {
              const x =
                padding +
                (index * (chartWidth - padding * 2)) / Math.max(labels.length - 1, 1);
              return (
                <text
                  key={label}
                  x={x}
                  y={chartHeight - padding + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {label}
                </text>
              );
            })}
          </svg>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Novos alunos
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Faturamento (R$)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
