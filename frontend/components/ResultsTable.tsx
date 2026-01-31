'use client';

interface ResultsTableProps {
  results: any[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Test Results</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🧪</div>
            <p className="text-gray-500 text-lg">No test results yet. Start a test to see results.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Test Results</h2>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                🆔 Test ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                📊 Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                📈 Total Requests
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ✅ Success Rate
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ⚡ Avg Response
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                🎯 P95 Response
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ⚖️ Balance Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{results.map((result, index) => {
            const successRate = result.requests?.successful && result.requests?.total
              ? (result.requests.successful / result.requests.total * 100).toFixed(1)
              : 'N/A';

            return (
              <tr key={index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900 bg-gray-50">
                  {result.test_id?.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-md ${result.status === 'completed'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    }`}>
                    {result.status === 'completed' ? '✓ ' : '⏳ '}{result.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                  {result.requests?.total?.toLocaleString() || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  {successRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                  {result.response_times?.mean?.toFixed(1) || 'N/A'}ms
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                  {result.response_times?.p95?.toFixed(1) || 'N/A'}ms
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-bold ${parseFloat(result.balance_score || 0) >= 0.95 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {(parseFloat(result.balance_score || 0) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
