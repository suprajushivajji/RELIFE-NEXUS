import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import Recommendation from '../models/Recommendation.js';
import type { IRecommendation } from '../models/Recommendation.js';
import Asset from '../models/Asset.js';
import AuditLog from '../models/AuditLog.js';

export const getRecommendationById = async (req: Request, res: Response) => {
  try {
    const rec = await Recommendation.findOne({ id: req.params.id } as any) as HydratedDocument<IRecommendation> | null;
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
    res.json({ data: rec });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
};

export const approveRecommendation = async (req: Request, res: Response) => {
  try {
    const rec = await Recommendation.findOne({ id: req.params.id } as any) as HydratedDocument<IRecommendation> | null;
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
    
    rec.approvalStatus = "APPROVED";
    await rec.save();
    
    // Update asset lifecycle status based on decision
    const asset = await Asset.findOne({ id: rec.assetId } as any);
    if (asset) {
      if (rec.decision === 'REDEPLOY' || rec.decision === 'REUSE') {
        asset.lifecycleStatus = 'AVAILABLE';
      } else if (rec.decision === 'RECYCLE') {
        asset.lifecycleStatus = 'RETIRED';
      }
      await asset.save();
    }
    
    await AuditLog.create({ entityType: 'recommendation', entityId: rec.id, action: 'APPROVED', metadata: { decision: rec.decision } });
    
    res.json({ data: rec });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve recommendation' });
  }
};

export const rejectRecommendation = async (req: Request, res: Response) => {
  try {
    const rec = await Recommendation.findOne({ id: req.params.id } as any) as HydratedDocument<IRecommendation> | null;
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });
    
    rec.approvalStatus = "REJECTED";
    await rec.save();
    await AuditLog.create({ entityType: 'recommendation', entityId: rec.id, action: 'REJECTED', metadata: { decision: rec.decision } });
    
    res.json({ data: rec });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject recommendation' });
  }
};
