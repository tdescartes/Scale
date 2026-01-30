#!/bin/bash

# Scale - Load Balancer Simulator & Tester Setup Script

set -e

echo "=========================================="
echo "Scale - Load Balancer Simulator & Tester"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi
echo "✅ Python 3 found"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi
echo "✅ Node.js found"

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Docker is recommended for production deployment."
fi

echo ""
echo "Installing backend dependencies..."
pip install -r requirements.txt

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "Option 1: Using Docker Compose (recommended)"
echo "  docker-compose up --build"
echo ""
echo "Option 2: Manual start"
echo "  Terminal 1: cd backend && python main.py"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
