"""
Balance Analyzer Module
Analyzes load distribution and detects imbalances
"""

from typing import Dict, Any, List, Optional
import numpy as np
import logging

logger = logging.getLogger(__name__)


class BalanceAnalyzer:
    """Analyze load balance across backend pods"""
    
    def __init__(self, target_accuracy: float = 0.95):
        self.target_accuracy = target_accuracy
        
    def calculate_balance_score(self, metrics: Dict[str, Any]) -> float:
        """
        Calculate balance score (0.0 to 1.0)
        
        A score of 1.0 means perfect balance
        A score >= 0.95 meets the 95% balance accuracy requirement
        
        Args:
            metrics: Metrics from K8sMonitor
            
        Returns:
            Balance score between 0.0 and 1.0
        """
        if not metrics or "pods" not in metrics:
            return 0.0
        
        pods = metrics["pods"]
        if len(pods) < 2:
            return 1.0
        
        # Calculate coefficient of variation (CV) for request distribution
        requests = [pod["requests"] for pod in pods]
        mean_requests = np.mean(requests)
        
        if mean_requests == 0:
            return 1.0
        
        std_requests = np.std(requests)
        cv = std_requests / mean_requests
        
        # Convert CV to balance score (lower CV = better balance)
        # CV of 0.0 -> score 1.0 (perfect balance)
        # CV of 0.5 -> score 0.0 (poor balance)
        balance_score = max(0.0, 1.0 - (cv / 0.5))
        
        logger.info(f"Balance score: {balance_score:.3f} (CV: {cv:.3f})")
        return balance_score
    
    def detect_imbalance(self, metrics: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Detect if there's a load imbalance
        
        Returns:
            Alert details if imbalance detected, None otherwise
        """
        balance_score = self.calculate_balance_score(metrics)
        
        if balance_score < self.target_accuracy:
            pods = metrics["pods"]
            requests = [pod["requests"] for pod in pods]
            mean_requests = np.mean(requests)
            
            overloaded_pods = [
                pod for pod in pods 
                if pod["requests"] > mean_requests * 1.2
            ]
            underloaded_pods = [
                pod for pod in pods 
                if pod["requests"] < mean_requests * 0.8
            ]
            
            return {
                "severity": "high" if balance_score < 0.85 else "medium",
                "balance_score": balance_score,
                "overloaded_pods": [p["name"] for p in overloaded_pods],
                "underloaded_pods": [p["name"] for p in underloaded_pods],
                "recommendation": self._generate_recommendation(
                    balance_score, overloaded_pods, underloaded_pods
                )
            }
        
        return None
    
    def _generate_recommendation(self, balance_score: float, 
                                 overloaded: List[Dict], 
                                 underloaded: List[Dict]) -> str:
        """Generate recommendation for fixing imbalance"""
        if len(overloaded) > 0:
            return (
                f"Consider adjusting load balancer weights to reduce "
                f"traffic to {', '.join(p['name'] for p in overloaded)}"
            )
        return "Review load balancing algorithm configuration"
    
    def analyze_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze test results and provide insights
        
        Args:
            results: Test results from LoadGenerator
            
        Returns:
            Analysis with recommendations
        """
        # Calculate success rate
        total_requests = results.get("requests", {}).get("total", 0)
        successful = results.get("requests", {}).get("successful", 0)
        
        success_rate = successful / total_requests if total_requests > 0 else 0
        
        return {
            "success_rate": success_rate,
            "performance_grade": self._calculate_performance_grade(results),
            "recommendations": self._generate_performance_recommendations(results)
        }
    
    def _calculate_performance_grade(self, results: Dict[str, Any]) -> str:
        """Calculate overall performance grade"""
        response_times = results.get("response_times", {})
        p95 = response_times.get("p95", 0)
        
        if p95 < 50:
            return "A"
        elif p95 < 100:
            return "B"
        elif p95 < 200:
            return "C"
        else:
            return "D"
    
    def _generate_performance_recommendations(self, 
                                             results: Dict[str, Any]) -> List[str]:
        """Generate performance recommendations"""
        recommendations = []
        
        response_times = results.get("response_times", {})
        p95 = response_times.get("p95", 0)
        
        if p95 > 100:
            recommendations.append(
                "High response times detected. Consider scaling up backend pods."
            )
        
        requests = results.get("requests", {})
        failed = requests.get("failed", 0)
        total = requests.get("total", 0)
        
        if failed > 0 and total > 0:
            error_rate = failed / total
            if error_rate > 0.01:
                recommendations.append(
                    f"Error rate of {error_rate*100:.2f}% is above threshold. "
                    "Investigate backend errors."
                )
        
        return recommendations
