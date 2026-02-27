export type UserRole = 'vendor' | 'wholesaler' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: UserRole
  status: UserStatus
  company?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  vendorId: string
  name: string
  description?: string
  price: number
  quantity: number
  category?: string
  images?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  wholesalerId: string
  vendorId: string
  status: OrderStatus
  total: number
  items: string
  paymentRef?: string
  trackingNumber?: string
  deliveryAddress?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  status: PaymentStatus
  paymentMethod?: string
  paystackRef?: string
  escrowHeldUntil?: string
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: string
  wholesalerId: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface LogisticsTracking {
  id: string
  orderId: string
  trackingNumber?: string
  status: string
  location?: string
  estimatedDelivery?: string
  logisticsProvider?: string
  externalRef?: string
  createdAt: string
  updatedAt: string
}

export interface AuthPayload {
  userId: string
  email: string
  role: UserRole
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}