#!/bin/bash

# Production Build Script
# Builds the application for production deployment

set -e  # Exit on error

echo "========================================="
echo "Starting Production Build"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm ci --production=false

# Run tests (optional - comment out if not needed)
# echo ""
# echo "Running tests..."
# npm test -- --watchAll=false

# Build frontend
echo ""
echo "Building frontend..."
npm run build

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "Error: Build directory not created"
    exit 1
fi

echo ""
echo "Build directory size:"
du -sh build

# Remove development dependencies
echo ""
echo "Removing development dependencies..."
npm prune --production

# Create build info file
echo ""
echo "Creating build info..."
cat > build/build-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF

echo ""
echo "========================================="
echo "Production Build Complete!"
echo "========================================="
echo ""
echo "Build artifacts are in the 'build' directory"
echo "Ready for deployment"
