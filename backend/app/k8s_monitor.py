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
        self.current_pod_count = 3  # Start with 3 pods
        self.min_pods = 2
        self.max_pods = 10
        self.scale_up_threshold = 1200  # Average requests per pod to scale up
        self.scale_down_threshold = 800  # Average requests per pod to scale down
        self.historical_metrics: List[Dict[str, Any]] = []  # Store historical data
        self.max_history_size = 100  # Keep last 100 snapshots
        self.last_scale_time = time.time()
        self.scale_cooldown = 30  # Wait 30 seconds between scaling operations
        self.current_algorithm = "round_robin"  # Current load balancing algorithm
        self.failure_injection = None  # Current failure injection config
        self.auto_scaling_enabled = True  # Dynamic pod scaling enabled by default
        
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
        """Generate mock metrics for development with dynamic pod scaling"""
        import random
        
        # Simulate metrics for dynamically scaled backend pods
        pods = []
        total_requests = 0
        total_errors_4xx = 0
        total_errors_5xx = 0
        
        # Simulate varying load - this would come from actual traffic in production
        base_requests_per_pod = random.randint(800, 1400)
        
        for i in range(self.current_pod_count):
            # Simulate slight imbalance
            variance = random.randint(-100, 150) if i == self.current_pod_count - 1 else random.randint(-50, 50)
            requests = base_requests_per_pod + variance
            
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
        
        # Auto-scaling logic based on average load per pod (only if enabled)
        current_time = time.time()
        if self.auto_scaling_enabled and current_time - self.last_scale_time >= self.scale_cooldown:
            avg_requests_per_pod = total_requests / self.current_pod_count if self.current_pod_count > 0 else 0
            
            # Scale up if average load is high and we're not at max
            if avg_requests_per_pod > self.scale_up_threshold and self.current_pod_count < self.max_pods:
                self.current_pod_count += 1
                self.last_scale_time = current_time
                logger.info(f"Scaling UP: {self.current_pod_count - 1} -> {self.current_pod_count} pods (avg load: {avg_requests_per_pod:.1f})")
            
            # Scale down if average load is low and we're not at min
            elif avg_requests_per_pod < self.scale_down_threshold and self.current_pod_count > self.min_pods:
                self.current_pod_count -= 1
                self.last_scale_time = current_time
                logger.info(f"Scaling DOWN: {self.current_pod_count + 1} -> {self.current_pod_count} pods (avg load: {avg_requests_per_pod:.1f})")
        
        metrics_snapshot = {
            "pods": pods,
            "total_requests": total_requests,
            "total_errors_4xx": total_errors_4xx,
            "total_errors_5xx": total_errors_5xx,
            "timestamp": time.time(),
            "algorithm": self.current_algorithm,
            "health_check_interval": 5,
            "pod_count": self.current_pod_count,
            "scaling_status": {
                "current_pods": self.current_pod_count,
                "min_pods": self.min_pods,
                "max_pods": self.max_pods,
                "avg_load_per_pod": total_requests / self.current_pod_count if self.current_pod_count > 0 else 0,
                "auto_scaling_enabled": self.auto_scaling_enabled,
            },
            "failure_injection": self.failure_injection
        }
        
        # Clear failure injection if duration expired
        self.clear_failure_injection()
        
        # Store historical snapshot
        self._store_historical_snapshot(metrics_snapshot)
        
        return metrics_snapshot
    
    def _store_historical_snapshot(self, metrics: Dict[str, Any]):
        """Store a snapshot of metrics for historical tracking"""
        # Create a simplified snapshot for historical data
        snapshot = {
            "timestamp": metrics["timestamp"],
            "pod_count": metrics["pod_count"],
            "total_requests": metrics["total_requests"],
            "pods": [
                {
                    "name": pod["name"],
                    "requests": pod["requests"],
                    "response_time_ms": pod["response_time_ms"],
                    "error_rate": pod["error_rate"],
                    "cpu_usage": pod["cpu_usage"],
                    "memory_usage": pod["memory_usage"],
                }
                for pod in metrics["pods"]
            ]
        }
        
        self.historical_metrics.append(snapshot)
        
        # Keep only the last max_history_size snapshots
        if len(self.historical_metrics) > self.max_history_size:
            self.historical_metrics.pop(0)
    
    def get_historical_metrics(self, minutes: int = 5) -> List[Dict[str, Any]]:
        """Get historical metrics for the last N minutes"""
        if not self.historical_metrics:
            return []
        
        current_time = time.time()
        cutoff_time = current_time - (minutes * 60)
        
        # Filter metrics to only include those within the time window
        filtered_metrics = [
            m for m in self.historical_metrics
            if m["timestamp"] >= cutoff_time
        ]
        
        return filtered_metrics
    
    async def get_ingress_config(self) -> Dict[str, Any]:
        """Get NGINX Ingress Controller configuration"""
        return {
            "load_balancing_algorithm": "round_robin",
            "backend_servers": self.current_pod_count,
            "health_check_interval": 5,
            "health_check_timeout": 3,
            "max_fails": 3,
            "fail_timeout": 30,
            "auto_scaling": {
                "enabled": True,
                "min_pods": self.min_pods,
                "max_pods": self.max_pods,
                "scale_up_threshold": self.scale_up_threshold,
                "scale_down_threshold": self.scale_down_threshold,
            }
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
    
    def set_algorithm(self, algorithm: str) -> Dict[str, Any]:
        """Change the load balancing algorithm"""
        valid_algorithms = ["round_robin", "least_connections", "ip_hash", "weighted_round_robin", "least_response_time"]
        
        if algorithm not in valid_algorithms:
            return {
                "success": False,
                "message": f"Invalid algorithm. Must be one of: {', '.join(valid_algorithms)}"
            }
        
        self.current_algorithm = algorithm
        logger.info(f"Load balancing algorithm changed to: {algorithm}")
        
        return {
            "success": True,
            "message": f"Load balancing algorithm changed to {algorithm}",
            "algorithm": algorithm
        }
    
    def inject_failure(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Store failure injection configuration"""
        self.failure_injection = {
            "type": config.get("type"),
            "severity": config.get("severity"),
            "duration": config.get("duration"),
            "start_time": time.time(),
        }
        
        logger.info(f"Failure injection activated: {self.failure_injection}")
        
        return {
            "success": True,
            "message": f"{config.get('type')} failure injected with {config.get('severity')} severity for {config.get('duration')}s",
            "config": self.failure_injection
        }
    
    def clear_failure_injection(self):
        """Clear active failure injection"""
        if self.failure_injection:
            elapsed = time.time() - self.failure_injection["start_time"]
            if elapsed >= self.failure_injection["duration"]:
                logger.info("Failure injection completed")
                self.failure_injection = None
                return True
        return False
    
    def toggle_auto_scaling(self, enabled: bool) -> Dict[str, Any]:
        """Enable or disable auto-scaling"""
        self.auto_scaling_enabled = enabled
        status = "enabled" if enabled else "disabled"
        logger.info(f"Auto-scaling {status}")
        
        return {
            "success": True,
            "enabled": enabled,
            "message": f"Dynamic pod scaling {status}",
            "config": {
                "min_pods": self.min_pods,
                "max_pods": self.max_pods,
                "scale_up_threshold": self.scale_up_threshold,
                "scale_down_threshold": self.scale_down_threshold,
                "cooldown": self.scale_cooldown
            }
        }
