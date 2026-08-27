import { Request, Response } from 'express';
import {
  createRoleSchema,
  updateRoleSchema,
  listRolesForBusiness,
  createCustomRole,
  updateRole,
  deleteRole,
} from './roles.service';

export async function getRolesHandler(req: Request, res: Response) {
  try {
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const roles = await listRolesForBusiness(businessId);
    return res.json(roles);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch roles' },
    });
  }
}

export async function createRoleHandler(req: Request, res: Response) {
  try {
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const validated = createRoleSchema.parse(req.body);
    const role = await createCustomRole(businessId, validated);
    return res.status(201).json(role);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid role payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create role' },
    });
  }
}

export async function updateRoleHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const validated = updateRoleSchema.parse(req.body);
    const updated = await updateRole(id, businessId, validated);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid update payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update role' },
    });
  }
}

export async function deleteRoleHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    await deleteRole(id, businessId);
    return res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to delete role' },
    });
  }
}
