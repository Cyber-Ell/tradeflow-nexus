#!/bin/bash

# MarketHub Quick Start Script
# This script sets up and runs the entire B2B marketplace platform

set -e

echo "🚀 MarketHub - B2B Marketplace Quick Start"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo -e "${BLUE}✓ Node.js $(node --version) found${NC}"

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "⚠️  Yarn not found. Installing globally..."
    npm install -g yarn
fi

echo -e "${BLUE}✓ Yarn $(yarn --version) found${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
yarn install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Setup environment
echo -e "${BLUE}Step 2: Setting up environment...${NC}"
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env (using defaults)${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi
echo ""

# Step 3: Create data directory
echo -e "${BLUE}Step 3: Creating data directory...${NC}"
mkdir -p data
echo -e "${GREEN}✓ Data directory ready${NC}"
echo ""

# Step 4: Seed database
echo -e "${BLUE}Step 4: Seeding database...${NC}"
yarn workspace backend seed
echo -e "${GREEN}✓ Database seeded with test data${NC}"
echo ""

# Display test credentials
echo -e "${GREEN}=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo -e "${BLUE}Test Credentials:${NC}"
echo ""
echo "Admin:"
echo "  Email: admin@marketplace.com"
echo "  Password: admin123"
echo ""
echo "Vendor:"
echo "  Email: vendor@marketplace.com"
echo "  Password: vendor123"
echo ""
echo "Wholesaler:"
echo "  Email: wholesaler@marketplace.com"
echo "  Password: wholesaler123"
echo ""
echo -e "${BLUE}Starting servers...${NC}"
echo ""
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Step 5: Start development servers
yarn dev