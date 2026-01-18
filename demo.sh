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
    echo "✅ Docker available"
else
    echo "⚠️  Docker not found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building production version..."
npm run build

echo ""
echo "🎉 Demo completed successfully!"
echo ""
echo "To start development:"
echo "  npm start"
echo ""
echo "To serve the production build:"
echo "  npm run serve"
echo ""
echo "To run with Docker:"
if command -v docker &> /dev/null; then
    echo "  npm run docker:build"
    echo "  npm run docker:run"
else
    echo "  (Docker not available - install Docker first)"
fi