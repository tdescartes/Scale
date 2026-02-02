'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useApiRequest } from '../hooks/useApiRequest';

interface LoadTestPanelProps {
  onTestStart: (testId: string) => void;
  activeTest: string | null;
  onConfigChange?: (config: any) => void;
}

export default function LoadTestPanel({ onTestStart, activeTest, onConfigChange }: LoadTestPanelProps) {
  const [users, setUsers] = useState(100);
  const [duration, setDuration] = useState(60);
  const [spawnRate, setSpawnRate] = useState(10);
  const [targetUrl, setTargetUrl] = useState('http://localhost:8080');
  const [scenario, setScenario] = useState('high_traffic');
  const [explanation, setExplanation] = useState<string>('');

  const { loading: isLoading, error, setError, execute } = useApiRequest();

  // Notify parent of config changes and generate explanation
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({ users, duration, spawnRate, scenario });
    }
    generateExplanation();
  }, [users, duration, spawnRate, scenario]);

  const generateExplanation = () => {
    const scenarioDescriptions: Record<string, string> = {
      high_traffic: `🚀 **High Traffic**: Testing with ${users} concurrent users simulating peak load conditions`,
      spike: `⚡ **Traffic Spike**: Rapid burst from baseline to ${users} users testing surge resilience`,
      sustained: `⏱️ **Sustained Load**: Maintaining ${users} users for ${duration}s to test long-term stability`,
      gradual_ramp: `📈 **Gradual Ramp**: Slowly increasing to ${users} users to identify capacity limits`,
    };

    const rampTime = Math.ceil(users / spawnRate);
    const steadyTime = duration - rampTime;

    setExplanation(
      `${scenarioDescriptions[scenario] || ''}\n\n` +
      `⚙️ **Configuration**: ${users} users spawning at ${spawnRate}/s (${rampTime}s ramp-up, ${steadyTime}s steady-state)`
    );
  };

  const handleStartTest = async () => {
    const response = await execute('/api/load-test/start', {
      method: 'POST',
      body: JSON.stringify({
        target_url: targetUrl,
        users,
        duration,
        spawn_rate: spawnRate,
      }),
    });

    if (response?.test_id) {
      onTestStart(response.test_id);
    }
  };

  const handleStopTest = async () => {
    if (!activeTest) return;
    await execute(`/api/load-test/stop/${activeTest}`, { method: 'POST' });
  };

  const handleGenerateScenario = async () => {
    const response = await execute('/api/scenario/generate', {
      method: 'POST',
      body: JSON.stringify({ type: scenario, duration }),
    });

    if (response?.scenario?.config) {
      const config = response.scenario.config;
      setUsers(config.users);
      setSpawnRate(config.spawn_rate);
      setDuration(config.duration);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-black">Load Test Configuration</h2>
      </div>

      {explanation && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
          <p className="text-sm text-blue-900 whitespace-pre-line">{explanation}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target URL
          </label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
            placeholder="http://localhost:8080"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scenario Type
          </label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white text-sm"
          >
            <option value="high_traffic">High Traffic</option>
            <option value="spike">Traffic Spike</option>
            <option value="sustained">Sustained Load</option>
            <option value="gradual_ramp">Gradual Ramp</option>
          </select>
          <button
            onClick={handleGenerateScenario}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            ✨ Generate with AI
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Users: {users}
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={users}
              onChange={(e) => setUsers(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>1000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spawn Rate: {spawnRate}/s
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={spawnRate}
              onChange={(e) => setSpawnRate(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration: {duration}s
            </label>
            <input
              type="range"
              min="10"
              max="600"
              step="10"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10s</span>
              <span>600s</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 mt-5">
          <button
            onClick={handleStartTest}
            disabled={activeTest !== null || isLoading}
            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm transition-colors"
          >
            {isLoading ? 'Starting...' : '▶ Start Test'}
          </button>
          <button
            onClick={handleStopTest}
            disabled={activeTest === null}
            className="flex-1 bg-red-600 border border-red-600 text-white px-4 py-2.5 rounded hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed font-medium text-sm transition-colors"
          >
            ■ Stop Test
          </button>
        </div>

        {activeTest && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              Test ID: <span className="font-mono">{activeTest.substring(0, 12)}...</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
