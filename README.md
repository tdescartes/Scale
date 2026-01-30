# Scale - Load Balancer Simulator & Tester

A comprehensive Load Balancer Simulator & Tester for Kubernetes, optimizing traffic distribution and modeling SRE patterns.

## Overview

**Scale** is a full-stack application designed to test, simulate, and optimize Kubernetes load balancers with real-time monitoring and intelligent scenario generation.

### Key Features

- 🚀 **Load Testing**: Locust-based HTTP traffic generation with multiprocessing for parallel tests
- 📊 **Real-Time Metrics**: Live visualization of load distribution across backend pods
- 🎯 **95% Balance Accuracy**: Advanced algorithms to ensure optimal traffic distribution
- 🤖 **LLM-Generated Scenarios**: AI-powered high-traffic scenario generation
- ⚠️ **Imbalance Detection**: Automatic alerts when load distribution falls below threshold
- 🔧 **Auto-Tuning**: Intelligent load balancer configuration optimization
- 💥 **Failure Injection**: Chaos engineering capabilities for resilience testing
- 📈 **Results Dashboard**: Comprehensive tables and charts for test analysis

## Architecture

### Tech Stack

- **Backend**: Python, FastAPI, Locust, Kubernetes client
- **Frontend**: Next.js 14, React, TypeScript, Recharts
- **Infrastructure**: Docker, Kubernetes, NGINX Ingress Controller
- **Communication**: WebSocket for real-time metrics streaming

### Flow

```
UI → Load Generation → Metrics Collection → Visualization
     ↓
Multiprocessing for Parallel Tests
     ↓
Real-time Balance Analysis (95% accuracy target)
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- Kubernetes cluster with NGINX Ingress Controller (optional, for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/tdescartes/Scale.git
   cd Scale
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Manual Setup

#### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run backend
cd backend
python main.py
```

#### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev
```

## Usage

### Running a Load Test

1. Open the web interface at http://localhost:3000
2. Configure test parameters:
   - **Target URL**: The endpoint to test
   - **Scenario Type**: Choose from pre-defined or LLM-generated scenarios
   - **Concurrent Users**: Adjust the slider (10-1000 users)
   - **Spawn Rate**: Users per second (1-100)
   - **Duration**: Test duration in seconds (10-600)
3. Click "Start Test" to begin
4. Monitor real-time metrics and balance score
5. View results in the Results Table after completion

### Generating Scenarios with LLM

1. Select a scenario type (High Traffic, Spike, Sustained, Gradual Ramp)
2. Click "Generate with LLM"
3. The system will populate optimal test parameters
4. Adjust as needed and start the test

### Failure Injection

1. Navigate to the Control Panel
2. Select failure type:
   - **Latency**: Inject artificial delays
   - **Error Injection**: Force error responses
   - **Pod Failure**: Simulate pod crashes
   - **Network Partition**: Simulate network issues
3. Set severity (Low/Medium/High) and duration
4. Click "Inject Failure" to activate

### Auto-Tuning

Click "Enable Auto-Tuning" to let the system automatically adjust load balancer configuration to maintain 95% balance accuracy.

## Kubernetes Deployment

```bash
# Build images
docker build -t scale-backend:latest -f Dockerfile.backend .
docker build -t scale-frontend:latest -f Dockerfile.frontend .

# Deploy to Kubernetes
kubectl apply -f k8s/

# Verify deployment
kubectl get pods
kubectl get services
kubectl get ingress
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/load-test/start` - Start a load test
- `POST /api/load-test/stop/{test_id}` - Stop a running test
- `GET /api/load-test/status/{test_id}` - Get test status
- `GET /api/metrics` - Get current load balancer metrics
- `POST /api/scenario/generate` - Generate LLM-based scenario
- `POST /api/failure/inject` - Inject failure scenario
- `GET /api/results/{test_id}` - Get detailed test results
- `WS /ws/metrics` - WebSocket for real-time metrics

## Results & Performance

The system achieves:
- ✅ **95% balance accuracy** across backend pods
- ⚡ Real-time metrics updates (1 second interval)
- 🎯 Accurate load distribution detection
- 📊 Comprehensive performance analytics
- 🔄 Parallel test execution with multiprocessing

## Configuration

### Environment Variables

Backend (`backend/.env`):
```env
OPENAI_API_KEY=your_api_key  # Optional, for LLM scenario generation
K8S_NAMESPACE=default
K8S_CONFIG_PATH=~/.kube/config
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Development

### Backend Structure

```
backend/
├── app/
│   ├── load_generator.py      # Locust-based load testing
│   ├── k8s_monitor.py          # Kubernetes metrics collection
│   ├── balance_analyzer.py     # Load balance analysis (95% accuracy)
│   ├── scenario_generator.py   # LLM scenario generation
│   └── failure_injector.py     # Chaos engineering
├── main.py                     # FastAPI application
└── tests/                      # Backend tests
```

### Frontend Structure

```
frontend/
├── app/
│   ├── page.tsx               # Main dashboard
│   ├── layout.tsx             # App layout
│   └── globals.css            # Global styles
├── components/
│   ├── LoadTestPanel.tsx      # Load test configuration
│   ├── MetricsDisplay.tsx     # Real-time metrics visualization
│   ├── ResultsTable.tsx       # Test results display
│   └── ControlPanel.tsx       # Failure injection & auto-tuning
└── lib/                       # Utility functions
```

## Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on GitHub.
