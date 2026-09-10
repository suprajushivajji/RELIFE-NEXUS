import { Router } from 'express';
import { getResponsibleAIInfo } from '../controllers/responsibleAIController.js';

const router = Router();

router.get('/info', getResponsibleAIInfo);

export default router;
