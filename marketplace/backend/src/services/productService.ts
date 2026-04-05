import { getDatabase } from '../config/database'
import { validateRequest, createProductSchema, updateProductSchema } from '../utils/validation'
import { Product, ProductPriceTier } from '../types'
import { v4 as uuid } from 'uuid'

export async function createProduct(vendorId: string, data: any): Promise<Product> {
  const validated = validateRequest(createProductSchema, data)
  const db = await getDatabase()

  const productId = uuid()
  await db.exec('BEGIN')

  try {
    await db.run(
      `INSERT INTO products (
         id, vendorId, name, description, price, quantity, moq, category, imageUrl, size, length, colors, specifications, createdAt, updatedAt
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        productId,
        vendorId,
        validated.name,
        validated.description || null,
        validated.price,
        validated.quantity,
        validated.moq ?? 1,
        validated.category || null,
        normalizeOptionalString(validated.imageUrl),
        normalizeOptionalString(validated.size),
        normalizeOptionalString(validated.length),
        stringifyJson(validated.colors),
        stringifyJson(validated.specifications),
      ]
    )

    await syncProductPriceTiers(productId, validated.priceTiers || [])
    await db.exec('COMMIT')
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }

  const product = await getProductById(productId)
  if (!product) {
    throw new Error('Failed to create product')
  }

  return product
}

export async function getProducts(filter?: { vendorId?: string; category?: string }): Promise<Product[]> {
  const db = await getDatabase()
  let query = `
    SELECT
      p.*,
      u.name as vendor,
      v.status as verificationStatus
    FROM products p
    INNER JOIN users u ON u.id = p.vendorId
    LEFT JOIN verifications v ON v.userId = p.vendorId
    WHERE 1=1
  `
  const params: any[] = []

  if (filter?.vendorId) {
    query += ' AND p.vendorId = ?'
    params.push(filter.vendorId)
  }

  if (filter?.category) {
    query += ' AND p.category = ?'
    params.push(filter.category)
  }

  query += ' ORDER BY p.createdAt DESC'
  const products = await db.all<Product[]>(query, params)

  return Promise.all(products.map(mapProduct))
}

export async function getProductById(productId: string): Promise<Product | null> {
  const db = await getDatabase()
  const product = await db.get<Product>(
    `SELECT
       p.*,
       u.name as vendor,
       v.status as verificationStatus
     FROM products p
     INNER JOIN users u ON u.id = p.vendorId
     LEFT JOIN verifications v ON v.userId = p.vendorId
     WHERE p.id = ?`,
    [productId]
  ) || null

  if (!product) {
    return null
  }

  return mapProduct(product)
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
  if (validated.moq) {
    updates.push('moq = ?')
    values.push(validated.moq)
  }
  if (validated.category) {
    updates.push('category = ?')
    values.push(validated.category)
  }
  if (validated.imageUrl !== undefined) {
    updates.push('imageUrl = ?')
    values.push(normalizeOptionalString(validated.imageUrl))
  }
  if (validated.size !== undefined) {
    updates.push('size = ?')
    values.push(normalizeOptionalString(validated.size))
  }
  if (validated.length !== undefined) {
    updates.push('length = ?')
    values.push(normalizeOptionalString(validated.length))
  }
  if (validated.colors !== undefined) {
    updates.push('colors = ?')
    values.push(stringifyJson(validated.colors))
  }
  if (validated.specifications !== undefined) {
    updates.push('specifications = ?')
    values.push(stringifyJson(validated.specifications))
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP')
  values.push(productId)

  await db.exec('BEGIN')

  try {
    if (updates.length > 1) {
      await db.run(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }

    if (validated.priceTiers) {
      await syncProductPriceTiers(productId, validated.priceTiers)
    }

    await db.exec('COMMIT')
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }

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

export async function getEffectiveProductPrice(productId: string, quantity: number): Promise<number> {
  const product = await getProductById(productId)
  if (!product) {
    throw new Error('Product not found')
  }

  if (quantity < product.moq) {
    throw new Error(`Minimum order quantity for ${product.name} is ${product.moq}`)
  }

  const matchingTier = [...(product.priceTiers || [])]
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .find((tier) => quantity >= tier.minQuantity)

  return matchingTier ? matchingTier.unitPrice : product.price
}

async function mapProduct(product: Product): Promise<Product> {
  return {
    ...product,
    moq: Number(product.moq || 1),
    imageUrl: normalizeOptionalString(product.imageUrl),
    size: normalizeOptionalString(product.size),
    length: normalizeOptionalString(product.length),
    colors: parseStringArray(product.colors),
    specifications: parseStringRecord(product.specifications),
    priceTiers: await getProductPriceTiers(product.id),
  }
}

async function getProductPriceTiers(productId: string): Promise<ProductPriceTier[]> {
  const db = await getDatabase()
  return await db.all<ProductPriceTier[]>(
    'SELECT * FROM product_price_tiers WHERE productId = ? ORDER BY minQuantity ASC',
    [productId]
  )
}

async function syncProductPriceTiers(
  productId: string,
  priceTiers: Array<{ minQuantity: number; unitPrice: number }>
): Promise<void> {
  const db = await getDatabase()

  await db.run('DELETE FROM product_price_tiers WHERE productId = ?', [productId])

  const normalizedTiers = [...priceTiers]
    .map((tier) => ({
      minQuantity: Number(tier.minQuantity),
      unitPrice: Number(tier.unitPrice),
    }))
    .filter((tier) => tier.minQuantity > 0 && tier.unitPrice > 0)
    .sort((a, b) => a.minQuantity - b.minQuantity)

  for (const tier of normalizedTiers) {
    await db.run(
      `INSERT INTO product_price_tiers (id, productId, minQuantity, unitPrice, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [uuid(), productId, tier.minQuantity, tier.unitPrice]
    )
  }
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function stringifyJson(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null
  }

  return JSON.stringify(value)
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }

  if (typeof value !== 'string' || !value.trim()) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
  } catch {
    return []
  }
}

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value) {
    return {}
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(
        ([key, entryValue]) => key.trim() && typeof entryValue === 'string'
      )
    )
  }

  if (typeof value !== 'string' || !value.trim()) {
    return {}
  }

  try {
    const parsed = JSON.parse(value)
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([key, entryValue]) => key.trim() && typeof entryValue === 'string'
      )
    )
  } catch {
    return {}
  }
}
