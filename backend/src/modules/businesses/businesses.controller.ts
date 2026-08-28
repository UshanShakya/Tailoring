import { Request, Response } from 'express';
import {
  createBusinessSchema,
  updateBusinessSchema,
  listBusinesses,
  createBusiness,
  updateBusiness,
} from './businesses.service';

export async function getBusinessesHandler(req: Request, res: Response) {
  try {
    const actorUserId = (req as any).user?.id;
    const businesses = await listBusinesses(actorUserId);
    return res.json(businesses);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch businesses' },
    });
  }
}

export async function createBusinessHandler(req: Request, res: Response) {
  try {
    const validated = createBusinessSchema.parse(req.body);
    const business = await createBusiness(validated);
    return res.status(201).json(business);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid business payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create business' },
    });
  }
}

export async function updateBusinessHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = updateBusinessSchema.parse(req.body);
    const business = await updateBusiness(id, validated);
    return res.json(business);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid update payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update business' },
    });
  }
}
