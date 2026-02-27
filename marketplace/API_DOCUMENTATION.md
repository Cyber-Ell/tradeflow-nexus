# MarketHub API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.marketplace.com`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "error description"
}
```

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Authentication Endpoints

### Register User

Create a new vendor or wholesaler account.

```
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "vendor",
  "company": "Acme Corp"
}
```

**Required Fields:**
- `name` (string, 2-100 chars)
- `email` (string, valid email)
- `password` (string, min 6 chars)
- `role` (string, "vendor" or "wholesaler")

**Optional Fields:**
- `company` (string, max 100 chars)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "vendor",
      "status": "pending",
      "company": "Acme Corp",
      "createdAt": "2024-02-27T20:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

Authenticate and receive a JWT token.

```
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Required Fields:**
- `email` (string)
- `password` (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "vendor",
      "status": "approved",
      "company": "Acme Corp"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Get User Profile

Retrieve current user's profile information.

```
GET /auth/profile
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "vendor",
    "status": "approved",
    "company": "Acme Corp",
    "profileImage": "https://...",
    "createdAt": "2024-02-27T20:00:00Z",
    "updatedAt": "2024-02-27T20:00:00Z"
  }
}
```

---

### Update User Profile

Update user's profile information.

```
PUT /auth/profile
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "company": "New Company",
  "profileImage": "https://..."
}
```

**Optional Fields:**
- `name` (string)
- `company` (string)
- `profileImage` (string, URL)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "vendor",
    "company": "New Company",
    "updatedAt": "2024-02-27T20:30:00Z"
  }
}
```

---

## Product Endpoints

### Create Product

Create a new product (vendor only).

```
POST /products
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "description": "High-precision wireless mouse",
  "price": 15000,
  "quantity": 100,
  "category": "Electronics"
}
```

**Required Fields:**
- `name` (string, 3-200 chars)
- `price` (number, positive)
- `quantity` (integer, positive)

**Optional Fields:**
- `description` (string, max 1000 chars)
- `category` (string, max 50 chars)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "vendorId": "user-uuid",
    "name": "Wireless Mouse",
    "description": "High-precision wireless mouse",
    "price": 15000,
    "quantity": 100,
    "category": "Electronics",
    "createdAt": "2024-02-27T20:00:00Z"
  }
}
```

---

### List Products

Get all products with optional filters.

```
GET /products?vendorId=uuid&category=Electronics
```

**Query Parameters:**
- `vendorId` (optional, string) - Filter by vendor
- `category` (optional, string) - Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-uuid",
      "vendorId": "user-uuid",
      "name": "Wireless Mouse",
      "price": 15000,
      "quantity": 100,
      "category": "Electronics",
      "createdAt": "2024-02-27T20:00:00Z"
    },
    {
      "id": "product-uuid-2",
      "vendorId": "user-uuid-2",
      "name": "Mechanical Keyboard",
      "price": 25000,
      "quantity": 50,
      "category": "Electronics",
      "createdAt": "2024-02-27T19:00:00Z"
    }
  ]
}
```

---

### Get Product Details

Retrieve a specific product.

```
GET /products/:id
```

**Path Parameters:**
- `id` (string) - Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "vendorId": "user-uuid",
    "name": "Wireless Mouse",
    "description": "High-precision wireless mouse",
    "price": 15000,
    "quantity": 100,
    "category": "Electronics",
    "createdAt": "2024-02-27T20:00:00Z"
  }
}
```

---

### Update Product

Update a product (vendor only, must be owner).

```
PUT /products/:id
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Path Parameters:**
- `id` (string) - Product ID

**Request Body:**
```json
{
  "price": 12000,
  "quantity": 150
}
```

**Optional Fields:**
- `name` (string)
- `description` (string)
- `price` (number)
- `quantity` (integer)
- `category` (string)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "vendorId": "user-uuid",
    "name": "Wireless Mouse",
    "price": 12000,
    "quantity": 150,
    "updatedAt": "2024-02-27T20:30:00Z"
  }
}
```

---

### Delete Product

Delete a product (vendor only, must be owner).

```
DELETE /products/:id
Authorization: Bearer TOKEN
```

**Path Parameters:**
- `id` (string) - Product ID

**Response:**
```json
{
  "success": true,
  "message": "Product deleted"
}
```

---

## Order Endpoints

### Create Order

Create a new order (wholesaler only).

```
POST /orders
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "vendorId": "vendor-uuid",
  "items": [
    {
      "productId": "product-uuid-1",
      "quantity": 10
    },
    {
      "productId": "product-uuid-2",
      "quantity": 5
    }
  ],
  "deliveryAddress": "123 Market St, Lagos, Nigeria"
}
```

