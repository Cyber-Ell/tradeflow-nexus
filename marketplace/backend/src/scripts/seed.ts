import { initializeDatabase, getDatabase, closeDatabase } from '../config/database'
import { registerUser } from '../services/authService'
import { createProduct } from '../services/productService'
import bcryptjs from 'bcryptjs'
import { v4 as uuid } from 'uuid'

async function seed() {
  console.log('Starting seed...')

  try {
    const db = await initializeDatabase()

    // Create admin user
    const adminId = uuid()
    const adminPassword = await bcryptjs.hash('admin123', 10)
    await db.run(
      `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'Admin User', 'admin@marketplace.com', adminPassword, 'admin', 'active']
    )
    console.log('Admin user created: admin@marketplace.com / admin123')

    // Create test vendor
    const vendorId = uuid()
    const vendorPassword = await bcryptjs.hash('vendor123', 10)
    await db.run(
      `INSERT INTO users (id, name, email, password, role, status, company) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vendorId, 'Test Vendor', 'vendor@marketplace.com', vendorPassword, 'vendor', 'approved', 'Vendor Inc']
    )
    console.log('Vendor user created: vendor@marketplace.com / vendor123')

    // Create test wholesaler
    const wholesalerId = uuid()
    const wholesalerPassword = await bcryptjs.hash('wholesaler123', 10)
    await db.run(
      `INSERT INTO users (id, name, email, password, role, status, company) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [wholesalerId, 'Test Wholesaler', 'wholesaler@marketplace.com', wholesalerPassword, 'wholesaler', 'active', 'Wholesaler Inc']
    )
    console.log('Wholesaler user created: wholesaler@marketplace.com / wholesaler123')

    // Create sample products
    const products = [
      { name: 'Laptop', description: 'High-performance laptop', price: 500000, quantity: 10 },
      { name: 'Desktop PC', description: 'Powerful desktop computer', price: 400000, quantity: 5 },
      { name: 'Monitor', description: '4K LED Monitor', price: 150000, quantity: 20 },
      { name: 'Keyboard', description: 'Mechanical keyboard', price: 25000, quantity: 50 },
      { name: 'Mouse', description: 'Wireless mouse', price: 15000, quantity: 100 },
    ]

    for (const product of products) {
      const productId = uuid()
      await db.run(
        `INSERT INTO products (id, vendorId, name, description, price, quantity, category, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [productId, vendorId, product.name, product.description, product.price, product.quantity, 'Electronics']
      )
      console.log(`Product created: ${product.name}`)
    }

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
  } finally {
    await closeDatabase()
  }
}

seed()