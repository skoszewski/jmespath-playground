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

# Optional container build with Docker
if command -v docker &> /dev/null; then
    echo "🐳 Building Docker container (optional)..."

    # Determine version information for Docker build
    VERSION=$(git tag --points-at HEAD 2>/dev/null | sed 's/^v//' | head -n 1)

    if [ -n "$VERSION" ]; then
        # We're at a tagged commit - release build
        echo "📦 Building release version: $VERSION"
        docker build \
            --build-arg VERSION="$VERSION" \
            --build-arg IS_RELEASE="true" \
            -t skoszewski/jmespath-playground:$VERSION \
            -t skoszewski/jmespath-playground:latest .
        echo "✅ Built Docker images: skoszewski/jmespath-playground:$VERSION, skoszewski/jmespath-playground:latest"
    else
        # Development build
        PACKAGE_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
        DEV_VERSION="${PACKAGE_VERSION}-dev"
        echo "📦 Building development version: $DEV_VERSION"
        docker build \
            --build-arg VERSION="$DEV_VERSION" \
            --build-arg IS_RELEASE="false" \
            -t skoszewski/jmespath-playground:dev \
            -t skoszewski/jmespath-playground:latest .
        echo "✅ Built Docker images: skoszewski/jmespath-playground:dev, skoszewski/jmespath-playground:latest"
    fi
else
    echo "💡 Docker not found. Container build is optional."
    echo "   Install Docker if you want to build containers."
fi

echo "✅ Build completed successfully!"
echo ""
echo "To run the application:"
echo "  npm run server         # Run integrated server locally"
if command -v docker &> /dev/null; then
    VERSION=$(git tag --points-at HEAD 2>/dev/null | sed 's/^v//' | head -n 1)
    if [ -n "$VERSION" ]; then
        echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:$VERSION  # Run release container"
    else
        echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:dev      # Run dev container"
    fi
    echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:latest      # Run latest container"
fi