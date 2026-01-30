"""
Scenario Generator Module
Uses LLM to generate high-traffic load test scenarios
"""

import asyncio
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)


class ScenarioGenerator:
    """Generate load test scenarios using LLM"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.mock_mode = not self.api_key  # Use mock if no API key
        
    async def generate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a load test scenario
        
        Args:
            params: Parameters for scenario generation including:
                - type: Scenario type (e.g., "high_traffic", "spike", "sustained")
                - duration: Test duration
                - target_system: Description of target system
                
        Returns:
            Generated scenario configuration
        """
        scenario_type = params.get("type", "high_traffic")
        duration = params.get("duration", 300)
        
        if self.mock_mode:
            return self._generate_mock_scenario(scenario_type, duration)
        
        try:
            # In production, this would use OpenAI API
            # import openai
            # response = openai.ChatCompletion.create(...)
            pass
        except Exception as e:
            logger.error(f"Error generating scenario with LLM: {e}")
            return self._generate_mock_scenario(scenario_type, duration)
    
    def _generate_mock_scenario(self, scenario_type: str, 
                                duration: int) -> Dict[str, Any]:
        """Generate a mock scenario for development"""
        
        scenarios = {
            "high_traffic": {
                "name": "High Traffic Sustained Load",
                "description": "Simulates sustained high traffic with consistent load",
                "config": {
                    "users": 500,
                    "spawn_rate": 10,
                    "duration": duration,
                    "rps_target": 1000,
                    "pattern": "sustained"
                },
                "expected_behavior": {
                    "response_time_p95": 100,
                    "error_rate_max": 0.01
                }
            },
            "spike": {
                "name": "Traffic Spike Simulation",
                "description": "Simulates sudden traffic spike to test auto-scaling",
                "config": {
                    "users": 1000,
                    "spawn_rate": 50,
                    "duration": duration,
                    "rps_target": 2000,
                    "pattern": "spike",
                    "spike_multiplier": 3
                },
                "expected_behavior": {
                    "response_time_p95": 200,
                    "error_rate_max": 0.05
                }
            },
            "sustained": {
                "name": "Sustained Load Test",
                "description": "Long-running test to check stability",
                "config": {
                    "users": 200,
                    "spawn_rate": 5,
                    "duration": duration,
                    "rps_target": 400,
                    "pattern": "sustained"
                },
                "expected_behavior": {
                    "response_time_p95": 80,
                    "error_rate_max": 0.005
                }
            },
            "gradual_ramp": {
                "name": "Gradual Ramp Up",
                "description": "Gradually increase load to find breaking point",
                "config": {
                    "users": 100,
                    "spawn_rate": 2,
                    "duration": duration,
                    "rps_target": 500,
                    "pattern": "ramp",
                    "ramp_steps": 5
                },
                "expected_behavior": {
                    "response_time_p95": 150,
                    "error_rate_max": 0.02
                }
            }
        }
        
        return scenarios.get(scenario_type, scenarios["high_traffic"])
