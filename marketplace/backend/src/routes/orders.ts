import { Router, Request, Response } from 'express'
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../services/orderService'
import { getPaymentByOrderId, initializePayment, releaseEscrowPayment, verifyPayment } from '../services/paymentService'
import { createLogisticsTracking, getLogisticsTrackingByOrderId, getShipmentEventsByOrderId } from '../services/logisticsService'
import { authenticateToken, requireRole } from '../middleware/auth'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { createDispute, listDisputes } from '../services/disputeService'

const router = Router()

router.post('/', authenticateToken, requireRole('wholesaler'), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { vendorId, items, deliveryAddress } = req.body

    if (!vendorId || !items || !deliveryAddress) {
      throw new AppError('Missing required fields', 400)
    }

    const order = await createOrder(req.user!.userId, vendorId, items, deliveryAddress)
    await createLogisticsTracking(order.id, 'Vendor Warehouse', deliveryAddress, 1)

    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
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

router.post('/:id/disputes', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await getOrderById(req.params.id)
    if (!order) throw new AppError('Order not found', 404)
    if (!req.body.reason) throw new AppError('Reason is required', 400)

    const isParticipant = order.wholesalerId === req.user!.userId || order.vendorId === req.user!.userId
    if (!isParticipant && req.user!.role !== 'admin') {
      throw new AppError('Not authorized', 403)
    }

    const dispute = await createDispute({
      orderId: req.params.id,
      openedByUserId: req.user!.userId,
      reason: req.body.reason,
      description: req.body.description,
    })

    res.status(201).json({
      success: true,
      data: dispute,
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

router.get('/:id/disputes', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id)
  if (!order) throw new AppError('Order not found', 404)

  const isParticipant = order.wholesalerId === req.user!.userId || order.vendorId === req.user!.userId
  if (!isParticipant && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403)
  }

  const disputes = await listDisputes({ orderId: req.params.id })

  res.json({
    success: true,
    data: disputes,
  })
}))

router.get('/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id)
  if (!order) {
    throw new AppError('Order not found', 404)
  }

  if (order.wholesalerId !== req.user!.userId && order.vendorId !== req.user!.userId && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403)
  }

  const payment = await getPaymentByOrderId(order.id)
  const tracking = await getLogisticsTrackingByOrderId(order.id)
  const shipmentEvents = await getShipmentEventsByOrderId(order.id)
  const disputes = await listDisputes({ orderId: order.id })

  res.json({
    success: true,
    data: {
      order,
      payment,
      tracking,
      shipmentEvents,
      disputes,
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
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

router.post('/:id/payment/verify', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await getOrderById(req.params.id)
    if (!order) throw new AppError('Order not found', 404)
    if (order.wholesalerId !== req.user!.userId && req.user!.role !== 'admin') {
      throw new AppError('Not authorized', 403)
    }

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
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

router.post('/:id/confirm-delivery', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const order = await getOrderById(req.params.id)
    if (!order) throw new AppError('Order not found', 404)
    if (order.wholesalerId !== req.user!.userId && req.user!.role !== 'admin') {
      throw new AppError('Not authorized', 403)
    }
    if (order.status === 'completed') {
      res.json({
        success: true,
        data: { completedOrder: order },
        message: 'Order already completed',
      })
      return
    }

    const deliveredOrder = order.status === 'delivered' ? order : await updateOrderStatus(order.id, 'delivered')
    const payment = await getPaymentByOrderId(order.id)
    if (payment?.status === 'escrow_held') {
      await releaseEscrowPayment(order.id)
    }
    const completedOrder = await updateOrderStatus(order.id, 'completed')

    res.json({
      success: true,
      data: {
        deliveredOrder,
        completedOrder,
      },
      message: 'Delivery confirmed and escrow released',
    })
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError(error.message, 400)
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
    throw error instanceof AppError ? error : new AppError(error.message, 400)
  }
}))

export default router
