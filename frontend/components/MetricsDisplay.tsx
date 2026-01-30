'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MetricsDisplayProps {
  metrics: any;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Real-Time Metrics</h2>
        <p className="text-gray-500">Waiting for metrics data...</p>
      </div>
    );
  }

  const pods = metrics.metrics?.pods || [];
  const balanceScore = metrics.balance_score || 0;
  const isBalanced = balanceScore >= 0.95;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Real-Time Metrics</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Balance Score</p>
            <p className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {(balanceScore * 100).toFixed(1)}%
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isBalanced ? '✓ Balanced' : '⚠ Imbalanced'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {pods.map((pod: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{pod.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Requests:</span>
                <span className="font-medium">{pod.requests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">{pod.response_time_ms.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPU Usage:</span>
                <span className="font-medium">{pod.cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory:</span>
                <span className="font-medium">{pod.memory_usage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Rate:</span>
                <span className="font-medium">{(pod.error_rate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pods}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
            <Bar dataKey="active_connections" fill="#10b981" name="Active Connections" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
