'use client';

import { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../lib/config';

interface ControlPanelProps {
  onAlgorithmChange?: (algorithm: string) => void;
  onFailureInjection?: (config: any) => void;
}

export default function ControlPanel({ onAlgorithmChange, onFailureInjection }: ControlPanelProps) {
  const [failureType, setFailureType] = useState('latency');
  const [failureSeverity, setFailureSeverity] = useState('medium');
  const [failureDuration, setFailureDuration] = useState(60);
  const [algorithm, setAlgorithm] = useState('round_robin');
  const [autoTuning, setAutoTuning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInjectFailure = async () => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);
    try {
      const config = {
        type: failureType,
        severity: failureSeverity,
        duration: failureDuration,
        target: 'random',
      };

      const response = await axios.post(`${API_CONFIG.apiUrl}/api/failure/inject`, config);

      setSuccess(response.data.result.message || 'Failure injected successfully');

      if (onFailureInjection) {
        onFailureInjection(config);
      }
    } catch (error: any) {
      console.error('Error injecting failure:', error);
      setError(error.response?.data?.error || 'Failed to inject failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeAlgorithm = async () => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);
    try {
      const response = await axios.post(`${API_CONFIG.apiUrl}/api/algorithm/change`, {
        algorithm: algorithm,
      });

      setSuccess(response.data.message || `Algorithm changed to ${algorithm}`);

      if (onAlgorithmChange) {
        onAlgorithmChange(algorithm);
      }
    } catch (error: any) {
      console.error('Error changing algorithm:', error);
      setError(error.response?.data?.error || 'Failed to change algorithm');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleAutoTuning = async () => {
    const newState = !autoTuning;
    setAutoTuning(newState);

    try {
      const response = await axios.post(`${API_CONFIG.apiUrl}/api/autoscaling/toggle`, {
        enabled: newState,
      });

      if (newState) {
        setSuccess(`Dynamic pod scaling enabled - ${response.data.config.min_pods}-${response.data.config.max_pods} pods`);
      } else {
        setSuccess('Dynamic pod scaling disabled - pod count will remain fixed');
      }
    } catch (error: any) {
      console.error('Error toggling auto-scaling:', error);
      setError(error.response?.data?.error || 'Failed to toggle auto-scaling');
      // Revert state on error
      setAutoTuning(!newState);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-6">Control Panel</h2>

      <div className="space-y-5">
        <div className="border border-gray-200 rounded p-4">
          <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wide">
            Load Balancing Algorithm
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-sm"
              >
                <option value="round_robin">Round Robin</option>
                <option value="least_connections">Least Connections</option>
                <option value="ip_hash">IP Hash</option>
                <option value="weighted_round_robin">Weighted Round Robin</option>
                <option value="least_response_time">Least Response Time</option>
              </select>
            </div>

            <button
              onClick={handleChangeAlgorithm}
              disabled={isProcessing}
              className="w-full bg-black text-white px-4 py-2.5 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {isProcessing ? 'Applying...' : 'Apply Algorithm'}
            </button>
          </div>
        </div>

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
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isProcessing}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isProcessing}
                className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-black disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>300s</span>
              </div>
            </div>

            <button
              onClick={handleInjectFailure}
              disabled={isProcessing}
              className="w-full bg-red-600 text-white px-4 py-2.5 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {isProcessing ? 'Injecting...' : 'Inject Failure'}
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wide">
              Dynamic Pod Scaling
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoTuning}
                onChange={handleToggleAutoTuning}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <p className="text-xs text-gray-600">
            {autoTuning
              ? '✓ Pods auto-scale (2-10) based on traffic (800-1200 req/pod)'
              : 'Enable automatic pod scaling based on traffic volume'}
          </p>
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
