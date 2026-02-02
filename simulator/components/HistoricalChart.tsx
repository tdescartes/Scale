'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import SimpleLineChart from './SimpleLineChart';

interface HistoricalChartProps {
    podName?: string;
}

export default function HistoricalChart({ podName }: HistoricalChartProps) {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeWindow, setTimeWindow] = useState(5); // minutes

    useEffect(() => {
        fetchHistoricalData();
        const interval = setInterval(fetchHistoricalData, 5000);
        return () => clearInterval(interval);
    }, [timeWindow]);

    const fetchHistoricalData = async () => {
        try {
            const data = await api.get(`/api/metrics/history?minutes=${timeWindow}`);
            const chartData = transformDataForChart(data.historical_metrics || []);
            setHistoricalData(chartData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            setLoading(false);
        }
    };

    const transformDataForChart = (data: any[]) => {
        if (!data || data.length === 0) return [];

        return data.map(snapshot => {
            const result: any = {
                time: new Date(snapshot.timestamp * 1000).toLocaleTimeString(),
                timestamp: snapshot.timestamp,
            };

            snapshot.pods.forEach((pod: any) => {
                const podId = pod.name.split('-').pop();
                result[`pod${podId}_requests`] = pod.requests;
                result[`pod${podId}_latency`] = pod.response_time_ms;
                result[`pod${podId}_cpu`] = pod.cpu_usage;
            });

            return result;
        });
    };

    const getPodNames = () => {
        if (historicalData.length === 0) return [];
        const keys = Object.keys(historicalData[0]);
        const podIds = new Set<string>();
        keys.forEach(key => {
            const match = key.match(/pod(\d+)_/);
            if (match) podIds.add(match[1]);
        });
        return Array.from(podIds).sort();
    };

    const podColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
    const requestLines = podNames.map((podId, idx) => ({
        dataKey: `pod${podId}_requests`,
        color: podColors[idx % podColors.length],
        name: `Pod ${podId}`,
    }));

    const latencyLines = podNames.map((podId, idx) => ({
        dataKey: `pod${podId}_latency`,
        color: podColors[idx % podColors.length],
        name: `Pod ${podId}`,
    }));

    const cpuLines = podNames.map((podId, idx) => ({
        dataKey: `pod${podId}_cpu`,
        color: podColors[idx % podColors.length],
        name: `Pod ${podId}`,
    }));

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
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Request Distribution Over Time
                    </h4>
                    <SimpleLineChart data={historicalData} lines={requestLines} xKey="time" height={250} />
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Response Time (Latency)
                    </h4>
                    <SimpleLineChart data={historicalData} lines={latencyLines} xKey="time" height={250} />
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        CPU Usage
                    </h4>
                    <SimpleLineChart data={historicalData} lines={cpuLines} xKey="time" height={250} />
                </div>
            </div>
        </div>
    );
}
