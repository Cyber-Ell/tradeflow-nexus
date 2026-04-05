export type UserRole = 'vendor' | 'wholesaler' | 'admin'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active'
export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
export type PaymentStatus = 'pending' | 'authorized' | 'escrow_held' | 'released' | 'failed' | 'refunded' | 'disputed'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected'

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
  moq: number
  category?: string
  images?: string
  imageUrl?: string
  size?: string
  length?: string
  colors?: string[]
  specifications?: Record<string, string>
  vendor?: string
  verificationStatus?: VerificationStatus | null
  priceTiers?: ProductPriceTier[]
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
  orderItems?: OrderItem[]
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

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  createdAt: string
}

export interface ProductPriceTier {
  id: string
  productId: string
  minQuantity: number
  unitPrice: number
  createdAt: string
  updatedAt: string
}

export interface Verification {
  id: string
  userId: string
  documentType: string
  documentNumber: string
  status: VerificationStatus
  submittedAt: string
  reviewedAt?: string
  notes?: string
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

export interface ShipmentEvent {
  id: string
  orderId: string
  trackingId?: string
  status: string
  location?: string
  notes?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  relatedEntityType?: string
  relatedEntityId?: string
  readAt?: string
  createdAt: string
}

export interface Dispute {
  id: string
  orderId: string
  openedByUserId: string
  reason: string
  description?: string
  status: DisputeStatus
  resolution?: string
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
