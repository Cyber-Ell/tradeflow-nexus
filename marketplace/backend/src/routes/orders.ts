import { Router, Request, Response } from 'express'
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../services/orderService'
import { initializePayment, verifyPayment, getPaymentByOrderId } from '../services/paymentService'
import { createLogisticsTracking, getLogisticsTrackingByOrderId } from '../services/logisticsService'
import { authenticateToken, requireRole } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const router = Router()

router.post('/', authenticateToken, requireRole('wholesaler'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { vendorId, items, deliveryAddress } = req.body

    if (!vendorId || !items || !deliveryAddress) {
      throw new AppError('Missing required fields', 400)
    }

    const order = await createOrder(req.user!.userId, vendorId, items, deliveryAddress)

    // Initialize logistics tracking
    await createLogisticsTracking(order.id, 'Vendor Warehouse', deliveryAddress, 1)

    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query

  const orders = await getOrders({
    wholesalerId: req.user!.role === 'wholesaler' ? req.user!.userId : undefined,
    vendorId: req.user!.role === 'vendor' ? req.user!.userId : undefined,
    status: status as any,
  })

  res.json({
    success: true,
    data: orders,
  })
}))

router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id)
  if (!order) {
    throw new AppError('Order not found', 404)
  }

  // Check authorization
  if (order.wholesalerId !== req.user!.userId && order.vendorId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403)
  }

  const payment = await getPaymentByOrderId(order.id)
  const tracking = await getLogisticsTrackingByOrderId(order.id)

  res.json({
    success: true,
    data: {
      order,
      payment,
      tracking,
    },
  })
}))

router.post('/:id/payment/initialize', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await getOrderById(req.params.id)
    if (!order) throw new AppError('Order not found', 404)
    if (order.wholesalerId !== req.user!.userId) throw new AppError('Not authorized', 403)

    const { email } = req.body
    const paymentUrl = await initializePayment(order.id, order.total, email)

    res.json({
      success: true,
      data: { paymentUrl },
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

router.post('/:id/payment/verify', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { reference } = req.body
    const result = await verifyPayment(reference)

    if (result.success) {
      await updateOrderStatus(req.params.id, 'paid')
    }

    res.json({
      success: result.success,
      data: result,
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

router.put('/:id/status', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await getOrderById(req.params.id)
    if (!order) throw new AppError('Order not found', 404)

    if (order.vendorId !== req.user!.userId && req.user!.role !== 'admin') {
      throw new AppError('Not authorized', 403)
    }

    const { status } = req.body
    const updatedOrder = await updateOrderStatus(req.params.id, status)

    res.json({
      success: true,
      data: updatedOrder,
    })
  } catch (error: any) {
    throw new AppError(error.message, 400)
  }
}))

export default router