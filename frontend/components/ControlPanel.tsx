'use client';

import { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../lib/config';

export default function ControlPanel() {
  const [failureType, setFailureType] = useState('latency');
  const [failureSeverity, setFailureSeverity] = useState('medium');
  const [failureDuration, setFailureDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInjectFailure = async () => {
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.post(`${API_CONFIG.apiUrl}/api/failure/inject`, {
        type: failureType,
        severity: failureSeverity,
        duration: failureDuration,
        target: 'random',
      });

      setSuccess(response.data.result.message || 'Failure injected successfully');
    } catch (error: any) {
      console.error('Error injecting failure:', error);
      setError(error.response?.data?.error || 'Failed to inject failure');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
      <h2 className="text-xl font-semibold text-black mb-6">Control Panel</h2>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded p-4">
          <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wide">
            Failure Injection
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Failure Type
              </label>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-sm"
              >
                <option value="latency">Latency</option>
                <option value="error">Error Injection</option>
                <option value="pod_failure">Pod Failure</option>
                <option value="network_partition">Network Partition</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={failureSeverity}
                onChange={(e) => setFailureSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration: {failureDuration}s
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={failureDuration}
                onChange={(e) => setFailureDuration(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>300s</span>
              </div>
            </div>

            <button
              onClick={handleInjectFailure}
              className="w-full bg-black text-white px-4 py-2.5 rounded hover:bg-gray-800 font-medium text-sm transition-colors"
            >
              Inject Failure
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">
              Auto-Tuning
            </h3>
            <button className="w-full bg-white border border-gray-300 text-black px-4 py-2.5 rounded hover:bg-gray-50 font-medium text-sm transition-colors">
              Enable Auto-Tuning
            </button>
            <p className="text-xs text-gray-600 mt-3">
              Automatically adjusts load balancer configuration to maintain 95% balance accuracy
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
}
