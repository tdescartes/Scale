'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ControlPanel() {
  const [failureType, setFailureType] = useState('latency');
  const [failureSeverity, setFailureSeverity] = useState('medium');
  const [failureDuration, setFailureDuration] = useState(60);

  const handleInjectFailure = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/failure/inject', {
        type: failureType,
        severity: failureSeverity,
        duration: failureDuration,
        target: 'random',
      });
      
      alert(`Failure injected: ${response.data.result.message}`);
    } catch (error) {
      console.error('Error injecting failure:', error);
      alert('Failed to inject failure');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Control Panel</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Failure Injection</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Failure Type
              </label>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full"
              />
            </div>

            <button
              onClick={handleInjectFailure}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Inject Failure
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Auto-Tuning</h3>
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Enable Auto-Tuning
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Automatically adjusts load balancer configuration to maintain 95% balance accuracy
          </p>
        </div>
      </div>
    </div>
  );
}
