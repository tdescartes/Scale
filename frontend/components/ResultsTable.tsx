'use client';

import { useState } from 'react';

interface ResultsTableProps {
  results: any[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('test_id');

  if (results.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Test Results</h2>
        <p className="text-gray-500 text-sm">No test results yet. Start a test to see results.</p>
      </div>
    );
  }

  // Filter results
  const filteredResults = results.filter(result =>
    filterStatus === 'all' || result.status === filterStatus
  );

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'success_rate') {
      const aRate = a.requests?.successful && a.requests?.total
        ? (a.requests.successful / a.requests.total)
        : 0;
      const bRate = b.requests?.successful && b.requests?.total
        ? (b.requests.successful / b.requests.total)
        : 0;
      return bRate - aRate;
    }
    if (sortBy === 'balance_score') {
      return (parseFloat(b.balance_score || 0) - parseFloat(a.balance_score || 0));
    }
    return 0;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Test Results</h2>

        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
          >
            <option value="test_id">Sort by Test ID</option>
            <option value="success_rate">Sort by Success Rate</option>
            <option value="balance_score">Sort by Balance Score</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Test ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Algorithm
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Requests
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Errors (4xx/5xx)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                P50 / P95 / P99
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Balance Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResults.map((result, index) => {
              const successRate = result.requests?.successful && result.requests?.total
                ? (result.requests.successful / result.requests.total * 100).toFixed(1)
                : 'N/A';

              const isExpanded = expandedRow === index;

              return (
                <>
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                      {result.test_id?.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {result.algorithm || 'round_robin'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded border ${result.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : result.status === 'running'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {result.requests?.total?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-medium ${parseFloat(successRate) >= 99 ? 'text-green-600' :
                          parseFloat(successRate) >= 95 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {successRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="text-yellow-600">{result.requests?.errors_4xx || 0}</span>
                      {' / '}
                      <span className="text-red-600">{result.requests?.errors_5xx || 0}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {result.response_times?.p50?.toFixed(0) || 'N/A'} /
                      {result.response_times?.p95?.toFixed(0) || 'N/A'} /
                      {result.response_times?.p99?.toFixed(0) || 'N/A'}ms
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-medium ${parseFloat(result.balance_score || 0) >= 0.95 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {(parseFloat(result.balance_score || 0) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : index)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {isExpanded ? '▼ Hide' : '▶ Details'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && result.pods && (
                    <tr>
                      <td colSpan={9} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-black uppercase tracking-wide">
                            Per-Pod Breakdown
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {result.pods.map((pod: any, podIndex: number) => (
                              <div key={podIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="font-mono text-xs font-semibold text-gray-700 mb-3">
                                  {pod.name}
                                </div>

                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Requests:</span>
                                    <span className="font-medium text-black">{pod.requests.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Success:</span>
                                    <span className="font-medium text-green-600">{pod.successful.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">4xx Errors:</span>
                                    <span className="font-medium text-yellow-600">{pod.errors_4xx}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">5xx Errors:</span>
                                    <span className="font-medium text-red-600">{pod.errors_5xx}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                    <span className="text-gray-600">Avg Latency:</span>
                                    <span className="font-medium text-black">{pod.response_time_mean?.toFixed(1)}ms</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">P95 Latency:</span>
                                    <span className="font-medium text-black">{pod.response_time_p95?.toFixed(1)}ms</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {result.health_checks && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                Health Checks & Failovers
                              </h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Health Checks:</span>
                                  <span className="font-medium text-black">{result.health_checks.total}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Passed:</span>
                                  <span className="font-medium text-green-600">{result.health_checks.passed}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Failed:</span>
                                  <span className="font-medium text-red-600">{result.health_checks.failed}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Failover Events:</span>
                                  <span className="font-medium text-red-600">{result.failover_events || 0}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
