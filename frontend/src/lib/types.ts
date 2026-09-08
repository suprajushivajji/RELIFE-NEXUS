export type Category = "LAPTOP" | "MONITOR" | "PROJECTOR" | "PRINTER";
export type Condition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "UNSAFE";
export type LifecycleAction = "REPAIR" | "REFURBISH" | "REUSE" | "REDEPLOY" | "RECYCLE" | "REPLACE" | "NEEDS_REVIEW";

export type Asset = {
  id: string;
  name: string;
  category: Category;
  brand: string | null;
  model: string | null;
  department: string;
  location: string;
  condition: Condition;
  reportedIssue: string;
  usageStatus: "ACTIVE" | "UNUSED" | "MAINTENANCE";
  lifecycleStatus: "IN_USE" | "AVAILABLE" | "UNDER_REVIEW" | "RETIRED";
  purchaseYear: number;
  replacementCost: number | null;
  specs: string[];
  massKg: number | null;
  analyzed?: boolean;
};

export type ResourceRequest = {
  id: string;
  department: string;
  category: Category;
  quantity: number;
  specifications: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "MATCHED" | "APPROVED";
  createdAt: string;
};

export type Evidence = { source: string; section: string; excerpt: string };
export type Recommendation = {
  id: string;
  assetId: string;
  decision: LifecycleAction;
  confidence: number;
  reasons: string[];
  evidence: Evidence[];
  alternatives: string[];
  assumptions: string[];
  humanReviewRequired: boolean;
  safetyNote: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};
