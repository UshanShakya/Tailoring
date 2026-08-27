import { Request, Response } from 'express';
import {
  createGarmentTypeSchema,
  createTemplateSchema,
  cloneTemplateSchema,
  updateTemplateSchema,
  listGarmentTypes,
  createGarmentType,
  listTemplates,
  getTemplateById,
  cloneTemplate,
  createCustomTemplate,
  updateTemplate,
} from './templates.service';

export async function getGarmentTypesHandler(req: Request, res: Response) {
  try {
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const types = await listGarmentTypes(businessId);
    return res.json(types);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch garment types' },
    });
  }
}

export async function createGarmentTypeHandler(req: Request, res: Response) {
  try {
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const validated = createGarmentTypeSchema.parse(req.body);
    const garmentType = await createGarmentType(businessId, validated);
    return res.status(201).json(garmentType);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid garment type input' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create garment type' },
    });
  }
}

export async function getTemplatesHandler(req: Request, res: Response) {
  try {
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const templates = await listTemplates(businessId);
    return res.json(templates);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch measurement templates' },
    });
  }
}

export async function getTemplateByIdHandler(req: Request, res: Response) {
  try {
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const { id } = req.params;
    const template = await getTemplateById(businessId, id);
    return res.json(template);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch template' },
    });
  }
}

export async function cloneTemplateHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const validated = cloneTemplateSchema.parse(req.body);
    const cloned = await cloneTemplate(req.businessId, validated.templateId, validated.name, validated.nameNp);
    return res.status(201).json(cloned);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid clone payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to clone template' },
    });
  }
}

export async function createTemplateHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const validated = createTemplateSchema.parse(req.body);
    const template = await createCustomTemplate(req.businessId, validated);
    return res.status(201).json(template);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid template payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create custom template' },
    });
  }
}

export async function updateTemplateHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tenant context required' } });
    }
    const { id } = req.params;
    const validated = updateTemplateSchema.parse(req.body);
    const updated = await updateTemplate(req.businessId, id, validated);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid update payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update template' },
    });
  }
}
