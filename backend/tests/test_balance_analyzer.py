"""
Tests for Balance Analyzer
"""

import pytest
from app.balance_analyzer import BalanceAnalyzer


def test_balance_score_perfect_balance():
    """Test balance score calculation with perfect distribution"""
    analyzer = BalanceAnalyzer()
    
    metrics = {
        "pods": [
            {"name": "pod-1", "requests": 1000, "response_time_ms": 50},
            {"name": "pod-2", "requests": 1000, "response_time_ms": 50},
            {"name": "pod-3", "requests": 1000, "response_time_ms": 50},
        ]
    }
    
    score = analyzer.calculate_balance_score(metrics)
    assert score >= 0.95, "Perfect balance should achieve 95%+ accuracy"


def test_balance_score_imbalanced():
    """Test balance score calculation with imbalanced distribution"""
    analyzer = BalanceAnalyzer()
    
    metrics = {
        "pods": [
            {"name": "pod-1", "requests": 1500, "response_time_ms": 50},
            {"name": "pod-2", "requests": 1000, "response_time_ms": 50},
            {"name": "pod-3", "requests": 500, "response_time_ms": 50},
        ]
    }
    
    score = analyzer.calculate_balance_score(metrics)
    assert score < 0.95, "Imbalanced distribution should score below 95%"


def test_detect_imbalance():
    """Test imbalance detection"""
    analyzer = BalanceAnalyzer()
    
    metrics = {
        "pods": [
            {"name": "pod-1", "requests": 1500, "response_time_ms": 50},
            {"name": "pod-2", "requests": 1000, "response_time_ms": 50},
            {"name": "pod-3", "requests": 500, "response_time_ms": 50},
        ]
    }
    
    alert = analyzer.detect_imbalance(metrics)
    assert alert is not None, "Should detect imbalance"
    assert "balance_score" in alert
    assert "overloaded_pods" in alert
    assert "recommendation" in alert


def test_no_imbalance_detected():
    """Test that no imbalance is detected with good distribution"""
    analyzer = BalanceAnalyzer()
    
    metrics = {
        "pods": [
            {"name": "pod-1", "requests": 1000, "response_time_ms": 50},
            {"name": "pod-2", "requests": 1020, "response_time_ms": 50},
            {"name": "pod-3", "requests": 980, "response_time_ms": 50},
        ]
    }
    
    alert = analyzer.detect_imbalance(metrics)
    assert alert is None, "Should not detect imbalance with good distribution"


def test_analyze_results():
    """Test results analysis"""
    analyzer = BalanceAnalyzer()
    
    results = {
        "requests": {
            "total": 10000,
            "successful": 9950,
            "failed": 50
        },
        "response_times": {
            "mean": 45.2,
            "p95": 78.5
        }
    }
    
    analysis = analyzer.analyze_results(results)
    assert "success_rate" in analysis
    assert "performance_grade" in analysis
    assert "recommendations" in analysis
    assert analysis["success_rate"] == 0.995
