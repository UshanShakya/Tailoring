import { Router } from 'express';
import { searchHandler } from './search.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', searchHandler);

export default router;
