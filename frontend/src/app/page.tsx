"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { Sidebar, type Page } from "../components/navigation";
import { Dashboard } from "../components/dashboard";
import { AssetRegistry } from "../components/asset-registry";
import { AnalyzeAsset } from "../components/analyze-asset";
import { ResourceMatching } from "../components/resource-matching";
import { ImpactPage } from "../components/impact";
import { ResponsibleAIPage } from "../components/responsible-ai";

// ============================================================
// Types
// ============================================================
type Asset = {
  id: string;
  name: string;
  category: string;
  department: string;
  location: string;
  condition: string;
  usageStatus: string;
  lifecycleStatus: string;
  brand?: string | null;
  model?: string | null;
  purchaseYear?: number;
  replacementCost?: number | null;
  reportedIssue?: string;
  specs?: string[];
  analyzed?: boolean;
};

type ResourceRequest = {
  id: string;
  department: string;
  category: string;
  quantity: number;
  specifications: string[];
  urgency: "LOW" | "MEDIUM" | "HIGH";
  status: string;
  createdAt: string;
};

type Match = {
  assetId: string;
  compatibilityScore: number;
  reasons: string[];
  condition: string;
  location: string;
};

type ImpactMetric = { value: number | null; status: string };
type Impact = {
  assetsCirculated: number;
  procurementAvoided: ImpactMetric;
  costDifference: ImpactMetric;
  lifeExtensionMonths: ImpactMetric;
  wasteAvoidedKg: ImpactMetric;
  assumptions: string[];
  message: string;
};

type ResponsibleAIInfo = {
  aiProvider: string;
  aiModel: string;
  aiFallbackModel: string;
  timeoutMs: number;
  maxRetries: number;
  guardrails: {
    fairness: string;
    transparency: string;
    privacy: string;
    safety: string;
    uncertainty: string;
    humanOversight: string;
    auditability: string;
  };
  supportedDecisions: string[];
  humanOversightRequired: boolean;
  dataHandling: { sentToAI: string[]; notSentToAI: string[] };
};

type Recommendation = {
  id: string;
  assetId: string;
  decision: string;
  confidence: number;
  reasons: string[];
  evidence: Array<{ source: string; section: string; excerpt: string }>;
  alternatives: string[];
  assumptions: string[];
  humanReviewRequired: boolean;
  safetyNote: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

// ============================================================
// API client
// ============================================================
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error ?? `Request failed: ${res.status}`);
  return payload.data as T;
}

