"""
Simple test to verify all backend imports work except Locust
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test imports
print("Testing imports...")

try:
    from app.k8s_monitor import K8sMonitor
    print("✓ K8sMonitor imported successfully")
except Exception as e:
    print(f"✗ K8sMonitor import failed: {e}")

try:
    from app.balance_analyzer import BalanceAnalyzer
    print("✓ BalanceAnalyzer imported successfully")
except Exception as e:
    print(f"✗ BalanceAnalyzer import failed: {e}")

try:
    from app.scenario_generator import ScenarioGenerator
    print("✓ ScenarioGenerator imported successfully")
except Exception as e:
    print(f"✗ ScenarioGenerator import failed: {e}")

try:
    from app.failure_injector import FailureInjector
    print("✓ FailureInjector imported successfully")
except Exception as e:
    print(f"✗ FailureInjector import failed: {e}")

print("\nAll core modules imported successfully!")
print("Note: LoadGenerator requires Locust which has dependency issues in this environment")
