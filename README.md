# Scale - Load Balancer Simulator & Tester

A comprehensive Load Balancer Simulator & Tester for Kubernetes, optimizing traffic distribution and modeling SRE patterns.

## Overview

**Scale** is a Next.js application designed to test, simulate, and optimize Kubernetes load balancers with real-time monitoring and intelligent scenario generation.

### Key Features

- 🚀 **Load Testing**: HTTP traffic simulation with configurable parameters
- 📊 **Real-Time Metrics**: Live visualization of load distribution across backend pods
- 🎯 **95% Balance Accuracy**: Advanced algorithms to ensure optimal traffic distribution
- 🤖 **LLM-Generated Scenarios**: AI-powered high-traffic scenario generation
- ⚠️ **Imbalance Detection**: Automatic alerts when load distribution falls below threshold
- 🔧 **Auto-Scaling**: Intelligent pod scaling based on request load
- 💥 **Failure Injection**: Chaos engineering capabilities for resilience testing
- 📈 **Results Dashboard**: Comprehensive tables and charts for test analysis

## Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: React, Tailwind CSS, Recharts
- **Infrastructure**: Docker, Kubernetes

### Flow

```
UI → API Routes → Metrics Service → Real-time Visualization
                        ↓
              Auto-scaling Logic
                        ↓
              Historical Data Tracking
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- Kubernetes cluster (optional, for production)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/tdescartes/Scale.git
   cd Scale
   ```

2. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Application: http://localhost:3000

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t scale-app .
docker run -p 3000:3000 scale-app
```

## API Endpoints

All API routes are built into the Next.js application:

| Endpoint                       | Method | Description                        |
| ------------------------------ | ------ | ---------------------------------- |
| `/api/metrics`                 | GET    | Get current metrics and pod status |
| `/api/metrics/history`         | GET    | Get historical metrics data        |
| `/api/algorithm/change`        | POST   | Change load balancing algorithm    |
| `/api/autoscaling/toggle`      | POST   | Toggle auto-scaling on/off         |
| `/api/failure/inject`          | POST   | Inject failure scenarios           |
| `/api/load-test/start`         | POST   | Start a load test                  |
| `/api/load-test/stop/[testId]` | POST   | Stop a running load test           |
| `/api/scenario/generate`       | POST   | Generate test scenarios            |

## Features

### Auto-Scaling

The application automatically scales pods based on request load:

- **Scale Up**: When avg requests > 1200/pod (adds 1 pod, max 10)
- **Scale Down**: When avg requests < 800/pod (removes 1 pod, min 2)
- **Cooldown**: 10-second cooldown between scaling operations

### Load Balancing Algorithms

- **Round Robin**: Distributes requests evenly across pods
- **Least Connections**: Routes to pod with fewest active requests
- **Random**: Random pod selection
- **IP Hash**: Consistent hashing based on client IP
- **Weighted Round Robin**: Weighted distribution

### Failure Injection

Test resilience with chaos engineering:

- **Pod Failure**: Simulate pod crashes
- **Network Latency**: Add artificial delays
- **CPU Spike**: Simulate resource exhaustion
- **Memory Pressure**: Test memory limits

## Project Structure

```
Scale/
├── frontend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main dashboard
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and services
│   │   ├── api.ts         # API client
│   │   ├── config.ts      # Configuration
│   │   ├── metricsService.ts  # Core metrics service
│   │   └── utils.ts       # Utility functions
│   └── package.json
├── k8s/                   # Kubernetes manifests
│   ├── deployment.yaml    # App deployment
│   └── ingress.yaml       # Ingress configuration
├── docker-compose.yml     # Docker Compose config
├── Dockerfile             # Docker build config
└── README.md
```

## Configuration

Environment variables (optional):

| Variable   | Default       | Description      |
| ---------- | ------------- | ---------------- |
| `PORT`     | `3000`        | Application port |
| `NODE_ENV` | `development` | Environment mode |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
