type BarChartProps = {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
};

export function BarChart({ data, color = '#0891b2', height = 200 }: BarChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  const gap = barWidth * 0.2;
  const actualBarWidth = barWidth - gap;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {data.map((d, i) => {
          const barHeight = (d.value / maxVal) * (height / 2 - 20);
          const x = i * barWidth + gap / 2;
          const y = height / 2 - barHeight - 12;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={actualBarWidth}
                height={barHeight}
                fill={color}
                rx={0.5}
                className="transition-all duration-500"
                style={{ opacity: 0.85 }}
              />
              <text
                x={x + actualBarWidth / 2}
                y={height / 2 - 2}
                textAnchor="middle"
                fontSize={2.5}
                fill="#94a3b8"
              >
                {d.label}
              </text>
              {d.value > 0 && (
                <text
                  x={x + actualBarWidth / 2}
                  y={y - 1.5}
                  textAnchor="middle"
                  fontSize={2.5}
                  fill="#475569"
                  fontWeight={600}
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type LineChartProps = {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
};

export function LineChart({ data, color = '#0891b2', height = 200 }: LineChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const chartHeight = height / 2;
  const padding = 12;
  const innerHeight = chartHeight - padding * 2;
  const step = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = i * step;
    const y = padding + innerHeight - (d.value / maxVal) * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGradient)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={1.2} fill={color} />
            <text
              x={p.x}
              y={chartHeight - 1}
              textAnchor="middle"
              fontSize={2.2}
              fill="#94a3b8"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

type DonutChartProps = {
  data: { label: string; value: number; color: string }[];
  size?: number;
};

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="flex-shrink-0">
        <circle cx={50} cy={50} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={12} />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const segment = (
            <circle
              key={i}
              cx={50}
              cy={50}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={12}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
              className="transition-all duration-500"
            />
          );
          offset += dash;
          return segment;
        })}
        <text x={50} y={48} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0f172a">
          {total}
        </text>
        <text x={50} y={58} textAnchor="middle" fontSize={6} fill="#94a3b8">
          Total
        </text>
      </svg>
      <div className="space-y-2 flex-1 min-w-[140px]">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-ink-600 flex-1 truncate">{d.label}</span>
            <span className="font-semibold text-ink-900">{d.value}</span>
            <span className="text-ink-400 text-xs w-10 text-right">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
