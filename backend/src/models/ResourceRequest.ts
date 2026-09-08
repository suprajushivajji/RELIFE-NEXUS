import mongoose, { Schema } from 'mongoose';

export interface IResourceRequest {
  id: string;
  department: string;
  category: "LAPTOP" | "MONITOR" | "PROJECTOR" | "PRINTER";
  quantity: number;
  specifications: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "MATCHED" | "APPROVED";
  createdAt: string;
}

const ResourceRequestSchema: Schema<IResourceRequest> = new Schema<IResourceRequest>({
  id: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  category: { type: String, required: true, enum: ["LAPTOP", "MONITOR", "PROJECTOR", "PRINTER"] },
  quantity: { type: Number, required: true },
  specifications: { type: [String], default: [] },
  urgency: { type: String, required: true, enum: ["LOW", "MEDIUM", "HIGH"] },
  status: { type: String, required: true, enum: ["OPEN", "MATCHED", "APPROVED"] },
  createdAt: { type: String, required: true }
});

export default mongoose.model<IResourceRequest>('ResourceRequest', ResourceRequestSchema);
