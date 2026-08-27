import { Request, Response } from 'express';
import {
  createMeasurementSchema,
  listCustomerMeasurements,
  getMeasurementById,
  createMeasurement,
} from './measurements.service';

export async function getCustomerMeasurementsHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { customerId } = req.params;
    const records = await listCustomerMeasurements(req.businessId, customerId);
    return res.json(records);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch customer measurements' },
    });
  }
}

export async function getMeasurementByIdHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const record = await getMeasurementById(req.businessId, id);
    return res.json(record);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch measurement record' },
    });
  }
}

export async function createMeasurementHandler(req: Request, res: Response) {
  try {
    if (!req.businessId || !req.user) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { customerId } = req.params;
    const validated = createMeasurementSchema.parse(req.body);
    const record = await createMeasurement(
      req.businessId,
      customerId,
      req.user.email,
      validated
    );
    return res.status(201).json(record);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid measurement payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to record measurement' },
    });
  }
}
