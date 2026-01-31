"""
Kubernetes Monitor Module
Collects metrics from NGINX Ingress Controller
"""

import asyncio
import time
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


class K8sMonitor:
    """Monitor Kubernetes NGINX Ingress metrics"""
    
    def __init__(self):
        self.mock_mode = True  # Use mock data for development
        
    async def get_metrics(self) -> Dict[str, Any]:
        """
        Get current load balancer metrics from Kubernetes
        
        Returns:
            Dictionary containing metrics for each backend pod
        """
        if self.mock_mode:
            return self._get_mock_metrics()
        
        try:
            # In production, this would use kubernetes client to fetch real metrics
            # from kubernetes.client import CoreV1Api, Configuration, ApiClient
            # api = CoreV1Api()
            # pods = api.list_namespaced_pod(namespace="default")
            pass
        except Exception as e:
            logger.error(f"Error fetching K8s metrics: {e}")
            return {}
    
    def _get_mock_metrics(self) -> Dict[str, Any]:
        """Generate mock metrics for development"""
        import random
        
        # Simulate metrics for 3 backend pods
        pods = []
        total_requests = 0
        total_errors_4xx = 0
        total_errors_5xx = 0
        
        for i in range(3):
            # Simulate slight imbalance
            base_requests = 1000
            variance = random.randint(-100, 150) if i == 2 else random.randint(-50, 50)
            requests = base_requests + variance
            
            # Health check simulation
            health_check_failures = random.randint(0, 2)
            is_healthy = health_check_failures < 2
            
            # Error breakdown
            error_4xx = random.randint(5, 20)
            error_5xx = random.randint(0, 5)
            total_errors = error_4xx + error_5xx
            
            total_requests += requests
            total_errors_4xx += error_4xx
            total_errors_5xx += error_5xx
            
            pods.append({
                "name": f"backend-pod-{i}",
                "requests": requests,
                "successful_requests": requests - total_errors,
                "errors_4xx": error_4xx,
                "errors_5xx": error_5xx,
                "total_errors": total_errors,
                "response_time_ms": random.uniform(40, 60),
                "response_time_p50": random.uniform(35, 45),
                "response_time_p90": random.uniform(55, 75),
                "response_time_p95": random.uniform(70, 95),
                "response_time_p99": random.uniform(100, 150),
                "cpu_usage": random.uniform(30, 70),
                "memory_usage": random.uniform(40, 60),
                "error_rate": total_errors / requests if requests > 0 else 0,
                "active_connections": random.randint(50, 150),
                "health_status": "healthy" if is_healthy else "degraded",
                "health_check_failures": health_check_failures,
                "last_health_check": time.time() - random.uniform(0, 10),
                "throughput_rps": requests / 60,  # requests per second
            })
        
        return {
            "pods": pods,
            "total_requests": total_requests,
            "total_errors_4xx": total_errors_4xx,
            "total_errors_5xx": total_errors_5xx,
            "timestamp": time.time(),
            "algorithm": "round_robin",  # Can be changed to simulate different algorithms
            "health_check_interval": 5,
        }
    
    async def get_ingress_config(self) -> Dict[str, Any]:
        """Get NGINX Ingress Controller configuration"""
        return {
            "load_balancing_algorithm": "round_robin",
            "backend_servers": 3,
            "health_check_interval": 5,
            "health_check_timeout": 3,
            "max_fails": 3,
            "fail_timeout": 30
        }
    
    def get_health_check_events(self) -> List[Dict[str, Any]]:
        """Get recent health check events"""
        import random
        events = []
        
        # Simulate some health check events
        for i in range(random.randint(0, 3)):
            events.append({
                "timestamp": time.time() - random.uniform(10, 300),
                "pod": f"backend-pod-{random.randint(0, 2)}",
                "status": random.choice(["passed", "failed", "timeout"]),
                "response_time": random.uniform(5, 50),
            })
        
        return sorted(events, key=lambda x: x["timestamp"], reverse=True)
    
    def get_failover_events(self) -> List[Dict[str, Any]]:
        """Get recent failover events"""
        import random
        events = []
        
        # Simulate occasional failover events
        if random.random() < 0.3:  # 30% chance of having failover events
            for i in range(random.randint(1, 2)):
                events.append({
                    "timestamp": time.time() - random.uniform(30, 600),
                    "failed_pod": f"backend-pod-{random.randint(0, 2)}",
                    "reason": random.choice(["health_check_failed", "high_error_rate", "timeout"]),
                    "requests_redirected": random.randint(50, 200),
                })
        
        return sorted(events, key=lambda x: x["timestamp"], reverse=True)
