import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { AuthPayload } from '../types'
import { getDatabase } from '../config/database'

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token required' })
    return
  }

  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
    return
  }

  const db = await getDatabase()
  const user = await db.get('SELECT id, role, status, email FROM users WHERE id = ?', [payload.userId])

  if (!user) {
    res.status(401).json({ success: false, message: 'User not found' })
    return
  }

  if (user.status === 'rejected') {
    res.status(403).json({ success: false, message: 'Account has been rejected' })
    return
  }

  req.user = payload
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied' })
      return
    }
    next()
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }

  next()
}
