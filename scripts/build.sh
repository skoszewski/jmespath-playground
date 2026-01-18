#!/bin/bash

# JMESPath Testing Tool - Build Script
# Targets macOS with Apple container command as first-class environment

set -e

echo "🍎 JMESPath Testing Tool - macOS Build Script"
echo "============================================="
echo ""

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 24 ]; then
        echo "✅ Node.js $NODE_VERSION (compatible with v24+ requirement)"
    else
        echo "❌ Node.js $NODE_VERSION found, but v24+ is required"
        exit 1
    fi
else
    echo "❌ Node.js not found. Please install Node.js 24 LTS or higher."
    exit 1
fi

# Build the React application
echo "📦 Installing dependencies..."
npm install

echo "🔨 Building production bundle..."
npm run build

# Container build - prioritize Apple container command
if command -v container &> /dev/null; then
    echo "🍎 Building container with Apple container command..."
    container build -t jmespath-playground .
else
    # Fallback to Docker if available
    if command -v docker &> /dev/null; then
        echo "🐳 Apple container command not found, falling back to Docker..."
        docker build -t jmespath-playground .
    else
        echo "⚠️  No container runtime found. Skipping container build."
        echo "   Install Apple container command or Docker to build containers."
    fi
fi

echo "✅ Build completed successfully!"
echo ""
echo "To run the application:"
echo "  npm run serve          # Serve production build locally"
if command -v container &> /dev/null; then
    echo "  container run -p 3000:3000 jmespath-playground  # Run with Apple container"
elif command -v docker &> /dev/null; then
    echo "  docker run -p 3000:3000 jmespath-playground     # Run with Docker"
fi