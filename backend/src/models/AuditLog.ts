import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  action: { type: String, required: true },
  actor: { type: String, default: 'prototype-user' },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
