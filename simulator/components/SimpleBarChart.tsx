/**
 * Simple Bar Chart Component
 * Lightweight SVG-based bar chart to replace recharts
 */

'use client';

interface BarData {
    label: string;
    value: number;
    color?: string;
}

interface SimpleBarChartProps {
    data: BarData[];
    height?: number;
    showValues?: boolean;
}

export default function SimpleBarChart({
    data,
    height = 200,
    showValues = true,
}: SimpleBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-gray-400 text-sm">No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = 600 - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / data.length - 10;

    return (
        <svg width="100%" height={height} viewBox={`0 0 600 ${height}`}>
            {/* Bars */}
            {data.map((item, i) => {
                const barHeight = (item.value / maxValue) * chartHeight;
                const x = padding.left + i * (chartWidth / data.length) + 5;
                const y = padding.top + chartHeight - barHeight;

                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={item.color || '#3B82F6'}
                            rx="4"
                        />

                        {showValues && (
                            <text
                                x={x + barWidth / 2}
                                y={y - 8}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#374151"
                                fontWeight="600"
                            >
                                {item.value.toFixed(0)}
                            </text>
                        )}

                        <text
                            x={x + barWidth / 2}
                            y={padding.top + chartHeight + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6B7280"
                        >
                            {item.label}
                        </text>
                    </g>
                );
            })}

            {/* Y-axis */}
            <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + chartHeight}
                stroke="#D1D5DB"
                strokeWidth="1"
            />

            {/* X-axis */}
            <line
                x1={padding.left}
                y1={padding.top + chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight}
                stroke="#D1D5DB"
                strokeWidth="1"
            />
        </svg>
    );
}
