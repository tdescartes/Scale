'use client';

import { useState, useEffect } from 'react';
import LoadTestPanel from '../components/LoadTestPanel';
import MetricsDisplay from '../components/MetricsDisplay';
import ResultsTable from '../components/ResultsTable';
import ControlPanel from '../components/ControlPanel';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time metrics
    const ws = new WebSocket('ws://localhost:8000/ws/metrics');
    
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
    };
    
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
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Load Balancer Simulator & Tester
          </h1>
          <p className="text-gray-600">
            Kubernetes NGINX Ingress Load Testing & Optimization Platform
          </p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

        <div className="mb-8">
          <MetricsDisplay metrics={metrics} />
        </div>

        <div>
          <ResultsTable results={testResults} />
        </div>
      </div>
    </main>
  );
}
