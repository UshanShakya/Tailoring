import { Router } from 'express';
import {
  getOrdersHandler,
  getOrderByIdHandler,
  createOrderHandler,
  updateOrderStatusHandler,
} from './orders.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', authorize('order:view'), getOrdersHandler);
router.get('/:id', authorize('order:view'), getOrderByIdHandler);
router.post('/', authorize('order:create'), createOrderHandler);
router.patch('/:id/status', authorize('order:edit'), updateOrderStatusHandler);

export default router;
