import { Router, Request, Response } from 'express'
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../services/productService'
import { authenticateToken, requireRole } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { getDatabase } from '../config/database'

const router = Router()

async function ensureApprovedVendor(req: Request): Promise<void> {
  const db = await getDatabase()
  const vendor = await db.get('SELECT status FROM users WHERE id = ? AND role = ?', [req.user!.userId, 'vendor'])

  if (!vendor) {
    throw new AppError('Vendor not found', 404)
  }

  if (vendor.status !== 'approved' && vendor.status !== 'active') {
    throw new AppError('Vendor approval required before managing products', 403)
  }
}

router.post('/', authenticateToken, requireRole('vendor'), asyncHandler(async (req: Request, res: Response) => {
  try {
    await ensureApprovedVendor(req)
    const product = await createProduct(req.user!.userId, req.body)
    res.status(201).json({
      success: true,
      data: product,
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { vendorId, category } = req.query
  const products = await getProducts({
    vendorId: vendorId as string | undefined,
    category: category as string | undefined,
  })
  res.json({
    success: true,
    data: products,
  })
}))

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductById(req.params.id)
  if (!product) {
    throw new AppError('Product not found', 404)
  }
  res.json({
    success: true,
    data: product,
  })
}))

router.put('/:id', authenticateToken, requireRole('vendor'), asyncHandler(async (req: Request, res: Response) => {
  try {
    await ensureApprovedVendor(req)
    const product = await updateProduct(req.params.id, req.user!.userId, req.body)
    res.json({
      success: true,
      data: product,
    })
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(error.message, error.message.includes('Not authorized') ? 403 : 400)
  }
}))

router.delete('/:id', authenticateToken, requireRole('vendor'), asyncHandler(async (req: Request, res: Response) => {
  try {
    await ensureApprovedVendor(req)
    await deleteProduct(req.params.id, req.user!.userId)
    res.json({
      success: true,
      message: 'Product deleted',
    })
  } catch (error: any) {
    throw error instanceof AppError
      ? error
      : new AppError(error.message, error.message.includes('Not authorized') ? 403 : 400)
  }
}))

export default router
