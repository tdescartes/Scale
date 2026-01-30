"""
Failure Injector Module
Injects various failure scenarios for chaos engineering
"""

import asyncio
from typing import Dict, Any
import random
import logging

logger = logging.getLogger(__name__)


class FailureInjector:
    """Inject failure scenarios for testing resilience"""
    
    def __init__(self):
        self.active_failures: Dict[str, Dict[str, Any]] = {}
        
    async def inject(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Inject a failure scenario
        
        Args:
            config: Failure configuration including:
                - type: Failure type (latency, error, pod_failure, network_partition)
                - target: Target pod or service
                - duration: Failure duration in seconds
                - severity: Failure severity (low, medium, high)
                
        Returns:
            Result of failure injection
        """
        failure_type = config.get("type", "latency")
        target = config.get("target", "random")
        duration = config.get("duration", 60)
        severity = config.get("severity", "medium")
        
        failure_id = f"{failure_type}_{target}_{asyncio.get_event_loop().time()}"
        
        # Store active failure
        self.active_failures[failure_id] = {
            "type": failure_type,
            "target": target,
            "duration": duration,
            "severity": severity,
            "start_time": asyncio.get_event_loop().time()
        }
        
        logger.info(f"Injecting {failure_type} failure on {target} for {duration}s")
        
        # Simulate different failure types
        if failure_type == "latency":
            result = await self._inject_latency(target, severity, duration)
        elif failure_type == "error":
            result = await self._inject_errors(target, severity, duration)
        elif failure_type == "pod_failure":
            result = await self._inject_pod_failure(target, duration)
        elif failure_type == "network_partition":
            result = await self._inject_network_partition(target, duration)
        else:
            result = {"status": "unsupported_failure_type"}
        
        return {
            "failure_id": failure_id,
            "status": "injected",
            "result": result
        }
    
    async def _inject_latency(self, target: str, severity: str, 
                             duration: int) -> Dict[str, Any]:
        """Inject latency into requests"""
        latency_ms = {
            "low": 50,
            "medium": 200,
            "high": 1000
        }.get(severity, 200)
        
        # In production, this would configure actual latency injection
        # For now, return simulation result
        return {
            "type": "latency",
            "latency_ms": latency_ms,
            "target": target,
            "message": f"Injected {latency_ms}ms latency on {target}"
        }
    
    async def _inject_errors(self, target: str, severity: str, 
                            duration: int) -> Dict[str, Any]:
        """Inject error responses"""
        error_rate = {
            "low": 0.05,
            "medium": 0.15,
            "high": 0.50
        }.get(severity, 0.15)
        
        return {
            "type": "error",
            "error_rate": error_rate,
            "target": target,
            "message": f"Injected {error_rate*100}% error rate on {target}"
        }
    
    async def _inject_pod_failure(self, target: str, duration: int) -> Dict[str, Any]:
        """Simulate pod failure"""
        return {
            "type": "pod_failure",
            "target": target,
            "message": f"Simulated pod failure on {target} for {duration}s"
        }
    
    async def _inject_network_partition(self, target: str, 
                                       duration: int) -> Dict[str, Any]:
        """Simulate network partition"""
        return {
            "type": "network_partition",
            "target": target,
            "message": f"Simulated network partition on {target} for {duration}s"
        }
    
    async def stop_failure(self, failure_id: str):
        """Stop an active failure injection"""
        if failure_id in self.active_failures:
            del self.active_failures[failure_id]
            logger.info(f"Stopped failure injection {failure_id}")
    
    def get_active_failures(self) -> Dict[str, Dict[str, Any]]:
        """Get list of currently active failures"""
        return self.active_failures
