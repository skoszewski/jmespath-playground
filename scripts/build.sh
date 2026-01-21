#!/bin/bash

# JMESPath Testing Tool - Build Script

set -e

echo "🚀 JMESPath Testing Tool - Build Script"
echo "======================================="
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

echo "✅ Build completed successfully!"
echo ""
echo "To run the application:"
echo "  npm run server         # Run integrated server locally"
echo ""
echo "To build Docker image:"
echo "  scripts/build-image.sh # Build Docker container image"