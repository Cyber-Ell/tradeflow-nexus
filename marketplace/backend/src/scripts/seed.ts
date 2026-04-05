import { initializeDatabase, closeDatabase } from '../config/database'
import bcryptjs from 'bcryptjs'
import { v4 as uuid } from 'uuid'

async function seed() {
  console.log('Starting seed...')

  try {
    const db = await initializeDatabase()

    // Create admin user
    const adminPassword = await bcryptjs.hash('admin123', 10)
    await upsertUser(db, {
      name: 'Admin User',
      email: 'admin@marketplace.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    })
    console.log('Admin user ready: admin@marketplace.com / admin123')

    // Create test vendor
    const vendorPassword = await bcryptjs.hash('vendor123', 10)
    const vendorId = await upsertUser(db, {
      name: 'Test Vendor',
      email: 'vendor@marketplace.com',
      password: vendorPassword,
      role: 'vendor',
      status: 'approved',
      company: 'Vendor Inc',
    })
    console.log('Vendor user ready: vendor@marketplace.com / vendor123')

    // Create test wholesaler
    const wholesalerPassword = await bcryptjs.hash('wholesaler123', 10)
    await upsertUser(db, {
      name: 'Test Wholesaler',
      email: 'wholesaler@marketplace.com',
      password: wholesalerPassword,
      role: 'wholesaler',
      status: 'active',
      company: 'Wholesaler Inc',
    })
    console.log('Wholesaler user ready: wholesaler@marketplace.com / wholesaler123')

    // Create sample products
    const products = [
      { name: 'Laptop', description: 'High-performance laptop', price: 500000, quantity: 10, moq: 2, size: '15-inch', length: '35cm', colors: ['Silver', 'Black'], specifications: { RAM: '16GB', Storage: '512GB SSD' }, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80', priceTiers: [{ minQuantity: 5, unitPrice: 475000 }, { minQuantity: 10, unitPrice: 450000 }] },
      { name: 'Desktop PC', description: 'Powerful desktop computer', price: 400000, quantity: 5, moq: 1, size: 'Mid Tower', length: '45cm', colors: ['Black'], specifications: { CPU: 'Intel i7', RAM: '16GB' }, imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80', priceTiers: [{ minQuantity: 3, unitPrice: 385000 }] },
      { name: 'Monitor', description: '4K LED Monitor', price: 150000, quantity: 20, moq: 2, size: '27-inch', length: '61cm', colors: ['Black'], specifications: { Resolution: '3840x2160', Panel: 'IPS' }, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80', priceTiers: [{ minQuantity: 5, unitPrice: 142500 }] },
      { name: 'Keyboard', description: 'Mechanical keyboard', price: 25000, quantity: 50, moq: 5, size: 'Full Size', length: '44cm', colors: ['White', 'Black'], specifications: { Switch: 'Blue', Connectivity: 'USB-C' }, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80', priceTiers: [{ minQuantity: 10, unitPrice: 23500 }, { minQuantity: 25, unitPrice: 22000 }] },
      { name: 'Mouse', description: 'Wireless mouse', price: 15000, quantity: 100, moq: 5, size: 'Medium', length: '12cm', colors: ['Black', 'Gray'], specifications: { Connectivity: 'Bluetooth', DPI: '1600' }, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80', priceTiers: [{ minQuantity: 20, unitPrice: 14000 }] },
    ]

    for (const product of products) {
      const existingProduct = await db.get(
        'SELECT id FROM products WHERE vendorId = ? AND name = ?',
        [vendorId, product.name]
      )

      if (existingProduct) {
        await db.run(
          `UPDATE products
           SET description = ?, price = ?, quantity = ?, moq = ?, category = ?, imageUrl = ?, size = ?, length = ?, colors = ?, specifications = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [product.description, product.price, product.quantity, product.moq, 'Electronics', product.imageUrl, product.size, product.length, JSON.stringify(product.colors), JSON.stringify(product.specifications), existingProduct.id]
        )
        await syncSeedPriceTiers(db, existingProduct.id, product.priceTiers)
        console.log(`Product updated: ${product.name}`)
        continue
      }

      const productId = uuid()
      await db.run(
        `INSERT INTO products (id, vendorId, name, description, price, quantity, moq, category, imageUrl, size, length, colors, specifications, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [productId, vendorId, product.name, product.description, product.price, product.quantity, product.moq, 'Electronics', product.imageUrl, product.size, product.length, JSON.stringify(product.colors), JSON.stringify(product.specifications)]
      )
      await syncSeedPriceTiers(db, productId, product.priceTiers)
      console.log(`Product created: ${product.name}`)
    }

    await db.run(
      `INSERT INTO verifications (id, userId, documentType, documentNumber, status, submittedAt, reviewedAt, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(userId) DO UPDATE SET
         documentType = excluded.documentType,
         documentNumber = excluded.documentNumber,
         status = excluded.status,
         reviewedAt = excluded.reviewedAt,
         notes = excluded.notes,
         updatedAt = CURRENT_TIMESTAMP`,
      [uuid(), vendorId, 'cac', 'RC-123456', 'approved', 'Seeded approved verification']
    )

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
  } finally {
    await closeDatabase()
  }
}

seed()

async function upsertUser(
  db: Awaited<ReturnType<typeof initializeDatabase>>,
  user: {
    name: string
    email: string
    password: string
    role: 'admin' | 'vendor' | 'wholesaler'
    status: 'pending' | 'approved' | 'rejected' | 'active'
    company?: string
  }
): Promise<string> {
  const existingUser = await db.get<{ id: string }>(
    'SELECT id FROM users WHERE email = ?',
    [user.email]
  )

  if (existingUser) {
    await db.run(
      `UPDATE users
       SET name = ?, password = ?, role = ?, status = ?, company = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [user.name, user.password, user.role, user.status, user.company || null, existingUser.id]
    )
    return existingUser.id
  }

  const userId = uuid()
  await db.run(
    `INSERT INTO users (id, name, email, password, role, status, company)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, user.name, user.email, user.password, user.role, user.status, user.company || null]
  )

  return userId
}

async function syncSeedPriceTiers(
  db: Awaited<ReturnType<typeof initializeDatabase>>,
  productId: string,
  priceTiers: Array<{ minQuantity: number; unitPrice: number }>
): Promise<void> {
  await db.run('DELETE FROM product_price_tiers WHERE productId = ?', [productId])

  for (const tier of priceTiers) {
    await db.run(
      `INSERT INTO product_price_tiers (id, productId, minQuantity, unitPrice, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [uuid(), productId, tier.minQuantity, tier.unitPrice]
    )
  }
}
