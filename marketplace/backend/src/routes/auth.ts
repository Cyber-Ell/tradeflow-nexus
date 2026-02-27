import { Router, Request, Response } from 'express'
import { registerUser, loginUser, getUserById, updateUserProfile } from '../services/authService'
import { authenticateToken } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const router = Router()

router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user, token } = await registerUser(req.body)
    res.status(201).json({
      success: true,
      data: { user, token },
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user, token } = await loginUser(req.body)
    res.json({
      success: true,
      data: { user, token },
    })
  } catch (error: any) {
    throw new AppError(error.message, 401)
  }
}))

router.get('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }
  res.json({
    success: true,
    data: user,
  })
}))

router.put('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserProfile(req.user!.userId, req.body)
  res.json({
    success: true,
    data: user,
  })
}))

export default router