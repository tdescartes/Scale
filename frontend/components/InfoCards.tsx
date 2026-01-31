'use client';

import { useState } from 'react';

interface InfoCard {
  id: string;
  title: string;
  icon: string;
  content: string;
  details: string[];
}

const infoCards: InfoCard[] = [
  {
    id: 'scenarios',
    title: 'Scenario Types',
    icon: '📊',
    content: 'Different load testing scenarios simulate various real-world traffic patterns.',
    details: [
      'High Traffic: Simulates peak usage with constant high load (500-1000 concurrent users)',
      'Traffic Spike: Sudden burst of users testing system resilience (rapid scaling from 100 to 1000+ users)',
      'Sustained Load: Long-duration steady traffic to test stability over time',
      'Gradual Ramp: Slowly increasing load to identify breaking points and capacity limits',
    ],
  },
  {
    id: 'algorithms',
    title: 'Load Balancing Algorithms',
    icon: '⚖️',
    content: 'Different algorithms determine how requests are distributed across backend pods.',
    details: [
      'Round Robin: Distributes requests sequentially across all pods (simplest, fair distribution)',
      'Least Connections: Routes to pod with fewest active connections (good for varying request durations)',
      'IP Hash: Routes based on client IP hash (ensures session persistence)',
      'Weighted Round Robin: Assigns more requests to higher-capacity pods (useful for heterogeneous backends)',
      'Least Response Time: Routes to pod with fastest recent response (optimizes for performance)',
    ],
  },
  {
    id: 'failures',
    title: 'Failure Injection',
    icon: '⚠️',
    content: 'Chaos engineering techniques to test system resilience and recovery.',
    details: [
      'Latency Injection: Adds artificial delays to test timeout handling (10ms-5000ms)',
      'Error Injection: Forces HTTP errors (4xx/5xx) to test error handling logic',
      'Pod Failure: Simulates complete pod crashes to test failover mechanisms',
      'Network Partition: Simulates network isolation to test distributed system behavior',
    ],
  },
  {
    id: 'autoscaling',
    title: 'Auto-Scaling',
    icon: '🔄',
    content: 'Dynamic pod scaling based on real-time load to optimize resource utilization.',
    details: [
      'Scales from 2 to 10 pods based on average requests per pod',
      'Scale-up threshold: 1200 requests/pod (adds pods when overloaded)',
      'Scale-down threshold: 800 requests/pod (removes pods when underutilized)',
      '30-second cooldown prevents thrashing and ensures stability',
      'Automatically tracks historical performance for analysis',
    ],
  },
];

export default function InfoCards() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-black mb-4">💡 Did You Know?</h3>
      {infoCards.map((card) => {
        const isExpanded = expandedCard === card.id;
        
        return (
          <div
            key={card.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
          >
            <button
              onClick={() => toggleCard(card.id)}
              className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-black text-sm mb-1">{card.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{card.content}</p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 animate-fadeIn">
                <ul className="space-y-2">
                  {card.details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
