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
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-2xl">⚙️</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Control Panel</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span>💥</span> Failure Injection
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Failure Type
              </label>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="latency">⏱️ Latency</option>
                <option value="error">❌ Error Injection</option>
                <option value="pod_failure">💣 Pod Failure</option>
                <option value="network_partition">🔌 Network Partition</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={failureSeverity}
                onChange={(e) => setFailureSeverity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Duration: <span className="text-orange-600 text-lg">{failureDuration}s</span>
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={failureDuration}
                onChange={(e) => setFailureDuration(Number(e.target.value))}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>300s</span>
              </div>
            </div>

            <button
              onClick={handleInjectFailure}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-xl hover:from-orange-700 hover:to-red-700 font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔥</span> Inject Failure
            </button>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
              <span>🤖</span> Auto-Tuning
            </h3>
            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95">
              Enable Auto-Tuning
            </button>
            <p className="text-xs text-gray-600 mt-3 italic">
              Automatically adjusts load balancer configuration to maintain 95% balance accuracy
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideIn">
            <p className="text-sm text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideIn">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <span>✅</span> {success}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
