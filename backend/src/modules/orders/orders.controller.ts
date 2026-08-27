import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from './orders.service';

export async function getOrdersHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const search = req.query.search as string | undefined;
    const status = req.query.status as OrderStatus | undefined;
    const orders = await listOrders(req.businessId, search, status);
    return res.json(orders);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch orders' },
    });
  }
}

export async function getOrderByIdHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const order = await getOrderById(req.businessId, id);
    return res.json(order);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch order detail' },
    });
  }
}

export async function createOrderHandler(req: Request, res: Response) {
  try {
    if (!req.businessId || !req.user) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const validated = createOrderSchema.parse(req.body);
    const order = await createOrder(req.businessId, req.user.userId, validated);
    return res.status(201).json(order);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid order input' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create order' },
    });
  }
}

export async function updateOrderStatusHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const validated = updateOrderStatusSchema.parse(req.body);
    const updated = await updateOrderStatus(req.businessId, id, validated.status);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid status transition' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update order status' },
    });
  }
}
