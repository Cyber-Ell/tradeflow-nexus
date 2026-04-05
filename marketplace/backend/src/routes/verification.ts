import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { getVerificationByUserId, submitVerification } from '../services/verificationService'

const router = Router()

router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const verification = await getVerificationByUserId(req.user!.userId)
  res.json({
    success: true,
    data: verification,
  })
}))

router.post('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const verification = await submitVerification(req.user!.userId, req.body)
    res.json({
      success: true,
      data: verification,
      message: 'Verification submitted',
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

export default router
