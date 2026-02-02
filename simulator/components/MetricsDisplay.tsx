'use client';

import SimpleBarChart from './SimpleBarChart';
import { getPercentageColor } from '../lib/utils';

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
  const algorithm = metrics.metrics?.algorithm || 'unknown';
  const healthEvents = metrics.health_check_events || [];
  const failoverEvents = metrics.failover_events || [];
  const scalingStatus = metrics.metrics?.scaling_status;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-black">Real-Time Metrics</h2>
          <p className="text-xs text-gray-500 mt-1">
            Algorithm: <span className="font-mono font-medium">{algorithm}</span>
            {scalingStatus && (
              <span className="ml-3">
                Pods: <span className="font-mono font-medium">{scalingStatus.current_pods}</span>
                <span className="text-gray-400"> ({scalingStatus.min_pods}-{scalingStatus.max_pods})</span>
              </span>
            )}
          </p>
        </div>
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

      {scalingStatus && (
        <div className={`border rounded-lg p-4 mb-6 ${scalingStatus.auto_scaling_enabled
          ? 'bg-blue-50 border-blue-200'
          : 'bg-gray-50 border-gray-200'
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${scalingStatus.auto_scaling_enabled ? 'text-blue-700' : 'text-gray-700'
                }`}>
                {scalingStatus.auto_scaling_enabled ? '🔄 Auto-Scaling Active' : '⏸️ Fixed Pod Count'}
              </h3>
              <p className={`text-xs ${scalingStatus.auto_scaling_enabled ? 'text-blue-600' : 'text-gray-600'
                }`}>
                {scalingStatus.auto_scaling_enabled
                  ? `Average load: ${scalingStatus.avg_load_per_pod.toFixed(0)} req/pod • Scale at ${800}-${1200} req/pod`
                  : 'Dynamic scaling disabled - pod count will remain constant'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${scalingStatus.auto_scaling_enabled ? 'text-blue-700' : 'text-gray-700'
                }`}>{scalingStatus.current_pods}</div>
              <div className={`text-xs ${scalingStatus.auto_scaling_enabled ? 'text-blue-600' : 'text-gray-600'
                }`}>
                Active Pods ({scalingStatus.min_pods}-{scalingStatus.max_pods})
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {pods.map((pod: any, index: number) => {
          const isHealthy = pod.health_status === 'healthy';
          const errorRate = pod.error_rate || 0;
          const statusColor = isHealthy ? (errorRate > 0.05 ? 'yellow' : 'green') : 'red';

          return (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black text-sm">{pod.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${statusColor === 'green' ? 'bg-green-500' :
                        statusColor === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></span>
                      <span className="text-xs text-gray-500">{pod.health_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">Requests</span>
                    <span className="text-lg font-bold text-black">{pod.requests}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
                    <span>Success: {pod.successful_requests || pod.requests}</span>
                    <span className="text-red-600">4xx: {pod.errors_4xx || 0} | 5xx: {pod.errors_5xx || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Latency</div>
                    <div className="text-base font-semibold text-black">{pod.response_time_ms.toFixed(1)}ms</div>
                    <div className="text-xs text-gray-500 mt-1">
                      P95: {(pod.response_time_p95 || pod.response_time_ms).toFixed(1)}ms
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Throughput</div>
                    <div className="text-base font-semibold text-black">{(pod.throughput_rps || 0).toFixed(1)}</div>
                    <div className="text-xs text-gray-500 mt-1">req/sec</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">CPU</div>
                    <div className={`text-base font-semibold ${pod.cpu_usage > 80 ? 'text-red-600' :
                      pod.cpu_usage > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{pod.cpu_usage.toFixed(1)}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Memory</div>
                    <div className={`text-base font-semibold ${pod.memory_usage > 80 ? 'text-red-600' :
                      pod.memory_usage > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{pod.memory_usage.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500 uppercase">Error Rate</span>
                    <span className={`text-base font-semibold ${errorRate > 0.05 ? 'text-red-600' : 'text-green-600'
                      }`}>{(errorRate * 100).toFixed(2)}%</span>
                  </div>
                  {pod.health_check_failures > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      Health check failures: {pod.health_check_failures}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Health Check & Failover Events */}
      {(healthEvents.length > 0 || failoverEvents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {healthEvents.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
                Recent Health Checks
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {healthEvents.slice(0, 5).map((event: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded">
                    <span className="font-mono text-gray-700">{event.pod}</span>
                    <span className={`px-2 py-0.5 rounded font-medium ${event.status === 'passed' ? 'bg-green-100 text-green-700' :
                      event.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {failoverEvents.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">
                Failover Events
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {failoverEvents.slice(0, 5).map((event: any, idx: number) => (
                  <div key={idx} className="bg-white p-2 rounded border border-red-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-gray-700">{event.failed_pod}</span>
                      <span className="text-red-600 font-medium">{event.reason}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Redirected: {event.requests_redirected} requests
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t-2 border-gray-200 pt-8">
        <h3 className="text-base font-semibold text-black mb-6">
          Request Distribution
        </h3>
        <SimpleBarChart
          data={pods.map((pod: any) => ({
            label: pod.name.split('-').pop() || pod.name,
            value: pod.requests,
            color: '#3B82F6',
          }))}
          height={280}
        />
      </div>
    </div>
  );
}
