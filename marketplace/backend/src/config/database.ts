import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'

let db: Database | null = null

export async function initializeDatabase(): Promise<Database> {
  if (db) return db

  const dbPath = process.env.DATABASE_PATH || './data/marketplace.db'
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  await db.exec('PRAGMA foreign_keys = ON')
  await createTables()

  return db
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    return initializeDatabase()
  }
  return db
}

async function createTables(): Promise<void> {
  if (!db) return

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('vendor', 'wholesaler', 'admin')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'active')),
      company TEXT,
      profileImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      vendorId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      category TEXT,
      images TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(vendorId) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      wholesalerId TEXT NOT NULL,
      vendorId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
      total REAL NOT NULL,
      items TEXT NOT NULL,
      paymentRef TEXT,
      trackingNumber TEXT,
      deliveryAddress TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(wholesalerId) REFERENCES users(id),
      FOREIGN KEY(vendorId) REFERENCES users(id)
    )
  `)

  // Payments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      paymentMethod TEXT,
      paystackRef TEXT,
      escrowHeldUntil TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)

  // Cart table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
      id TEXT PRIMARY KEY,
      wholesalerId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(wholesalerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  // Logistics tracking table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS logistics_tracking (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      trackingNumber TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      location TEXT,
      estimatedDelivery TEXT,
      logisticsProvider TEXT,
      externalRef TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_products_vendorId ON products(vendorId);
    CREATE INDEX IF NOT EXISTS idx_orders_wholesalerId ON orders(wholesalerId);
    CREATE INDEX IF NOT EXISTS idx_orders_vendorId ON orders(vendorId);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_cart_wholesalerId ON cart(wholesalerId);
    CREATE INDEX IF NOT EXISTS idx_logistics_orderId ON logistics_tracking(orderId);
  `)
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close()
    db = null
  }
}