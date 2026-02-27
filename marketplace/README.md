# MarketHub - B2B Marketplace Platform

A production-ready, full-stack B2B marketplace connecting vendors, wholesalers, and buyers with secure payments, real-time order tracking, and admin oversight.

## Features

- **Multi-Role Support**: Vendor, Wholesaler, and Admin roles with RBAC
- **JWT Authentication**: Secure token-based authentication
- **Product Management**: Vendors can list and manage products
- **Order System**: Wholesalers can place orders with real-time tracking
- **Escrow Payments**: Secure Paystack integration with escrow protection
- **Logistics Integration**: Real-time order tracking with GIG Logistics
- **Admin Dashboard**: Vendor approval system and platform monitoring
- **Responsive Design**: Modern UI with Tailwind CSS
- **SQLite Database**: Lightweight, serverless database
- **Monorepo Setup**: Frontend and backend in single repository

## Tech Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Hook Form
- Axios

**Backend:**
- Node.js + Express
- TypeScript
- SQLite
- JWT (Authentication)
- Joi (Validation)
- bcryptjs (Password Hashing)
- Axios (HTTP Client)

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn or NPM

### Installation

```bash
cd /workspace/marketplace

# Install dependencies
yarn install

# Copy environment file
cp backend/.env.example backend/.env

# Seed database with test data
yarn workspace backend seed

# Start development servers
yarn dev
```

### Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Test Accounts

### Admin
- Email: `admin@marketplace.com`
- Password: `admin123`

### Vendor
- Email: `vendor@marketplace.com`
- Password: `vendor123`

### Wholesaler
- Email: `wholesaler@marketplace.com`
- Password: `wholesaler123`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (authenticated)
- `PUT /auth/profile` - Update user profile (authenticated)

### Products
- `POST /products` - Create product (vendor only)
- `GET /products` - List products
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product (vendor only)
- `DELETE /products/:id` - Delete product (vendor only)

### Orders
- `POST /orders` - Create order (wholesaler only)
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/payment/initialize` - Initialize payment
- `POST /orders/:id/payment/verify` - Verify payment
- `PUT /orders/:id/status` - Update order status

### Admin
- `GET /admin/stats` - Platform statistics
- `GET /admin/vendors` - List vendors
- `POST /admin/vendors/:vendorId/approve` - Approve vendor
- `POST /admin/vendors/:vendorId/reject` - Reject vendor

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_PATH=./data/marketplace.db
PAYSTACK_SECRET_KEY=your-key
PAYSTACK_PUBLIC_KEY=your-key
CORS_ORIGIN=http://localhost:3001
```

## Project Structure

```
marketplace/
├── frontend/
│   ├── app/                  # Next.js app directory
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utilities and store
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   └── package.json
├── docker-compose.yml       # Docker configuration
└── package.json            # Monorepo root
```

## Docker Deployment

```bash
# Build and start services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Features Implementation

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcryptjs

### 2. User Management
- Registration for vendors and wholesalers
- User profiles with company information
- Admin user management

### 3. Product Management
- Vendors can create, update, and delete products
- Product listing with filtering by vendor and category
- Inventory tracking

### 4. Order Processing
- Wholesalers can browse and order products
- Order status tracking (pending → paid → processing → shipped → delivered)
- Order history and details

### 5. Payment Integration
- Paystack payment gateway integration
- Escrow payment system (3-day hold after payment)
- Payment verification and status tracking

### 6. Logistics Integration
- GIG Logistics API integration (with fallback)
- Real-time order tracking
- Automatic tracking number generation
- Delivery status updates

### 7. Admin Dashboard
- Vendor approval workflow
- Platform statistics and monitoring
- User and order management

## Security Measures

- HTTPS enforced in production
- Password hashing with bcryptjs
- JWT token validation
- CORS protection
- Input validation with Joi
- SQL injection prevention
- Helmet.js security headers

## Performance Optimization

- Database indexing on frequently queried fields
- Optimized queries with proper filtering
- Gzip compression
- Connection pooling ready
- Static asset caching

## Scaling Considerations

- SQLite can be replaced with PostgreSQL/MySQL for multi-instance deployment
- RabbitMQ ready for async task processing
- Load balancing ready with Express
- Horizontal scaling with session management

## Future Enhancements

- Message queue integration (RabbitMQ)
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Mobile app (React Native)
- Multi-currency support
- Advanced search with Elasticsearch
- Marketplace ratings and reviews
- Vendor analytics and insights
- Inventory forecasting
- Automated compliance checks

## License

MIT