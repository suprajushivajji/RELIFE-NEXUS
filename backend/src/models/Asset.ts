import mongoose, { Schema } from 'mongoose';

export interface IAsset {
  id: string; // Keep original frontend ID mapping
  name: string;
  category: "LAPTOP" | "MONITOR" | "PROJECTOR" | "PRINTER";
  brand: string | null;
  model: string | null;
  department: string;
  location: string;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "UNSAFE";
  reportedIssue: string;
  usageStatus: "ACTIVE" | "UNUSED" | "MAINTENANCE";
  lifecycleStatus: "IN_USE" | "AVAILABLE" | "UNDER_REVIEW" | "RETIRED";
  purchaseYear: number;
  replacementCost: number | null;
  specs: string[];
  massKg: number | null;
  analyzed: boolean;
}

const AssetSchema: Schema<IAsset> = new Schema<IAsset>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ["LAPTOP", "MONITOR", "PROJECTOR", "PRINTER"] },
  brand: { type: String, default: null },
  model: { type: String, default: null },
  department: { type: String, required: true },
  location: { type: String, required: true },
  condition: { type: String, required: true, enum: ["EXCELLENT", "GOOD", "FAIR", "POOR", "UNSAFE"] },
  reportedIssue: { type: String, default: "" },
  usageStatus: { type: String, required: true, enum: ["ACTIVE", "UNUSED", "MAINTENANCE"] },
  lifecycleStatus: { type: String, required: true, enum: ["IN_USE", "AVAILABLE", "UNDER_REVIEW", "RETIRED"] },
  purchaseYear: { type: Number, required: true },
  replacementCost: { type: Number, default: null },
  specs: { type: [String], default: [] },
  massKg: { type: Number, default: null },
  analyzed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IAsset>('Asset', AssetSchema);
