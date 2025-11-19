#!/bin/bash

# Deployment Script for StumpScore
# Automates the deployment process with pre-deployment checks

set -e  # Exit on error

echo "========================================="
echo "StumpScore Deployment Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create a .env file with required environment variables."
    exit 1
fi
print_success ".env file found"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required"
    exit 1
fi
print_success "Node.js version check passed"

# Check if MongoDB is accessible
echo ""
echo "Checking database connection..."
if node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI || process.env.MONGO_ATLAS_URI).then(() => { console.log('Connected'); process.exit(0); }).catch(() => process.exit(1));" 2>/dev/null; then
    print_success "Database connection successful"
else
    print_warning "Could not verify database connection"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm ci --production
print_success "Dependencies installed"

# Run tests (optional)
# echo ""
# echo "Running tests..."
# npm test -- --watchAll=false
# print_success "Tests passed"

# Build frontend
echo ""
echo "Building frontend..."
npm run build
if [ ! -d "build" ]; then
    print_error "Build directory not created"
    exit 1
fi
print_success "Frontend built successfully"

# Create logs directory
mkdir -p logs
print_success "Logs directory created"

# Backup current deployment (if exists)
if [ -d "build.backup" ]; then
    rm -rf build.backup
fi
if [ -d "build.old" ]; then
    mv build.old build.backup
    print_success "Previous backup archived"
fi

# Stop existing PM2 process
echo ""
echo "Stopping existing application..."
pm2 stop stumpscore-api 2>/dev/null || true
print_success "Application stopped"

# Start application with PM2
echo ""
echo "Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save
print_success "Application started"

# Wait for application to be ready
echo ""
echo "Waiting for application to be ready..."
sleep 5

# Health check
echo ""
echo "Performing health check..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    print_success "Health check passed"
else
    print_error "Health check failed (HTTP $HEALTH_CHECK)"
    echo "Rolling back..."
    pm2 stop stumpscore-api
    exit 1
fi

# Display status
echo ""
echo "========================================="
echo "Deployment Summary"
echo "========================================="
pm2 status
echo ""
print_success "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "  - Monitor logs: pm2 logs stumpscore-api"
echo "  - Check status: pm2 status"
echo "  - View monitoring: pm2 monit"
echo ""
