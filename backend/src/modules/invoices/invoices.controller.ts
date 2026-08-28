import { Request, Response } from 'express';
import { InvoiceStatus } from '@prisma/client';
import {
  recordPaymentSchema,
  listInvoices,
  getInvoiceById,
  generateInvoiceFromOrder,
  recordPayment,
} from './invoices.service';

export async function getInvoicesHandler(req: Request, res: Response) {
  try {
    const isSuperAdmin = req.user?.roleName === 'Super Admin';
    if (!req.businessId && !isSuperAdmin) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const search = req.query.search as string | undefined;
    const status = req.query.status as InvoiceStatus | undefined;
    const targetBusinessId = (req.query.businessId as string) || req.businessId;
    const invoices = await listInvoices(targetBusinessId, search, status);
    return res.json(invoices);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch invoices' },
    });
  }
}

export async function getInvoiceByIdHandler(req: Request, res: Response) {
  try {
    const isSuperAdmin = req.user?.roleName === 'Super Admin';
    if (!req.businessId && !isSuperAdmin) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const targetBusinessId = (req.query.businessId as string) || req.businessId;
    const invoice = await getInvoiceById(targetBusinessId, id);
    return res.json(invoice);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch invoice detail' },
    });
  }
}

export async function generateInvoiceHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { orderId } = req.params;
    const invoice = await generateInvoiceFromOrder(req.businessId, orderId);
    return res.status(201).json(invoice);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to generate invoice' },
    });
  }
}

export async function recordPaymentHandler(req: Request, res: Response) {
  try {
    if (!req.businessId || !req.user) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const validated = recordPaymentSchema.parse(req.body);
    const result = await recordPayment(req.businessId, id, req.user.email, validated);
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid payment input' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to record payment' },
    });
  }
}
