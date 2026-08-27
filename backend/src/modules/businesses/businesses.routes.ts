import { Router } from 'express';
import {
  getBusinessesHandler,
  createBusinessHandler,
  updateBusinessHandler,
} from './businesses.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Protect all /admin/businesses routes for SUPER_ADMIN only
router.use(authenticate, authorize('*'));

router.get('/', getBusinessesHandler);
router.post('/', createBusinessHandler);
router.patch('/:id', updateBusinessHandler);

export default router;