**Required Fields:**
- `vendorId` (string) - Vendor to order from
- `items` (array) - Array of items with productId and quantity
- `deliveryAddress` (string) - Delivery address

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "wholesalerId": "user-uuid",
    "vendorId": "vendor-uuid",
    "status": "pending",
    "total": 150000,
    "items": "[{\"productId\":\"...\",\"quantity\":10}]",
    "deliveryAddress": "123 Market St, Lagos, Nigeria",
    "createdAt": "2024-02-27T20:00:00Z"
  }
}
```

---

### List Orders

Get user's orders (filters based on user role).

```
GET /orders?status=pending
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `status` (optional, string) - Filter by status: pending, paid, processing, shipped, delivered, cancelled

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "wholesalerId": "user-uuid",
      "vendorId": "vendor-uuid",
      "status": "pending",
      "total": 150000,
      "items": "...",
      "createdAt": "2024-02-27T20:00:00Z"
    }
  ]
}
```

---

### Get Order Details

Retrieve specific order with payment and tracking info.

```
GET /orders/:id
Authorization: Bearer TOKEN
```

**Path Parameters:**
- `id` (string) - Order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid",
      "wholesalerId": "user-uuid",
      "vendorId": "vendor-uuid",
      "status": "paid",
      "total": 150000,
      "items": "[...]",
      "deliveryAddress": "123 Market St, Lagos",
      "paymentRef": "paystack-ref-123",
      "trackingNumber": "TRK123456",
      "createdAt": "2024-02-27T20:00:00Z"
    },
    "payment": {
      "id": "payment-uuid",
      "orderId": "order-uuid",
      "amount": 150000,
      "status": "completed",
      "paymentMethod": "paystack",
      "escrowHeldUntil": "2024-03-02T20:00:00Z",
      "createdAt": "2024-02-27T20:05:00Z"
    },
    "tracking": {
      "id": "tracking-uuid",
      "orderId": "order-uuid",
      "trackingNumber": "TRK123456",
      "status": "in_transit",
      "location": "Distribution Hub",
      "estimatedDelivery": "2024-03-02T00:00:00Z",
      "logisticsProvider": "gig_logistics"
    }
  }
}
```

---

### Initialize Payment

Start Paystack payment process for an order.

```
POST /orders/:id/payment/initialize
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Path Parameters:**
- `id` (string) - Order ID

**Request Body:**
```json
{
  "email": "buyer@example.com"
}
```

**Required Fields:**
- `email` (string) - Buyer's email for Paystack

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.paystack.com/..."
  }
}
```

---

### Verify Payment

Verify Paystack payment callback.

```
POST /orders/:id/payment/verify
Content-Type: application/json
```

**Path Parameters:**
- `id` (string) - Order ID

**Request Body:**
```json
{
  "reference": "paystack-reference-code"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "orderId": "order-uuid"
  }
}
```

---

### Update Order Status

Update order status (vendor/admin only).

```
PUT /orders/:id/status
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Path Parameters:**
- `id` (string) - Order ID

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Statuses:**
- `pending` - Initial state
- `paid` - Payment received
- `processing` - Being prepared for shipment
- `shipped` - In transit
- `delivered` - Delivered to customer
- `cancelled` - Order cancelled

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "status": "processing",
    "updatedAt": "2024-02-27T20:30:00Z"
  }
}
```

---

## Admin Endpoints

All admin endpoints require `role: "admin"` and authentication.

### Get Platform Statistics

Get overall platform metrics.

```
GET /admin/stats
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 45,
    "totalVendors": 15,
    "totalWholesalers": 30,
    "pendingApprovals": 3,
    "totalOrders": 287,
    "totalRevenue": 12500000
  }
}
```

---

### List Vendors

Get list of vendors with optional status filter.

```
GET /admin/vendors?status=pending
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `status` (optional, string) - Filter by: pending, approved, rejected

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "name": "Vendor Name",
      "email": "vendor@example.com",
      "status": "pending",
      "company": "Vendor Inc",
      "createdAt": "2024-02-27T20:00:00Z"
    }
  ]
}
```

---

### Approve Vendor

Approve a vendor account.

```
POST /admin/vendors/:vendorId/approve
Authorization: Bearer TOKEN
```

**Path Parameters:**
- `vendorId` (string) - Vendor user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Vendor Name",
    "email": "vendor@example.com",
    "status": "approved",
    "company": "Vendor Inc"
  },
  "message": "Vendor approved"
}
```

---

### Reject Vendor

Reject a vendor account.

```
POST /admin/vendors/:vendorId/reject
Authorization: Bearer TOKEN
```

**Path Parameters:**
- `vendorId` (string) - Vendor user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Vendor Name",
    "email": "vendor@example.com",
    "status": "rejected"
  },
  "message": "Vendor rejected"
}
```

---

## Health Check

Check if the API is running.

```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-02-27T20:00:00Z"
}
```

---

## Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| 400 | Invalid email or password | Login credentials incorrect |
| 400 | Email already registered | User exists |
| 400 | Product not found | Product ID invalid |
| 401 | Invalid or expired token | Token invalid/expired |
| 403 | Access denied | User lacks required role |
| 403 | Not authorized | User doesn't own resource |
| 404 | User not found | User ID invalid |
| 409 | This email is already registered | Duplicate email |

---

## Rate Limiting

Currently no rate limiting. Production setup includes:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Burst limit: 10 requests per second

---

## Pagination

List endpoints support pagination:

```
GET /products?page=1&limit=20
```

**Query Parameters:**
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 20, max: 100)

---

## Filtering

Most list endpoints support filtering:

```
GET /orders?status=delivered&vendorId=uuid
GET /products?category=Electronics&vendorId=uuid
```

---

## Sorting

List endpoints support sorting:

```
GET /products?sort=createdAt&order=desc
```

**Query Parameters:**
- `sort` (optional, string) - Field to sort by
- `order` (optional, string) - asc or desc

---

## CORS Headers

Allowed origins:
- Development: `http://localhost:3001`
- Production: Configured in environment

All responses include appropriate CORS headers.

---

## Webhook Events (Future)

The following webhook events are planned:
- `order.created` - New order created
- `payment.completed` - Payment received
- `order.delivered` - Order delivered
- `vendor.approved` - Vendor approved by admin

---

## API Testing Tools

### cURL
See SETUP.md for cURL examples

### Postman
1. Import collection from API endpoints above
2. Set `{{BASE_URL}}` to http://localhost:3000
3. Use Bearer token authentication

### Thunder Client
Available as VS Code extension with same setup

---

For more information, see README.md and SETUP.md