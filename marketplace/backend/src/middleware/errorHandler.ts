import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', error)

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    })
    return
  }

  if (error.message.includes('UNIQUE constraint failed')) {
    res.status(409).json({
      success: false,
      message: 'This email is already registered',
    })
    return
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}