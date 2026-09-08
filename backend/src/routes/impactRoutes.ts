import { Router } from 'express';
import { getImpactSummary } from '../controllers/impactController.js';

const router = Router();

router.get('/summary', getImpactSummary);

export default router;
