import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { listNotificationsByUser, markNotificationAsRead } from '../services/notificationService'

const router = Router()

router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const notifications = await listNotificationsByUser(req.user!.userId)
  res.json({
    success: true,
    data: notifications,
  })
}))

router.post('/:id/read', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    await markNotificationAsRead(req.params.id, req.user!.userId)
    res.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

export default router
