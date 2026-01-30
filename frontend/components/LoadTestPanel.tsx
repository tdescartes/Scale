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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Load Test Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target URL
          </label>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high_traffic">High Traffic</option>
            <option value="spike">Traffic Spike</option>
            <option value="sustained">Sustained Load</option>
            <option value="gradual_ramp">Gradual Ramp</option>
          </select>
          <button
            onClick={handleGenerateScenario}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Generate with LLM
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Concurrent Users: {users}
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10</span>
            <span>1000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spawn Rate (users/sec): {spawnRate}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={spawnRate}
            onChange={(e) => setSpawnRate(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (seconds): {duration}
          </label>
          <input
            type="range"
            min="10"
            max="600"
            step="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
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
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Starting...' : 'Start Test'}
          </button>
          <button
            onClick={handleStopTest}
            disabled={activeTest === null}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Stop Test
          </button>
        </div>

        {activeTest && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Test running: <span className="font-mono">{activeTest}</span>
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
