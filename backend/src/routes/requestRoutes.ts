import { Router } from 'express';
import { getRequests, getRequestById, createRequest, matchRequest } from '../controllers/requestController.js';

const router = Router();

router.get('/', getRequests);
router.post('/', createRequest);
router.get('/:id', getRequestById);
router.post('/:id/match', matchRequest);

export default router;
