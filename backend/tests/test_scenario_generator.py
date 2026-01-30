"""
Tests for Scenario Generator
"""

import pytest
from app.scenario_generator import ScenarioGenerator


@pytest.mark.asyncio
async def test_generate_high_traffic_scenario():
    """Test high traffic scenario generation"""
    generator = ScenarioGenerator()
    
    params = {
        "type": "high_traffic",
        "duration": 300
    }
    
    scenario = await generator.generate(params)
    
    assert "name" in scenario
    assert "config" in scenario
    assert scenario["config"]["duration"] == 300
    assert scenario["config"]["users"] > 0


@pytest.mark.asyncio
async def test_generate_spike_scenario():
    """Test spike scenario generation"""
    generator = ScenarioGenerator()
    
    params = {
        "type": "spike",
        "duration": 180
    }
    
    scenario = await generator.generate(params)
    
    assert "spike" in scenario["name"].lower()
    assert scenario["config"]["spike_multiplier"] > 1


@pytest.mark.asyncio
async def test_generate_sustained_scenario():
    """Test sustained load scenario generation"""
    generator = ScenarioGenerator()
    
    params = {
        "type": "sustained",
        "duration": 600
    }
    
    scenario = await generator.generate(params)
    
    assert "sustained" in scenario["name"].lower()
    assert scenario["config"]["duration"] == 600


@pytest.mark.asyncio
async def test_generate_ramp_scenario():
    """Test gradual ramp scenario generation"""
    generator = ScenarioGenerator()
    
    params = {
        "type": "gradual_ramp",
        "duration": 400
    }
    
    scenario = await generator.generate(params)
    
    assert "ramp" in scenario["config"]["pattern"]
    assert "ramp_steps" in scenario["config"]
