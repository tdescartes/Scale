"""
Load Balancer Simulator & Tester
Main application entry point
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
from typing import List, Dict, Any
import json
import logging

from app.load_generator import LoadGenerator
from app.k8s_monitor import K8sMonitor
from app.scenario_generator import ScenarioGenerator
from app.balance_analyzer import BalanceAnalyzer
from app.failure_injector import FailureInjector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Load Balancer Simulator & Tester")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
load_generator = LoadGenerator()
k8s_monitor = K8sMonitor()
scenario_generator = ScenarioGenerator()
balance_analyzer = BalanceAnalyzer()
failure_injector = FailureInjector()

# WebSocket connections for real-time updates
active_connections: List[WebSocket] = []


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"message": "Load Balancer Simulator & Tester API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/load-test/start")
async def start_load_test(config: Dict[str, Any]):
    """Start a new load test with specified configuration"""
    try:
        test_id = await load_generator.start_test(config)
        return {"test_id": test_id, "status": "started"}
    except Exception as e:
        logger.error(f"Error starting load test: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/load-test/stop/{test_id}")
async def stop_load_test(test_id: str):
    """Stop a running load test"""
    try:
        await load_generator.stop_test(test_id)
        return {"test_id": test_id, "status": "stopped"}
    except Exception as e:
        logger.error(f"Error stopping load test: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/load-test/status/{test_id}")
async def get_test_status(test_id: str):
    """Get status of a load test"""
    try:
        status = await load_generator.get_test_status(test_id)
        return status
    except Exception as e:
        logger.error(f"Error getting test status: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/metrics")
async def get_metrics():
    """Get current load balancer metrics"""
    try:
        metrics = await k8s_monitor.get_metrics()
        balance_score = balance_analyzer.calculate_balance_score(metrics)
        return {
            "metrics": metrics,
            "balance_score": balance_score,
            "is_balanced": balance_score >= 0.95
        }
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/scenario/generate")
async def generate_scenario(params: Dict[str, Any]):
    """Generate a load test scenario using LLM"""
    try:
        scenario = await scenario_generator.generate(params)
        return {"scenario": scenario}
    except Exception as e:
        logger.error(f"Error generating scenario: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/failure/inject")
async def inject_failure(config: Dict[str, Any]):
    """Inject a failure scenario"""
    try:
        result = await failure_injector.inject(config)
        return {"result": result}
    except Exception as e:
        logger.error(f"Error injecting failure: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/results/{test_id}")
async def get_test_results(test_id: str):
    """Get detailed results for a completed test"""
    try:
        results = await load_generator.get_test_results(test_id)
        analysis = balance_analyzer.analyze_results(results)
        return {
            "test_id": test_id,
            "results": results,
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"Error getting test results: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """WebSocket endpoint for real-time metrics streaming"""
    await manager.connect(websocket)
    try:
        while True:
            # Send metrics updates every second
            metrics = await k8s_monitor.get_metrics()
            balance_score = balance_analyzer.calculate_balance_score(metrics)
            
            await websocket.send_json({
                "type": "metrics_update",
                "data": {
                    "metrics": metrics,
                    "balance_score": balance_score,
                    "timestamp": asyncio.get_event_loop().time()
                }
            })
            
            # Check for imbalance and send alert
            if balance_score < 0.95:
                await websocket.send_json({
                    "type": "imbalance_alert",
                    "data": {
                        "balance_score": balance_score,
                        "threshold": 0.95
                    }
                })
            
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
