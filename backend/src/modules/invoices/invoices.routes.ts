import { Router } from 'express';
import {
  getInvoicesHandler,
  getInvoiceByIdHandler,
  generateInvoiceHandler,
  recordPaymentHandler,
} from './invoices.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', authorize('invoice:view'), getInvoicesHandler);
router.get('/:id', authorize('invoice:view'), getInvoiceByIdHandler);
router.post('/generate/:orderId', authorize('invoice:create'), generateInvoiceHandler);
router.post('/:id/payments', authorize('payment:create'), recordPaymentHandler);

export default router;
