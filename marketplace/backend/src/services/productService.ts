import { getDatabase } from '../config/database'
import { validateRequest, createProductSchema, updateProductSchema } from '../utils/validation'
import { Product } from '../types'
import { v4 as uuid } from 'uuid'

export async function createProduct(vendorId: string, data: any): Promise<Product> {
  const validated = validateRequest(createProductSchema, data)
  const db = await getDatabase()

  const productId = uuid()
  await db.run(
    `INSERT INTO products (id, vendorId, name, description, price, quantity, category, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [productId, vendorId, validated.name, validated.description || null, validated.price, validated.quantity, validated.category || null]
  )

  const product = await db.get('SELECT * FROM products WHERE id = ?', [productId])
  return product
}

export async function getProducts(filter?: { vendorId?: string; category?: string }): Promise<Product[]> {
  const db = await getDatabase()
  let query = 'SELECT * FROM products WHERE 1=1'
  const params: any[] = []

  if (filter?.vendorId) {
    query += ' AND vendorId = ?'
    params.push(filter.vendorId)
  }

  if (filter?.category) {
    query += ' AND category = ?'
    params.push(filter.category)
  }

  query += ' ORDER BY createdAt DESC'
  return await db.all(query, params)
}

export async function getProductById(productId: string): Promise<Product | null> {
  const db = await getDatabase()
  return await db.get('SELECT * FROM products WHERE id = ?', [productId]) || null
}

export async function updateProduct(productId: string, vendorId: string, data: any): Promise<Product> {
  const validated = validateRequest(updateProductSchema, data)
  const db = await getDatabase()

  const product = await getProductById(productId)
  if (!product) throw new Error('Product not found')
  if (product.vendorId !== vendorId) throw new Error('Not authorized')

  const updates: string[] = []
  const values: any[] = []

  if (validated.name) {
    updates.push('name = ?')
    values.push(validated.name)
  }
  if (validated.description !== undefined) {
    updates.push('description = ?')
    values.push(validated.description)
  }
  if (validated.price) {
    updates.push('price = ?')
    values.push(validated.price)
  }
  if (validated.quantity) {
    updates.push('quantity = ?')
    values.push(validated.quantity)
  }
  if (validated.category) {
    updates.push('category = ?')
    values.push(validated.category)
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP')
  values.push(productId)

  await db.run(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values
  )

  const updated = await getProductById(productId)
  if (!updated) throw new Error('Failed to update product')
  return updated
}

export async function deleteProduct(productId: string, vendorId: string): Promise<void> {
  const db = await getDatabase()
  const product = await getProductById(productId)
  
  if (!product) throw new Error('Product not found')
  if (product.vendorId !== vendorId) throw new Error('Not authorized')

  await db.run('DELETE FROM products WHERE id = ?', [productId])
}