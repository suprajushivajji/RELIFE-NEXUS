import type { Request, Response } from 'express';
import Asset from '../models/Asset.js';
import Recommendation from '../models/Recommendation.js';

export const getImpactSummary = async (req: Request, res: Response) => {
  try {
    const approved = await Recommendation.find({ approvalStatus: 'APPROVED', decision: { $in: ['REUSE', 'REDEPLOY'] } });
    const assetIds = approved.map(item => item.assetId);
    const assets = await Asset.find({ id: { $in: assetIds } });
    const replacementCosts = assets.map(asset => asset.replacementCost).filter((cost): cost is number => typeof cost === 'number');
    const masses = assets.map(asset => asset.massKg).filter((mass): mass is number => typeof mass === 'number');
    res.json({
      data: {
        assetsCirculated: approved.length,
        procurementAvoided: replacementCosts.length === assets.length ? replacementCosts.reduce((sum, cost) => sum + cost, 0) : null,
        costDifference: null,
        lifeExtension: null,
        wasteAvoided: masses.length === assets.length ? masses.reduce((sum, mass) => sum + mass, 0) : null,
        status: "ESTIMATED",
        assumptions: [
          "Procurement avoided is estimated from recorded replacement costs.",
          "Waste avoided is mass-based and is not a carbon claim.",
          "Cost difference and lifecycle extension require approved transfer and maintenance cost data."
        ],
        message: assets.length ? "Impact is estimated from approved internal circulation records." : "Impact estimate unavailable -- insufficient lifecycle data."
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch impact summary' });
  }
};
