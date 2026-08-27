import { Router } from 'express';
import {
  getCustomerMeasurementsHandler,
  getMeasurementByIdHandler,
  createMeasurementHandler,
} from './measurements.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/customers/:customerId/measurements', authorize('customer:view'), getCustomerMeasurementsHandler);
router.post('/customers/:customerId/measurements', authorize('customer:edit'), createMeasurementHandler);
router.get('/measurements/:id', authorize('customer:view'), getMeasurementByIdHandler);

export default router;
