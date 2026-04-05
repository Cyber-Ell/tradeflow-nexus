import { Router, Request, Response } from 'express'
import { getVendors, approveVendor, rejectVendor, getPlatformStats } from '../services/adminService'
import { listVerifications, reviewVerification } from '../services/verificationService'
import { authenticateToken, requireRole } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { listDisputes, updateDisputeStatus } from '../services/disputeService'

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

router.get('/verifications', asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query
  const verifications = await listVerifications(status as any)
  res.json({
    success: true,
    data: verifications,
  })
}))

router.get('/disputes', asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query
  const disputes = await listDisputes({ status: status as any })
  res.json({
    success: true,
    data: disputes,
  })
}))

router.post('/disputes/:disputeId/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const dispute = await updateDisputeStatus(req.params.disputeId, req.body.status, req.body.resolution)
    res.json({
      success: true,
      data: dispute,
      message: 'Dispute updated',
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

router.post('/verifications/:userId/review', asyncHandler(async (req: Request, res: Response) => {
  try {
    const verification = await reviewVerification(req.params.userId, req.body)
    res.json({
      success: true,
      data: verification,
      message: 'Verification reviewed',
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
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
    throw error instanceof AppError ? error : new AppError(error.message, 400)
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
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

export default router
