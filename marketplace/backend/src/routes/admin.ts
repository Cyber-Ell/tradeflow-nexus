import { Router, Request, Response } from 'express'
import { getVendors, approveVendor, rejectVendor, getPlatformStats } from '../services/adminService'
import { authenticateToken, requireRole } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const router = Router()

router.use(authenticateToken, requireRole('admin'))

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await getPlatformStats()
  res.json({
    success: true,
    data: stats,
  })
}))

router.get('/vendors', asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query
  const vendors = await getVendors(status as any)
  res.json({
    success: true,
    data: vendors,
  })
}))

router.post('/vendors/:vendorId/approve', asyncHandler(async (req: Request, res: Response) => {
  try {
    const vendor = await approveVendor(req.params.vendorId)
    res.json({
      success: true,
      data: vendor,
      message: 'Vendor approved',
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

router.post('/vendors/:vendorId/reject', asyncHandler(async (req: Request, res: Response) => {
  try {
    const vendor = await rejectVendor(req.params.vendorId)
    res.json({
      success: true,
      data: vendor,
      message: 'Vendor rejected',
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

export default router