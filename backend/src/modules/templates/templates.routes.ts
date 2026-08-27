import { Router } from 'express';
import {
  getGarmentTypesHandler,
  createGarmentTypeHandler,
  getTemplatesHandler,
  getTemplateByIdHandler,
  cloneTemplateHandler,
  createTemplateHandler,
  updateTemplateHandler,
} from './templates.controller';
import { authenticate } from '../../middleware/authenticate';
import { attachTenant } from '../../middleware/attachTenant';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate, attachTenant);

// Garment Types
router.get('/garment-types', authorize('template:view'), getGarmentTypesHandler);
router.post('/garment-types', authorize('template:manage'), createGarmentTypeHandler);

// Measurement Templates
router.get('/measurement-templates', authorize('template:view'), getTemplatesHandler);
router.get('/measurement-templates/:id', authorize('template:view'), getTemplateByIdHandler);
router.post('/measurement-templates/clone', authorize('template:manage'), cloneTemplateHandler);
router.post('/measurement-templates', authorize('template:manage'), createTemplateHandler);
router.patch('/measurement-templates/:id', authorize('template:manage'), updateTemplateHandler);

export default router;
