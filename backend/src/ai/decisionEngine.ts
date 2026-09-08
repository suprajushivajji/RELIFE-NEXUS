import type { HydratedDocument } from 'mongoose';
import type { IAsset } from '../models/Asset.js';
import Recommendation from '../models/Recommendation.js';
import { getAIRecommendation } from './openRouterService.js';

export const analyzeAsset = async (asset: HydratedDocument<IAsset>) => {
  const decisionData = await getAIRecommendation(asset);
  const safetyRisk = asset.condition === 'UNSAFE' || /burning|damaged power|smoke|shock/i.test(asset.reportedIssue);
  if (safetyRisk) {
    decisionData.humanReviewRequired = true;
    decisionData.safetyNote = 'Professional inspection required. Do not power on or attempt repair.';
    if (decisionData.decision !== 'RECYCLE' && decisionData.decision !== 'NEEDS_REVIEW') decisionData.decision = 'NEEDS_REVIEW';
  }

  // Create Recommendation Record
  const newRecommendation = new Recommendation({
    ...decisionData,
    id: `REC-${Date.now()}`,
    assetId: asset.id,
    createdAt: new Date().toISOString(),
    approvalStatus: "PENDING"
  });

  await newRecommendation.save();
  return newRecommendation;
};
