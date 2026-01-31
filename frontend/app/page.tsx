'use client';

import { useState, useEffect } from 'react';
import LoadTestPanel from '../components/LoadTestPanel';
import MetricsDisplay from '../components/MetricsDisplay';
import ResultsTable from '../components/ResultsTable';
import ControlPanel from '../components/ControlPanel';
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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                  ⚡ Load Balancer Simulator
                </h1>
                <p className="text-white/90 text-lg">
                  Kubernetes NGINX Ingress Load Testing & Optimization Platform
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 ${isConnected
                    ? 'bg-green-500 text-white animate-pulse'
                    : 'bg-red-500 text-white'
                  }`}>
                  {isConnected ? '● Live' : '● Offline'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn">
          <div className="lg:col-span-2 transform transition-all duration-300 hover:scale-[1.01]">
            <LoadTestPanel
              onTestStart={handleTestStart}
              activeTest={activeTest}
            />
          </div>
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <ControlPanel />
          </div>
        </div>

        <div className="mb-8 animate-fadeIn transform transition-all duration-300 hover:scale-[1.01]">
          <MetricsDisplay metrics={metrics} />
        </div>

        <div className="animate-fadeIn transform transition-all duration-300 hover:scale-[1.01]">
          <ResultsTable results={testResults} />
        </div>
      </div>
    </main>
  );
}
