import { Router } from 'express';
import {
  getRolesHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
} from './roles.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', authorize('menu:roles'), getRolesHandler);
router.post('/', authorize('role:manage'), createRoleHandler);
router.patch('/:id', authorize('role:manage'), updateRoleHandler);
router.delete('/:id', authorize('role:manage'), deleteRoleHandler);

export default router;
