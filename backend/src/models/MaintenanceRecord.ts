import mongoose, { Schema } from 'mongoose';

const MaintenanceRecordSchema = new Schema({
  id: { type: String, required: true, unique: true }, assetId: { type: String, required: true }, date: { type: String, required: true }, issue: { type: String, required: true }, action: { type: String, required: true }, result: { type: String, required: true }, cost: { type: Number, default: null }, technician: { type: String, required: true }, status: { type: String, required: true },
});
export default mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);
