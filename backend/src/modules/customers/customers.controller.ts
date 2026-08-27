import { Request, Response } from 'express';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
} from './customers.service';

export async function getCustomersHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const search = req.query.search as string | undefined;
    const customers = await listCustomers(req.businessId, search);
    return res.json(customers);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch customers' },
    });
  }
}

export async function getCustomerByIdHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const customer = await getCustomerById(req.businessId, id);
    return res.json(customer);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch customer profile' },
    });
  }
}

export async function createCustomerHandler(req: Request, res: Response) {
  try {
    if (!req.businessId || !req.user) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const validated = createCustomerSchema.parse(req.body);
    const customer = await createCustomer(req.businessId, req.user.userId, validated);
    return res.status(201).json(customer);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid customer payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create customer' },
    });
  }
}

export async function updateCustomerHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const validated = updateCustomerSchema.parse(req.body);
    const updated = await updateCustomer(req.businessId, id, validated);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid update payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update customer' },
    });
  }
}
