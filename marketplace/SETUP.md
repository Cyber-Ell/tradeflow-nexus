# MarketHub Setup Guide

## One-Click Installation

Run this script to set up the entire application:

```bash
cd /workspace/marketplace
```

### Step 1: Install Dependencies

```bash
# For macOS/Linux users
yarn install

# For Windows users, use npm
npm install
```

### Step 2: Configure Environment

The backend has a `.env.example` file with all required variables. Copy it:

```bash
cp backend/.env.example backend/.env
```

Optional: Update `backend/.env` with your credentials:
- `PAYSTACK_SECRET_KEY` - Get from https://dashboard.paystack.com
- `GIG_LOGISTICS_API_KEY` - Get from GIG Logistics dashboard

### Step 3: Initialize Database

```bash
# Seed database with test users and products
yarn workspace backend seed
```

This creates:
- 1 Admin user
- 1 Vendor with 5 sample products
- 1 Wholesaler account

### Step 4: Start Development

```bash
# Start both frontend and backend simultaneously
yarn dev
```

Or separately:

```bash
# Terminal 1: Frontend
yarn workspace frontend dev

# Terminal 2: Backend
yarn workspace backend dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health

## Using Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- RabbitMQ: http://localhost:15672 (guest/guest)

## Test Login Flow

### 1. As Admin

1. Go to http://localhost:3001/login
2. Email: `admin@marketplace.com`
3. Password: `admin123`
4. You'll see the Admin Dashboard with vendor approvals

### 2. As Vendor

1. Go to http://localhost:3001/login
2. Email: `vendor@marketplace.com`
3. Password: `vendor123`
4. You can add products and manage your inventory

### 3. As Wholesaler

1. Go to http://localhost:3001/login
2. Email: `wholesaler@marketplace.com`
3. Password: `wholesaler123`
4. You can browse vendor products and place orders

## API Testing

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "vendor"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@marketplace.com",
    "password": "vendor123"
  }'
```

**Create a product (requires token):**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Product Name",
    "price": 10000,
    "quantity": 5
  }'
```

### Using Postman

1. Import the API collection (endpoints listed in README.md)
2. Set `{{BASE_URL}}` to `http://localhost:3000`
3. After login, use the returned token in requests

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

```bash
# Frontend (change port)
yarn workspace frontend dev -- -p 3002

# Backend (update in backend/.env)
# Change PORT=3001
yarn workspace backend dev
```

### Database Errors

```bash
# Reset database
rm -rf data/marketplace.db

# Re-seed
yarn workspace backend seed
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
yarn install

# Clean build cache
yarn build
```

### CORS Errors

Ensure `CORS_ORIGIN` in `backend/.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:3001
```

## File Structure

```
marketplace/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── login/page.tsx        # Login page
│   │   ├── signup/page.tsx       # Registration
│   │   └── dashboard/            # Protected dashboards
│   ├── components/               # Reusable components
│   ├── lib/                      # API client, store
│   └── styles/                   # Global styles
├── backend/
│   ├── src/
│   │   ├── config/               # Database setup
│   │   ├── middleware/           # Auth, errors
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Helpers
│   │   └── index.ts              # Server entry
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Next Steps

1. **Customize branding**: Update logo and colors in `frontend/tailwind.config.ts`
2. **Add Paystack keys**: Get from https://dashboard.paystack.com
3. **Connect GIG Logistics**: Update API key in `.env`
4. **Deploy to production**: Use Docker and cloud provider (AWS, Heroku, etc.)
5. **Set up monitoring**: Add CloudWatch or New Relic

## Production Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure database (PostgreSQL recommended)
- [ ] Set up environment variables for all services
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Set up backups
- [ ] Enable logging and monitoring
- [ ] Test payment integration with real Paystack account
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Test all email notifications
- [ ] Set up error tracking (Sentry)
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline

## Support

For issues or questions:
1. Check README.md for feature details
2. Review .env.example for configuration
3. Check backend logs: `yarn workspace backend dev`
4. Check frontend errors in browser console
5. Verify database: `ls -la data/marketplace.db`