'use client';

import { useState, useEffect } from 'react';
import LoadTestPanel from '../components/LoadTestPanel';
import MetricsDisplay from '../components/MetricsDisplay';
import ResultsTable from '../components/ResultsTable';
import ControlPanel from '../components/ControlPanel';
import HistoricalChart from '../components/HistoricalChart';
import { API_CONFIG } from '../lib/config';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time metrics
    const connectWebSocket = () => {
      const ws = new WebSocket(`${API_CONFIG.wsUrl}/ws/metrics`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'metrics_update') {
          setMetrics(data.data);
        } else if (data.type === 'imbalance_alert') {
          // Show alert notification
          console.warn('Imbalance detected:', data.data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      ws.close();
    };
  }, []);

  const handleTestStart = (testId: string) => {
    setActiveTest(testId);
  };

  const handleTestComplete = (results: any) => {
    setTestResults([...testResults, results]);
    setActiveTest(null);
  };

  return (
    <main className="min-h-screen flex justify-center">
      <div className="w-full max-w-7xl px-6 py-8">
        <header className="mb-8 animate-fadeIn">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-black mb-2">
                  Load Balancer Simulator
                </h1>
                <p className="text-gray-600">
                  Kubernetes NGINX Ingress Load Testing & Optimization Platform
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${isConnected
                    ? 'bg-green-50 text-green-700 border-2 border-green-200'
                    : 'bg-red-50 text-red-700 border-2 border-red-200'
                    }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <LoadTestPanel
              onTestStart={handleTestStart}
              activeTest={activeTest}
            />
          </div>
          <div>
            <ControlPanel />
          </div>
        </div>

        <div className="mb-6">
          <MetricsDisplay metrics={metrics} />
        </div>

        <div className="mb-6">
          <HistoricalChart />
        </div>

        <div>
          <ResultsTable results={testResults} />
        </div>
      </div>
    </main>
  );
}
