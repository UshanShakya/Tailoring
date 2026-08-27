import { Request, Response } from 'express';
import {
  createBusinessAdminSchema,
  createStaffSchema,
  updateUserSchema,
  listAllUsers,
  createBusinessAdmin,
  listTenantUsers,
  createStaffUser,
  updateUser,
} from './users.service';

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await listAllUsers();
    return res.json(users);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch users' },
    });
  }
}

export async function createBusinessAdminHandler(req: Request, res: Response) {
  try {
    const validated = createBusinessAdminSchema.parse(req.body);
    const user = await createBusinessAdmin(validated);
    return res.status(201).json(user);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid input payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create business admin' },
    });
  }
}

export async function getTenantUsersHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Tenant context required' },
      });
    }
    const users = await listTenantUsers(req.businessId);
    return res.json(users);
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to fetch staff members' },
    });
  }
}

export async function createStaffHandler(req: Request, res: Response) {
  try {
    if (!req.businessId) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Tenant context required' },
      });
    }
    const validated = createStaffSchema.parse(req.body);
    const user = await createStaffUser(req.businessId, validated);
    return res.status(201).json(user);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid staff payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to create staff member' },
    });
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = updateUserSchema.parse(req.body);
    const businessId = req.user?.roleName === 'Super Admin' ? null : req.businessId || null;
    const updated = await updateUser(id, businessId, validated);
    return res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: err.errors[0]?.message || 'Invalid update payload' },
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Failed to update user' },
    });
  }
}
