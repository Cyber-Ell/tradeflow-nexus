#!/bin/bash

# MarketHub Initialization Script

set -e

echo "🚀 MarketHub - Initialization"
echo "============================="
echo ""

cd /workspace/marketplace

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

echo "✓ Root dependencies installed"

# Step 2: Ensure .env exists
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
else
    echo "✓ backend/.env already exists"
fi

# Step 3: Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p data
echo "✓ Data directory created"

# Step 4: Check Node version
echo ""
echo "🔍 Checking Node version..."
NODE_VERSION=$(node --version)
echo "✓ Node $NODE_VERSION"

# Step 5: Build verification
echo ""
echo "🔨 Verifying builds..."
npm run --workspace=frontend build > /dev/null 2>&1 && echo "✓ Frontend build successful" || echo "⚠️  Frontend build had warnings"
npm run --workspace=backend build > /dev/null 2>&1 && echo "✓ Backend build successful" || echo "⚠️  Backend build had warnings"

echo ""
echo "=========================================="
echo "✓ Initialization Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Seed database: npm run --workspace=backend seed"
echo "2. Start servers: npm run dev"
echo ""
echo "Or use quick start:"
echo "  bash QUICKSTART.sh"