"""
Load Generator Module
Uses Locust for HTTP load generation with multiprocessing support
"""

import asyncio
import uuid
from typing import Dict, Any, Optional
import multiprocessing as mp
from locust import HttpUser, task, between
from locust.env import Environment
from locust.stats import stats_printer, stats_history
from locust import events
import logging

logger = logging.getLogger(__name__)


class LoadBalancerUser(HttpUser):
    """Locust user class for load balancer testing"""
    wait_time = between(0.1, 0.5)
    
    @task
    def test_endpoint(self):
        """Test the load balancer endpoint"""
        self.client.get("/")


class LoadGenerator:
    def __init__(self):
        self.active_tests: Dict[str, Dict[str, Any]] = {}
        self.processes: Dict[str, mp.Process] = {}
        
    async def start_test(self, config: Dict[str, Any]) -> str:
        """
        Start a new load test
        
        Args:
            config: Test configuration including:
                - target_url: URL to test
                - users: Number of concurrent users
                - spawn_rate: User spawn rate
                - duration: Test duration in seconds
                - requests_per_second: Target RPS
        
        Returns:
            test_id: Unique identifier for the test
        """
        test_id = str(uuid.uuid4())
        
        target_url = config.get("target_url", "http://localhost")
        users = config.get("users", 10)
        spawn_rate = config.get("spawn_rate", 1)
        duration = config.get("duration", 60)
        
        # Store test configuration
        self.active_tests[test_id] = {
            "config": config,
            "status": "running",
            "start_time": asyncio.get_event_loop().time()
        }
        
        # Start load test in separate process
        process = mp.Process(
            target=self._run_load_test,
            args=(test_id, target_url, users, spawn_rate, duration)
        )
        process.start()
        self.processes[test_id] = process
        
        logger.info(f"Started load test {test_id} with {users} users")
        return test_id
    
    def _run_load_test(self, test_id: str, target_url: str, 
                       users: int, spawn_rate: float, duration: int):
        """
        Run load test in separate process
        """
        try:
            # Create Locust environment
            env = Environment(user_classes=[LoadBalancerUser])
            env.host = target_url
            
            # Start test
            env.runner.start(user_count=users, spawn_rate=spawn_rate)
            
            # Run for specified duration
            import time
            time.sleep(duration)
            
            # Stop test
            env.runner.quit()
            
            logger.info(f"Load test {test_id} completed")
        except Exception as e:
            logger.error(f"Error running load test {test_id}: {e}")
    
    async def stop_test(self, test_id: str):
        """Stop a running load test"""
        if test_id in self.processes:
            process = self.processes[test_id]
            process.terminate()
            process.join(timeout=5)
            
            if test_id in self.active_tests:
                self.active_tests[test_id]["status"] = "stopped"
            
            del self.processes[test_id]
            logger.info(f"Stopped load test {test_id}")
    
    async def get_test_status(self, test_id: str) -> Dict[str, Any]:
        """Get status of a load test"""
        if test_id not in self.active_tests:
            return {"error": "Test not found"}
        
        test_info = self.active_tests[test_id]
        
        # Check if process is still running
        if test_id in self.processes:
            is_alive = self.processes[test_id].is_alive()
            if not is_alive and test_info["status"] == "running":
                test_info["status"] = "completed"
        
        return test_info
    
    async def get_test_results(self, test_id: str) -> Dict[str, Any]:
        """Get detailed results for a completed test"""
        if test_id not in self.active_tests:
            return {"error": "Test not found"}
        
        # In a real implementation, this would return detailed metrics
        # from the Locust stats
        return {
            "test_id": test_id,
            "status": self.active_tests[test_id]["status"],
            "requests": {
                "total": 10000,
                "successful": 9950,
                "failed": 50
            },
            "response_times": {
                "mean": 45.2,
                "median": 42.0,
                "p95": 78.5,
                "p99": 125.3
            },
            "rps": {
                "mean": 166.7,
                "max": 200.0,
                "min": 150.0
            }
        }
