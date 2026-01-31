'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../lib/config';

interface ScenarioExplainerProps {
    testConfig: {
        users: number;
        duration: number;
        spawnRate: number;
        scenario: string;
    };
    controlConfig: {
        algorithm: string;
        failureType: string;
        failureSeverity: string;
        failureDuration: number;
    };
}

export default function ScenarioExplainer({ testConfig, controlConfig }: ScenarioExplainerProps) {
    const [explanation, setExplanation] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        generateExplanation();
    }, [testConfig, controlConfig]);

    const generateExplanation = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_CONFIG.apiUrl}/api/scenario/explain`, {
                test_config: testConfig,
                control_config: controlConfig,
            });

            setExplanation(response.data.explanation);
        } catch (error) {
            console.error('Error generating explanation:', error);
            // Fallback to local explanation if API fails
            setExplanation(generateLocalExplanation());
        } finally {
            setLoading(false);
        }
    };

    const generateLocalExplanation = () => {
        const { users, duration, spawnRate, scenario } = testConfig;
        const { algorithm, failureType, failureSeverity, failureDuration } = controlConfig;

        let scenarioDesc = '';
        switch (scenario) {
            case 'high_traffic':
                scenarioDesc = `high-traffic scenario will simulate ${users} concurrent users hitting your load balancer at full capacity`;
                break;
            case 'spike':
                scenarioDesc = `traffic spike scenario will rapidly scale from baseline to ${users} users, testing your system's ability to handle sudden surges`;
                break;
            case 'sustained':
                scenarioDesc = `sustained load scenario will maintain ${users} users for ${duration} seconds to test long-term stability`;
                break;
            case 'gradual_ramp':
                scenarioDesc = `gradual ramp scenario will slowly increase load to ${users} users, helping identify capacity thresholds`;
                break;
            default:
                scenarioDesc = `scenario will test with ${users} users`;
        }

        let algorithmDesc = '';
        switch (algorithm) {
            case 'round_robin':
                algorithmDesc = 'Round Robin distributes requests evenly across all pods in sequence, ensuring fair distribution';
                break;
            case 'least_connections':
                algorithmDesc = 'Least Connections routes traffic to pods with the fewest active connections, optimizing for varying request durations';
                break;
            case 'ip_hash':
                algorithmDesc = 'IP Hash ensures session persistence by routing the same client IP to the same pod consistently';
                break;
            case 'weighted_round_robin':
                algorithmDesc = 'Weighted Round Robin assigns more traffic to higher-capacity pods for optimal resource utilization';
                break;
            case 'least_response_time':
                algorithmDesc = 'Least Response Time directs traffic to the fastest-responding pod for optimal performance';
                break;
        }

        let failureDesc = '';
        if (failureType && failureSeverity !== 'none') {
            switch (failureType) {
                case 'latency':
                    failureDesc = ` with ${failureSeverity} latency injection (${failureDuration}s) to test timeout handling`;
                    break;
                case 'error':
                    failureDesc = ` with ${failureSeverity} error injection (${failureDuration}s) to test error recovery`;
                    break;
                case 'pod_failure':
                    failureDesc = ` with ${failureSeverity} pod failure simulation (${failureDuration}s) to test failover mechanisms`;
                    break;
                case 'network_partition':
                    failureDesc = ` with ${failureSeverity} network partition (${failureDuration}s) to test distributed system resilience`;
                    break;
            }
        }

        return `Your ${scenarioDesc}. The load balancer will use ${algorithm} algorithm. ${algorithmDesc}.${failureDesc} Users will spawn at ${spawnRate} users/second over the first ${Math.ceil(users / spawnRate)} seconds, then maintain that load for the remaining ${duration - Math.ceil(users / spawnRate)} seconds. This configuration will help you understand how your system handles load distribution, identify bottlenecks, and verify failover mechanisms are working correctly.`;
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <h3 className="font-semibold text-blue-900">AI Scenario Explanation</h3>
                </div>
                <svg
                    className={`w-5 h-5 text-blue-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="px-4 pb-4 border-t border-blue-200">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-blue-600 py-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                            <span>Analyzing your configuration...</span>
                        </div>
                    ) : (
                        <div className="text-sm text-blue-900 leading-relaxed py-4">
                            {explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
