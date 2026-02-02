/**
 * Simple Line Chart Component
 * Lightweight SVG-based line chart to replace recharts
 */

'use client';

import { useState, useMemo } from 'react';

interface DataPoint {
    [key: string]: any;
}

interface LineChartProps {
    data: DataPoint[];
    lines: {
        dataKey: string;
        color: string;
        name: string;
    }[];
    xKey: string;
    height?: number;
    showGrid?: boolean;
    showTooltip?: boolean;
}

export default function SimpleLineChart({
    data,
    lines,
    xKey,
    height = 250,
    showGrid = true,
    showTooltip = true,
}: LineChartProps) {
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null);

    const { xLabels, yMin, yMax, points } = useMemo(() => {
        if (!data || data.length === 0) {
            return { xLabels: [], yMin: 0, yMax: 100, points: {} };
        }

        const xLabels = data.map(d => d[xKey]);

        // Calculate min/max for all lines
        let globalMin = Infinity;
        let globalMax = -Infinity;

        lines.forEach(line => {
            data.forEach(d => {
                const value = d[line.dataKey];
                if (typeof value === 'number') {
                    globalMin = Math.min(globalMin, value);
                    globalMax = Math.max(globalMax, value);
                }
            });
        });

        // Add padding
        const padding = (globalMax - globalMin) * 0.1 || 1;
        const yMin = Math.max(0, globalMin - padding);
        const yMax = globalMax + padding;

        // Calculate points for each line
        const points: Record<string, string> = {};
        const padding_left = 40;
        const padding_right = 20;
        const padding_top = 20;
        const padding_bottom = 40;
        const chartWidth = 800 - padding_left - padding_right;
        const chartHeight = height - padding_top - padding_bottom;

        lines.forEach(line => {
            const linePoints = data.map((d, i) => {
                const x = padding_left + (i / (data.length - 1 || 1)) * chartWidth;
                const value = d[line.dataKey] || 0;
                const y = padding_top + chartHeight - ((value - yMin) / (yMax - yMin || 1)) * chartHeight;
                return `${x},${y}`;
            });
            points[line.dataKey] = linePoints.join(' ');
        });

        return { xLabels, yMin, yMax, points };
    }, [data, lines, xKey, height]);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-gray-400 text-sm">No data available</p>
            </div>
        );
    }

    const padding_left = 40;
    const padding_right = 20;
    const padding_top = 20;
    const padding_bottom = 40;
    const chartWidth = 800 - padding_left - padding_right;
    const chartHeight = height - padding_top - padding_bottom;

    // Grid lines
    const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
        const y = padding_top + (i / 4) * chartHeight;
        const value = yMax - (i / 4) * (yMax - yMin);
        return { y, value };
    }) : [];

    return (
        <div className="relative">
            <svg width="100%" height={height} viewBox={`0 0 800 ${height}`}>
                {/* Grid */}
                {showGrid && (
                    <g>
                        {gridLines.map((line, i) => (
                            <g key={i}>
                                <line
                                    x1={padding_left}
                                    y1={line.y}
                                    x2={padding_left + chartWidth}
                                    y2={line.y}
                                    stroke="#E5E7EB"
                                    strokeDasharray="3,3"
                                />
                                <text
                                    x={padding_left - 8}
                                    y={line.y + 4}
                                    textAnchor="end"
                                    fontSize="11"
                                    fill="#6B7280"
                                >
                                    {Math.round(line.value)}
                                </text>
                            </g>
                        ))}
                    </g>
                )}

                {/* Lines */}
                {lines.map((line, i) => (
                    <polyline
                        key={line.dataKey}
                        points={points[line.dataKey]}
                        fill="none"
                        stroke={line.color}
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                ))}

                {/* X-axis labels */}
                {xLabels.map((label, i) => {
                    if (i % Math.ceil(xLabels.length / 6) !== 0 && i !== xLabels.length - 1) return null;
                    const x = padding_left + (i / (data.length - 1 || 1)) * chartWidth;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - padding_bottom + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6B7280"
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3 justify-center">
                {lines.map(line => (
                    <div key={line.dataKey} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: line.color }}
                        />
                        <span className="text-xs text-gray-600">{line.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
