import { Router } from 'express';
import {
  getCompanyHandler,
  updateCompanyHandler,
  uploadLogoHandler,
  removeLogoHandler,
} from './company.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

router.get('/', getCompanyHandler);
router.patch('/', authorize('settings:manage'), updateCompanyHandler);
router.post('/logo', authorize('settings:manage'), uploadLogoHandler);
router.delete('/logo', authorize('settings:manage'), removeLogoHandler);

export default router;
