# MarketHub - Setup Verification Guide

## Pre-Flight Checklist

Before running the application, verify all files are in place.

### Frontend Files Check

```bash
cd /workspace/marketplace/frontend

# Required files
ls -la app/layout.tsx
ls -la app/page.tsx
ls -la app/globals.css
ls -la components/Navbar.tsx
ls -la lib/api.ts
ls -la lib/store.ts
ls -la package.json
ls -la tsconfig.json
ls -la next.config.js
ls -la tailwind.config.ts
```

### Backend Files Check

```bash
cd /workspace/marketplace/backend

# Required files
ls -la src/index.ts
ls -la src/config/database.ts
ls -la src/middleware/auth.ts
ls -la src/routes/auth.ts
ls -la src/services/authService.ts
ls -la package.json
ls -la tsconfig.json
ls -la .env.example
```

## Installation Steps

### Step 1: Install Dependencies

```bash
cd /workspace/marketplace

# Install root dependencies
npm install

# Install frontend dependencies
npm install --workspace=frontend

# Install backend dependencies
npm install --workspace=backend
```

### Step 2: Setup Environment

```bash
# Copy backend environment file
cp backend/.env.example backend/.env
```

### Step 3: Create Data Directory

```bash
mkdir -p data
```

### Step 4: Initialize Database

```bash
npm run --workspace=backend seed
```

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules
npm install --workspace=frontend
npm install --workspace=backend
```

### Issue: "sqlite3 compilation error"

**Solution:**
```bash
# Rebuild sqlite3
cd backend
npm rebuild sqlite3
cd ..
```

### Issue: Port 3000 or 3001 already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process (replace PID)
kill -9 PID

# Or use different ports
PORT=3002 npm run --workspace=backend dev
```

### Issue: Database file permissions

**Solution:**
```bash
# Ensure data directory is writable
chmod 755 data
chmod 644 data/*.db 2>/dev/null || true
```

## Verification Tests

### 1. Check Node Version
```bash
node --version  # Should be 18+
```

### 2. Check npm Version
```bash
npm --version   # Should be 8+
```

### 3. Verify Frontend Build
```bash
npm run --workspace=frontend build
```

### 4. Verify Backend Build
```bash
npm run --workspace=backend build
```

### 5. Check API Health
```bash
# Start backend
npm run --workspace=backend dev &

# Wait 5 seconds
sleep 5

# Test endpoint
curl http://localhost:3000/health
```

## Docker Verification

### Build Docker Image
```bash
docker build -t marketplace:latest .
```

### Run with Docker Compose
```bash
docker-compose up
```

### Access Services
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- RabbitMQ: http://localhost:15672

## File Structure Verification

The complete project structure should look like:

```
marketplace/
├── frontend/
│   ├── app/
│   │   ├── page.tsx ✓
│   │   ├── layout.tsx ✓
│   │   ├── globals.css ✓
│   │   ├── login/page.tsx ✓
│   │   ├── signup/page.tsx ✓
│   │   └── dashboard/
│   │       ├── vendor/page.tsx ✓
│   │       ├── wholesaler/page.tsx ✓
│   │       └── admin/page.tsx ✓
│   ├── components/
│   │   ├── Navbar.tsx ✓
│   │   └── Footer.tsx ✓
│   ├── lib/
│   │   ├── api.ts ✓
│   │   └── store.ts ✓
│   ├── package.json ✓
│   ├── tsconfig.json ✓
│   ├── next.config.js ✓
│   └── tailwind.config.ts ✓
│
├── backend/
│   ├── src/
│   │   ├── index.ts ✓
│   │   ├── config/database.ts ✓
│   │   ├── middleware/
│   │   │   ├── auth.ts ✓
│   │   │   └── errorHandler.ts ✓
│   │   ├── routes/
│   │   │   ├── auth.ts ✓
│   │   │   ├── products.ts ✓
│   │   │   ├── orders.ts ✓
│   │   │   └── admin.ts ✓
│   │   ├── services/
│   │   │   ├── authService.ts ✓
│   │   │   ├── productService.ts ✓
│   │   │   ├── orderService.ts ✓
│   │   │   ├── paymentService.ts ✓
│   │   │   ├── logisticsService.ts ✓
│   │   │   └── adminService.ts ✓
│   │   ├── utils/
│   │   │   ├── jwt.ts ✓
│   │   │   └── validation.ts ✓
│   │   ├── types/index.ts ✓
│   │   └── scripts/seed.ts ✓
│   ├── package.json ✓
│   ├── tsconfig.json ✓
│   └── .env.example ✓
│
├── package.json ✓
├── docker-compose.yml ✓
├── Dockerfile ✓
├── .gitignore ✓
├── README.md ✓
├── SETUP.md ✓
├── DEPLOYMENT.md ✓
├── API_DOCUMENTATION.md ✓
└── PROJECT_SUMMARY.md ✓
```

## Quick Diagnostic Script

Run this to verify everything:

```bash
#!/bin/bash

echo "🔍 MarketHub Setup Verification"
echo "================================"
echo ""

# Check Node
echo -n "Node.js: "
node --version || echo "NOT FOUND"

# Check npm
echo -n "npm: "
npm --version || echo "NOT FOUND"

# Check files
echo ""
echo "Frontend Files:"
test -f frontend/package.json && echo "✓ package.json" || echo "✗ package.json"
test -f frontend/app/page.tsx && echo "✓ app/page.tsx" || echo "✗ app/page.tsx"
test -f frontend/app/layout.tsx && echo "✓ app/layout.tsx" || echo "✗ app/layout.tsx"

echo ""
echo "Backend Files:"
test -f backend/package.json && echo "✓ package.json" || echo "✗ package.json"
test -f backend/src/index.ts && echo "✓ src/index.ts" || echo "✗ src/index.ts"
test -f backend/.env.example && echo "✓ .env.example" || echo "✗ .env.example"

echo ""
echo "Configuration:"
test -f backend/.env && echo "✓ backend/.env" || echo "✗ backend/.env (run: cp backend/.env.example backend/.env)"
test -d data && echo "✓ data/" || echo "✗ data/ (run: mkdir -p data)"

echo ""
echo "✓ Setup verification complete!"
```

## Troubleshooting

If you encounter issues:

1. **Check logs**: `npm run --workspace=backend dev 2>&1 | head -50`
2. **Verify database**: `ls -la data/`
3. **Test API**: `curl -s http://localhost:3000/health`
4. **Check ports**: `lsof -i :3000; lsof -i :3001`

## Support

Refer to:
- **README.md** - Overview and quick start
- **SETUP.md** - Detailed setup guide
- **API_DOCUMENTATION.md** - API reference