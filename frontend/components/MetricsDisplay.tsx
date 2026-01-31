'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MetricsDisplayProps {
  metrics: any;
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  if (!metrics) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Real-Time Metrics</h2>
        <p className="text-gray-500 text-sm">Waiting for metrics data...</p>
      </div>
    );
  }

  const pods = metrics.metrics?.pods || [];
  const balanceScore = metrics.balance_score || 0;
  const isBalanced = balanceScore >= 0.95;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Real-Time Metrics</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Balance Score</p>
            <p className={`text-2xl font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {(balanceScore * 100).toFixed(1)}%
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded text-sm font-medium border ${isBalanced
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            {isBalanced ? 'Balanced' : 'Imbalanced'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {pods.map((pod: any, index: number) => {
          const isHealthy = pod.error_rate <= 0.05 && pod.cpu_usage < 80 && pod.memory_usage < 80;
          const statusColor = isHealthy ? 'green' : pod.error_rate > 0.1 ? 'red' : 'yellow';

          return (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black text-sm">{pod.name}</h3>
                    <span className={`inline-block w-2 h-2 rounded-full mt-1 ${statusColor === 'green' ? 'bg-green-500' :
                        statusColor === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">Requests</span>
                    <span className="text-lg font-bold text-black">{pod.requests}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Response</div>
                    <div className="text-base font-semibold text-black">{pod.response_time_ms.toFixed(1)}ms</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">CPU</div>
                    <div className={`text-base font-semibold ${pod.cpu_usage > 80 ? 'text-red-600' :
                        pod.cpu_usage > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{pod.cpu_usage.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Memory</div>
                    <div className={`text-base font-semibold ${pod.memory_usage > 80 ? 'text-red-600' :
                        pod.memory_usage > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{pod.memory_usage.toFixed(1)}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Errors</div>
                    <div className={`text-base font-semibold ${pod.error_rate > 0.05 ? 'text-red-600' : 'text-green-600'
                      }`}>{(pod.error_rate * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-gray-200 pt-8">
        <h3 className="text-base font-semibold text-black mb-6">
          Request Distribution
        </h3>
        <div className="h-72 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pods}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis dataKey="name" stroke="#6C757D" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6C757D" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E9ECEF',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="requests" fill="#3B82F6" name="Requests" />
              <Bar dataKey="active_connections" fill="#10B981" name="Active Connections" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
