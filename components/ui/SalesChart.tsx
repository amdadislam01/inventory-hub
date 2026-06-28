'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

interface SalesChartProps {
  data: Array<{ date: string; revenue: number; orders: number }>;
  title?: string;
  loading?: boolean;
}

export default function SalesChart({ data = [], title = 'Sales Revenue Trend', loading = false }: SalesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-background border border-border rounded-2xl p-6 shadow-xl h-[320px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-background border border-border rounded-2xl p-6 shadow-xl h-[320px] flex flex-col items-center justify-center text-muted-foreground text-sm">
        <TrendingUp className="w-10 h-10 text-muted-foreground/50 mb-2" />
        <p>No sales data available for this range.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, data: d, index };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const gridLevels = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="bg-background border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          {title}
        </h3>
        <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full border border-border font-medium print:hidden">
          Interactive
        </span>
      </div>

      <div className="relative w-full h-[240px] select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.00" />
            </linearGradient>
            {/* Line Gradient */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis labels */}
          {gridLevels.map((level, i) => {
            const y = paddingTop + chartHeight - level * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.75"
                  strokeDasharray="4 4"
                  className="opacity-70"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3}
                  className="text-[10px] font-semibold fill-muted-foreground/80 font-mono"
                  textAnchor="end"
                >
                  ${Math.round(level * maxRevenue).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area Path */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#areaGradient)"
              className="animate-[fadeIn_0.5s_ease-out]"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* X Axis Labels */}
          {points.map((p, i) => {
            if (i % labelStep !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={svgHeight - 12}
                className="text-[9px] font-semibold fill-muted-foreground/80 font-mono"
                textAnchor="middle"
              >
                {p.data.date}
              </text>
            );
          })}

          {/* Hover indicator lines and active circles */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              <line
                x1={points[hoveredIndex].x}
                y1={paddingTop}
                x2={points[hoveredIndex].x}
                y2={paddingTop + chartHeight}
                stroke="var(--muted-foreground)"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="opacity-50"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="6"
                fill="#10b981"
                stroke="var(--card)"
                strokeWidth="2"
                className="shadow-md"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="10"
                fill="#10b981"
                fillOpacity="0.15"
                className="animate-ping"
              />
            </g>
          )}

          {/* Interactive hover trigger overlay columns */}
          {points.map((p, i) => {
            const colWidth = chartWidth / Math.max(data.length - 1, 1);
            const x = p.x - colWidth / 2;
            return (
              <rect
                key={i}
                x={x}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* HTML Tooltip Card */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-30 bg-card/95 backdrop-blur-md border border-border px-3 py-2 rounded-xl shadow-xl pointer-events-none transition-all duration-150 flex flex-col gap-0.5 border-emerald-500/20 text-xs font-mono"
            style={{
              left: `${Math.min(
                Math.max(5, (points[hoveredIndex].x / svgWidth) * 100 - 15),
                80
              )}%`,
              top: `${Math.max(5, (points[hoveredIndex].y / svgHeight) * 100 - 28)}%`,
            }}
          >
            <span className="text-[10px] text-muted-foreground font-semibold">
              {points[hoveredIndex].data.date}
            </span>
            <div className="flex items-center gap-1.5 text-foreground font-bold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500 -ml-0.5" />
              <span>{points[hoveredIndex].data.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {points[hoveredIndex].data.orders} {points[hoveredIndex].data.orders === 1 ? 'order' : 'orders'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
