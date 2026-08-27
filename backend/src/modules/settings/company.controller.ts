import { Request, Response } from 'express';
import {
  updateCompanySchema,
  getCompanySettings,
  updateCompanySettings,
  uploadCompanyLogo,
  removeCompanyLogo,
} from './company.service';

export async function getCompanyHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(400).json({ error: { code: 'NO_TENANT', message: 'No tenant context found' } });
    }
    const settings = await getCompanySettings(req.businessId);
    return res.json(settings);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch company settings' },
    });
  }
}

export async function updateCompanyHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(400).json({ error: { code: 'NO_TENANT', message: 'No tenant context found' } });
    }
    const validated = updateCompanySchema.parse(req.body);
    const updated = await updateCompanySettings(req.businessId, validated);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid input' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update company settings' },
    });
  }
}

export async function uploadLogoHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(400).json({ error: { code: 'NO_TENANT', message: 'No tenant context found' } });
    }
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'imageBase64 string is required' } });
    }
    const result = await uploadCompanyLogo(req.businessId, imageBase64);
    return res.json(result);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to upload logo' },
    });
  }
}

export async function removeLogoHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(400).json({ error: { code: 'NO_TENANT', message: 'No tenant context found' } });
    }
    const result = await removeCompanyLogo(req.businessId);
    return res.json(result);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to remove logo' },
    });
  }
}
