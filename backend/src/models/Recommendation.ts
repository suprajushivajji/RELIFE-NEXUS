import mongoose, { Schema } from 'mongoose';

export interface IEvidence {
  source: string;
  section: string;
  excerpt: string;
}

export interface IRecommendation {
  id: string;
  assetId: string;
  decision: "REPAIR" | "REFURBISH" | "REUSE" | "REDEPLOY" | "RECYCLE" | "REPLACE" | "NEEDS_REVIEW";
  confidence: number;
  reasons: string[];
  evidence: IEvidence[];
  alternatives: string[];
  assumptions: string[];
  humanReviewRequired: boolean;
  safetyNote: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const EvidenceSchema = new Schema({
  source: { type: String, required: true },
  section: { type: String, required: true },
  excerpt: { type: String, required: true }
}, { _id: false });

const RecommendationSchema: Schema<IRecommendation> = new Schema<IRecommendation>({
  id: { type: String, required: true, unique: true },
  assetId: { type: String, required: true },
  decision: { type: String, required: true, enum: ["REPAIR", "REFURBISH", "REUSE", "REDEPLOY", "RECYCLE", "REPLACE", "NEEDS_REVIEW"] },
  confidence: { type: Number, required: true },
  reasons: { type: [String], default: [] },
  evidence: { type: [EvidenceSchema], default: [] },
  alternatives: { type: [String], default: [] },
  assumptions: { type: [String], default: [] },
  humanReviewRequired: { type: Boolean, required: true },
  safetyNote: { type: String, default: null },
  approvalStatus: { type: String, required: true, enum: ["PENDING", "APPROVED", "REJECTED"] },
  createdAt: { type: String, required: true }
});

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
