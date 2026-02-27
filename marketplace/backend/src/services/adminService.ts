import { getDatabase } from '../config/database'
import { User, UserStatus } from '../types'

export async function getVendors(status?: UserStatus): Promise<Omit<User, 'password'>[]> {
  const db = await getDatabase()
  let query = "SELECT * FROM users WHERE role = 'vendor'"
  const params: any[] = []

  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }

  query += ' ORDER BY createdAt DESC'
  const vendors = await db.all(query, params)
  
  return vendors.map((v: any) => {
    delete v.password
    return v
  })
}

export async function approveVendor(vendorId: string): Promise<Omit<User, 'password'>> {
  const db = await getDatabase()

  const vendor = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [vendorId, 'vendor'])
  if (!vendor) throw new Error('Vendor not found')

  await db.run(
    'UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    ['approved', vendorId]
  )

  const updated = await db.get('SELECT * FROM users WHERE id = ?', [vendorId])
  delete updated.password
  return updated
}

export async function rejectVendor(vendorId: string): Promise<Omit<User, 'password'>> {
  const db = await getDatabase()

  const vendor = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [vendorId, 'vendor'])
  if (!vendor) throw new Error('Vendor not found')

  await db.run(
    'UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    ['rejected', vendorId]
  )

  const updated = await db.get('SELECT * FROM users WHERE id = ?', [vendorId])
  delete updated.password
  return updated
}

export async function getPlatformStats(): Promise<{
  totalUsers: number
  totalVendors: number
  totalWholesalers: number
  pendingApprovals: number
  totalOrders: number
  totalRevenue: number
}> {
  const db = await getDatabase()

  const userStats = await db.get("SELECT COUNT(*) as total FROM users")
  const vendorStats = await db.get("SELECT COUNT(*) as total FROM users WHERE role = 'vendor'")
  const wholesalerStats = await db.get("SELECT COUNT(*) as total FROM users WHERE role = 'wholesaler'")
  const pendingStats = await db.get("SELECT COUNT(*) as total FROM users WHERE role = 'vendor' AND status = 'pending'")
  const orderStats = await db.get("SELECT COUNT(*) as total FROM orders")
  const revenueStats = await db.get("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'delivered'")

  return {
    totalUsers: userStats.total,
    totalVendors: vendorStats.total,
    totalWholesalers: wholesalerStats.total,
    pendingApprovals: pendingStats.total,
    totalOrders: orderStats.total,
    totalRevenue: revenueStats.total,
  }
}