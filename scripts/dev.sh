#!/bin/bash

# JMESPath Testing Tool - Development Script
# Optimized for macOS development environment

set -e

echo "🍎 JMESPath Testing Tool - macOS Development"
echo "==========================================="
echo ""

# Check environment
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Running on macOS"
else
    echo "⚠️  This script is optimized for macOS but will attempt to run anyway."
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 24 LTS."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "🚀 Starting development server..."
echo "   The app will open at http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""
npm start