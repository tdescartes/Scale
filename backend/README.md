# Load Balancer Simulator Backend

Python-based backend for load testing and Kubernetes integration.

## Features

- Locust-based load generation
- Kubernetes NGINX Ingress metrics collection
- Multiprocessing for parallel tests
- LLM-generated traffic scenarios
- Imbalance detection and alerts
- Auto-tuning capabilities
- Failure injection

## Setup

```bash
pip install -r ../requirements.txt
```

## Running

```bash
python main.py
```

API will be available at http://localhost:8000
