import mongoose, { Schema } from 'mongoose';

const KnowledgeDocumentSchema = new Schema({
  id: { type: String, required: true, unique: true }, name: { type: String, required: true }, type: { type: String, required: true }, assetCategory: { type: String, required: true }, source: { type: String, required: true }, status: { type: String, required: true },
}, { timestamps: true });
export default mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);
