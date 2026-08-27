import { Router } from 'express';
import {
  getCustomersHandler,
  getCustomerByIdHandler,
  createCustomerHandler,
  updateCustomerHandler,
} from './customers.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', authorize('customer:view'), getCustomersHandler);
router.get('/:id', authorize('customer:view'), getCustomerByIdHandler);
router.post('/', authorize('customer:create'), createCustomerHandler);
router.patch('/:id', authorize('customer:edit'), updateCustomerHandler);

export default router;
