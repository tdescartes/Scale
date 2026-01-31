'use client';

import { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../lib/config';

interface LoadTestPanelProps {
  onTestStart: (testId: string) => void;
  activeTest: string | null;
}

export default function LoadTestPanel({ onTestStart, activeTest }: LoadTestPanelProps) {
  const [users, setUsers] = useState(100);
  const [duration, setDuration] = useState(60);
  const [spawnRate, setSpawnRate] = useState(10);
  const [targetUrl, setTargetUrl] = useState('http://localhost:8080');
  const [scenario, setScenario] = useState('high_traffic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_CONFIG.apiUrl}/api/load-test/start`, {
        target_url: targetUrl,
        users,
        duration,
        spawn_rate: spawnRate,
      });

      onTestStart(response.data.test_id);
    } catch (error: any) {
      console.error('Error starting test:', error);
      setError(error.response?.data?.error || 'Failed to start test');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTest = async () => {
    if (!activeTest) return;

    try {
      await axios.post(`${API_CONFIG.apiUrl}/api/load-test/stop/${activeTest}`);
    } catch (error) {
      console.error('Error stopping test:', error);
      setError('Failed to stop test');
    }
  };

  const handleGenerateScenario = async () => {
    try {
      const response = await axios.post(`${API_CONFIG.apiUrl}/api/scenario/generate`, {
        type: scenario,
        duration,
      });

      const config = response.data.scenario.config;
      setUsers(config.users);
      setSpawnRate(config.spawn_rate);
      setDuration(config.duration);
    } catch (error) {
      console.error('Error generating scenario:', error);
      setError('Failed to generate scenario');
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-2xl">🚀</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Load Test Configuration</h2>
      </div>

      <div className="space-y-6">{error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-slideIn">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎯 Target URL
          </label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
            placeholder="http://localhost:8080"
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📊 Scenario Type
          </label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white group-hover:border-gray-400"
          >
            <option value="high_traffic">High Traffic</option>
            <option value="spike">Traffic Spike</option>
            <option value="sustained">Sustained Load</option>
            <option value="gradual_ramp">Gradual Ramp</option>
          </select>
          <button
            onClick={handleGenerateScenario}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-2"
          >
            <span>✨</span> Generate with AI
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            👥 Concurrent Users: <span className="text-blue-600 text-lg">{users}</span>
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10</span>
            <span>1000</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ⚡ Spawn Rate (users/sec): <span className="text-purple-600 text-lg">{spawnRate}</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={spawnRate}
            onChange={(e) => setSpawnRate(Number(e.target.value))}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-xl border border-green-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ⏱️ Duration (seconds): <span className="text-green-600 text-lg">{duration}</span>
          </label>
          <input
            type="range"
            min="10"
            max="600"
            step="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10s</span>
            <span>600s</span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleStartTest}
            disabled={activeTest !== null || isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? '⏳ Starting...' : '▶️ Start Test'}
          </button>
          <button
            onClick={handleStopTest}
            disabled={activeTest === null}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            ⏹️ Stop Test
          </button>
        </div>

        {activeTest && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-400 rounded-xl animate-pulse shadow-lg">
            <p className="text-sm text-white font-medium flex items-center gap-2">
              <span className="text-lg">🏃</span>
              Test running: <span className="font-mono bg-white/20 px-2 py-1 rounded">{activeTest.substring(0, 12)}...</span>
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
