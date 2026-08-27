import { Router } from 'express';
import {
  getAllUsersHandler,
  createBusinessAdminHandler,
  getTenantUsersHandler,
  createStaffHandler,
  updateUserHandler,
} from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

// 1. Super Admin Router (/admin/users)
export const adminUsersRouter = Router();
adminUsersRouter.use(authenticate, authorize('*'));
adminUsersRouter.get('/', getAllUsersHandler);
adminUsersRouter.post('/', createBusinessAdminHandler);

// 2. Business Tenant Router (/users)
export const tenantUsersRouter = Router();
tenantUsersRouter.use(authenticate, attachTenant);
tenantUsersRouter.get('/', authorize('user:view'), getTenantUsersHandler);
tenantUsersRouter.post('/', authorize('*business_scoped*'), createStaffHandler);
tenantUsersRouter.patch('/:id', authorize('*business_scoped*'), updateUserHandler);
