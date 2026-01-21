#!/bin/bash

# JMESPath Testing Tool - Docker Image Build Script

set -e

echo "🐳 JMESPath Testing Tool - Docker Image Build"
echo "=============================================="
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker to build container images."
    exit 1
fi

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

    echo ""
    echo "To run the release container:"
    echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:$VERSION"
    echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:latest"

    echo ""
    echo "To push to Docker Hub:"
    echo "  docker push skoszewski/jmespath-playground:$VERSION"
    echo "  docker push skoszewski/jmespath-playground:latest"
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

    echo ""
    echo "To run the development container:"
    echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:dev"
    echo "  docker run -p 3000:3000 skoszewski/jmespath-playground:latest"

    echo ""
    echo "To push to Docker Hub:"
    echo "  docker push skoszewski/jmespath-playground:dev"
    echo "  docker push skoszewski/jmespath-playground:latest"
fi

echo ""
echo "🎉 Docker image build completed successfully!"