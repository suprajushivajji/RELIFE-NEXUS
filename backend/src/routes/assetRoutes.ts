import { Router } from 'express';
import { getAssets, getAssetById, createAsset, analyzeAssetAction, updateAsset, deleteAsset } from '../controllers/assetController.js';

const router = Router();

router.get('/', getAssets);
router.post('/', createAsset);
router.get('/:id', getAssetById);
router.post('/:id/analyze', analyzeAssetAction);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
