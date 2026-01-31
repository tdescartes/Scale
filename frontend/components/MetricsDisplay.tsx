'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MetricsDisplayProps {
  metrics: any;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  if (!metrics) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Real-Time Metrics</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-pulse text-6xl mb-4">⏳</div>
            <p className="text-gray-500 text-lg">Waiting for metrics data...</p>
          </div>
        </div>
      </div>
    );
  }

  const pods = metrics.metrics?.pods || [];
  const balanceScore = metrics.balance_score || 0;
  const isBalanced = balanceScore >= 0.95;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Real-Time Metrics</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-1">Balance Score</p>
            <p className={`text-4xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {(balanceScore * 100).toFixed(1)}%
            </p>
          </div>
          <div className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg ${isBalanced ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
            }`}>
            {isBalanced ? '✓ Balanced' : '⚠ Imbalanced'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {pods.map((pod: any, index: number) => (
          <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow">
                {index + 1}
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{pod.name}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-gray-600 font-medium">📈 Requests:</span>
                <span className="font-bold text-blue-600">{pod.requests}</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-gray-600 font-medium">⚡ Response:</span>
                <span className="font-bold text-purple-600">{pod.response_time_ms.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-gray-600 font-medium">💻 CPU:</span>
                <span className="font-bold text-green-600">{pod.cpu_usage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-gray-600 font-medium">🧠 Memory:</span>
                <span className="font-bold text-orange-600">{pod.memory_usage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 px-3 py-2 rounded-lg">
                <span className="text-gray-600 font-medium">❌ Errors:</span>
                <span className="font-bold text-red-600">{(pod.error_rate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> Request Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pods}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 600 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
              <Bar dataKey="requests" fill="url(#colorRequests)" name="Requests" radius={[8, 8, 0, 0]} />
              <Bar dataKey="active_connections" fill="url(#colorConnections)" name="Active Connections" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
