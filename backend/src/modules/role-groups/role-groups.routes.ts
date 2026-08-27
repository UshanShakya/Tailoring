import { Router } from 'express';
import {
  getRoleGroupsHandler,
  getRoleGroupByIdHandler,
  createRoleGroupHandler,
  updateRoleGroupHandler,
  deleteRoleGroupHandler,
} from './role-groups.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', authorize('menu:roles'), getRoleGroupsHandler);
router.get('/:id', authorize('menu:roles'), getRoleGroupByIdHandler);
router.post('/', authorize('menu:roles'), createRoleGroupHandler);
router.patch('/:id', authorize('menu:roles'), updateRoleGroupHandler);
router.delete('/:id', authorize('menu:roles'), deleteRoleGroupHandler);

export default router;
