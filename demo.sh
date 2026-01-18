#!/bin/bash

# JMESPath Testing Tool - Demo Script
# Optimized for macOS with Apple container command

echo "🍎 JMESPath Testing Tool Demo"
echo "==============================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Running on macOS (recommended platform)"
else
    echo "⚠️  Not running on macOS. This demo is optimized for macOS."
fi

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

# Check container runtimes
if command -v container &> /dev/null; then
    echo "✅ Apple container command available"
else
    echo "⚠️  Apple container command not found"
    if command -v docker &> /dev/null; then
        echo "✅ Docker available as fallback"
    else
        echo "⚠️  No container runtime found"
    fi
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building with macOS-optimized script..."
npm run build:macos

echo ""
echo "🎉 Demo completed successfully!"
echo ""
echo "To start development (macOS optimized):"
echo "  npm run dev"
echo ""
echo "To start development (traditional):"
echo "  npm start"
echo ""
echo "To serve the production build:"
echo "  npm run serve"
echo ""
echo "To run with containers:"
if command -v container &> /dev/null; then
    echo "  npm run container:run    # Apple container (recommended)"
fi
if command -v docker &> /dev/null; then
    echo "  npm run docker:run       # Docker (fallback)"
fi