// ============================================================
// Page transition wrapper
// ============================================================
function PageTransition({ children, pageKey }: { children: React.ReactNode; pageKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Toast notification
// ============================================================
function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "var(--emerald-soft)", border: "var(--border-accent)", text: "var(--emerald)" },
    error:   { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)", text: "#f87171" },
    info:    { bg: "var(--ai-glow)", border: "rgba(96,165,250,0.3)", text: "var(--ai-blue)" },
  };
  const cfg = colors[type];

  return (
    <motion.div
      className="flex items-start gap-3 px-4 py-3 rounded-xl max-w-sm pointer-events-auto"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
    >
      <p className="text-sm flex-1" style={{ color: cfg.text }}>{message}</p>
      <button onClick={onClose} style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1 }}>×</button>
    </motion.div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function Home() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");

  // Data state
  const [assets, setAssets]               = useState<Asset[]>([]);
  const [requests, setRequests]           = useState<ResourceRequest[]>([]);
  const [matches, setMatches]             = useState<Match[]>([]);
  const [impact, setImpact]               = useState<Impact | null>(null);
  const [responsibleAI, setResponsibleAI] = useState<ResponsibleAIInfo | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [analyzeTarget, setAnalyzeTarget] = useState<Asset | null>(null);

  // Loading states
  const [assetsLoading,   setAssetsLoading]   = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [impactLoading,   setImpactLoading]   = useState(false);
  const [raiLoading,      setRaiLoading]      = useState(false);
  const [analyzing,       setAnalyzing]       = useState(false);
  const [approving,       setApproving]       = useState(false);

  // Error states
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [analyzeError,  setAnalyzeError]  = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  // ============================================================
  // Data loaders
  // ============================================================
  const loadAssets = useCallback(async () => {
    if (assetsLoading) return;
    setAssetsLoading(true);
    try {
      const data = await apiFetch<Asset[]>("/api/assets");
      setAssets(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load assets.", "error");
    } finally {
      setAssetsLoading(false);
    }
  }, [assetsLoading, showToast]);

  const loadMatching = useCallback(async () => {
    setMatchingLoading(true);
    setMatchingError(null);
    try {
      const reqs = await apiFetch<ResourceRequest[]>("/api/requests");
      setRequests(reqs);
      const req = reqs.find((r: ResourceRequest) => r.category === "MONITOR") ?? reqs[0];
      if (!req) { setMatches([]); return; }
      const matchData = await apiFetch<{ matches: Match[] }>(`/api/requests/${req.id}/match`, { method: "POST", body: "{}" });
      setMatches(matchData.matches ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Resource matching failed.";
      setMatchingError(msg);
      showToast(msg, "error");
    } finally {
      setMatchingLoading(false);
    }
  }, [showToast]);

  const loadImpact = useCallback(async () => {
    setImpactLoading(true);
    try {
      const data = await apiFetch<Impact>("/api/impact/summary");
      setImpact(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impact loading failed.", "error");
    } finally {
      setImpactLoading(false);
    }
  }, [showToast]);

  const loadResponsibleAI = useCallback(async () => {
    setRaiLoading(true);
    try {
      const data = await apiFetch<ResponsibleAIInfo>("/api/responsible-ai/info");
      setResponsibleAI(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Responsible AI loading failed.", "error");
    } finally {
      setRaiLoading(false);
    }
  }, [showToast]);

  // ============================================================
  // Analyze asset
  // ============================================================
  const analyzeAsset = useCallback(async (asset: Asset) => {
    setAnalyzing(true);
    setAnalyzeError(null);
    setRecommendation(null);
    try {
      const data = await apiFetch<Recommendation>(`/api/assets/${asset.id}/analyze`, { method: "POST", body: "{}" });
      setRecommendation(data);
      showToast("Analysis complete. Human review is required.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      setAnalyzeError(msg);
      showToast(msg, "error");
    } finally {
      setAnalyzing(false);
    }
  }, [showToast]);

  // ============================================================
  // Approve recommendation
  // ============================================================
  const approveRecommendation = useCallback(async () => {
    if (!recommendation) return;
    setApproving(true);
    try {
      const data = await apiFetch<Recommendation>(`/api/recommendations/${recommendation.id}/approve`, { method: "POST", body: "{}" });
      setRecommendation(data);
      showToast("Approval recorded in the audit log.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Approval failed.", "error");
    } finally {
      setApproving(false);
    }
  }, [recommendation, showToast]);

  // ============================================================
  // Navigation handler — lazy-load page data
  // ============================================================
  const navigate = useCallback((page: Page) => {
    setActivePage(page);
    if (page === "Resource Matching" && requests.length === 0) {
      void loadMatching();
    }
    if (page === "Impact" && !impact) {
      void loadImpact();
    }
    if (page === "Responsible AI" && !responsibleAI) {
      void loadResponsibleAI();
    }
  }, [requests.length, impact, responsibleAI, loadMatching, loadImpact, loadResponsibleAI]);

  // Navigate to analyze page with a pre-selected asset
  const openAnalyze = useCallback((asset: Asset) => {
    setAnalyzeTarget(asset);
    setRecommendation(null);
    setAnalyzeError(null);
    setActivePage("Analyze Asset");
  }, []);

  // Initial load — fetch assets on mount
  useEffect(() => {
    async function init() {
      setAssetsLoading(true);
      try {
        const data = await apiFetch<Asset[]>("/api/assets");
        setAssets(data);
      } catch (err) {
        // toast is available via closure but we skip it here to avoid setState cascade
        console.error("Failed to load assets on mount:", err);
      } finally {
        setAssetsLoading(false);
      }
    }
    void init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // Render
  // ============================================================
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Sidebar */}
      <Sidebar active={activePage} onNavigate={navigate} />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 h-16 shrink-0"
          style={{ background: "rgba(10,15,13,0.85)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{activePage}</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--emerald)" }} />
              Live data
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 px-6 md:px-8 py-8 max-w-6xl mx-auto w-full">
          <PageTransition pageKey={activePage}>
            {activePage === "Dashboard" && (
              <Dashboard
                assets={assets}
                loading={assetsLoading}
                onAnalyze={openAnalyze}
                onNavigate={(page: string) => navigate(page as Page)}
              />
            )}

            {activePage === "Asset Registry" && (
              <AssetRegistry
                assets={assets}
                loading={assetsLoading}
                onAnalyze={openAnalyze}
              />
            )}

            {activePage === "Analyze Asset" && (
              <AnalyzeAsset
                assets={assets}
                preSelected={analyzeTarget}
                onAnalyze={analyzeAsset}
                onApprove={approveRecommendation}
                recommendation={recommendation}
                analyzing={analyzing}
                approving={approving}
                error={analyzeError}
                onClearError={() => setAnalyzeError(null)}
              />
            )}

            {activePage === "Resource Matching" && (
              <ResourceMatching
                requests={requests}
                matches={matches}
                loading={matchingLoading}
                error={matchingError}
                onRefresh={loadMatching}
              />
            )}

            {activePage === "Impact" && (
              <ImpactPage
                impact={impact}
                assets={assets}
                loading={impactLoading}
                onRefresh={loadImpact}
              />
            )}

            {activePage === "Responsible AI" && (
              <ResponsibleAIPage
                info={responsibleAI}
                loading={raiLoading}
              />
            )}
          </PageTransition>
        </div>
      </main>

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
