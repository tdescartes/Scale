# Documentation

## Architecture Overview

### System Components

1. **Frontend (Next.js)**
   - Real-time dashboard with WebSocket connection
   - Interactive sliders for test configuration
   - Live metrics visualization with Recharts
   - Results tables with detailed test analysis

2. **Backend (Python/FastAPI)**
   - REST API for test management
   - WebSocket server for real-time updates
   - Locust integration for load generation
   - Kubernetes monitoring and metrics collection

3. **Load Generator**
   - Multiprocessing for parallel test execution
   - Configurable user spawn rates
   - Support for various traffic patterns
   - Real-time statistics collection

4. **Balance Analyzer**
   - Coefficient of Variation (CV) based balance scoring
   - 95% accuracy threshold detection
   - Automatic imbalance alerts
   - Performance grade calculation

### Data Flow

```
User Input → Frontend
    ↓
REST API Request → Backend
    ↓
Load Test Process (Multiprocessing)
    ↓
K8s Metrics Collection
    ↓
Balance Analysis
    ↓
WebSocket Update → Frontend
    ↓
Real-time Visualization
```

## Balance Score Algorithm

The balance score is calculated using the Coefficient of Variation (CV):

```
CV = σ / μ
```

Where:
- σ = Standard deviation of requests across pods
- μ = Mean requests per pod

The balance score is then:

```
Balance Score = max(0, 1 - (CV / 0.5))
```

This ensures:
- Perfect balance (CV = 0) → Score = 1.0 (100%)
- Target threshold → Score ≥ 0.95 (95%)
- Poor balance (CV ≥ 0.5) → Score = 0.0 (0%)

## API Reference

### POST /api/load-test/start

Start a new load test.

**Request Body:**
```json
{
  "target_url": "http://example.com",
  "users": 100,
  "spawn_rate": 10,
  "duration": 60
}
```

**Response:**
```json
{
  "test_id": "uuid",
  "status": "started"
}
```

### WS /ws/metrics

WebSocket endpoint for real-time metrics.

**Message Format:**
```json
{
  "type": "metrics_update",
  "data": {
    "metrics": {
      "pods": [...],
      "total_requests": 3000
    },
    "balance_score": 0.97,
    "timestamp": 1234567890.123
  }
}
```

**Alert Format:**
```json
{
  "type": "imbalance_alert",
  "data": {
    "balance_score": 0.82,
    "threshold": 0.95
  }
}
```

## Deployment Guide

### Kubernetes Deployment

1. **Build Docker images:**
   ```bash
   docker build -t scale-backend:latest -f Dockerfile.backend .
   docker build -t scale-frontend:latest -f Dockerfile.frontend .
   ```

2. **Push to registry:**
   ```bash
   docker tag scale-backend:latest your-registry/scale-backend:latest
   docker tag scale-frontend:latest your-registry/scale-frontend:latest
   docker push your-registry/scale-backend:latest
   docker push your-registry/scale-frontend:latest
   ```

3. **Update image references in k8s/*.yaml files**

4. **Deploy:**
   ```bash
   kubectl apply -f k8s/
   ```

5. **Verify:**
   ```bash
   kubectl get pods -l app=scale-backend
   kubectl get pods -l app=scale-frontend
   kubectl get ingress scale-ingress
   ```

### NGINX Ingress Configuration

The application is designed to work with NGINX Ingress Controller. Ensure it's installed:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

## Performance Tuning

### Backend Optimization

- Adjust worker processes based on CPU cores
- Configure Locust distributed mode for large-scale tests
- Use Redis for test state management in production

### Frontend Optimization

- Enable Next.js production build optimizations
- Configure CDN for static assets
- Implement client-side caching for metrics

## Troubleshooting

### WebSocket Connection Issues

If the WebSocket connection fails:
1. Check CORS configuration in `backend/main.py`
2. Verify backend is running and accessible
3. Check browser console for error messages

### Load Test Not Starting

If load tests fail to start:
1. Check target URL is accessible from backend
2. Verify Locust dependencies are installed
3. Review backend logs for errors

### Imbalance Detection Issues

If balance score seems incorrect:
1. Ensure K8s metrics are being collected properly
2. Verify pod count and request distribution
3. Check balance analyzer threshold configuration

## Metrics Collection

### Mock Mode (Development)

By default, the K8s monitor runs in mock mode, generating simulated metrics. This allows development without a live Kubernetes cluster.

### Production Mode

To enable real Kubernetes metrics collection:

1. Set up kubeconfig access
2. Update `k8s_monitor.py`:
   ```python
   self.mock_mode = False
   ```
3. Ensure proper RBAC permissions for pod and metrics access

## Contributing

### Code Structure

- Follow PEP 8 for Python code
- Use TypeScript for all React components
- Add type hints to Python functions
- Document all public APIs

### Testing

Run tests before submitting:

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Update documentation
5. Submit PR with clear description
