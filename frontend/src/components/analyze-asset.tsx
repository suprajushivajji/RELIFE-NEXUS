"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Eye,
  User,
  ThumbsUp,
  RefreshCw,
  Sparkles,
  FileText,
  Wrench,
  Package,
  Recycle,
  Zap,
} from "lucide-react";
import { SubtleParticles } from "./backgrounds";
import {
  SpotlightCard,
  StatusBadge,
  ConfidenceRing,
  PageHeader,
  PrimaryButton,
  ErrorState,
  MonoId,
  SectionReveal,
} from "./ui";

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
};

type Evidence = { source: string; section: string; excerpt: string };
type Recommendation = {
  id: string;
  assetId: string;
  decision: string;
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

// ============================================================
// Decision configuration
// ============================================================
const decisionConfig: Record<string, {
  color: string;
  bg: string;
  icon: React.ReactNode;
  description: string;
}> = {
  REUSE:          { color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: <RefreshCw size={18} />,  description: "Asset can be reused as-is" },
  REDEPLOY:       { color: "#34d399", bg: "rgba(52,211,153,0.1)",  icon: <ArrowRight size={18} />, description: "Redeployment to new location" },
  REPAIR:         { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  icon: <Wrench size={18} />,     description: "Minor repair recommended" },
  REFURBISH:      { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", icon: <Package size={18} />,    description: "Comprehensive refurbishment" },
  RECYCLE:        { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: <Recycle size={18} />,    description: "End of life, responsible recycling" },
  REPLACE:        { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: <Zap size={18} />,         description: "Asset should be replaced" },
  NEEDS_REVIEW:   { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", icon: <Eye size={18} />,         description: "Requires expert review" },
};

const allDecisions = ["REUSE", "REDEPLOY", "REPAIR", "REFURBISH", "RECYCLE", "REPLACE", "NEEDS_REVIEW"];

// ============================================================
// AI Analysis stages (visual representation of request state)
// ============================================================
const analyzeStages = [
  { label: "Understanding Asset",      icon: <FileText size={14} /> },
  { label: "Retrieving Evidence",      icon: <BookOpen size={14} /> },
  { label: "Evaluating Lifecycle",     icon: <Cpu size={14} /> },
  { label: "Generating Recommendation",icon: <Sparkles size={14} /> },
];

function AIProcessingStages({ analyzing }: { analyzing: boolean }) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {analyzeStages.map((stage, i) => (
        <motion.div
          key={stage.label}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -12 }}
          animate={analyzing ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--emerald-soft)", color: "var(--emerald)" }}
          >
            {stage.icon}
          </div>
          <span className="text-sm" style={{ color: analyzing ? "var(--text-primary)" : "var(--text-muted)" }}>
            {stage.label}
          </span>
          {analyzing && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full ml-auto"
              style={{ background: "var(--emerald)" }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// Decision Wheel / Visual
// ============================================================
function DecisionVisual({ recommendation }: { recommendation: Recommendation }) {
  const active = recommendation.decision;
  const cfg = decisionConfig[active] ?? decisionConfig.NEEDS_REVIEW;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Central decision indicator */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            width: 96, height: 96,
            background: `radial-gradient(circle, ${cfg.color}20 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center relative"
          style={{ background: cfg.bg, border: `2px solid ${cfg.color}50`, color: cfg.color }}
        >
          <span style={{ transform: "scale(1.4)" }}>{cfg.icon}</span>
        </div>
      </motion.div>

      {/* Decision label */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: cfg.color }}
        >
          {active}
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{cfg.description}</p>
      </motion.div>

      {/* Other options ring */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {allDecisions.filter(d => d !== active).map(d => (
            <span
              key={d}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--bg-overlay)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              {d}
            </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Asset Selector (picking an asset to analyze)
// ============================================================
interface AssetPickerProps {
  assets: Asset[];
  selected: Asset | null;
  onSelect: (asset: Asset) => void;
}

function AssetPicker({ assets, selected, onSelect }: AssetPickerProps) {
  const [search, setSearch] = useState("");
  const filtered = assets.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Search assets…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      />
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {filtered.map(asset => (
          <button
            key={asset.id}
            className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3"
            style={{
              background: selected?.id === asset.id ? "var(--emerald-soft)" : "var(--bg-elevated)",
              border: `1px solid ${selected?.id === asset.id ? "var(--border-accent)" : "var(--border)"}`,
            }}
            onClick={() => onSelect(asset)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{asset.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <MonoId>{asset.id}</MonoId>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{asset.condition}</span>
              </div>
            </div>
            {selected?.id === asset.id && (
              <CheckCircle size={14} style={{ color: "var(--emerald)", flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main AnalyzeAsset Component
// ============================================================
interface AnalyzeAssetProps {
  assets: Asset[];
  preSelected?: Asset | null;
  onAnalyze: (asset: Asset) => Promise<void>;
  onApprove: () => Promise<void>;
  recommendation: Recommendation | null;
  analyzing: boolean;
  approving?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function AnalyzeAsset({
  assets,
  preSelected,
  onAnalyze,
  onApprove,
  recommendation,
  analyzing,
  approving,
  error,
  onClearError,
}: AnalyzeAssetProps) {
  const [selected, setSelected] = useState<Asset | null>(preSelected ?? null);

  const handleSelect = (asset: Asset) => {
    setSelected(asset);
    if (onClearError) onClearError();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI Workspace"
        title="Analyze Asset"
        subtitle="Select an asset for AI-powered lifecycle analysis. All recommendations require human approval."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================
            LEFT: Asset Input Panel
            ====================================================== */}
        <SectionReveal>
          <div className="flex flex-col gap-4">
            {/* Asset selector */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Select Asset
              </p>
              <AssetPicker assets={assets} selected={selected} onSelect={handleSelect} />
            </div>

            {/* Selected asset details */}
            {selected && (
              <motion.div
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-accent)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--emerald)" }}>
                      Selected Asset
                    </p>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{selected.name}</h3>
                    <MonoId>{selected.id}</MonoId>
                  </div>
                  <StatusBadge
                    variant={selected.condition === "EXCELLENT" || selected.condition === "GOOD" ? "success" : selected.condition === "FAIR" ? "warning" : "error"}
                    label={selected.condition}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Department", value: selected.department },
                    { label: "Location",   value: selected.location },
                    { label: "Category",   value: selected.category },
                    { label: "Status",     value: selected.lifecycleStatus.replace("_", " ") },
                    ...(selected.brand ? [{ label: "Brand",  value: selected.brand }] : []),
                    ...(selected.model ? [{ label: "Model",  value: selected.model }] : []),
                    ...(selected.purchaseYear ? [{ label: "Year", value: String(selected.purchaseYear) }] : []),
                    ...(selected.replacementCost ? [{ label: "Cost", value: `₹${selected.replacementCost.toLocaleString()}` }] : []),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {selected.reportedIssue && (
                  <div
                    className="p-3 rounded-lg text-xs"
                    style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}
                  >
                    <p className="font-semibold mb-1" style={{ color: "#fbbf24" }}>Reported Issue</p>
                    <p style={{ color: "var(--text-secondary)" }}>{selected.reportedIssue}</p>
                  </div>
                )}

                {selected.specs && selected.specs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.specs.map(s => (
                      <span
                        key={s}
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: "var(--bg-overlay)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Analyze button */}
            <PrimaryButton
              onClick={() => selected && onAnalyze(selected)}
              disabled={!selected || analyzing}
              loading={analyzing}
              size="lg"
            >
              <Cpu size={15} />
              {analyzing ? "Analyzing asset…" : "Analyze with AI"}
              {!analyzing && <ArrowRight size={14} />}
            </PrimaryButton>
          </div>
        </SectionReveal>

        {/* ======================================================
            RIGHT: AI Analysis Workspace
            ====================================================== */}
        <SectionReveal delay={0.1}>
          <div
            className="relative rounded-xl overflow-hidden flex flex-col gap-5 p-6 min-h-96"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <SubtleParticles count={8} />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--ai-blue)" }}>
                  AI Analysis Workspace
                </p>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {analyzing ? "Analyzing asset…" : recommendation ? "Analysis complete" : "Ready to analyze"}
                </h3>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--ai-glow)", color: "var(--ai-blue)" }}
              >
                <Cpu size={15} />
              </div>
            </div>

            {/* Processing stages */}
            {(analyzing || !recommendation) && (
              <div className="relative z-10">
                <AIProcessingStages analyzing={analyzing} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="relative z-10">
                <ErrorState
                  title="Analysis failed"
                  message={error}
                  onRetry={() => selected && onAnalyze(selected)}
                />
              </div>
            )}

            {/* Result */}
            <AnimatePresence>
              {recommendation && !analyzing && (
                <motion.div
                  className="relative z-10 flex flex-col gap-5"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Decision visual */}
                  <DecisionVisual recommendation={recommendation} />

                  {/* Confidence */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <ConfidenceRing value={recommendation.confidence} size={72} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                        AI Confidence
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {Math.round(recommendation.confidence * 100)}% confidence
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {recommendation.humanReviewRequired ? "Human review required" : "Auto-eligible for review"}
                      </p>
                    </div>
                    {recommendation.humanReviewRequired && (
                      <div
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}
                      >
                        Review Required
                      </div>
                    )}
                  </div>

                  {/* Safety note */}
                  {recommendation.safetyNote && (
                    <motion.div
                      className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <AlertTriangle size={16} style={{ color: "#f87171", marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: "#f87171" }}>Safety Notice</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{recommendation.safetyNote}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Reasons */}
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                      Reasoning
                    </p>
                    <div className="flex flex-col gap-2">
                      {recommendation.reasons.map((r, i) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-2.5 text-sm"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.08 }}
                        >
                          <CheckCircle size={13} style={{ color: "var(--emerald)", marginTop: 2, flexShrink: 0 }} />
                          <span style={{ color: "var(--text-secondary)" }}>{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence */}
                  {recommendation.evidence.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                        Evidence Sources
                      </p>
                      <div className="flex flex-col gap-2">
                        {recommendation.evidence.map((ev, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg text-xs"
                            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                          >
                            <p className="font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>
                              {ev.source} — {ev.section}
                            </p>
                            <p style={{ color: "var(--text-muted)" }}>&ldquo;{ev.excerpt}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assumptions */}
                  {recommendation.assumptions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                        Assumptions
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {recommendation.assumptions.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span style={{ color: "var(--text-muted)" }}>·</span>
                            <span style={{ color: "var(--text-muted)" }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approval */}
                  <div
                    className="flex items-center justify-between gap-3 p-4 rounded-xl"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-2">
                      <User size={14} style={{ color: "var(--ai-blue)" }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Human Decision</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Status: <span style={{ color: recommendation.approvalStatus === "APPROVED" ? "var(--emerald)" : recommendation.approvalStatus === "REJECTED" ? "#f87171" : "var(--status-warn)" }}>
                            {recommendation.approvalStatus}
                          </span>
                        </p>
                      </div>
                    </div>

                    {recommendation.approvalStatus === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <PrimaryButton
                          onClick={onApprove}
                          loading={approving}
                          size="sm"
                        >
                          <ThumbsUp size={12} />
                          Approve
                        </PrimaryButton>
                      </div>
                    )}

                    {recommendation.approvalStatus === "APPROVED" && (
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--emerald)" }}>
                        <CheckCircle size={13} />
                        Approved
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
}
