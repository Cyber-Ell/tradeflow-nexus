# Preview Server Instructions

The "preview" refers to starting the development servers to test the application.

## Why Preview Failed Initially

The project files were created but dependencies weren't installed yet. This is normal for a fresh project setup.

## How to Start Preview

### Method 1: Using npm (Recommended)

```bash
cd /workspace/marketplace

# Install all dependencies
npm install

# Setup database
npm run --workspace=backend seed

# Start both servers
npm run dev
```

### Method 2: Using the init script

```bash
cd /workspace/marketplace
bash init.sh
npm run --workspace=backend seed
npm run dev
```

### Method 3: Start servers separately

**Terminal 1 - Backend:**
```bash
cd /workspace/marketplace
npm run --workspace=backend dev
```

**Terminal 2 - Frontend:**
```bash
cd /workspace/marketplace
npm run --workspace=frontend dev
```

## Access the Application

Once servers are running:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

## What Happens During Preview Start

1. **Dependencies install** - npm installs all packages
2. **Database initializes** - SQLite creates tables and indexes
3. **Test data loads** - Seed script creates 3 test users and 5 sample products
4. **Servers start** - Both frontend (port 3001) and backend (port 3000)
5. **Ready to use** - Login with test accounts

## Test Accounts

```
Admin:
  email: admin@marketplace.com
  password: admin123

Vendor:
  email: vendor@marketplace.com
  password: vendor123

Wholesaler:
  email: wholesaler@marketplace.com
  password: wholesaler123
```

## Troubleshooting

If servers don't start:

1. **Check Node version**: `node --version` (should be 18+)
2. **Check port availability**: 
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```
3. **Clear cache and retry**:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

## How Long Does It Take?

- **First time setup**: 3-5 minutes (dependencies + build)
- **Subsequent runs**: 15-30 seconds

## Stopping the Servers

Press `Ctrl+C` in the terminal

## Next Steps

After servers are running:
1. Open http://localhost:3001 in browser
2. Login with any test account
3. Explore the dashboard
4. Try creating products (as vendor)
5. Try ordering (as wholesaler)
6. Try approving vendors (as admin)

See **START_HERE.md** for complete guide.