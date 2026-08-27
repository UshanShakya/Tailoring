import { Request, Response } from 'express';
import {
  createRoleGroupSchema,
  updateRoleGroupSchema,
  listRoleGroups,
  getRoleGroupById,
  createRoleGroup,
  updateRoleGroup,
  deleteRoleGroup,
} from './role-groups.service';

export async function getRoleGroupsHandler(req: Request, res: Response) {
  try {
    const groups = await listRoleGroups(req.businessId || null);
    return res.json(groups);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch role groups' },
    });
  }
}

export async function getRoleGroupByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const group = await getRoleGroupById(req.businessId || null, id);
    return res.json(group);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch role group' },
    });
  }
}

export async function createRoleGroupHandler(req: Request, res: Response) {
  try {
    const validated = createRoleGroupSchema.parse(req.body);
    const group = await createRoleGroup(req.businessId || null, validated);
    return res.status(201).json(group);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid input' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create role group' },
    });
  }
}

export async function updateRoleGroupHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = updateRoleGroupSchema.parse(req.body);
    const updated = await updateRoleGroup(req.businessId || null, id, validated);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid input' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update role group' },
    });
  }
}

export async function deleteRoleGroupHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await deleteRoleGroup(req.businessId || null, id);
    return res.json(result);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to delete role group' },
    });
  }
}
