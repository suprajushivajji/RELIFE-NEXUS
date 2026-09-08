import { Router } from 'express';
import { getRecommendationById, approveRecommendation, rejectRecommendation } from '../controllers/recommendationController.js';

const router = Router();

router.get('/:id', getRecommendationById);
router.post('/:id/approve', approveRecommendation);
router.post('/:id/reject', rejectRecommendation);

export default router;
