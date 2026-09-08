import { Router } from 'express';
import { getAudit } from '../controllers/auditController.js';

const router = Router();
router.get('/:id', getAudit);
export default router;