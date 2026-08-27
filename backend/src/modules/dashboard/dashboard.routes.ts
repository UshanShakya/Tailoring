import { Router } from 'express';
import { getDashboardStatsHandler } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/stats', getDashboardStatsHandler);

export default router;
