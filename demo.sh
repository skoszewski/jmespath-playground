#!/bin/bash

# JMESPath Testing Tool - Demo Script

echo "🚀 JMESPath Testing Tool Demo"
echo "==============================="
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 24 LTS or higher."
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ npm not found. Please install npm."
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker available: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker not found"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🧪 Running tests..."
npm test -- --watchAll=false

echo ""
echo "🔨 Building React application..."
npm run build

echo ""
echo "🎉 Demo completed successfully!"
echo ""
echo "Available commands:"
echo "==================="
echo ""
echo "Development:"
echo "  npm start          - Start React development server (port 3000)"
echo "  npm run server     - Start Express API server only (port 3000)" 
echo "  npm test           - Run test suite"
echo ""
echo "Production:"
echo "  npm run build      - Build React app for production"
echo "  node server/server.js - Start integrated server with built app"
echo ""
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "Docker:"
    echo "  docker build -t jmespath-playground ."
    echo "  docker run -p 3000:3000 jmespath-playground"
    echo ""
    echo "Docker Compose:"
    echo "  docker compose up --build"
    echo "  docker compose down"
else
    echo "Docker (install Docker first):"
    echo "  docker build -t jmespath-playground ."
    echo "  docker run -p 3000:3000 jmespath-playground"
    echo "  docker compose up --build"
fi

echo ""
echo "🌐 The application will be available at:"
echo "   http://localhost:3000"