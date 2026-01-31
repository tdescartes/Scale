'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { API_CONFIG } from '../lib/config';

interface HistoricalChartProps {
    podName?: string;
}

export default function HistoricalChart({ podName }: HistoricalChartProps) {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeWindow, setTimeWindow] = useState(5); // minutes

    useEffect(() => {
        fetchHistoricalData();
        const interval = setInterval(fetchHistoricalData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [timeWindow]);

    const fetchHistoricalData = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.apiUrl}/api/metrics/history?minutes=${timeWindow}`);
            const data = response.data.historical_metrics;

            // Transform data for charting
            const chartData = transformDataForChart(data);
            setHistoricalData(chartData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setLoading(false);
        }
    };

    const transformDataForChart = (data: any[]) => {
        if (!data || data.length === 0) return [];

        // Group data by timestamp and create series for each pod
        return data.map(snapshot => {
            const result: any = {
                time: new Date(snapshot.timestamp * 1000).toLocaleTimeString(),
                timestamp: snapshot.timestamp,
            };

            // Add data for each pod
            snapshot.pods.forEach((pod: any) => {
                const podId = pod.name.split('-').pop(); // Get pod number
                result[`pod${podId}_requests`] = pod.requests;
                result[`pod${podId}_latency`] = pod.response_time_ms;
                result[`pod${podId}_errors`] = pod.error_rate * 100;
                result[`pod${podId}_cpu`] = pod.cpu_usage;
            });

            return result;
        });
    };

    // Get unique pod names from the data
    const getPodNames = () => {
        if (historicalData.length === 0) return [];
        const keys = Object.keys(historicalData[0]);
        const podIds = new Set<string>();
        keys.forEach(key => {
            const match = key.match(/pod(\d+)_/);
            if (match) {
                podIds.add(match[1]);
            }
        });
        return Array.from(podIds).sort();
    };

    const podColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Historical Performance</h3>
                <p className="text-gray-500 text-sm">Loading historical data...</p>
            </div>
        );
    }

    if (historicalData.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Historical Performance</h3>
                <p className="text-gray-500 text-sm">No historical data available yet. Metrics are being collected...</p>
            </div>
        );
    }

    const podNames = getPodNames();

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-black">Historical Performance</h3>
                <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(Number(e.target.value))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
                >
                    <option value={2}>Last 2 minutes</option>
                    <option value={5}>Last 5 minutes</option>
                    <option value={10}>Last 10 minutes</option>
                    <option value={15}>Last 15 minutes</option>
                </select>
            </div>

            <div className="space-y-8">
                {/* Request Distribution Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Request Distribution Over Time
                    </h4>
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis stroke="#6C757D" style={{ fontSize: '11px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E9ECEF',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                {podNames.map((podId, idx) => (
                                    <Line
                                        key={podId}
                                        type="monotone"
                                        dataKey={`pod${podId}_requests`}
                                        stroke={podColors[idx % podColors.length]}
                                        name={`Pod ${podId} Requests`}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Latency Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Response Time (Latency)
                    </h4>
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E9ECEF',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                {podNames.map((podId, idx) => (
                                    <Line
                                        key={podId}
                                        type="monotone"
                                        dataKey={`pod${podId}_latency`}
                                        stroke={podColors[idx % podColors.length]}
                                        name={`Pod ${podId} Latency`}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Error Rate Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Error Rate (%)
                    </h4>
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E9ECEF',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                {podNames.map((podId, idx) => (
                                    <Line
                                        key={podId}
                                        type="monotone"
                                        dataKey={`pod${podId}_errors`}
                                        stroke={podColors[idx % podColors.length]}
                                        name={`Pod ${podId} Errors`}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CPU Usage Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        CPU Usage (%)
                    </h4>
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#6C757D"
                                    style={{ fontSize: '11px' }}
                                    domain={[0, 100]}
                                    label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E9ECEF',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                {podNames.map((podId, idx) => (
                                    <Line
                                        key={podId}
                                        type="monotone"
                                        dataKey={`pod${podId}_cpu`}
                                        stroke={podColors[idx % podColors.length]}
                                        name={`Pod ${podId} CPU`}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
