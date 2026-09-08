import mongoose, { Schema } from 'mongoose';

const ImpactRecordSchema = new Schema({
  id: { type: String, required: true, unique: true }, assetId: { type: String, required: true }, action: { type: String, required: true }, procurementAvoided: { type: Number, default: null }, costDifference: { type: Number, default: null }, lifeExtensionMonths: { type: Number, default: null }, wasteAvoidedKg: { type: Number, default: null }, status: { type: String, required: true }, assumptions: { type: [String], default: [] },
}, { timestamps: true });
export default mongoose.model('ImpactRecord', ImpactRecordSchema);
